import * as fs from "fs-extra";
import * as path from "path";
import * as yargs from "yargs";
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

/**
 * Data Structures
 * 
 * We define the core data structures used throughout the program.
 * These interfaces represent the FHIR resources we'll be working with.
 */

interface Resource {
  resourceType: string;
  id: string;
  subject?: { reference: string };
  [key: string]: any;
}

interface BundleEntry {
  resource: Resource;
  request: {
    method: string;
    url: string;
  };
}

interface Bundle {
  resourceType: "Bundle";
  type: "batch";
  timestamp?: string;
  entry: BundleEntry[];
}

interface FileMetadata {
  file: string;
  timestamp: number;
}

/**
 * Process Bundle Function
 * 
 * This is the core function of our program. It takes an input bundle,
 * processes its resources, and creates individual event bundles for
 * Observations and Conditions.
 */
async function processBundle(
  inputPath: string,
  outputDir: string
): Promise<void> {
  const inputBundle: Omit<Bundle, "type"> & { entry: { resource: Resource }[] } = await fs.readJSON(inputPath);
  const patients: { [key: string]: Resource } = {};
  const eventBundles: Bundle[] = [];

  // Process all resources in a single pass
  for (const entry of inputBundle.entry) {
    const resource = entry.resource;

    if (resource.resourceType === "Patient") {
      const patientId = resource.id.replace(/^urn:uuid:/, "");
      patients[patientId] = resource;
    } else if (
      resource.resourceType === "Observation" ||
      resource.resourceType === "Condition"
    ) {
      if (resource.subject && resource.subject.reference) {
        const patientId = resource.subject.reference
          .split("/")
          .pop()
          ?.replace(/^urn:uuid:/, "");
        if (patientId && patients[patientId]) {
          const timestamp = resource.resourceType === "Condition" ? resource.recordedDate : resource.effectiveDateTime;

          eventBundles.push({
            resourceType: "Bundle",
            type: "batch",
            timestamp,
            entry: [
              {
                resource: patients[patientId],
                request: {
                  method: "PUT",
                  url: `Patient/${patients[patientId].id}`,
                },
              },
              {
                resource,
                request: {
                  method: "PUT",
                  url: `${resource.resourceType}/${resource.id}`,
                },
              },
            ],
          });
        }
      }
    }
  }

  // Write all event bundles in parallel
  await Promise.all(
    eventBundles.map(async (bundle) => {
      const resourceType = bundle.entry[1].resource.resourceType.toLowerCase();
      const resourceId = bundle.entry[1].resource.id;
      const outputFileName = `${resourceType}_${resourceId}.json`;
      const outputPath = path.join(outputDir, outputFileName);
      await fs.writeJSON(outputPath, bundle, { spaces: 2 });
    })
  );
}

/**
 * Generates metadata for all JSON files in the specified directory.
 * This metadata includes the filename and timestamp for each file.
 * 
 * @param outputDir - The directory containing the JSON files
 * @returns A promise that resolves to an array of FileMetadata objects
 */
async function generateFileMetadata(outputDir: string): Promise<FileMetadata[]> {
  // Get all JSON files in the directory
  const files = await fs.readdir(outputDir);
  const jsonFiles = files.filter((file: string) => file.endsWith(".json"));
  console.log(`Found ${jsonFiles.length} JSON files in the output directory.`);

  const metadata: FileMetadata[] = [];
  let processedFiles = 0;
  // Calculate logging interval (log every 5% of files processed)
  const logInterval = Math.max(1, Math.floor(jsonFiles.length / 20));
  const startTime = Date.now();

  // Process each JSON file
  for (const file of jsonFiles) {
    const filePath = path.join(outputDir, file);
    let fileStream: fs.ReadStream | null = null;
    let rl: ReturnType<typeof createInterface> | null = null;

    try {
      // Create a read stream and readline interface for efficient file reading
      fileStream = createReadStream(filePath);
      rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      let timestamp = 0;
      // Read the file line by line to find the timestamp
      for await (const line of rl) {
        if (line.includes('"timestamp"')) {
          const match = line.match(/"timestamp"\s*:\s*"([^"]+)"/);
          if (match) {
            timestamp = new Date(match[1]).getTime();
            break;  // Exit the loop once we've found the timestamp
          }
        }
      }

      metadata.push({ file, timestamp });
    } finally {
      // Ensure resources are properly closed
      if (rl) rl.close();
      if (fileStream) fileStream.close();
    }

    // Log progress
    processedFiles++;
    if (processedFiles % logInterval === 0 || processedFiles === jsonFiles.length) {
      const percentage = (processedFiles / jsonFiles.length * 100).toFixed(1);
      const elapsedTime = (Date.now() - startTime) / 1000;
      const filesPerSecond = (processedFiles / elapsedTime).toFixed(2);
      console.log(`Processed metadata for ${processedFiles}/${jsonFiles.length} files (${percentage}%) - ${filesPerSecond} files/sec`);
    }
  }

  console.log("Finished processing all files. Sorting metadata...");
  // Sort metadata by timestamp to ensure chronological order
  const sortedMetadata = metadata.sort((a, b) => a.timestamp - b.timestamp);
  console.log("Metadata sorting complete.");

  return sortedMetadata;
}

/**
 * Main Function
 * 
 * This function orchestrates the entire process. It handles command-line
 * arguments, sets up the environment, and processes all input files.
 */
async function main() {
  // Parse command line arguments
  const argv = await yargs
    .option('limit', {
      type: 'number',
      description: 'Limit the number of input bundles to process'
    })
    .option('concurrency', {
      type: 'number',
      description: 'Number of files to process concurrently',
      default: 5
    })
    .demandCommand(2)
    .parse();

  const [inputDir, outputDir] = argv._ as [string, string];
  const concurrencyLimit = argv.concurrency as number;
  
  // Ensure both directories exist
  if (!(await fs.pathExists(inputDir))) {
    console.error(`Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  await fs.ensureDir(outputDir);

  // Get the list of JSON files to process
  const files = await fs.readdir(inputDir);
  const jsonFiles = files.filter((file: string) => file.endsWith(".json"));
  const filesToProcess = argv.limit ? jsonFiles.slice(0, argv.limit) : jsonFiles;

  // Process files in parallel with the specified concurrency limit
  const processFile = async (file: string) => {
    const inputPath = path.join(inputDir, file);
    await processBundle(inputPath, outputDir);
  };

  for (let i = 0; i < filesToProcess.length; i += concurrencyLimit) {
    const batch = filesToProcess.slice(i, i + concurrencyLimit);
    await Promise.all(batch.map(processFile));
  }

  // After processing all files, generate and save metadata
  console.log("Starting file metadata generation...");
  const metadataStartTime = Date.now();
  const metadata = await generateFileMetadata(outputDir);
  const metadataEndTime = Date.now();
  const metadataProcessingTime = (metadataEndTime - metadataStartTime) / 1000;
  console.log(`File metadata generation completed in ${metadataProcessingTime.toFixed(2)} seconds.`);

  // Write the metadata to a JSON file
  console.log("Writing file metadata to disk...");
  const metadataPath = path.join(outputDir, "index.json");
  const writeStartTime = Date.now();
  await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
  const writeEndTime = Date.now();
  const writeTime = (writeEndTime - writeStartTime) / 1000;
  console.log(`File metadata saved to ${metadataPath} in ${writeTime.toFixed(2)} seconds.`);

  // Log a summary of the metadata
  const totalFiles = metadata.length;
  const firstTimestamp = new Date(metadata[0].timestamp).toISOString();
  const lastTimestamp = new Date(metadata[metadata.length - 1].timestamp).toISOString();
  console.log(`Metadata summary:`);
  console.log(`  Total files indexed: ${totalFiles}`);
  console.log(`  First event timestamp: ${firstTimestamp}`);
  console.log(`  Last event timestamp: ${lastTimestamp}`);

  console.log(`Processing complete. Processed ${filesToProcess.length} input files.`);
}

// Run the main function
main().catch(console.error);
