# hardhat-superchain-deployer

Hardhat plugin for deploying contracts to same addresses on EVM chains. Being built for superchain to make development easier on OP stack. This is a https://ethglobal.com/events/superhack hackathon project.


## What

Smart contract address is determined by the sender's address and a nonce. This nonce is the total transactions sent from sender. In order to deploy a smart contract on multiple chain with the same address it will be best practice to generate a new EOA account and deploy with it. 

With this plugin you can generate a fresh EOA deployer account, fund it, deploy your contract and verify them on different chains in single commands.

After deployment you can use this wallet on metamask. For ownable contracts you can interact with them.


## Installation

This is still the development environment you can test the plugin by hand.

```bash
npm install
```

## Tasks

This plugin adds several tasks to Hardhat:

### generate-deployer

`generate-deployer` generates a fresh EOA account for deploying. Logs the private key, mnemonic phrases for user to save. Asks for password encrypts it, saves it and deletes logs.

```
npx hardhat generate-deployer
```

### get-private-key

`get-private-key` logs the private key of the given wallet. Asks for the password of the wallet, decrypts it, logs it, wait for user to press Enter and deletes logs.

```
npx hardhat get-private-key --account <path to wallet>
```

### fund-deployer

`fund-deployer` calculates needed amount of gas to deploy the contract on each wanted chain then sends funds to freshly generated EOA deployer account.

```
npx hardhat fund-deployer --contract-name <name of the contract> CONSTRUCTOR_ARGS
```

### check-balances

`check-balances` checks balances of deployer and funder account and logs if required amount of balance they have.

```
npx hardhat check-balances
```

### superchain-deploy

`superchain-deploy` gets deployment script path as arguement. Runs the deployment script on each selected chain with deployer account.

```
npx hardhat superchain-deploy --path <Path to deploy script>
```

### superchain-verify

`superchain-verify` gthe deployed contract on each configured network. For this task to work successfully api keys for block explorers should be set. It runs `hardhat verify` on each network. For more information about verify configuration you can check [Hardhat docs](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify)

```
npx hardhat superchain-verify --address <Address of the deployed contract> CONSTRUCTOR_ARGS
```

### 


## Configuration

This plugin uses network configuration for determining network. Only the url for the network is required. This plugin extends the HardhatConfig with `superchain` field. It requires the names of the wanted networks (contracts will be deployed on thos networks), private key of the deployer account this should be the freshly generated EOA using `generate-deployer` and private key of an account to fund this deployer on wanted networks, this can be your personal account which has funds on each network.

For verifying contracts you need to set block explorer api keys, to learn how to do that you can check [Hardhat docs](https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify).

This is an example of how to set it:

```js
module.exports = {
  networks: {
    exampleNetwork: {
      url: "url to network", 
    },
  },
  superchain: {
    networks: ["exampleNetwork", <other wanted networks>],
    deployerAccount: <deployer account private key>,
    funderAccount: <private key of an account to fund deployer>
  },
  etherscan: {
    apiKey: {
      optimisticGoerli: <optimism explorer api key>,
      baseGoerli: <base explorer api key>,
    }
  },
};
```

## Usage

First of all have a funder account which has funds on each wanted network. Then configure the hardhat.config file.

Later run

```
npx hardhat generate-deployer
```

Generate a fresh EOA, copy its private key and use it in hardhat.config.

If private key of deployer is lost somehow run 

```
npx hardhat get-private-key --account <path to the wallet json file>
```

Deployer needs gas to deploy the contract. To fund deployer run

```
npx hardhat fund-deployer --contract-name <name of the contract> CONSTRUCTOR_ARGS
```

Fund the deployer account and deployer is ready to deploy contracts

To deploy contract to all chains run 

```
npx hardhat superchain-deploy --path <Path to deploy script>
```

This will run deploy script on all chains.

After deployment to verify contract on all network explorers run

```
npx hardhat superchain-verify --address <Address of the deployed contract> CONSTRUCTOR_ARGS
```