// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestResolver {
    mapping(string => address) private addresses;

    function set(string calldata name, address target) external {
        addresses[name] = target;
    }

    function get(string calldata name) external view returns (address) {
        return addresses[name];
    }
}