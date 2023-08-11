require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const {extendEnvironment, subtask, extendConfig} = require('hardhat/config');
const prompt = require('prompt-sync')({sigint: true});
const chalk = require("chalk");
const { clearLastLine, clearLines } = require("./utils/lineManipulation");
const { task } = require("hardhat/config");

const gasAmount = 427000;

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

extendEnvironment((hre) => {
  let networks = hre.config.superchain.networks;
  let deployer = hre.config.superchain.deployerAccount;

  for(let i=0; i < networks.length; i++) {
    hre.config.networks.fuji.accounts = [deployer]
  }

});


task("superchain-deploy", "Deploy smart contracts to superchain")
  .addParam("path", "Path to deploy script")
  .addParam("deployer", "Path to deployer json file")
  .setAction(async (args, hre) => {

    try {
      //console.log(hre.network);

      // get gas prices

      let networks = hre.config.superchain.networks;
      let deployer = new hre.ethers.Wallet(hre.config.superchain.deployerAccount);
      let funder = new hre.ethers.Wallet(hre.config.superchain.funderAccount);

      console.log(deployer);

      console.log(funder);

      for(let i=0; i < networks.length ; i++) {

        let provider = new hre.ethers.JsonRpcProvider(hre.config.networks[networks[i]].url);
        let deployerBalance = await provider.getBalance(deployer.address);
        let funderBalance = await hre.ethers.formatEther(await provider.getBalance(funder.address));

        let gas =  (await provider.getFeeData()).gasPrice;

        let fundToSend = await hre.ethers.formatEther((gas * BigInt(gasAmount)).toString());

        console.log(fundToSend);

        console.log(balance);
      }

      //hre.hardhatArguments.network = "hardhat";

      await hre.run("run", { script: args.path, network: hre.config.networks.hardhat });

    } catch(err) {
      console.log(err);
      return;
    }
  }
);



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
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
  superchain: {
    networks: ["fuji"],
    deployerAccount: process.env.DEPLOYER_ACCOUNT,
    funderAccount: process.env.FUNDER_ACCOUNT
  },
  solidity: "0.8.19",
};

