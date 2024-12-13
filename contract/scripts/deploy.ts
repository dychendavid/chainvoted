import { deployContract, verifyContract, sleep } from "./deploy-helper";

async function main() {
  try {
    // Deploy the contract
    const poll = await deployContract("Poll", [[1, 2]]);
    console.log("Poll deployed to:", await poll.getAddress());

    // Wait a bit before verification (some networks need this)
    // await sleep(20000); // 20 seconds
  } catch (error) {
    console.error("Error in deployment:", error);
    throw error;
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
