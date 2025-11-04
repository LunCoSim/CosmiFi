// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./DesignerRegistry.sol";
import "./EngineeringNFT.sol";

contract EngineeringNFTFactory {
    DesignerRegistry public immutable registry;
    mapping(address => address[]) private _collectionsByDesigner;
    mapping(address => address) public designerOfCollection;
    uint256 public totalCollections;

    event CollectionCreated(
        address indexed designer,
        address indexed collection,
        string name,
        string symbol,
        uint256 collectionId
    );

    error InvalidName();
    error InvalidSymbol();
    error ZeroAddress();

    constructor(address _registry) {
        if (_registry == address(0)) revert ZeroAddress();
        registry = DesignerRegistry(_registry);
    }

    function createCollection(
        string memory name,
        string memory symbol
    ) external returns (address collection) {
        if (bytes(name).length == 0) revert InvalidName();
        if (bytes(symbol).length == 0) revert InvalidSymbol();

        if (!registry.isDesigner(msg.sender)) {
            revert("Designer not registered");
        }

        EngineeringNFT newCollection = new EngineeringNFT(
            name,
            symbol,
            msg.sender
        );
        collection = address(newCollection);

        _collectionsByDesigner[msg.sender].push(collection);
        designerOfCollection[collection] = msg.sender;
        totalCollections++;

        emit CollectionCreated(
            msg.sender,
            collection,
            name,
            symbol,
            totalCollections
        );
    }

    function getCollections(address designer)
        external
        view
        returns (address[] memory collections)
    {
        collections = _collectionsByDesigner[designer];
    }

    function getCollectionCount(address designer)
        external
        view
        returns (uint256 count)
    {
        count = _collectionsByDesigner[designer].length;
    }

    function getDesigner(address collection)
        external
        view
        returns (address designer)
    {
        designer = designerOfCollection[collection];
    }

    function isDesigner(address account)
        external
        view
        returns (bool isRegistered)
    {
        isRegistered = registry.isDesigner(account);
    }
}