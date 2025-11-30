// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Web3BaseQuestNFT
 * @dev Simple ERC721 NFT contract for Web3Base Quest Pass
 */
contract Web3BaseQuestNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Mapping to track if address has already minted
    mapping(address => bool) public hasMinted;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = "https://web3base.quest/nft/";
    }

    /**
     * @dev Mint NFT to a specific address (only owner can mint)
     */
    function mint(address to) public onlyOwner returns (uint256) {
        require(!hasMinted[to], "Address has already minted");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(to, newTokenId);
        hasMinted[to] = true;
        
        // Set a simple token URI
        _setTokenURI(newTokenId, string(abi.encodePacked(_baseTokenURI, toString(newTokenId))));
        
        return newTokenId;
    }

    /**
     * @dev Public mint function - anyone can mint (for quest completion)
     */
    function questMint(address to) public returns (uint256) {
        require(!hasMinted[to], "Address has already minted");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(to, newTokenId);
        hasMinted[to] = true;
        
        // Set a simple token URI
        _setTokenURI(newTokenId, string(abi.encodePacked(_baseTokenURI, toString(newTokenId))));
        
        return newTokenId;
    }

    /**
     * @dev Set base URI for token metadata
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Convert uint256 to string
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

