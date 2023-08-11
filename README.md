# hardhat-superchain-deployer

Hardhat plugin for deploying contracts to same addresses on EVM chains. Being built for superchain to make this process easier for developers on OP stack. This is a https://ethglobal.com/events/superhack hackathon project.


## What

Smart contract address is determined by the sender's address and a nonce. This nonce is the total transactions sent from sender. With this plugin you can generate a fresh EOA deployer account, fund it and deploy your contract on different chains in single commands.

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

`fund-deployer` sends funds to freshly generated EOA deployer account on each selected network to be used as gas on contract deployment.

```
npx hardhat fund-deployer
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

### 


## Configuration

This plugin uses network configuration for determining network. Only the url for the network is required. This plugin extends the HardhatConfig with `superchain` field. It requires the names of the wanted networks (contracts will be deployed on thos networks), private key of the deployer account this should be the freshly generated EOA using `generate-deployer` and private key of an account to fund this deployer on wanted networks, this can be your personal account which has funds on each network.

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
};
```

## Usage

First of all have a funder account which has funds on each wanted network. Then configure the hardhat.config file.

Later run

```
npx hardhat generate-deployer
```

Generate a fresh EOA, copy its private key and use it in hardhat.config.

Then run

```
npx hardhat fund-deployer
```

Fund the deployer account and deployer is ready to deploy contracts

To deploy contract to all chains run 

```
npx hardhat superchain-deploy --path <Path to deploy script>
```

This will run deploy script on all chains.

