import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'hardhat-deploy'
import * as dotenv from 'dotenv'
dotenv.config()


const TESTNET_RPC= process.env.CITREA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    citrea_testnet: {
      url: TESTNET_RPC,
      accounts: [PRIVATE_KEY!],
        chainId: 5115,
      saveDeployments: true,
    },
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },

  }
};

export default config;