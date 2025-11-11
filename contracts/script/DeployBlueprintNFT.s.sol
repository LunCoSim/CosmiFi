// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {BlueprintNFT} from "../src/BlueprintNFT.sol";

contract DeployBlueprintNFT is Script {
    BlueprintNFT public blueprintNFT;

    function run(string memory _name, string memory _symbol, address _designer) public {
        vm.startBroadcast();
        blueprintNFT = new BlueprintNFT(_name, _symbol, _designer);
        vm.stopBroadcast();
    }
    
    function runDefault() public {
        run("BlueprintNFT", "BNFT", msg.sender);
    }
}