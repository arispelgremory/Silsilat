# Fungible Token Minting Guide

## Overview

This guide explains how to mint additional supply to existing fungible tokens in the Hedera Pawnshop NFT system.

## Key Differences: NFT vs Fungible Token Minting

### NFT (Non-Fungible Token) Minting
- Uses `TokenMintTransaction` with `.setMetadata()`
- Creates serial numbers for each NFT
- Each token is unique with its own metadata
- Returns serial numbers in the response

### Fungible Token Minting
- Uses `TokenMintTransaction` with `.setAmount()`
- Increases the total supply by the specified amount
- All tokens are identical (fungible)
- Returns the new total supply in the response

## Implementation

### 1. Schema Definition (`token.model.ts`)

```typescript
// Request Schema
export const MintFungibleTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  amount: z.number().int().min(1, 'Amount must be at least 1')
});

// Response Schema
export const MintFungibleTokenResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    newTotalSupply: z.string(),
    transactionId: z.string(),
    receipt: z.any()
  }).optional(),
  error: z.string().optional()
});
```

### 2. Repository Method (`token.repository.ts`)

The `mintFungibleToken` method in `TokenRepository`:

```typescript
async mintFungibleToken(params: MintFungibleTokenParams): Promise<{
  newTotalSupply: string;
  transactionId: string;
  receipt: TransactionReceipt;
}>
```

**Key Steps:**
1. Creates a `TokenMintTransaction`
2. Sets the token ID and amount to mint
3. Signs with the supply key
4. Executes the transaction on Hedera
5. Returns the new total supply from the receipt

### 3. Controller Method (`token.controller.ts`)

The `mintFungibleToken` method in `HederaTokenController`:

**Process:**
1. Validates the request body
2. Gets the account information and supply key
3. Decrypts the private key
4. Calls the repository method to mint tokens
5. Updates the database with the new supply
6. Returns the response

### 4. Route (`token.routes.ts`)

```typescript
router.post('/fungible/mint', (req, res) => {
  hederaTokenController.mintFungibleToken(req, res);
});
```

## API Usage

### Endpoint
```
POST /api/v1/token/fungible/mint
```

### Request Body
```json
{
  "tokenId": "0.0.123456",
  "amount": 1000
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "newTotalSupply": "11000",
    "transactionId": "0.0.123456@1234567890.123456789",
    "receipt": { ... }
  }
}
```

### Response (Error)
```json
{
  "success": false,
  "error": "Failed to mint fungible token: INSUFFICIENT_TOKEN_BALANCE"
}
```

## Requirements

### Token Requirements
1. **Supply Type**: Token must be created with `TokenSupplyType.Infinite` or have remaining supply capacity
2. **Supply Key**: Token must have a supply key set during creation
3. **Token Type**: Must be a `FungibleCommon` token

### Account Requirements
1. Must have the supply key for the token
2. Must have sufficient HBAR for transaction fees (~0.001 HBAR)

## Example: Creating and Minting a Fungible Token

### Step 1: Create Fungible Token
```http
POST /api/v1/token/fungible/create
Content-Type: application/json

{
  "name": "Suyula Gold Token",
  "symbol": "SGLD",
  "initialSupply": 10000,
  "price": 100,
  "expiredAt": "2025-12-31T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": "0.0.123456"
  }
}
```

### Step 2: Mint Additional Supply
```http
POST /api/v1/token/fungible/mint
Content-Type: application/json

{
  "tokenId": "0.0.123456",
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "newTotalSupply": "15000",
    "transactionId": "0.0.123456@1234567890.123456789",
    "receipt": { ... }
  }
}
```

## Database Updates

When minting is successful, the `fungible_token` table is automatically updated:

```sql
UPDATE fungible_token 
SET 
  amount = '15000',
  updated_by = '0.0.6861395',
  updated_at = NOW()
WHERE token_id = '0.0.123456';
```

## Error Handling

### Common Errors

1. **INVALID_TOKEN_ID**: Token ID doesn't exist
   ```json
   {
     "success": false,
     "error": "Failed to mint fungible token: INVALID_TOKEN_ID"
   }
   ```

2. **INVALID_SUPPLY_KEY**: Wrong supply key or no supply key set
   ```json
   {
     "success": false,
     "error": "Failed to mint fungible token: INVALID_SUPPLY_KEY"
   }
   ```

3. **TOKEN_MAX_SUPPLY_REACHED**: Token has reached its maximum supply
   ```json
   {
     "success": false,
     "error": "Failed to mint fungible token: TOKEN_MAX_SUPPLY_REACHED"
   }
   ```

4. **INSUFFICIENT_TX_FEE**: Not enough HBAR for transaction fee
   ```json
   {
     "success": false,
     "error": "Failed to mint fungible token: INSUFFICIENT_TX_FEE"
   }
   ```

## Best Practices

1. **Monitor Supply**: Keep track of your token's total supply and max supply
2. **Batch Minting**: If minting large amounts, consider the transaction fee
3. **Supply Key Security**: Store the supply key securely and only allow authorized accounts to mint
4. **Database Consistency**: Always verify the database update succeeded after minting
5. **Transaction Fees**: Ensure the treasury account has sufficient HBAR (~20 HBAR per transaction)

## Testing with Bruno

A Bruno API request file is available at:
```
backend/Pawnshop Bruno/Token (NFT)/Mint Fungible Token.bru
```

Simply update the `tokenId` and `amount` values to test minting.

## Comparison Table

| Feature | NFT Minting | Fungible Token Minting |
|---------|-------------|------------------------|
| Endpoint | `/api/v1/token/mint` | `/api/v1/token/fungible/mint` |
| Metadata | Required | Not used |
| Serial Numbers | Generated | None |
| Amount | Optional (default 1) | Required |
| Transaction Method | `.setMetadata()` | `.setAmount()` |
| Response | `serialNumbers[]` | `newTotalSupply` |
| Use Case | Unique items (artwork, collectibles) | Currency, shares, points |

## Notes

- The implementation uses the hardcoded account ID `6c2cb6dd-8658-415b-8415-cbfa06af856d` and Hedera account `0.0.6861395` for minting. In production, this should be replaced with the authenticated user's account or a proper treasury account.
- The token decimals are set to 2 during creation, meaning amounts are represented in units of 0.01
- For example, an amount of 1000 represents 10.00 tokens with 2 decimals

