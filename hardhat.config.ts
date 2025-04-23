// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import './scripts/SendOFT'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/types'

import { EndpointId } from '@layerzerolabs/lz-definitions'

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
      ? [PRIVATE_KEY]
      : undefined

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    deterministicDeployment: {
        'sepolia-testnet': {
            factory: '0x8B32257Bac967FF1Ad3454D65998ba50d4eD3190',
            deployer: '0x0130c9E9c49a59a269D1Ca808B3F06e2e442082B',
            funding: '10000000',
            signedTx: '0x',
        },
    },
    networks: {
        'sepolia-testnet': {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts,
        },
        'base-sepolia': {
            eid: EndpointId.BASESEP_V2_TESTNET,
            url: `https://base-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts,
        },
        'arbitrum-sepolia': {
            eid: EndpointId.ARBSEP_V2_TESTNET,
            url: `https://arbitrum-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            accounts,
        },
        'hyperliquid-testnet': {
            eid: EndpointId.HYPERLIQUID_V2_TESTNET,
            url: 'https://rpc.hyperliquid-testnet.xyz/evm',
            accounts,
        },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
}

export default config
