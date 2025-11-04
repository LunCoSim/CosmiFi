// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {EngineeringNFT} from "../src/EngineeringNFT.sol";

contract DeployEngineeringNFT is Script {
    EngineeringNFT public engineeringNFT;

    function run(string memory _name, string memory _symbol, address _designer) public {
        vm.startBroadcast();
        engineeringNFT = new EngineeringNFT(_name, _symbol, _designer);
        vm.stopBroadcast();
    }
    
    function runDefault() public {
        run("EngineeringNFT", "ENFT", msg.sender);
    }
}