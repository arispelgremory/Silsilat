# Hedera Account API

This module provides comprehensive account management functionality for Hedera Hashgraph accounts, including creation, retrieval, balance checking, and account information queries.

## Features

- **Account Creation**: Create new Hedera accounts with automatic key generation
- **Account Management**: CRUD operations for account records
- **Balance Queries**: Real-time balance checking from Hedera network
- **Account Information**: Detailed account information retrieval
- **Pagination & Filtering**: Advanced querying with search and filter capabilities
- **Operator Management**: Special handling for operator accounts

## API Endpoints

### Account Management

#### Create Account
```http
POST /api/v1/hedera/accounts
Content-Type: application/json

{
  "accountName": "My Test Account",
  "accountType": "USER",
  "network": "testnet",
  "isOperator": false
}
```

#### Get Account by ID
```http
GET /api/v1/hedera/accounts/{accountId}
```

#### Get All Accounts
```http
GET /api/v1/hedera/accounts?page=1&limit=10&search=test&accountType=USER&status=ACTIVE&network=testnet
```

#### Update Account
```http
PUT /api/v1/hedera/accounts/{accountId}
Content-Type: application/json

{
  "accountName": "Updated Account Name",
  "status": "ACTIVE",
  "isOperator": false
}
```

#### Delete Account (Soft Delete)
```http
DELETE /api/v1/hedera/accounts/{accountId}
```

### Hedera Network Operations

#### Get Account Balance
```http
GET /api/v1/hedera/accounts/{accountId}/balance
```

#### Get Account Info
```http
GET /api/v1/hedera/accounts/{accountId}/info
```

### Operator Management

#### Get Operator Accounts
```http
GET /api/v1/hedera/accounts/operators?network=testnet
```

## Data Models

### HederaAccountType
```typescript
{
  accountId?: string;
  hederaAccountId: string;
  accountName: string;
  publicKey: string;
  privateKey?: string | null;
  accountType: 'OPERATOR' | 'USER' | 'SYSTEM';
  balance?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isOperator: boolean;
  network: 'testnet' | 'mainnet' | 'previewnet';
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  updatedBy: string;
}
```

### CreateAccountRequest
```typescript
{
  accountName: string;
  accountType: 'OPERATOR' | 'USER' | 'SYSTEM';
  network?: 'testnet' | 'mainnet' | 'previewnet';
  isOperator?: boolean;
}
```

### AccountBalanceResponse
```typescript
{
  hederaAccountId: string;
  balance: string;
  balanceInHbar: string;
  network: string;
}
```

## Error Handling

The API follows consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict (Account already exists)
- `500` - Internal Server Error

## Security Considerations

1. **Private Key Storage**: Private keys are stored in the database but should be encrypted in production
2. **Access Control**: Implement proper authentication and authorization
3. **Network Security**: Use HTTPS in production
4. **Input Validation**: All inputs are validated before processing

## Environment Variables

Required environment variables:
- `HEDERA_OPERATOR_ID`: Hedera operator account ID
- `HEDERA_OPERATOR_KEY`: Hedera operator private key
- `HEDERA_NETWORK`: Hedera network (testnet/mainnet/previewnet)

## Database Schema

The `hedera_account` table includes:
- `account_id`: Primary key (UUID)
- `hedera_account_id`: Hedera account ID (unique)
- `account_name`: Human-readable account name
- `public_key`: Account public key
- `private_key`: Account private key (encrypted)
- `account_type`: Type of account
- `balance`: Current balance in tinybars
- `status`: Account status
- `is_operator`: Whether account is an operator
- `network`: Hedera network
- Standard audit fields (created_at, updated_at, created_by, updated_by)

## Usage Examples

### Creating a User Account
```typescript
const response = await fetch('/api/v1/hedera/accounts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    accountName: 'User Wallet',
    accountType: 'USER',
    network: 'testnet'
  })
});
```

### Checking Account Balance
```typescript
const response = await fetch('/api/v1/hedera/accounts/123e4567-e89b-12d3-a456-426614174000/balance');
const data = await response.json();
console.log(`Balance: ${data.data.balanceInHbar} HBAR`);
```

### Getting Account List with Filtering
```typescript
const response = await fetch('/api/v1/hedera/accounts?page=1&limit=20&accountType=USER&status=ACTIVE');
const data = await response.json();
console.log(`Found ${data.data.total} accounts`);
```
