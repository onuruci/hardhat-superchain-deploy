require("@nomicfoundation/hardhat-toolbox");

const chalk = require("chalk");

task("envtest", async (args, hre) => {
  console.log(chalk.blue('Hello world!'));
});


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
};
