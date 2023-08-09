require("@nomicfoundation/hardhat-toolbox");
const fs = require('fs');
const prompt = require('prompt-sync')({sigint: true});
const chalk = require("chalk");

task("envtest", async (args, hre) => {
  console.log(chalk.blue('Hello world!'));
});

const clearLastLine = () => {
  process.stdout.moveCursor(0, -1) // up one line
  process.stdout.clearLine(1) // from cursor to end
  process.stdout.moveCursor(0, 1)
}

const clearLines = (lineCount) => {
  process.stdout.moveCursor(0, -1* lineCount) // up one line

  process.stdout.clearScreenDown()

  process.stdout.moveCursor(0, lineCount)
}

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

task("generate-deployer", async (args, hre) => {
  console.log(chalk.blue('Generating a deployer wallet!\n'));
  let deployer = hre.ethers.Wallet.createRandom();

  console.log(chalk.white.bgRed.bold(deployer.mnemonic.phrase), "\n");
  console.log("Take this 12 word phrase in a secure place and enter a password!");
  console.log(chalk.bold("After you enter a password phrase will be deleted !"));

  let pressEnter =prompt("Did you save it the phrase (press Enter)");
  clearLastLine()
  let password = prompt("Enter a password: ");

  clearLines(6);

  let encryptedWallet = await deployer.encrypt(password);

  console.log(chalk.bold("Deployer wallet in encrypted it will be saved!"));

  let name = prompt("Give a name to deployer: ");

  // here should check if such name exists and not write to file
  // this might delete wallets which is not wanted

  fs.writeFile(`${name}.json`, encryptedWallet, 'utf8', () => {
    console.log(chalk.bold("Deployer wallet generated successfully!"));
  });

});



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
};
