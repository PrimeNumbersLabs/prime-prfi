import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'

import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('PRFI Test', function () {
    // Constant representing a mock Endpoint ID for testing purposes
    const eidA = 1
    const eidB = 2
    // Declaration of variables to be used in the test suite
    let PRFI: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let PRFIA: Contract
    let PRFIB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    // Before hook for setup that runs once before all tests in the block
    before(async function () {
        // Contract factory for our tested contract
        //
        // We are using a derived contract that exposes a mint() function for testing purposes
        PRFI = await ethers.getContractFactory('PRFI')

        // Fetching the first three signers (accounts) from Hardhat's local Ethereum network
        const signers = await ethers.getSigners()

        ownerA = signers.at(0)!
        ownerB = signers.at(1)!
        endpointOwner = signers.at(2)!

        // The EndpointV2Mock contract comes from @layerzerolabs/test-devtools-evm-hardhat package
        // and its artifacts are connected as external artifacts to this project
        //
        // Unfortunately, hardhat itself does not yet provide a way of connecting external artifacts,
        // so we rely on hardhat-deploy to create a ContractFactory for EndpointV2Mock
        //
        // See https://github.com/NomicFoundation/hardhat/issues/1040
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(EndpointV2MockArtifact.abi, EndpointV2MockArtifact.bytecode, endpointOwner)
    })

    // beforeEach hook for setup that runs before each test in the block
    beforeEach(async function () {
        // Deploying a mock LZEndpoint with the given Endpoint ID
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)

        // Deploying two instances of PRFI contract with different identifiers and linking them to the mock LZEndpoint
        PRFIA = await PRFI.deploy('aOFT', 'aOFT', mockEndpointV2A.address, ownerA.address)
        PRFIB = await PRFI.deploy('bOFT', 'bOFT', mockEndpointV2B.address, ownerB.address)

        // Setting destination endpoints in the LZEndpoint mock for each PRFI instance
        await mockEndpointV2A.setDestLzEndpoint(PRFIB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(PRFIA.address, mockEndpointV2A.address)

        // Setting each PRFI instance as a peer of the other in the mock LZEndpoint
        await PRFIA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(PRFIB.address, 32))
        await PRFIB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(PRFIA.address, 32))
    })

    // A test case to verify token transfer functionality
    it('should send a token from A address to B address via each OFT', async function () {
        // Minting an initial amount of tokens to ownerA's address in the PRFIA contract
        const initialAmount = ethers.utils.parseEther('100')
        await PRFIA.mint(ownerA.address, initialAmount)

        // Defining the amount of tokens to send and constructing the parameters for the send operation
        const tokensToSend = ethers.utils.parseEther('1')

        // Defining extra message execution options for the send operation
        const options = Options.newOptions().addExecutorLzReceiveOption(200000, 0).toHex().toString()

        const sendParam = [
            eidB,
            ethers.utils.zeroPad(ownerB.address, 32),
            tokensToSend,
            tokensToSend,
            options,
            '0x',
            '0x',
        ]

        // Fetching the native fee for the token send operation
        const [nativeFee] = await PRFIA.quoteSend(sendParam, false)

        // Executing the send operation from PRFIA contract
        await PRFIA.send(sendParam, [nativeFee, 0], ownerA.address, { value: nativeFee })

        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await PRFIA.balanceOf(ownerA.address)
        const finalBalanceB = await PRFIB.balanceOf(ownerB.address)

        // Asserting that the final balances are as expected after the send operation
        expect(finalBalanceA).eql(initialAmount.sub(tokensToSend))
        expect(finalBalanceB).eql(tokensToSend)
    })

    it('should mint tokens', async function () {
        // Minting an initial amount of tokens to ownerA's address in the PRFIA contract
        const initialAmount = ethers.utils.parseEther('100')
        await PRFIA.mint(ownerA.address, initialAmount)

        // Fetching the final token balance of ownerA
        const finalBalance = await PRFIA.balanceOf(ownerA.address)

        // Asserting that the final balance is as expected after the mint operation
        expect(finalBalance).eql(initialAmount)
    })

    it('do not allow minting by non-owner', async function () {
        // Minting an initial amount of tokens to ownerA's address in the PRFIA contract
        const initialAmount = ethers.utils.parseEther('100')
        try {
            await PRFIA.connect(ownerB).mint(ownerB.address, initialAmount)
            // If we reach here, the test should fail
            expect.fail('Transaction should have reverted')
        } catch (error) {
            // Transaction reverted as expected
        }
    })

    it('should transfer tokens', async function () {
        // Minting an initial amount of tokens to ownerA's address in the PRFIA contract
        const initialAmount = ethers.utils.parseEther('100')
        await PRFIA.mint(ownerA.address, initialAmount)

        // Defining the amount of tokens to transfer
        const tokensToTransfer = ethers.utils.parseEther('1')

        // Transferring tokens from ownerA to ownerB
        await PRFIA.transfer(ownerB.address, tokensToTransfer)

        // Fetching the final token balances of ownerA and ownerB
        const finalBalanceA = await PRFIA.balanceOf(ownerA.address)
        const finalBalanceB = await PRFIA.balanceOf(ownerB.address)

        // Asserting that the final balances are as expected after the transfer
        expect(finalBalanceA).eql(initialAmount.sub(tokensToTransfer))
        expect(finalBalanceB).eql(tokensToTransfer)
    })

    it('should burn tokens', async function () {
        // Minting an initial amount of tokens to ownerA's address in the PRFIA contract
        const initialAmount = ethers.utils.parseEther('100')
        await PRFIA.mint(ownerA.address, initialAmount)

        // Defining the amount of tokens to burn
        const tokensToBurn = ethers.utils.parseEther('1')

        // Burning tokens from ownerA's address
        await PRFIA.burn(ownerA.address, tokensToBurn)

        // Fetching the final token balance of ownerA
        const finalBalance = await PRFIA.balanceOf(ownerA.address)

        // Asserting that the final balance is as expected after the burn operation
        expect(finalBalance).eql(initialAmount.sub(tokensToBurn))
    })

    it('should approve spending of tokens', async function () {
        const amountToApprove = ethers.utils.parseEther('10')

        // Approve ownerB to spend tokens on behalf of ownerA
        await PRFIA.connect(ownerA).approve(ownerB.address, amountToApprove)

        // Check the allowance
        const allowance = await PRFIA.allowance(ownerA.address, ownerB.address)

        expect(allowance).eql(amountToApprove)
    })

    it('should update allowance when approving tokens', async function () {
        const amountToApprove = ethers.utils.parseEther('5')

        // First approval
        await PRFIA.connect(ownerA).approve(ownerB.address, amountToApprove)
        const initialAllowance = await PRFIA.allowance(ownerA.address, ownerB.address)
        expect(initialAllowance).eql(amountToApprove)

        // Change approval amount
        const newAmount = ethers.utils.parseEther('10')
        await PRFIA.connect(ownerA).approve(ownerB.address, newAmount)

        // Check updated allowance
        const updatedAllowance = await PRFIA.allowance(ownerA.address, ownerB.address)
        expect(updatedAllowance).eql(newAmount)
    })

    it('should allow transferFrom after approval', async function () {
        // Mint tokens to ownerA
        const initialAmount = ethers.utils.parseEther('100')
        await PRFIA.mint(ownerA.address, initialAmount)

        // Amount to be transferred
        const transferAmount = ethers.utils.parseEther('15')

        // ownerA approves ownerB to spend tokens
        await PRFIA.connect(ownerA).approve(ownerB.address, transferAmount)

        // ownerB transfers tokens from ownerA to themselves
        await PRFIA.connect(ownerB).transferFrom(ownerA.address, ownerB.address, transferAmount)

        // Check balances after transfer
        const ownerABalance = await PRFIA.balanceOf(ownerA.address)
        const ownerBBalance = await PRFIA.balanceOf(ownerB.address)

        expect(ownerABalance).eql(initialAmount.sub(transferAmount))
        expect(ownerBBalance).eql(transferAmount)

        // Check that allowance was reduced
        const remainingAllowance = await PRFIA.allowance(ownerA.address, ownerB.address)
        expect(remainingAllowance).eql(ethers.constants.Zero)
    })

    it('should transfer tokens correctly', async function () {
        // Mint tokens to ownerA
        const initialAmount = ethers.utils.parseEther('50')
        await PRFIA.mint(ownerA.address, initialAmount)

        const transferAmount = ethers.utils.parseEther('25')

        // Transfer tokens
        await PRFIA.connect(ownerA).transfer(ownerB.address, transferAmount)

        // Verify balances after transfer
        const ownerABalance = await PRFIA.balanceOf(ownerA.address)
        const ownerBBalance = await PRFIA.balanceOf(ownerB.address)

        expect(ownerABalance).eql(initialAmount.sub(transferAmount))
        expect(ownerBBalance).eql(transferAmount)
    })

    it('should not allow transferFrom more than approved amount', async function () {
        // Mint tokens to ownerA
        const initialAmount = ethers.utils.parseEther('100')
        await PRFIA.mint(ownerA.address, initialAmount)

        // Amount to be approved
        const approveAmount = ethers.utils.parseEther('10')

        // Amount to attempt to transfer (more than approved)
        const transferAmount = ethers.utils.parseEther('20')

        // ownerA approves ownerB to spend tokens
        await PRFIA.connect(ownerA).approve(ownerB.address, approveAmount)

        // Attempt to transfer more than approved should fail
        try {
            await PRFIA.connect(ownerB).transferFrom(ownerA.address, ownerB.address, transferAmount)
            // If we reach here, the test should fail
            expect.fail('Transaction should have reverted')
        } catch (error) {
            // Transaction reverted as expected
        }

        // Balances should remain unchanged
        const ownerABalance = await PRFIA.balanceOf(ownerA.address)
        const ownerBBalance = await PRFIA.balanceOf(ownerB.address)

        expect(ownerABalance).eql(initialAmount)
        expect(ownerBBalance).eql(ethers.constants.Zero)
    })

    it('should return correct token name and symbol', async function () {
        const name = await PRFIA.name()
        const symbol = await PRFIA.symbol()
        expect(name).eql('aOFT')
        expect(symbol).eql('aOFT')
    })

    it('should return correct decimals', async function () {
        const decimals = await PRFIA.decimals()
        // ERC20 standard typically uses 18 decimals
        expect(decimals).eql(18)
    })
})
