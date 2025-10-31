// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IHederaTokenService
 * @dev Interface for Hedera Token Service system smart contract
 * @notice This interface provides access to Hedera's native token operations
 */
interface IHederaTokenService {
    // Token transfer functions
    function transferToken(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external returns (int64 responseCode);

    function transferNFT(
        address token,
        address sender,
        address recipient,
        int64 serialNumber
    ) external returns (int64 responseCode);

    function transferNFTs(
        address token,
        address sender,
        address recipient,
        int64[] memory serialNumbers
    ) external returns (int64 responseCode);

    // Token association functions
    function associateToken(
        address account,
        address token
    ) external returns (int64 responseCode);

    function dissociateToken(
        address account,
        address token
    ) external returns (int64 responseCode);

    // Token freeze/unfreeze functions
    function freezeToken(
        address token,
        address account
    ) external returns (int64 responseCode);

    function unfreezeToken(
        address token,
        address account
    ) external returns (int64 responseCode);

    // Token mint functions
    function mintToken(
        address token,
        uint64 amount,
        bytes[] memory metadata
    ) external returns (int64 responseCode, int64 newTotalSupply, int64[] memory serialNumbers);

    // Token burn functions
    function burnToken(
        address token,
        uint64 amount
    ) external returns (int64 responseCode, int64 newTotalSupply);

    function burnTokenNFT(
        address token,
        int64[] memory serialNumbers
    ) external returns (int64 responseCode, int64 newTotalSupply);

    // Token query functions
    function getTokenInfo(address token) external view returns (
        int64 responseCode,
        string memory name,
        string memory symbol,
        string memory memo,
        bool deleted,
        int64 totalSupply,
        int64 maxSupply,
        int64 decimals,
        bool defaultKycStatus,
        bool defaultFreezeStatus,
        address treasury,
        address adminKey,
        address kycKey,
        address freezeKey,
        address supplyKey,
        address wipeKey,
        address feeScheduleKey,
        address pauseKey
    );

    function getTokenCustomFees(address token) external view returns (
        int64 responseCode,
        int64[] memory fixedFees,
        int64[] memory fractionalFees,
        int64[] memory royaltyFees
    );

    function getAccountBalance(address account, address token) external view returns (
        int64 responseCode,
        int64 balance
    );

    function getTokenNftInfo(address token, int64 serialNumber) external view returns (
        int64 responseCode,
        address owner,
        int64 creationTime,
        bytes memory metadata,
        address spender
    );

    function getTokenNftInfos(address token, int64 startSerialNumber, int64 endSerialNumber) external view returns (
        int64 responseCode,
        address[] memory owners,
        int64[] memory creationTimes,
        bytes[] memory metadata,
        address[] memory spenders
    );
}
