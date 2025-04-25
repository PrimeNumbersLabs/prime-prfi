import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'PRFI'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    await deploy('PRFI', {
        contract: 'PRFI',
        args: ['PRFI', 'PRFI', endpointV2Deployment.address, deployer],
        from: deployer,
        log: true,
        deterministicDeployment: true,
    })
}

deploy.tags = [contractName]

export default deploy
