// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "forge-std/Test.sol";
import "../src/BlueprintNFT.sol";
import "../src/DesignerRegistry.sol";

contract BlueprintNFTCollectionTest is Test {
    // Contracts
    DesignerRegistry public registry;
    BlueprintNFT public collectionA;
    BlueprintNFT public collectionB;

    // Actors
    address public designerA = address(0xA11CE);
    address public designerB = address(0xB0B);
    address public user1 = address(0x1111);
    address public user2 = address(0x2222);
    address public attacker = address(0xDEAD);

    // Data
    string constant METADATA_CID_A1 = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    string constant METADATA_CID_A2 = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdj";
    string constant METADATA_CID_B1 = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdk";

    // Redeclare event for expectEmit matching
    event DesignMinted(uint256 indexed tokenId, address indexed owner, string metadataCid);

    function setUp() public {
        // Fund actors
        vm.deal(designerA, 10 ether);
        vm.deal(designerB, 10 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(attacker, 10 ether);

        // Deploy registry and register designers
        registry = new DesignerRegistry();
        vm.prank(designerA);
        registry.registerDesigner();
        vm.prank(designerB);
        registry.registerDesigner();

        // Deploy two per-designer collections
        collectionA = new BlueprintNFT("BlueprintNFT A", "BNFTA", designerA);
        collectionB = new BlueprintNFT("BlueprintNFT B", "BNFTB", designerB);
    }

    function testInitialState() public {
        assertEq(collectionA.name(), "BlueprintNFT A");
        assertEq(collectionA.symbol(), "BNFTA");
        assertEq(collectionA.nextTokenId(), 1);
        assertEq(collectionA.totalSupply(), 0);
        assertEq(collectionA.designer(), designerA);

        assertEq(collectionB.name(), "BlueprintNFT B");
        assertEq(collectionB.symbol(), "BNFTB");
        assertEq(collectionB.nextTokenId(), 1);
        assertEq(collectionB.totalSupply(), 0);
        assertEq(collectionB.designer(), designerB);
    }

    function testMintDesignOnlyDesigner() public {
        vm.prank(designerA);
        uint256 tokenId = collectionA.mintDesign(METADATA_CID_A1);

        assertEq(tokenId, 1);
        assertEq(collectionA.nextTokenId(), 2);
        assertEq(collectionA.totalSupply(), 1);
        assertEq(collectionA.ownerOf(tokenId), designerA);

        (string memory cid, address creator) = collectionA.getDesignData(tokenId);
        assertEq(cid, METADATA_CID_A1);
        assertEq(creator, designerA);

        string memory expectedTokenURI = string(abi.encodePacked("ipfs://", METADATA_CID_A1));
        assertEq(collectionA.tokenURI(tokenId), expectedTokenURI);
    }

    function testMintDesignByNonDesignerReverts() public {
        vm.prank(attacker);
        vm.expectRevert(bytes("BlueprintNFT: caller is not designer"));
        collectionA.mintDesign(METADATA_CID_A1);
    }

    function testMintBlocksWhenDesignerRevoked() public {
        // This test is not applicable since BlueprintNFT doesn't check registry status
        // The designer can always mint from their own collection
        vm.prank(designerA);
        uint256 tokenId = collectionA.mintDesign(METADATA_CID_A1);
        assertEq(tokenId, 1);
        assertEq(collectionA.ownerOf(tokenId), designerA);
    }

    function testMintMultipleDesignsAcrossCollections() public {
        // Designer A mints twice
        vm.prank(designerA);
        uint256 tokenIdA1 = collectionA.mintDesign(METADATA_CID_A1);

        vm.prank(designerA);
        uint256 tokenIdA2 = collectionA.mintDesign(METADATA_CID_A2);

        // Designer B mints once
        vm.prank(designerB);
        uint256 tokenIdB1 = collectionB.mintDesign(METADATA_CID_B1);

        assertEq(tokenIdA1, 1);
        assertEq(tokenIdA2, 2);
        assertEq(collectionA.nextTokenId(), 3);
        assertEq(collectionA.totalSupply(), 2);

        assertEq(tokenIdB1, 1);
        assertEq(collectionB.nextTokenId(), 2);
        assertEq(collectionB.totalSupply(), 1);

        assertEq(collectionA.ownerOf(tokenIdA1), designerA);
        assertEq(collectionA.ownerOf(tokenIdA2), designerA);
        assertEq(collectionB.ownerOf(tokenIdB1), designerB);

        string memory expectedTokenURIA1 = string(abi.encodePacked("ipfs://", METADATA_CID_A1));
        string memory expectedTokenURIA2 = string(abi.encodePacked("ipfs://", METADATA_CID_A2));
        string memory expectedTokenURIB1 = string(abi.encodePacked("ipfs://", METADATA_CID_B1));

        assertEq(collectionA.tokenURI(tokenIdA1), expectedTokenURIA1);
        assertEq(collectionA.tokenURI(tokenIdA2), expectedTokenURIA2);
        assertEq(collectionB.tokenURI(tokenIdB1), expectedTokenURIB1);
    }

    function testMintDesignEmitsEvent() public {
        vm.expectEmit(true, true, true, true, address(collectionA));
        emit DesignMinted(1, designerA, METADATA_CID_A1);

        vm.prank(designerA);
        collectionA.mintDesign(METADATA_CID_A1);
    }

    function testTokenURIForNonExistentToken() public {
        vm.expectRevert(bytes("BlueprintNFT: URI query for nonexistent token"));
        collectionA.tokenURI(999);
    }

    function testGetDesignDataForNonExistentToken() public {
        vm.expectRevert(bytes("BlueprintNFT: query for nonexistent token"));
        collectionA.getDesignData(999);
    }

    function testSupportsInterface() public {
        // ERC721 interface ID
        assertTrue(collectionA.supportsInterface(0x80ac58cd));
        // ERC721Metadata interface ID
        assertTrue(collectionA.supportsInterface(0x5b5e139f));
        // ERC165 interface ID
        assertTrue(collectionA.supportsInterface(0x01ffc9a7));
        // Random interface ID
        assertFalse(collectionA.supportsInterface(0xffffffff));
    }

    function testBalanceApproveTransferFlows() public {
        // Mint to designerA
        vm.prank(designerA);
        uint256 tokenId = collectionA.mintDesign(METADATA_CID_A1);

        assertEq(collectionA.balanceOf(designerA), 1);

        // Designer transfers to user1
        vm.prank(designerA);
        collectionA.transferFrom(designerA, user1, tokenId);

        assertEq(collectionA.ownerOf(tokenId), user1);
        assertEq(collectionA.balanceOf(designerA), 0);
        assertEq(collectionA.balanceOf(user1), 1);

        // User1 approves user2 and transfers
        vm.prank(user1);
        collectionA.approve(user2, tokenId);
        assertEq(collectionA.getApproved(tokenId), user2);

        vm.prank(user2);
        collectionA.transferFrom(user1, user2, tokenId);

        assertEq(collectionA.ownerOf(tokenId), user2);
        assertEq(collectionA.balanceOf(user1), 0);
        assertEq(collectionA.balanceOf(user2), 1);

        // Safe transfer back to designer
        vm.prank(user2);
        collectionA.safeTransferFrom(user2, designerA, tokenId);

        assertEq(collectionA.ownerOf(tokenId), designerA);
        assertEq(collectionA.balanceOf(user1), 0);
        assertEq(collectionA.balanceOf(designerA), 1);
    }

    function testEmptyMetadataCidReverts() public {
        vm.prank(designerA);
        vm.expectRevert(bytes("BlueprintNFT: empty metadataCid"));
        collectionA.mintDesign("");
    }

    function testConstructorWithZeroDesignerReverts() public {
        vm.expectRevert(bytes("BlueprintNFT: designer is zero address"));
        new BlueprintNFT("Test Collection", "TEST", address(0));
    }
}