import * as fs from "fs-extra";
import * as path from "path";
import * as yargs from "yargs";

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
  type: "batch";  // Changed from "transaction" to "batch"
  timestamp?: string;
  entry: BundleEntry[];
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

  console.log(`Processing complete. Processed ${filesToProcess.length} files.`);
}

// Run the main function
main().catch(console.error);
