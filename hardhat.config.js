require("@nomicfoundation/hardhat-toolbox");
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')({sigint: true});
const chalk = require("chalk");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { clearLastLine, clearLines } = require("./utils/lineManipulation");
const { task } = require("hardhat/config");


task("generate-deployer", async (args, hre) => {
  console.log(chalk.blue('Generating a deployer wallet!\n'));
  let deployer = hre.ethers.Wallet.createRandom();

  console.log(chalk.white.bgRed.bold(deployer.mnemonic.phrase), "\n");
  console.log("Take this 12 word phrase in a secure place and enter a password!");
  console.log(chalk.bold("After you enter a password phrase will be deleted !\n"));

  let pressEnter =prompt("Did you save it the phrase (press Enter)    ");
  clearLastLine()

  let password = prompt("Enter a password: ");
  clearLines(7);

  let encryptedWallet = await deployer.encrypt(password);

  console.log(chalk.bold("Deployer wallet in encrypted it will be saved!"));

  let name = prompt("Give a name to deployer: ");

  // here should check if such name exists and not write to file on top of it
  // this might delete wallets, which is not a wanted functionality

  fs.writeFile(`./wallets/${name}.json`, encryptedWallet, 'utf8', () => {
    console.log(chalk.bold("Deployer wallet generated successfully!"));
  });
});

task("superchain-deploy", "Deploy smart contracts to superchain")
  .addParam("path", "Path to deploy script")
  .setAction(async (args, hre) => {
    const filePath = args.path;

    const absolutePath = path.resolve(filePath);

    try {
       const { stdout, stderr } = await exec(`node ${filePath}`);

       console.log(stderr);
       console.log(stdout);
    } catch (err) {

    }
  }
);



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
};
