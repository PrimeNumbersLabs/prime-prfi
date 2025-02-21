import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const ethereumContract: OmniPointHardhat = {
    eid: EndpointId.ETHEREUM_V2_MAINNET,
    contractName: 'PRFI',
}

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'PRFI',
}

const BaseSepoliaContract: OmniPointHardhat = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: 'PRFI',
}

const BaseContract: OmniPointHardhat = {
    eid: EndpointId.BASE_V2_MAINNET,
    contractName: 'PRFI',
}

const ArbitrumSepoliaContract: OmniPointHardhat = {
    eid: EndpointId.ARBSEP_V2_TESTNET,
    contractName: 'PRFI',
}

const ArbitrumContract: OmniPointHardhat = {
    eid: EndpointId.ARBITRUM_V2_MAINNET,
    contractName: 'PRFI',
}

const hyperliquidContract: OmniPointHardhat = {
    eid: EndpointId.HYPERLIQUID_V2_MAINNET,
    contractName: 'PRFI',
}

const HyperliquidTestnetContract: OmniPointHardhat = {
    eid: EndpointId.HYPERLIQUID_V2_TESTNET,
    contractName: 'PRFI',
}

const XDCContract: OmniPointHardhat = {
    eid: EndpointId.XDC_V2_MAINNET,
    contractName: 'PRFI',
}



const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: ethereumContract,
        },
        {
            contract: sepoliaContract,
        },
        {
            contract: BaseContract,
        },
        {
            contract: BaseSepoliaContract,
        },
        {
            contract: ArbitrumSepoliaContract,
        },
        {
            contract: ArbitrumContract,
        },
        {
            contract: hyperliquidContract,
        },
        {
            contract: HyperliquidTestnetContract,
        },
        {
            contract: XDCContract,
        },
    ],
    connections: [
        // Ethereum
        {
            from: ethereumContract,
            to: BaseContract,
        },
        {
            from: ethereumContract,
            to: ArbitrumContract,
        },
        {
            from: ethereumContract,
            to: hyperliquidContract,
        },
        {
            from: ethereumContract,
            to: XDCContract,
        },
        // Arbitrum
        {
            from: ArbitrumContract,
            to: ethereumContract,
        },
        {
            from: ArbitrumContract,
            to: BaseContract,
        },
        {
            from: ArbitrumContract,
            to: hyperliquidContract,
        },
        {
            from: ArbitrumContract,
            to: XDCContract,
        },
        // Hyperliquid
        {
            from: hyperliquidContract,
            to: ethereumContract,
        },
        {
            from: hyperliquidContract,
            to: BaseContract,
        },
        {
            from: hyperliquidContract,
            to: ArbitrumContract,
        },
        {
            from: hyperliquidContract,
            to: XDCContract,
        },
        // XDC
        {
            from: XDCContract,
            to: ethereumContract,
        },
        {
            from: XDCContract,
            to: BaseContract,
        },
        {
            from: XDCContract,
            to: ArbitrumContract,
        },
        {
            from: XDCContract,
            to: hyperliquidContract,
        },
        // Base
        {
            from: BaseContract,
            to: ethereumContract,
        },
        {
            from: BaseContract,
            to: ArbitrumContract,
        },
        {
            from: BaseContract,
            to: hyperliquidContract,
        },
        {
            from: BaseContract,
            to: XDCContract,
        },
        //Tesnets Networks
        // Sepolia
        {
            from: sepoliaContract,
            to: BaseSepoliaContract,
        },
        {
            from: sepoliaContract,
            to: ArbitrumSepoliaContract,
        },
        {
            from: sepoliaContract,
            to: HyperliquidTestnetContract,
        },
        // Base Sepolia
        {
            from: BaseSepoliaContract,
            to: ArbitrumSepoliaContract,
        },
        {
            from: BaseSepoliaContract,
            to: HyperliquidTestnetContract,
        },
        {
            from: BaseSepoliaContract,
            to: sepoliaContract,
        },
        // Hyperliquid Testnet
        {
            from: HyperliquidTestnetContract,
            to: ArbitrumSepoliaContract,
        },
        {
            from: HyperliquidTestnetContract,
            to: BaseSepoliaContract,
        },
        {
            from: HyperliquidTestnetContract,
            to: sepoliaContract,
        }
    ],
}

export default config
