// This script is designed to emit FHIR bundles to a FHIR server, simulating real-time data submission.
// It can optionally compress the timeline of events into a specified duration.

import * as fs from "fs-extra";
import * as path from "path";
import * as yargs from "yargs";
import { createReadStream } from 'fs';
import { createInterface, Interface } from 'readline';

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

interface FileMetadata {
  file: string;
  timestamp: number;
}

async function readIndex(inputDir: string): Promise<FileMetadata[]> {
  const metadataPath = path.join(inputDir, "index.json");
  if (!(await fs.pathExists(metadataPath))) {
    throw new Error(`Metadata file not found: ${metadataPath}`);
  }
  return fs.readJSON(metadataPath);
}

// This is the main function that emits bundles to the FHIR server
async function runSimulation(inputDir: string, fhirServerUrl: string, tokenUrl: string, clientId: string, clientSecret: string, simulationDuration?: number): Promise<void> {
  const startTime = new Date();
  let firstEventTime: number | null = null;
  let lastEventTime: number | null = null;
  let compressionFactor: number;

  // Get initial access token
  let accessToken = await getAccessToken(tokenUrl, clientId, clientSecret);

  console.log("Reading index file...");
  const fileMetadata = await readIndex(inputDir);

  console.log("Calculating event time range...");
  // Determine the time range of all events
  firstEventTime = fileMetadata[0].timestamp;
  lastEventTime = fileMetadata[fileMetadata.length - 1].timestamp;

  const originalDuration = lastEventTime - firstEventTime;
  // Calculate compression factor if simulation duration is specified
  compressionFactor = simulationDuration ? (simulationDuration * 1000 / originalDuration) : 1;

  // Format durations as human-readable strings
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  };

  // Log details about the event time range and compression
  console.log(`Event time range:`);
  console.log(`  First event: ${new Date(firstEventTime).toISOString()}`);
  console.log(`  Last event: ${new Date(lastEventTime).toISOString()}`);
  console.log(`  Original duration: ${formatDuration(originalDuration)} (${originalDuration} ms)`);
  console.log(`  Simulation duration: ${simulationDuration ? formatDuration(simulationDuration * 1000) : 'Not specified'}`);
  console.log(`  Compression factor: ${compressionFactor.toFixed(4)}`);
  console.log("");

  console.log("Starting to process files...");
  let filesProcessed = 0;
  let lastLogTime = Date.now();
  const simulationStartTime = Date.now();
  const simulationEndTime = simulationStartTime + (lastEventTime - firstEventTime!) * compressionFactor;

  for (const { file, timestamp } of fileMetadata) {
    // Calculate the time to wait before processing this file
    const eventTime = timestamp;
    const simulatedEventTime = startTime.getTime() + (eventTime - firstEventTime!) * compressionFactor;
    const waitTime = simulatedEventTime - Date.now();

    // Wait until it's time to process this file according to the simulation timeline
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Process the bundle and potentially refresh the access token
    accessToken = await simulateEvent(file, inputDir, fhirServerUrl, accessToken, tokenUrl, clientId, clientSecret);
    
    filesProcessed++;

    // Log summary every second
    if (Date.now() - lastLogTime >= 1000) {
      const currentSimulationTime = Date.now();
      const percentComplete = ((currentSimulationTime - simulationStartTime) / (simulationEndTime - simulationStartTime)) * 100;
      const lag = currentSimulationTime - simulatedEventTime;
      console.log(`Simulation time: ${new Date(simulatedEventTime).toISOString()}, events: ${filesProcessed}/${fileMetadata.length}, lag: ${lag.toFixed(0)}ms`);
      lastLogTime = Date.now();
    }
  }

  // Final log after all files are processed
  console.log(`Files processed: ${filesProcessed}/${fileMetadata.length} (100.00%)`);

  // Log summary information
  console.log(`Finished processing all files.`);
  console.log(`Total files processed: ${fileMetadata.length}`);
  console.log(`First event time: ${new Date(firstEventTime).toISOString()}`);
  console.log(`Last event time: ${new Date(lastEventTime).toISOString()}`);
  console.log(`Original duration: ${formatDuration(originalDuration)} (${originalDuration}ms)`);
  console.log(`Simulated duration: ${formatDuration((Date.now() - startTime.getTime()))}`);
  console.log(`Overall compression factor: ${compressionFactor.toFixed(2)}`);
}

// This function processes a single bundle file
async function simulateEvent(
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
  
  console.log("Script arguments:");
  console.log(`  Input directory: ${inputDir}`);
  console.log(`  FHIR server: ${argv['fhir-server']}`);
  console.log(`  Token URL: ${argv['token-url']}`);
  console.log(`  Client ID: ${argv['client-id']}`);
  console.log(`  Client Secret: ${argv['client-secret'].substring(0, 3)}...`); // Only show first 3 characters for security
  console.log(`  Simulation duration: ${argv['simulation-duration'] || 'Not specified'}`);
  console.log(""); // Empty line for better readability

  // Ensure the input directory exists
  if (!(await fs.pathExists(inputDir))) {
    console.error(`Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  // Start the bundle emission process
  await runSimulation(
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
