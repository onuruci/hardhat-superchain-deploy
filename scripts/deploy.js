// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  console.log("Hello");
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime =  1691983464;

  const feeData = await hre.ethers.provider.getFeeData();

  const lockedAmount = hre.ethers.parseEther("0.001");

  //console.log(hre.network);

  const lock = await hre.ethers.deployContract("Lock", [unlockTime], {gasPrice: feeData.maxFeePerGas});

  console.log(
    `Lock with ${hre.ethers.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.log("Errror");
  console.error(error);
  process.exitCode = 1;
});
