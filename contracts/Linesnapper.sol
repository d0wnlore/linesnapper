// SPDX-License-Identifier: GPL-3.0

pragma solidity >0.8.18;

/**
 * @title Storage
 * @dev Store phishing website detection rules and retrieve them
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract Linesnapper {
    string public text;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, 'Only the owner can call this function');
        _;
    }

    constructor() {
        owner = msg.sender; // Set the owner to the address deploying the contract
    }

    /**
     * @dev Store rule in variable
     * @param _text value to store
     */
    function store(string memory _text) public onlyOwner {
        text = _text;
    }

    /**
     * @dev Return value
     * @return value of 'text'
     */
    function retrieve() public view returns (string memory) {
        return text;
    }
}
