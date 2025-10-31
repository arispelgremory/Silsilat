// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IHederaTokenService.sol";

/**
 * @title TokenPurchase
 * @dev Smart contract for handling NFT token purchases with fungible token payments using Hedera Token Service
 * @notice This contract manages the purchase of NFTs using fungible tokens as payment with actual on-chain transfers
 */
contract TokenPurchase {
    // Hedera Token Service precompiled contract address
    address constant HEDERA_TOKEN_SERVICE = address(0x167);
    
    // IHederaTokenService interface instance
    IHederaTokenService constant hederaTokenService = IHederaTokenService(HEDERA_TOKEN_SERVICE);
    // Events
    event TokenPurchased(
        address indexed buyer,
        address indexed seller,
        address indexed nftToken,
        uint256[] serialNumbers,
        address paymentToken,
        uint256 totalAmount,
        bytes32 transactionId
    );
    
    event PaymentTransferred(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        bytes32 transactionId
    );
    
    event NFTTransferred(
        address indexed from,
        address indexed to,
        address indexed nftToken,
        uint256[] serialNumbers,
        bytes32 transactionId
    );
    
    event TokenFrozen(
        address indexed account,
        address indexed nftToken,
        bytes32 transactionId
    );
    
    event TokenUnfrozen(
        address indexed account,
        address indexed nftToken,
        bytes32 transactionId
    );

    // State variables
    address public owner;
    mapping(address => bool) public authorizedTokens;
    mapping(address => bool) public authorizedPaymentTokens;
    mapping(address => bool) public authorizedAccounts;
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
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

    /**
     * @dev Authorize an NFT token for purchases
     * @param token The NFT token address to authorize
     */
    function authorizeToken(address token) external onlyOwner {
        authorizedTokens[token] = true;
    }

    /**
     * @dev Authorize a payment token for purchases
     * @param token The payment token address to authorize
     */
    function authorizePaymentToken(address token) external onlyOwner {
        authorizedPaymentTokens[token] = true;
    }

    /**
     * @dev Authorize an account to perform purchases
     * @param account The account address to authorize
     */
    function authorizeAccount(address account) external onlyOwner {
        authorizedAccounts[account] = true;
    }

    /**
     * @dev Deauthorize an NFT token
     * @param token The NFT token address to deauthorize
     */
    function deauthorizeToken(address token) external onlyOwner {
        authorizedTokens[token] = false;
    }

    /**
     * @dev Deauthorize a payment token
     * @param token The payment token address to deauthorize
     */
    function deauthorizePaymentToken(address token) external onlyOwner {
        authorizedPaymentTokens[token] = false;
    }

    /**
     * @dev Deauthorize an account
     * @param account The account address to deauthorize
     */
    function deauthorizeAccount(address account) external onlyOwner {
        authorizedAccounts[account] = false;
    }

    /**
     * @dev Purchase NFTs with fungible token payment using Hedera Token Service
     * @param nftToken The NFT token address
     * @param serialNumbers Array of serial numbers to purchase
     * @param buyer The buyer's address
     * @param seller The seller's address
     * @param paymentToken The payment token address
     * @param totalAmount The total amount to pay (in smallest unit, e.g., tinybars)
     * @param freezeKey The freeze key address
     * @return success Whether the purchase was successful
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
        require(buyer != address(0), "Invalid buyer address");
        require(seller != address(0), "Invalid seller address");
        require(serialNumbers.length > 0, "No serial numbers provided");
        require(totalAmount > 0, "Invalid total amount");

        // Generate transaction IDs for events
        bytes32 paymentTxId = keccak256(abi.encodePacked(buyer, seller, paymentToken, totalAmount, block.timestamp));
        bytes32 nftTxId = keccak256(abi.encodePacked(seller, buyer, nftToken, block.timestamp));

        // Step 1: Associate NFT token with buyer if not already associated
        require(hederaTokenService.associateToken(buyer, nftToken) == 22, "Failed to associate NFT token with buyer");

        // Step 2: Transfer fungible token payment from buyer to seller
        require(hederaTokenService.transferToken(
            paymentToken,
            buyer,
            seller,
            int64(uint64(totalAmount))
        ) == 22, "Payment transfer failed");
        
        emit PaymentTransferred(buyer, seller, paymentToken, totalAmount, paymentTxId);

        // Step 3: Transfer NFTs from seller to buyer
        for (uint256 i = 0; i < serialNumbers.length; i++) {
            require(hederaTokenService.transferNFT(
                nftToken,
                seller,
                buyer,
                int64(uint64(serialNumbers[i]))
            ) == 22, "NFT transfer failed");
        }
        
        emit NFTTransferred(seller, buyer, nftToken, serialNumbers, nftTxId);

        // Step 4: Freeze NFTs for buyer (if freeze key is provided)
        if (freezeKey != address(0)) {
            if (hederaTokenService.freezeToken(nftToken, buyer) == 22) {
                bytes32 freezeTxId = keccak256(abi.encodePacked(buyer, nftToken, block.timestamp));
                emit TokenFrozen(buyer, nftToken, freezeTxId);
            }
        }

        // Emit main purchase event
        emit TokenPurchased(buyer, seller, nftToken, serialNumbers, paymentToken, totalAmount, nftTxId);

        return true;
    }

    /**
     * @dev Unfreeze token for an account (only owner) using Hedera Token Service
     * @param account Account to unfreeze
     * @param nftToken NFT token address
     */
    function unfreezeToken(address account, address nftToken) external onlyOwner {
        if (hederaTokenService.unfreezeToken(nftToken, account) == 22) {
            emit TokenUnfrozen(account, nftToken, keccak256(abi.encodePacked(account, nftToken, block.timestamp)));
        }
    }

    /**
     * @dev Emergency function to withdraw stuck tokens (only owner) using Hedera Token Service
     * @param token Token address to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        (, int64 balance) = hederaTokenService.getAccountBalance(address(this), token);
        require(balance > 0, "No tokens to withdraw");
        
        require(hederaTokenService.transferToken(
            token,
            address(this),
            owner,
            int64(uint64(amount))
        ) == 22, "Withdrawal failed");
        
        emit PaymentTransferred(address(this), owner, token, amount, keccak256(abi.encodePacked(address(this), owner, token, amount, block.timestamp)));
    }

    /**
     * @dev Get contract information
     * @return Contract version and owner
     */
    function getContractInfo() external view returns (string memory, address) {
        return ("TokenPurchase v1.0", owner);
    }

    /**
     * @dev Check if a token is authorized
     * @param token Token address to check
     * @return Whether the token is authorized
     */
    function isTokenAuthorized(address token) external view returns (bool) {
        return authorizedTokens[token];
    }

    /**
     * @dev Check if a payment token is authorized
     * @param token Payment token address to check
     * @return Whether the payment token is authorized
     */
    function isPaymentTokenAuthorized(address token) external view returns (bool) {
        return authorizedPaymentTokens[token];
    }

    /**
     * @dev Check if an account is authorized
     * @param account Account address to check
     * @return Whether the account is authorized
     */
    function isAccountAuthorized(address account) external view returns (bool) {
        return authorizedAccounts[account] || account == owner;
    }
}