// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./DesignerRegistry.sol";

contract EngineeringNFT is ERC721 {
    struct DesignData {
        string metadataCid;
        uint256 mintedAt;
    }

    address public immutable designer;
    uint256 public nextTokenId;
    mapping(uint256 => DesignData) public designs;

    event DesignMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string metadataCid,
        uint256 mintedAt
    );

    modifier onlyDesigner() {
        require(msg.sender == designer, "EngineeringNFT: caller is not designer");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _designer
    ) ERC721(_name, _symbol) {
        require(_designer != address(0), "EngineeringNFT: designer is zero address");
        designer = _designer;
        nextTokenId = 1;
    }

    function mintDesign(string memory metadataCid) public onlyDesigner returns (uint256) {
        require(bytes(metadataCid).length != 0, "EngineeringNFT: empty metadataCid");

        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _safeMint(msg.sender, tokenId);

        designs[tokenId] = DesignData({
            metadataCid: metadataCid,
            mintedAt: block.timestamp
        });

        emit DesignMinted(tokenId, msg.sender, metadataCid, block.timestamp);

        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "EngineeringNFT: URI query for nonexistent token");
        DesignData memory design = designs[tokenId];
        return string(abi.encodePacked("ipfs://", design.metadataCid));
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply() public view returns (uint256) {
        return nextTokenId - 1;
    }

    function getDesignData(uint256 tokenId) public view returns (string memory metadataCid, address creator, uint256 mintedAt) {
        require(_ownerOf(tokenId) != address(0), "EngineeringNFT: query for nonexistent token");
        DesignData memory design = designs[tokenId];
        return (design.metadataCid, designer, design.mintedAt);
    }
}