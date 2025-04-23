import { parseEther, formatEther } from 'ethers/lib/utils'
import { deployments } from 'hardhat'

// Import ethers directly as it seems to be used this way in the project
const { ethers } = require('hardhat')

async function main() {
    // Get the network name to display in logs
    const network = await ethers.provider.getNetwork()
    console.log(`Network: ${network.name} (chainId: ${network.chainId})`)

    // Get the signer (account that will send the transaction)
    const [signer] = await ethers.getSigners()
    console.log(`Using signer: ${signer.address}`)

    // Get the deployed PRFI contract
    let prfi
    try {
        // Try to get the contract using hardhat-deploy's getContract
        prfi = await ethers.getContract('PRFI')
    } catch (error) {
        // If not found, try to get the deployment and create a contract instance
        const deployment = await deployments.get('PRFI')
        const PRFI = await ethers.getContractFactory('PRFI')
        prfi = PRFI.attach(deployment.address)
    }
    console.log(`PRFI contract address: ${prfi.address}`)

    // Default parameters
    const recipientAddress = process.env.RECIPIENT_ADDRESS || signer.address
    const amountToMint = process.env.AMOUNT_TO_MINT ? 
        parseEther(process.env.AMOUNT_TO_MINT) : 
        parseEther('1000') // Default to 1000 tokens if not specified

    console.log(`Minting ${formatEther(amountToMint)} PRFI tokens to ${recipientAddress}`)

    // Check if the signer is the owner of the contract
    const owner = await prfi.owner()
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        console.error(`Error: The signer (${signer.address}) is not the owner of the PRFI contract (${owner})`)
        console.error('Only the owner can mint tokens. Please use the correct private key.')
        process.exit(1)
    }

    // Mint tokens
    const tx = await prfi.mint(recipientAddress, amountToMint)
    console.log(`Transaction hash: ${tx.hash}`)
    
    // Wait for the transaction to be mined
    console.log('Waiting for transaction confirmation...')
    const receipt = await tx.wait()
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`)
    
    // Get the new balance of the recipient
    const newBalance = await prfi.balanceOf(recipientAddress)
    console.log(`New balance of ${recipientAddress}: ${formatEther(newBalance)} PRFI`)
}

// Execute the script and handle any errors
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
