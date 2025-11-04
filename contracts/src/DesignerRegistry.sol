// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DesignerRegistry is Ownable(msg.sender) {
    mapping(address => bool) private _isDesigner;

    event DesignerRegistered(address indexed designer);
    event DesignerRevoked(address indexed designer);

    error ZeroAddress();
    error AlreadyRegistered(address designer);
    error NotRegistered(address designer);

    function registerDesigner() external {
        if (msg.sender == address(0)) revert ZeroAddress();
        if (_isDesigner[msg.sender]) revert AlreadyRegistered(msg.sender);
        _isDesigner[msg.sender] = true;
        emit DesignerRegistered(msg.sender);
    }

    function registerDesignerFor(address designer) external onlyOwner {
        if (designer == address(0)) revert ZeroAddress();
        if (_isDesigner[designer]) revert AlreadyRegistered(designer);
        _isDesigner[designer] = true;
        emit DesignerRegistered(designer);
    }

    function revokeDesigner(address designer) external onlyOwner {
        if (designer == address(0)) revert ZeroAddress();
        if (!_isDesigner[designer]) revert NotRegistered(designer);
        _isDesigner[designer] = false;
        emit DesignerRevoked(designer);
    }

    function isDesigner(address account) external view returns (bool) {
        return _isDesigner[account];
    }

    function unregisterDesigner() external {
        if (!_isDesigner[msg.sender]) revert NotRegistered(msg.sender);
        _isDesigner[msg.sender] = false;
        emit DesignerRevoked(msg.sender);
    }
}