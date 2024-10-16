// This script is designed to emit FHIR bundles to a FHIR server, simulating real-time data submission.
// It can optionally compress the timeline of events into a specified duration.

import * as fs from "fs-extra";
import * as path from "path";
import * as yargs from "yargs";

// Define the structure of a FHIR Bundle
interface Bundle {
  resourceType: "Bundle";
  type: "transaction";
  timestamp?: string;
  entry: any[];
}

// Define the structure of an OAuth2 token response
interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// This function obtains an access token from the OAuth2 server
async function getAccessToken(tokenUrl: string, clientId: string, clientSecret: string): Promise<string> {
  // Send a POST request to the token URL with client credentials
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  // If the request fails, throw an error with details
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to obtain access token: ${response.status} ${response.statusText}\nResponse body: ${errorBody}`);
  }

  // Parse the response and return the access token
  const data: TokenResponse = await response.json();
  return data.access_token;
}

// This is the main function that emits bundles to the FHIR server
async function emitBundles(inputDir: string, fhirServerUrl: string, tokenUrl: string, clientId: string, clientSecret: string, simulationDuration?: number): Promise<void> {
  // Read all JSON files from the input directory
  const files = await fs.readdir(inputDir);
  const jsonFiles = files.filter((file: string) => file.endsWith(".json"));
  
  // Sort files by their original timestamp
  const sortedFiles = await Promise.all(jsonFiles.map(async (file) => {
    const filePath = path.join(inputDir, file);
    const bundle: Bundle = await fs.readJSON(filePath);
    return { file, timestamp: bundle.timestamp || "0" };
  }));
  sortedFiles.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  // Calculate the compression factor if a simulation duration is specified
  const startTime = new Date();
  const firstEventTime = new Date(sortedFiles[0].timestamp);
  const lastEventTime = new Date(sortedFiles[sortedFiles.length - 1].timestamp);
  const originalDuration = lastEventTime.getTime() - firstEventTime.getTime();
  const compressionFactor = simulationDuration ? (simulationDuration * 1000 / originalDuration) : 1;

  // Get the initial access token
  let accessToken = await getAccessToken(tokenUrl, clientId, clientSecret);

  let currentIndex = 0;

  // Main loop for processing bundles
  while (currentIndex < sortedFiles.length) {
    const currentTime = new Date();
    
    // Process all bundles that should have been sent by now
    while (currentIndex < sortedFiles.length) {
      const { file, timestamp } = sortedFiles[currentIndex];
      const eventTime = new Date(timestamp);
      const timeDiff = eventTime.getTime() - firstEventTime.getTime();
      const adjustedTimeDiff = timeDiff * compressionFactor;
      const simulationTime = new Date(startTime.getTime() + adjustedTimeDiff);

      if (simulationTime <= currentTime) {
        // Process the bundle and update the access token if necessary
        accessToken = await processBundle(file, inputDir, fhirServerUrl, accessToken, tokenUrl, clientId, clientSecret);
        currentIndex++;
      } else {
        break;
      }
    }

    // Wait for a short time before checking again
    if (currentIndex < sortedFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
    }
  }
}

// This function processes a single bundle file
async function processBundle(
  file: string, 
  inputDir: string, 
  fhirServerUrl: string, 
  accessToken: string, 
  tokenUrl: string, 
  clientId: string, 
  clientSecret: string
): Promise<string> {
  const filePath = path.join(inputDir, file);
  const bundle: Bundle = await fs.readJSON(filePath);

  // Update the bundle's timestamp to the current time
  if (bundle.timestamp) {
    bundle.timestamp = new Date().toISOString();
  }

  // Attempt to submit the bundle to the FHIR server
  const requestBody = JSON.stringify(bundle);
  try {
    const response = await fetch(fhirServerUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/fhir+json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: requestBody
    });

    // Handle potential errors, including token expiration
    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 401) {
        // If the token has expired, get a new one and retry
        accessToken = await getAccessToken(tokenUrl, clientId, clientSecret);
        const retryResponse = await fetch(fhirServerUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/fhir+json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: requestBody
        });
        if (!retryResponse.ok) {
          const retryErrorBody = await retryResponse.text();
          throw new Error(`HTTP error! status: ${retryResponse.status}, body: ${retryErrorBody}`);
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }
    }

    console.log(`Submitted ${file} at ${new Date().toISOString()}`);
  } catch (error) {
    // Log detailed error information and exit the script
    console.error(`Error submitting ${file}. Details:`);
    console.error(`Request URL: ${fhirServerUrl}`);
    console.error(`Request method: POST`);
    console.error(`Request headers: ${JSON.stringify({ 'Content-Type': 'application/fhir+json', 'Authorization': 'Bearer [REDACTED]' }, null, 2)}`);
    console.error(`Request body: ${requestBody}`);
    
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
    } else {
      console.error('An unknown error occurred');
    }
    
    console.error(`Fatal error. Aborting script.`);
    process.exit(1);
  }

  return accessToken;
}

// The main function that sets up command-line arguments and initiates the bundle emission process
async function main() {
  const argv = await yargs
    .option('fhir-server', {
      type: 'string',
      description: 'FHIR server URL',
      default: 'http://localhost:8080/fhir'
    })
    .option('token-url', {
      type: 'string',
      description: 'OAuth2 token URL',
      demandOption: true
    })
    .option('client-id', {
      type: 'string',
      description: 'OAuth2 client ID',
      demandOption: true
    })
    .option('client-secret', {
      type: 'string',
      description: 'OAuth2 client secret',
      demandOption: true
    })
    .option('simulation-duration', {
      type: 'number',
      description: 'Simulation duration in seconds (optional)',
    })
    .demandCommand(1)
    .parse();

  const [inputDir] = argv._ as [string];
  
  // Ensure the input directory exists
  if (!(await fs.pathExists(inputDir))) {
    console.error(`Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  // Start the bundle emission process
  await emitBundles(
    inputDir, 
    argv['fhir-server'], 
    argv['token-url'], 
    argv['client-id'], 
    argv['client-secret'],
    argv['simulation-duration']
  );
  console.log("Emission complete.");
}

// Run the main function and catch any uncaught errors
main().catch(console.error);
