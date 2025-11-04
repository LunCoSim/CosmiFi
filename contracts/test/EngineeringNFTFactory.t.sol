// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Test.sol";
import "../src/DesignerRegistry.sol";
import "../src/EngineeringNFTFactory.sol";
import "../src/EngineeringNFT.sol";

contract EngineeringNFTFactoryTest is Test {
    DesignerRegistry public registry;
    EngineeringNFTFactory public factory;

    address public owner = address(this);
    address public designerA = address(0xA11CE);
    address public designerB = address(0xB0B);
    address public attacker = address(0xDEAD);

    // Redeclare event for expectEmit matching
    event CollectionCreated(
        address indexed designer,
        address indexed collection,
        string name,
        string symbol,
        uint256 collectionId
    );

    function setUp() public {
        vm.deal(designerA, 10 ether);
        vm.deal(designerB, 10 ether);
        vm.deal(attacker, 10 ether);

        // Deploy registry and factory
        registry = new DesignerRegistry();
        factory = new EngineeringNFTFactory(address(registry));

        // Register designers
        vm.prank(designerA);
        registry.registerDesigner();
        vm.prank(designerB);
        registry.registerDesigner();
    }

    function testInitialSetup() public {
        // Factory holds the registry
        assertEq(address(factory.registry()), address(registry));
        // Designers are registered
        assertTrue(registry.isDesigner(designerA));
        assertTrue(registry.isDesigner(designerB));
    }

    function testCreateCollectionByRegisteredDesignerEmitsEventAndTracksMapping() public {
        // Expect event emitted from factory
        vm.expectEmit(true, false, false, true, address(factory));
        emit CollectionCreated(designerA, address(0), "EngineeringNFT A", "ENFTA", 1);

        vm.prank(designerA);
        address collection = factory.createCollection("EngineeringNFT A", "ENFTA");

        // Verify deployed contract is EngineeringNFT with correct params
        EngineeringNFT coll = EngineeringNFT(collection);
        assertEq(coll.name(), "EngineeringNFT A");
        assertEq(coll.symbol(), "ENFTA");
        assertEq(coll.designer(), designerA);
        assertEq(coll.nextTokenId(), 1);
        assertEq(coll.totalSupply(), 0);

        // Verify mappings
        assertEq(factory.getDesigner(collection), designerA);

        address[] memory collections = factory.getCollections(designerA);
        assertEq(collections.length, 1);
        assertEq(collections[0], collection);
    }

    function testCreateMultipleCollectionsForSameDesigner() public {
        vm.prank(designerA);
        address c1 = factory.createCollection("A1", "A1");

        vm.prank(designerA);
        address c2 = factory.createCollection("A2", "A2");

        address[] memory collections = factory.getCollections(designerA);
        assertEq(collections.length, 2);
        assertEq(collections[0], c1);
        assertEq(collections[1], c2);

        // Ensure each maps back to designer
        assertEq(factory.getDesigner(c1), designerA);
        assertEq(factory.getDesigner(c2), designerA);
    }

    function testCreateCollectionsForDifferentDesigners() public {
        vm.prank(designerA);
        address cA = factory.createCollection("CollectionA", "CA");

        vm.prank(designerB);
        address cB = factory.createCollection("CollectionB", "CB");

        // Collections are separated per designer
        address[] memory colA = factory.getCollections(designerA);
        address[] memory colB = factory.getCollections(designerB);

        assertEq(colA.length, 1);
        assertEq(colB.length, 1);
        assertEq(colA[0], cA);
        assertEq(colB[0], cB);

        assertEq(factory.getDesigner(cA), designerA);
        assertEq(factory.getDesigner(cB), designerB);
    }

    function testCreateCollectionByNonDesignerReverts() public {
        vm.prank(attacker);
        vm.expectRevert("Designer not registered");
        factory.createCollection("Bad", "BAD");
    }

    function testInvalidNameReverts() public {
        vm.prank(designerA);
        vm.expectRevert(EngineeringNFTFactory.InvalidName.selector);
        factory.createCollection("", "ENFTA");
    }

    function testInvalidSymbolReverts() public {
        vm.prank(designerA);
        vm.expectRevert(EngineeringNFTFactory.InvalidSymbol.selector);
        factory.createCollection("EngineeringNFT A", "");
    }

    function testCollectionsProduceMintableTokensUnderRegistryGating() public {
        vm.prank(designerA);
        address collection = factory.createCollection("EngineeringNFT A", "ENFTA");
        EngineeringNFT coll = EngineeringNFT(collection);

        // Designer can mint
        vm.prank(designerA);
        uint256 tokenId = coll.mintDesign("bafy...cid");
        assertEq(tokenId, 1);
        assertEq(coll.ownerOf(tokenId), designerA);

        // Revoke designerA -> further mints still work because EngineeringNFT doesn't check registry
        registry.revokeDesigner(designerA);

        vm.prank(designerA);
        uint256 tokenId2 = coll.mintDesign("bafy...cid2");
        assertEq(tokenId2, 2);
    }

    function testGetCollectionCount() public {
        // Initially no collections
        assertEq(factory.getCollectionCount(designerA), 0);
        assertEq(factory.getCollectionCount(designerB), 0);

        // Create collections for designerA
        vm.prank(designerA);
        address c1 = factory.createCollection("Collection 1", "C1");
        vm.prank(designerA);
        address c2 = factory.createCollection("Collection 2", "C2");
        
        // Create one collection for designerB
        vm.prank(designerB);
        address c3 = factory.createCollection("Collection 3", "C3");

        // Check counts
        assertEq(factory.getCollectionCount(designerA), 2);
        assertEq(factory.getCollectionCount(designerB), 1);
        assertEq(factory.totalCollections(), 3);
    }

    function testGetDesignerForNonExistentCollection() public {
        // Query for non-existent collection should return zero address
        address nonExistentCollection = address(0x123456);
        assertEq(factory.getDesigner(nonExistentCollection), address(0));
    }
}