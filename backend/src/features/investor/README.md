# Investor Purchase Token Feature

This feature allows investors to purchase minted NFT tokens. When an investor purchases a token, it is transferred to their account and immediately frozen to prevent further transfers, ensuring the investor cannot transfer it to other people.

## API Endpoint

**POST** `/api/v1/investor/purchase-token`

## Request Body

```json
{
  "tokenId": "0.0.123456",
  "serialNumber": 1,
  "investorAccountId": "0.0.987654",
  "investorPrivateKey": "302e020100300506032b657004220420...",
  "pawnShopAccountId": "0.0.111111",
  "pawnShopPrivateKey": "302e020100300506032b657004220420...",
  "freezeKey": "302e020100300506032b657004220420..."
}
```

### Field Descriptions

- `tokenId` (string, required): The Hedera token ID of the NFT to purchase
- `serialNumber` (number, required): The serial number of the specific NFT to purchase
- `investorAccountId` (string, required): The Hedera account ID of the investor
- `investorPrivateKey` (string, required): The private key of the investor account
- `pawnShopAccountId` (string, required): The Hedera account ID of the pawnshop
- `pawnShopPrivateKey` (string, required): The private key of the pawnshop account
- `freezeKey` (string, required): The freeze key for the token (used to freeze the token after transfer)

## Response

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "tokenId": "0.0.123456",
    "serialNumber": 1,
    "investorAccountId": "0.0.987654",
    "transferTransactionId": "0.0.123456@1234567890.123456789",
    "freezeTransactionId": "0.0.123456@1234567890.123456790",
    "transferReceipt": { /* Hedera transaction receipt */ },
    "freezeReceipt": { /* Hedera transaction receipt */ }
  }
}
```

### Error Response (500)

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Process Flow

1. **Token Association**: The system first attempts to associate the token with the investor's account (if not already associated)
2. **Token Transfer**: The NFT is transferred from the pawnshop's account to the investor's account
3. **Token Freeze**: The token is immediately frozen for the investor's account to prevent further transfers

## Security Features

- **Immediate Freeze**: After purchase, the token is frozen for the investor's account, preventing them from transferring it to others
- **Private Key Validation**: All private keys are validated before use
- **Transaction Signing**: All transactions are properly signed with the appropriate private keys

## Error Handling

The system handles various error scenarios:

- Invalid token ID or serial number
- Invalid account IDs
- Invalid private keys
- Insufficient account balance
- Token already associated (non-fatal)
- Network or Hedera service errors

## Usage Example

```bash
curl -X POST http://localhost:3000/api/v1/investor/purchase-token \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.123456",
    "serialNumber": 1,
    "investorAccountId": "0.0.987654",
    "investorPrivateKey": "302e020100300506032b657004220420...",
    "pawnShopAccountId": "0.0.111111",
    "pawnShopPrivateKey": "302e020100300506032b657004220420...",
    "freezeKey": "302e020100300506032b657004220420..."
  }'
```

## Testing

Use the provided Bruno API test file `Pawnshop Bruno/Investor/Purchase Token.bru` to test the endpoint with your specific token and account details.
