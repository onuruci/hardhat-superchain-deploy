require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const {extendEnvironment, subtask, extendConfig} = require('hardhat/config');
const prompt = require('prompt-sync')({sigint: true});
const chalk = require("chalk");
const { clearLastLine, clearLines } = require("./utils/lineManipulation");
const { task } = require("hardhat/config");
const execSync = require('child_process').execSync;

const gasAmount = 427000;

extendEnvironment((hre) => {
  let networks = hre.config.superchain.networks;
  let deployer = hre.config.superchain.deployerAccount;

  for(let i=0; i < networks.length; i++) {
    hre.config.networks[networks[i]].accounts = [deployer]
  }

});

task("generate-deployer", async (args, hre) => {
  console.log(chalk.blue('Generating a deployer wallet!\n'));
  let deployer = hre.ethers.Wallet.createRandom();

  console.log(chalk.white.bgRed.bold(deployer.mnemonic.phrase), "\n");
  console.log("Take this 12 word phrase in a secure place and enter a password!\n");

  console.log("Copy the private key into hardhat.config to be used!");
  console.log(chalk.white.bgRed.bold(deployer.privateKey))
  console.log(chalk.bold("After you enter a password phrase will be deleted !"));

  let pressEnter =prompt("Did you save it the phrase (press Enter)    ");
  clearLastLine()

  let password = prompt("Enter a password: ");
  clearLines(9);

  let encryptedWallet = await deployer.encrypt(password);

  console.log(chalk.bold("Deployer wallet in encrypted it will be saved!"));

  let name = prompt("Give a name to deployer: ");

  // here should check if such name exists and not write to file on top of it
  // this might delete wallets, which is not a wanted functionality

  fs.writeFile(`./wallets/${name}.json`, encryptedWallet, 'utf8', () => {
    console.log(chalk.bold("Deployer wallet generated successfully!"));
  });
});

task("get-private-key", "Get private key of account")
  .addParam("account", "Path to account json file")
  .setAction(async (args, hre) => {

    console.log(chalk.bold("Get private key of account\n"));

    let password = prompt("Password of account: ");

    let wallet_json = fs.readFileSync( args.account);

    let wallet = hre.ethers.Wallet.fromEncryptedJsonSync(wallet_json, password);

    console.log(chalk.bold.bgRed(wallet.privateKey));

    let pressEnter =prompt("Did you save it the private key (press Enter to continue and delete logs)    ");
    clearLines(3);

    console.log(chalk.bold.green("Task completed successfully"));
    
});


task("fund-deployer", "Fund the deployer account with native tokens")
  .addParam("contractName", "Name of the contract to be deployed")
  .addOptionalVariadicPositionalParam("constructorArgs", "Constructor arguements of the contract")
  .setAction(async (args, hre) => {
    try {
      let networks = hre.config.superchain.networks;
      let deployer = new hre.ethers.Wallet(hre.config.superchain.deployerAccount);
      let funder = new hre.ethers.Wallet(hre.config.superchain.funderAccount);

      // Calculate gas for deployment
      let contract = await hre.ethers.getContractFactory(args.contractName);
      let data = (await contract.getDeployTransaction(...args.constructorArgs)).data;

      const estimatedGas = await ethers.provider.estimateGas({ data: data });

      console.log(chalk.bold("Funding the deployer account\n"));

      for(let i=0; i < networks.length ; i++) {

        console.log(chalk.bold("-->Checking for balances on network "), chalk.bold.green(networks[i]));

        let provider = new hre.ethers.JsonRpcProvider(hre.config.networks[networks[i]].url);
        console.log("\n")
        console.log("Connected to proivder");
        let deployerBalance = hre.ethers.formatEther(await provider.getBalance(deployer.address));
        let funderBalance = hre.ethers.formatEther(await provider.getBalance(funder.address));


        let feeData = await provider.getFeeData();

        let maxGas = feeData.maxFeePerGas;
        let tip = feeData.maxPriorityFeePerGas;

        let gas = maxGas + tip;

        console.log(chalk.bold.green("Gas price:  ", gas.toString()));

        let fundToSend = hre.ethers.formatEther((gas * BigInt(estimatedGas) * BigInt(2)).toString());

        console.log(chalk.bold("Required amount of native tokens to deploy contract:  "), chalk.bold.green(fundToSend));

        if(deployerBalance >= fundToSend) {
          console.log("Balance for deployer address: ", chalk.bold(deployer.address), " ", chalk.bold.green(deployerBalance));

          console.log(chalk.bold.green("Deployer has enough amount of tokens passing to next network\n"));
        } else {
          console.log("Balance for deployer address: ", chalk.bold(deployer.address), " ", chalk.bold.red(deployerBalance));

          console.log("Balance for funder address:  ", chalk.bold(funder.address), " ", chalk.bold.green(funderBalance),"\n");

          let ifFund = prompt("Fund the deployer address (press Y and enter to continue)  ");

          if(ifFund.toLowerCase() === "y") {
            // fund the address
            let funderConnected = funder.connect(provider);

            let tx = {
              to: deployer.address,
              value: hre.ethers.parseEther(fundToSend.toString())
            }

            let res = await funderConnected.sendTransaction(tx);

            console.log("Tx hash to fund deployer ", chalk.bold(res.hash), "on network  ", chalk.bold.green(networks[i]));

            console.log(chalk.bold.green("Tx sent for funding the deployer passing to next network\n"));
          }
        }
      }

      console.log(chalk.bold.green("Funding phase is completed continue with deploying"));
    } catch(err) {
      console.log(err);
      return;
    }
  }
);

task("check-balances", "Check balances of deployer and funder on wanted chains")
  .setAction(async (args, hre) => {
    try {
      let networks = hre.config.superchain.networks;
      let deployer = new hre.ethers.Wallet(hre.config.superchain.deployerAccount);
      let funder = new hre.ethers.Wallet(hre.config.superchain.funderAccount);

      let funded = true;

      console.log(chalk.bold("Checking balances\n"));

      for(let i=0; i < networks.length ; i++) {

        console.log(chalk.bold("-->Checking for balances on network "), chalk.bold.green(networks[i]));

        let provider = new hre.ethers.JsonRpcProvider(hre.config.networks[networks[i]].url);

        let deployerBalance = hre.ethers.formatEther(await provider.getBalance(deployer.address));
        let funderBalance = hre.ethers.formatEther(await provider.getBalance(funder.address));

        let gas =  (await provider.getFeeData()).gasPrice;

        let fundToSend = hre.ethers.formatEther((gas * BigInt(gasAmount)).toString());

        console.log("Balance for deployer address: ", chalk.bold(deployer.address), " ", chalk.bold.blue(deployerBalance));

        console.log("Balance for funder address:  ", chalk.bold(funder.address), " ", chalk.bold.green(funderBalance),"\n");

        console.log(chalk.bold("Required amount of native tokens to deploy contract:  "), chalk.bold.green(fundToSend));

        if(deployerBalance >= fundToSend) {
          console.log(chalk.bold.green("Deployer has enough amount of funds"));
        } else {
          console.log(chalk.bold.red("Deployer does not have enough amount of tokens, fund it!\n\n"));
          funded = false;
        }
      }

      return funded;
    } catch(err) {
      console.log(err);
      return false;
    }
  });

task("superchain-deploy", "Deploy smart contracts to superchain")
  .addParam("path", "Path to deploy script")
  .setAction(async (args, hre) => {
    let balancesRes = await hre.run("check-balances");

    if(!balancesRes) {
      return;
    }

    console.log(chalk.bold("-->Deployment phase"));

    let networks = hre.config.superchain.networks;

    for(let i=0; i < networks.length; i++) {
      console.log("Deploying for network: ", chalk.bold.green(networks[i]));
      console.log("Deployment script logs");
      console.log("-->");
      console.log("-->\n\n");
      hre.hardhatArguments.network = networks[i];
      await hre.run("run", { script: args.path });

      console.log("\n\n");
      console.log(chalk.bold.green("Deployed successfully to ", networks[i]));
      console.log(chalk.bold.green("\nPassing to next network"));
    }
    
  })

task("superchain-verify", "Verify contracts on deployed networks")
  .addParam("address", "Address of the deployed contract")
  .addOptionalVariadicPositionalParam("constructorArgs", "Constructor arguements of the contract")
  .setAction(async (args, hre) => {
    let networks = hre.config.superchain.networks;

    for(let i=0; i < networks.length; i++) {
      console.log("Verifiying for network: ", chalk.bold.green(networks[i]));
      console.log("-->");
      console.log("-->\n\n");
      hre.hardhatArguments.network = networks[i];

      let res = execSync(`npx hardhat verify --network ${networks[i]} ${args.address} ${args.constructorArgs}`);
      var enc = new TextDecoder("utf-8");

      console.log(enc.decode(res));

      console.log("\n\n");
    }
  });


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
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/olvyiXDSdK2fqK3CgEpJg4VUvaw4nQ48"
    },
    optimismGoerli: {
      url: "https://goerli.optimism.io"
    },
    baseGoerli: {
      url: "https://goerli.base.org"
    },
    modeSepolia: {
      url: "https://sepolia.mode.network/"
    }
  },
  superchain: {
    networks: ["optimismGoerli", "baseGoerli"],
    deployerAccount: process.env.DEPLOYER_ACCOUNT,
    funderAccount: process.env.FUNDER_ACCOUNT
  },
  etherscan: {
    apiKey: {
      optimisticGoerli: process.env.OPTIMISM_API,
      baseGoerli: process.env.BASE_API,
      avalancheFujiTestnet: process.env.FUJI_API,
      goerli: process.env.GOERLI_API
    }
  },
  solidity: "0.8.19",
};

