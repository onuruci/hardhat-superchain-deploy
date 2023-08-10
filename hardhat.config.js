require("@nomicfoundation/hardhat-toolbox");
const fs = require('fs');
const path = require('path');
const { createProvider } = require("hardhat/internal/core/providers/construction");
const {extendEnvironment, subtask, extendConfig} = require('hardhat/config');
const prompt = require('prompt-sync')({sigint: true});
const chalk = require("chalk");
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const { clearLastLine, clearLines } = require("./utils/lineManipulation");
const { task } = require("hardhat/config");
const { ProviderWrapper } = require('hardhat/plugins')


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
  .addParam("deployer", "Path to deployer json file")
  .setAction(async (args, hre) => {

    try {require("hardhat-change-network");

      hre.config.networks.fuji.accounts = [""]

      console.log(hre.network);

      hre.hardhatArguments.network = "fuji";

      await hre.run("run", { script: args.path, network: hre.config.networks.hardhat });

    } catch(err) {
      console.log(err);
      return;
    }
  }
);



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "fuji",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/<key>", 
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
    }
  },
  solidity: "0.8.19",
};

