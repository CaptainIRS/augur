// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import "foundry-chainlink-toolkit/script/feeds/DataFeed.s.sol";

contract AugurTokenScript is Script {
    function getLatestPrice(address dataFeedAddress) public returns (int256 latestPrice) {
        DataFeedsScript automationScript = new DataFeedsScript(dataFeedAddress);

        vm.broadcast();
        (, latestPrice,,,) = automationScript.getLatestRoundData();
        return latestPrice;
    }
}
