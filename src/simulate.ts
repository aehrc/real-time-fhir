import * as fs from "fs-extra";
import * as path from "path";
import * as yargs from "yargs";

interface Bundle {
  resourceType: "Bundle";
  type: "transaction";
  timestamp?: string;
  entry: any[];
}

interface IndexEntry {
  file: string;
  timestamp: number;
}

function timestampToIso(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

async function readIndex(inputDir: string): Promise<IndexEntry[]> {
  const metadataPath = path.join(inputDir, "index.json");
  if (!(await fs.pathExists(metadataPath))) {
    throw new Error(`Metadata file not found: ${metadataPath}`);
  }
  return fs.readJSON(metadataPath);
}

async function runSimulation(
  inputDir: string,
  fhirServerUrl: string,
  compressionFactor: number
): Promise<void> {
  const realStartTime = new Date();

  console.log("Reading index file...");
  const index = await readIndex(inputDir);
  console.log(`Index file read: ${index.length} events found.`);

  // Start with the first event time.
  let simulationTime = 0;
  const originalStartTime = index[0].timestamp;

  let i = 0;
  while (i < index.length) {
    // Peek at the next event time.
    const nextOriginalTime = index[i].timestamp;

    // Convert the original time to a simulation time, and check whether we have reached that time yet.
    const nextSimulationTime =
      (nextOriginalTime - originalStartTime) * compressionFactor;
    const nextOriginalTimeIso = timestampToIso(nextOriginalTime);

    console.log(`Original start time: ${timestampToIso(originalStartTime)}`);
    console.log(`Next original time: ${nextOriginalTimeIso}`);
    console.log(`Current simulation time: ${simulationTime}`);
    console.log(
      `Next event has original time ${nextOriginalTimeIso} and simulation time ${nextSimulationTime}.`
    );

    if (nextSimulationTime <= simulationTime) {
      // If we have reached that time, send the event.
      console.log(`Sending event: ${index[i].file}`);
      await simulateEvent(index[0].file, inputDir, fhirServerUrl);
      i++;
    } else {
      // If we have not reached that time, wait until we get there.
      const waitTime = nextSimulationTime - simulationTime;
      console.log(`Waiting for ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    // Advance the simulation time.
    simulationTime = nextSimulationTime;
  }
}

async function simulateEvent(
  file: string,
  inputDir: string,
  fhirServerUrl: string
): Promise<void> {
  const filePath = path.join(inputDir, file);
  const bundle: Bundle = await fs.readJSON(filePath);

  // Update the bundle's timestamp to the current time.
  if (bundle.timestamp) {
    bundle.timestamp = new Date().toISOString();
  }

  // Attempt to submit the bundle to the FHIR server.
  const requestBody = JSON.stringify(bundle);
  const headers: Record<string, string> = {
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
  };

  const response = await fetch(fhirServerUrl, {
    method: "POST",
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    // If the response is not OK, throw an error.
    const errorBody = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${errorBody}`
    );
  }
}

async function main() {
  const argv = await yargs
    .option("fhir-server", {
      type: "string",
      description: "FHIR server URL",
      default: "http://localhost:8080/fhir",
    })
    .option("compression-factor", {
      type: "number",
      description: "Factor by which time is compressed during the simulation",
      default: 1,
    })
    .demandCommand(1)
    .parse();

  const [inputDir] = argv._ as [string];

  // Log the script arguments.
  console.log(`Input directory: ${inputDir}`);
  console.log(`FHIR server: ${argv["fhir-server"]}`);
  console.log(`Compression factor: ${argv["compression-factor"]}`);
  console.log("");

  // Ensure the input directory exists.
  if (!(await fs.pathExists(inputDir))) {
    console.error(`Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  // Start the simulation.
  await runSimulation(
    inputDir,
    argv["fhir-server"],
    argv["compression-factor"]
  );
  console.log("Simulation complete.");
}

// Run the main function and catch any uncaught errors.
main().catch(console.error);
