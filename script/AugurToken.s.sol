// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import "foundry-chainlink-toolkit/script/feeds/DataFeed.s.sol";
// import "@chainlink/contracts/v0.8/functions/dev/v1_0_0/FunctionsRouter.sol";
// import "@chainlink/contracts/v0.8/functions/dev/v1_0_0/interfaces/IFunctionsRouter.sol";
import "foundry-chainlink-toolkit/src/interfaces/functions/IFunctionsRouter.sol";

contract AugurTokenScript is Script {
    IFunctionsRouter internal immutable i_router;

    constructor() {
        i_router = IFunctionsRouter(address(0x172076E0166D1F9Cc711C77Adf8488051744980C));
    }

    function getLatestPrice(address dataFeedAddress) public returns (int256 latestPrice) {
        DataFeedsScript automationScript = new DataFeedsScript(dataFeedAddress);

        vm.broadcast();
        (, latestPrice,,,) = automationScript.getLatestRoundData();
        return latestPrice;
    }

    function deploy(address linkTokenAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        uint32[] memory maxCallbackGasLimits = new uint32[](3);
        maxCallbackGasLimits[0] = 300_000;
        maxCallbackGasLimits[1] = 500_000;
        maxCallbackGasLimits[2] = 1_000_000;

        IFunctionsRouter.Config memory simulatedRouterConfig = IFunctionsRouter.Config({
            maxConsumersPerSubscription: 100,
            adminFee: 0,
            handleOracleFulfillmentSelector: 0x0ca76175, //bytes4(keccak256("handleOracleFulfillment(bytes32 requestId, bytes memory response, bytes memory err)")),
            gasForCallExactCheck: 5000,
            maxCallbackGasLimits: maxCallbackGasLimits,
            subscriptionDepositMinimumRequests: 0,
            subscriptionDepositJuels: 0
        });

        address routerAddress =
            deployCode("FunctionsRouter.sol:FunctionsRouter", abi.encode(linkTokenAddress, simulatedRouterConfig));
        console.log("FunctionsRouter deployed at: ", routerAddress);
        IFunctionsRouter functionsRouter = IFunctionsRouter(routerAddress);

        vm.stopBroadcast();
    }

    // getProposedContractSet
    function getProposedContractSet() public view returns (bytes32[] memory a, address[] memory b) {
        (a, b) = i_router.getProposedContractSet();
        return (a, b);
    }

    // function getAllowListId() public view returns (bytes32) {
    //     bytes32 a = i_router.getAllowListId();
    //     return a;
    // }

    // function owner() public view returns (address a) {
    //     a = i_router.owner();
    //     return a;
    // }
}
