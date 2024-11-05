// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AugurToken} from "../src/AugurToken.sol";

contract AugurTokenTest is Test {
    AugurToken public augurToken;

    function setUp() public {
        augurToken = new AugurToken(address(0x1234));
    }

    function test_Increment() public {
        // counter.increment();
        // assertEq(counter.number(), 1);
    }

    function testFuzz_SetNumber(uint256 x) public {
        // counter.setNumber(x);
        // assertEq(counter.number(), x);
    }
}
