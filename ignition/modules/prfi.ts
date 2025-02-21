import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PRFI", (m) => {

    const endpointV2Address = m.getParameter('endpointV2Address');
    const deployer = m.getParameter('deployer');

    const prfi = m.contract("PRFI", ['PRFI', // name
                                    'PRFI', // symbol
                                    "0x6EDCE65403992e310A62460808c4b910D972f10f", // endpointV2Deployment.address
                                    "0xe517A15D0907682875C2390Df78CA368F990F1a7" // deployer
            ]);
  
    //m.call(prfi, "launch", []);
  
    return { prfi };
  });