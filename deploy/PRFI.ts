import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'
import { bytecode } from "../artifacts/contracts/PRFI.sol/PRFI.json";
const { encoder, create2Address } = require("../utils.js")
import { ethers } from 'hardhat';

const contractName = 'PRFI'

const deploy: DeployFunction = async (hre) => {

    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)

    const endpointV2Deployment = await hre.deployments.get('EndpointV2')
   
    const factoryAddr = "0xAC2A150065090a58C1a325341d66A28cA1e24289";
    const saltHex = ethers.utils.id("12346");
    const initCode = bytecode + encoder(["string", "string", "address", "address"], ["PRFI", "PRFI", endpointV2Deployment.address, deployer]);

    const create2Addr = create2Address(factoryAddr, saltHex, initCode);
    console.log("precomputed address:", create2Addr);

  
    const Factory = await ethers.getContractFactory("DeterministicDeployFactory");
    const factory = await Factory.attach(factoryAddr);

    const prfiDeploy = await factory.deploy(initCode, saltHex);
    const txReceipt = await prfiDeploy.wait();
    //console.log("Deployed to:", txReceipt);

    
    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${txReceipt.events[0].address}, tx: ${txReceipt.transactionHash}`)
}

deploy.tags = [contractName]

export default deploy
