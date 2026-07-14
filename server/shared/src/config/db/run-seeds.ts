import { appDataSource } from "./data-source";
import { runSeeders } from "typeorm-extension";

async function runSeeds() {
  try {
    await appDataSource.initialize();
    console.log("Data Source initialized");

    await runSeeders(appDataSource);
    console.log("Seeds executed successfully");

    await appDataSource.destroy();
    console.log("Data Source destroyed");

    process.exit(0);
  } catch (error) {
    console.error("Error running seeds:", error);
    process.exit(1);
  }
}

runSeeds();
