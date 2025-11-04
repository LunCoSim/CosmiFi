// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Test.sol";
import "../src/DesignerRegistry.sol";

contract DesignerRegistryTest is Test {
    DesignerRegistry registry;
    address owner = address(this);
    address designer1 = address(0x1111);
    address designer2 = address(0x2222);
    address attacker = address(0xdead);

    // Redeclare events for expectEmit matching
    event DesignerRegistered(address indexed designer);
    event DesignerRevoked(address indexed designer);

    function setUp() public {
        registry = new DesignerRegistry();
        // Ownable owner should be the deployer (this test contract)
        assertEq(registry.owner(), owner);
    }

    function testInitialState() public {
        assertFalse(registry.isDesigner(designer1));
        assertFalse(registry.isDesigner(designer2));
    }

    function testRegisterDesignerEmitsEventAndSetsState() public {
        // Expect event emitted from the registry contract
        vm.expectEmit(true, true, false, true, address(registry));
        emit DesignerRegistered(designer1);
        vm.prank(designer1);
        registry.registerDesigner();
        assertTrue(registry.isDesigner(designer1));
    }

    function testRevokeDesignerEmitsEventAndClearsState() public {
        vm.prank(designer1);
        registry.registerDesigner();
        vm.expectEmit(true, true, false, true, address(registry));
        emit DesignerRevoked(designer1);
        registry.revokeDesigner(designer1);
        assertFalse(registry.isDesigner(designer1));
    }

    function testOnlyOwnerCanRegisterFor() public {
        vm.prank(attacker);
        vm.expectRevert();
        registry.registerDesignerFor(designer1);
    }

    function testOnlyOwnerCanRevoke() public {
        vm.prank(designer1);
        registry.registerDesigner();
        vm.prank(attacker);
        vm.expectRevert();
        registry.revokeDesigner(designer1);
    }

    function testRegisterZeroAddressReverts() public {
        vm.expectRevert(DesignerRegistry.ZeroAddress.selector);
        registry.registerDesignerFor(address(0));
    }

    function testRevokeZeroAddressReverts() public {
        vm.expectRevert(DesignerRegistry.ZeroAddress.selector);
        registry.revokeDesigner(address(0));
    }

    function testRegisterAlreadyRegisteredReverts() public {
        vm.prank(designer1);
        registry.registerDesigner();
        vm.expectRevert(abi.encodeWithSelector(DesignerRegistry.AlreadyRegistered.selector, designer1));
        vm.prank(designer1);
        registry.registerDesigner();
    }

    function testRevokeNotRegisteredReverts() public {
        vm.expectRevert(abi.encodeWithSelector(DesignerRegistry.NotRegistered.selector, designer2));
        registry.revokeDesigner(designer2);
    }

    function testUnregisterDesignerEmitsEventAndClearsState() public {
        // First register a designer
        vm.prank(designer1);
        registry.registerDesigner();
        assertTrue(registry.isDesigner(designer1));

        // Expect event emitted from the registry contract
        vm.expectEmit(true, true, false, true, address(registry));
        emit DesignerRevoked(designer1);
        
        // Designer unregisters themselves
        vm.prank(designer1);
        registry.unregisterDesigner();
        assertFalse(registry.isDesigner(designer1));
    }

    function testUnregisterNotRegisteredDesignerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(DesignerRegistry.NotRegistered.selector, designer1));
        vm.prank(designer1);
        registry.unregisterDesigner();
    }
}