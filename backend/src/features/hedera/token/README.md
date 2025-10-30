# Hedera Token Management API

This module provides functionality to create, mint, freeze, and unfreeze NFT tokens using the Hedera SDK.

## Features

- **Create Token**: Create new NFT tokens with customizable properties
- **Mint Token**: Mint new NFTs to existing tokens with metadata
- **Freeze Token**: Freeze an account's token holdings
- **Unfreeze Token**: Unfreeze an account's token holdings
- **Burn Token**: Burn NFT serials from an existing token
- **Associate Token**: Associate an account with a token
- **Transfer Token**: Transfer NFTs between accounts

## API Endpoints

### 1. Create Token

**POST** `/api/v1/hedera/token/create`

Creates a new NFT token on the Hedera network.

**Request Body:**
```json
{
  "name": "My NFT Collection",
  "symbol": "MNC",
  "treasuryAccountId": "0.0.123456",
  "adminKey": "302e020100300506032b657004220420...", // Optional
  "supplyKey": "302e020100300506032b657004220420...", // Optional
  "freezeKey": "302e020100300506032b657004220420...", // Optional
  "wipeKey": "302e020100300506032b657004220420...", // Optional
  "metadata": "ipfs://QmYourMetadataHash", // Optional
  "customFees": [] // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": "0.0.1234567",
    "transactionId": "0.0.1234567@1234567890.123456789",
    "receipt": { /* Transaction receipt object */ }
  }
}
```

### 2. Mint Token

**POST** `/api/v1/hedera/token/mint`

Mints new NFTs to an existing token.

**Request Body:**
```json
{
  "tokenId": "0.0.1234567",
  "amount": 5,
  "metadata": [
    "ipfs://QmMetadata1",
    "ipfs://QmMetadata2",
    "ipfs://QmMetadata3",
    "ipfs://QmMetadata4",
    "ipfs://QmMetadata5"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "serialNumbers": [1, 2, 3, 4, 5],
    "transactionId": "0.0.1234567@1234567890.123456789",
    "receipt": { /* Transaction receipt object */ }
  }
}
```

### 3. Freeze Token

**POST** `/api/v1/hedera/token/freeze`

Freezes an account's token holdings, preventing transfers.

**Request Body:**
```json
{
  "tokenId": "0.0.1234567",
  "accountId": "0.0.123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "0.0.1234567@1234567890.123456789",
    "receipt": { /* Transaction receipt object */ }
  }
}
```

### 4. Unfreeze Token

**POST** `/api/v1/hedera/token/unfreeze`

Unfreezes an account's token holdings, allowing transfers.

**Request Body:**
```json
{
  "tokenId": "0.0.1234567",
  "accountId": "0.0.123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "0.0.1234567@1234567890.123456789",
    "receipt": { /* Transaction receipt object */ }
  }
}
```

### 5. Burn Token

**POST** `/api/v1/hedera/token/burn`

Burns NFT serials from an existing token (used at loan end).

**Request Body:**
```json
{
  "tokenId": "0.0.1234567",
  "serials": [1, 2, 3, 4, 5]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "0.0.1234567@1234567890.123456789",
    "receipt": { /* Transaction receipt object */ }
  }
}
```

### 6. Associate Token

**POST** `/api/v1/hedera/token/associate`

Associates an account with a token (required before receiving NFTs).

**Request Body:**
```json
{
  "tokenId": "0.0.1234567",
  "accountId": "0.0.123456",
  "privateKey": "302e020100300506032b657004220420..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "0.0.1234567@1234567890.123456789",
    "receipt": { /* Transaction receipt object */ }
  }
}
```

### 7. Transfer Token

**POST** `/api/v1/hedera/token/transfer`

Transfers an NFT from one account to another.

**Request Body:**
```json
{
  "tokenId": "0.0.1234567",
  "senderAccountId": "0.0.123456",
  "senderPrivateKey": "302e020100300506032b657004220420...",
  "recipientAccountId": "0.0.789012",
  "serialNumber": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "0.0.1234567@1234567890.123456789",
    "receipt": { /* Transaction receipt object */ }
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Environment Variables

Make sure the following environment variables are set:

- `HEDERA_OPERATOR_ID`: Your Hedera operator account ID
- `HEDERA_OPERATOR_KEY`: Your Hedera operator private key
- `HEDERA_NETWORK`: Network to use (`testnet`, `mainnet`, or `previewnet`)

## Usage Examples

### Creating an NFT Collection

```bash
curl -X POST http://localhost:3000/api/v1/hedera/token/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Digital Art Collection",
    "symbol": "DAC",
    "treasuryAccountId": "0.0.123456"
  }'
```

### Minting NFTs

```bash
curl -X POST http://localhost:3000/api/v1/hedera/token/mint \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.1234567",
    "amount": 3,
    "metadata": [
      "ipfs://QmArtwork1",
      "ipfs://QmArtwork2", 
      "ipfs://QmArtwork3"
    ]
  }'
```

### Freezing an Account

```bash
curl -X POST http://localhost:3000/api/v1/hedera/token/freeze \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.1234567",
    "accountId": "0.0.123456"
  }'
```

### Burning NFTs

```bash
curl -X POST http://localhost:3000/api/v1/hedera/token/burn \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.1234567",
    "serials": [1, 2, 3, 4, 5]
  }'
```

### Associating an Account

```bash
curl -X POST http://localhost:3000/api/v1/hedera/token/associate \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.1234567",
    "accountId": "0.0.123456",
    "privateKey": "302e020100300506032b657004220420..."
  }'
```

### Transferring NFTs

```bash
curl -X POST http://localhost:3000/api/v1/hedera/token/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.1234567",
    "senderAccountId": "0.0.123456",
    "senderPrivateKey": "302e020100300506032b657004220420...",
    "recipientAccountId": "0.0.789012",
    "serialNumber": 1
  }'
```

## NFT-Based Loan Flow

This API supports the complete NFT-based loan lifecycle:

1. **Loan Creation**: Use `createToken` to create the NFT collection, then `mintToken` to create fractional NFTs
2. **Investor Onboarding**: Use `associateToken` to allow investors to receive NFTs, then `transferToken` to distribute NFTs to investors
3. **Loan Period**: Use `freezeToken` to prevent investors from transferring NFTs during the loan period
4. **Loan Resolution**: 
   - **Repayment**: Use `unfreezeToken` then `burnToken` to burn all NFTs and distribute repayment
   - **Default**: Use `unfreezeToken` then `burnToken` to burn all NFTs and distribute liquidation proceeds

## Notes

- All private keys should be provided as hex-encoded strings
- Metadata should be provided as IPFS URLs or other content identifiers
- Transaction fees are automatically set to reasonable defaults
- The treasury account will receive all minted tokens
- Frozen accounts cannot transfer or receive the specified token
