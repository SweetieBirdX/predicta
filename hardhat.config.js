require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    // Saga chainlet network
    saga: {
      url: process.env.SAGA_RPC_URL,
      chainId: Number(process.env.SAGA_CHAIN_ID),
      accounts: [process.env.PRIVATE_KEY].filter(Boolean)
    }
  },
  paths: {
    sources: "./src/contracts",
    tests:   "./test",
    cache:   "./cache",
    artifacts: "./artifacts"
  }
};
