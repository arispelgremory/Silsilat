// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IHederaTokenService.sol";

/**
 * @title TokenPurchase
 * @dev Simplified smart contract for on-chain NFT purchases using Hedera Token Service
 */
contract TokenPurchase {
    address constant HEDERA_TOKEN_SERVICE = address(0x167);
    IHederaTokenService constant hederaTokenService = IHederaTokenService(HEDERA_TOKEN_SERVICE);
    
    address public owner;
    mapping(address => bool) public authorizedTokens;
    mapping(address => bool) public authorizedPaymentTokens;
    mapping(address => bool) public authorizedAccounts;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorizedToken(address token) {
        require(authorizedTokens[token], "Token not authorized");
        _;
    }
    
    modifier onlyAuthorizedPaymentToken(address token) {
        require(authorizedPaymentTokens[token], "Payment token not authorized");
        _;
    }
    
    modifier onlyAuthorizedAccount(address account) {
        require(authorizedAccounts[account] || account == owner, "Account not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedAccounts[msg.sender] = true;
    }

    function authorizeToken(address token) external onlyOwner {
        authorizedTokens[token] = true;
    }

    function authorizePaymentToken(address token) external onlyOwner {
        authorizedPaymentTokens[token] = true;
    }

    function authorizeAccount(address account) external onlyOwner {
        authorizedAccounts[account] = true;
    }

    function deauthorizeToken(address token) external onlyOwner {
        authorizedTokens[token] = false;
    }

    function deauthorizePaymentToken(address token) external onlyOwner {
        authorizedPaymentTokens[token] = false;
    }

    function deauthorizeAccount(address account) external onlyOwner {
        authorizedAccounts[account] = false;
    }

    /**
     * @dev Purchase NFTs with fungible token payment using Hedera Token Service
     */
    function purchaseTokens(
        address nftToken,
        uint256[] memory serialNumbers,
        address buyer,
        address seller,
        address paymentToken,
        uint256 totalAmount,
        address freezeKey
    ) 
        external 
        onlyAuthorizedAccount(msg.sender)
        onlyAuthorizedToken(nftToken)
        onlyAuthorizedPaymentToken(paymentToken)
        returns (bool success) 
    {
        require(buyer != address(0), "Invalid buyer");
        require(seller != address(0), "Invalid seller");
        require(serialNumbers.length > 0, "No serials");
        require(totalAmount > 0, "Invalid amount");

        // Associate NFT token with buyer
        require(hederaTokenService.associateToken(buyer, nftToken) == 22, "Association failed");

        // Transfer payment
        require(hederaTokenService.transferToken(
            paymentToken,
            buyer,
            seller,
            int64(uint64(totalAmount))
        ) == 22, "Payment failed");

        // Transfer NFTs
        for (uint256 i = 0; i < serialNumbers.length; i++) {
            require(hederaTokenService.transferNFT(
                nftToken,
                seller,
                buyer,
                int64(uint64(serialNumbers[i]))
            ) == 22, "NFT transfer failed");
        }

        // Freeze if requested
        if (freezeKey != address(0)) {
            hederaTokenService.freezeToken(nftToken, buyer);
        }

        return true;
    }

    function unfreezeToken(address account, address nftToken) external onlyOwner {
        hederaTokenService.unfreezeToken(nftToken, account);
    }

    function getContractInfo() external view returns (string memory, address) {
        return ("TokenPurchase v2.0", owner);
    }

    function isTokenAuthorized(address token) external view returns (bool) {
        return authorizedTokens[token];
    }

    function isPaymentTokenAuthorized(address token) external view returns (bool) {
        return authorizedPaymentTokens[token];
    }

    function isAccountAuthorized(address account) external view returns (bool) {
        return authorizedAccounts[account] || account == owner;
    }
}
