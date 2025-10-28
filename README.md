![Silsilat logo](https://silsilat.finance/images/silsilat.jpg)
# Silsilat Finance

**Track:** Onchain Finance & RWA

---

## 🌟 Project Overview

Creating a liquidity bridge that transforms gold-backed Ar-Rahnu financing into a transparent, instant, and Shariah-compliant digital asset ecosystem empowering micro-entrepreneurs, cooperatives, and investors through traceable, data-driven finance.

---

## 🔗 Hedera Integration Summary

### Hedera Token Service (HTS)
We leverage HTS to tokenize gold-backed Ar-Rahnu financing into fungible digital assets that represent real-world collateral. This service is critical for Silsilat Finance because it provides native compliance features (freeze/unfreeze), programmable supply management (mint/burn), and ultra-low transaction costs ($0.001 per transfer). For micro-entrepreneurs and cooperatives operating on thin margins, HTS's predictable fee structure ensures that tokenizing their gold collateral remains economically viable while maintaining full Shariah compliance through transparent, auditable on-chain records. The ability to associate tokens with accounts ensures controlled distribution, while wipe functionality provides necessary safeguards for regulatory compliance.

**Key Transactions Used:**
- `TokenMintTransaction` - Create new tokens representing newly pledged gold collateral
- `TokenBurnTransaction` - Remove tokens when Ar-Rahnu financing is repaid
- `TokenFreezeTransaction` / `TokenUnfreezeTransaction` - Manage compliance and risk controls
- `TokenAssociateTransaction` - Enable accounts to hold gold-backed tokens
- `TokenWipeTransaction` - Remove tokens from non-compliant accounts for regulatory adherence
- `TransferTransaction` - Facilitate instant, transparent transfers of tokenized financing

### Hedera Consensus Service (HCS)
We chose HCS for immutable logging of all critical financing events—collateral pledges, repayments, token issuance, and transfers. Each transaction in the Ar-Rahnu lifecycle is timestamped and recorded on an immutable topic, creating an auditable trail that satisfies both Shariah compliance requirements and investor due diligence needs. HCS's $0.0001 per message cost makes it economically feasible to log every micro-transaction, ensuring complete transparency without pricing out small-scale operations. This immutable record builds trust among stakeholders—from micro-entrepreneurs seeking financing to investors providing liquidity—by proving that every gold-backed token is traceable to real collateral.

**Key Transactions Used:**
- `TopicCreateTransaction` - Establish immutable audit logs for different financing pools
- `TopicMessageSubmitTransaction` - Record all financing events with timestamps and proof

---

## 🚀 Deployment & Setup Instructions

### Project Structure

```
Silsilat/
├── frontend/   # NextJS application
├── backend/    # Express.js backend API
├── agent/      # Compliance Service Agent
├── docker-compose.yml  # Docker services configuration
└── README.md         # This file
```

### Getting Started
For getting started we recommend to use `docker compose` to start all the services.

#### Pre-requisite
- Docker Compose
- Git / Github Desktop
- A Hedera Account
- A fastforex account (API Key)

### Steps
Make sure you have registered the hedera account at https://portal.hedera.com/register as the operator account with hbar

1. Clone this project with
```
git clone git@github.com:arispelgremory/Silsilat.git
```
2. Create a .env file at both frontend and backend
#### Frontend
```
<!-- Assuming terminal is at Silsilat/ -->
cd frontend
cp .env.example .env
```

Then you could modify the .env file where by default it will be:
```
NODE_ENV=development

NEXT_PUBLIC_API_URL=http://localhost:9266/api # By default
NEXT_PUBLIC_SOCKET_URL=http://localhost:9266 # By default
NEXT_PUBLIC_ENV_URL=https://hashscan.io/testnet/token # Change to mainnet if required

OVERRIDE_TOPIC_ID=
```

#### Backend
```
<!-- Assuming terminal is at Silsilat/frontend -->
cd ../backend
cp .env.example .env
```

Then you could modify the .env file where by default it will be:
```
# Runtime environment
NODE_ENV=production
JWT_ALGORITHM=RS256
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Database Configurations
POSTGRES_HOST=postgres # If uses the instance inside docker compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_PASSWORD_HERE
POSTGRES_PORT=5432
POSTGRES_DB=silsilat-db
DATABASE_URL=postgresql://postgres:iamverysui@postgres:5432/silsilat-db

# Hedera Configurations
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=
HEDERA_OPERATOR_KEY=
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com/api/v1
ENCRYPTION_MASTER_KEY=
PINATA_API_KEY=
PINATA_SECRET_API_KEY=
FUNGIBLE_TOKEN_ID= # Specify this field if you already registered the fungible token that you wish to use, will create automatically if doesn't have
IPFS_ENCRYPTION_KEY=317bb20e6dc90ec571b74c431f66314abab2fab8964f701e32431a68d6806a52
OVERRIDE_TOPIC_ID= # Hedera Topic ID
ADMIN_HEDERA_ACCOUNT_ID= # Same with hedera operator ID

# Redis Configurations
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

```

---

