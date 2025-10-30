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


### Economic Justification
Silsilat unlocks billions of dollars in value trapped within gold-backed pawn and microfinance networks across Africa and Southeast Asia. Today, these sectors operate on cash cycles, turning capital only 3–4 times per year and burdened by 60% higher compliance costs. By tokenizing collateral, automating valuations, and connecting pawnshops to on-chain liquidity pools, Silsilat expands lending capacity up to 5× while lowering funding costs by 30–40%. This transforms an informal, opaque ecosystem into a transparent, regulated, and yield-generating marketplace. At just USD 50 million in tokenized loan volume, Silsilat can generate USD1 million in annual revenue with 70% gross margins, sustained by liquidity, compliance, and transaction fees. More than profit, it delivers measurable inclusion and trust, giving millions of unbanked borrowers affordable access to finance through verifiable, Shariah-compliant digital liquidity.

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
- A metal price api account (API Key)
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

NEXT_PUBLIC_API_URL=http://localhost:9926/api # By default
NEXT_PUBLIC_SOCKET_URL=http://localhost:9926 # By default
NEXT_PUBLIC_ENV_URL=https://hashscan.io/testnet/token # Change to mainnet if required
NODE_ENV=development
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
JWT_ACCESS_TOKEN_EXPIRATION=30d
JWT_REFRESH_TOKEN_EXPIRATION=30d

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
IPFS_ENCRYPTION_KEY=
OVERRIDE_TOPIC_ID= # Hedera Topic ID
ADMIN_HEDERA_ACCOUNT_ID= # Same with hedera operator ID

# Redis Configurations
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

```
#### Agent
```
<!-- Assuming terminal is at Silsilat/ -->
cd agent
cp .env.example .env
```
Then you could modify the .env file where by default it will be:
```
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_LLM_MODEL=llama3.1:8b
PHOENIX_COLLECTOR_ENDPOINT=http://localhost:6006/v1/traces
PHOENIX_SERVICE_NAME=silsilat-gold-evaluator
JEWELLERY_HAIRCUT_BPS=500
BAR_HAIRCUT_BPS=100
MAX_SAFE_LTV=0.80
MARGIN_CALL_LTV=0.85
VOL_WINDOW=30
METALPRICE_API_KEY=
FASTFOREX_API_KEY=your_fastforex_key_here
SILSILAT_API_BASE=http://localhost:9487
SILSILAT_API_KEY=your_silsilat_key_here
IPFS_ENCRYPTION_KEY=

# PINATA FOR IPFS SERVICES
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key

# HEDERA INFO
HEDERA_OPERATOR_ID=your_hedera_operator_id
HEDERA_OPERATOR_KEY=your_hedera_operator_key

# TOPIC IDs
INPUT_TOPIC_ID=your_hedera_input_topic_id
OUTPUT_TOPIC_ID=your_hedera_output_topic_id
```

### How to Start Silsilat
``` 
<!-- Assuming terminal is at Silsilat/ -->
docker compose up -d
```

### Account created on initialization & Onboarding

Silsilat Finance provides three different user roles, each with specific access routes:

#### 1. **Investor Role**
Investors can view and purchase tokenized gold-backed financing opportunities.

**Access Route:** `/login` or `http://localhost:9927/login`

**Default Account:**
```
Email: investor@silsilat.finance
Password: investor123
```

**Features:**
- Browse available SAG (Shariah Asset Group) tokens
- Purchase tokenized financing
- Track portfolio and returns
- View transaction history

---

#### 2. **Ar-Rahnu (Pawnshop) Role**
Ar-Rahnu operators manage loan applications, collateral, and financing operations.

**Access Route:** `/admin/login` or `http://localhost:9927/admin/login`

**Default Account:**
```
Email: ar-rahnu@silsilat.finance
Password: admin
```

**Features:**
- Process loan applications
- Manage gold collateral
- Create SAG tokens
- Handle repayments
- Monitor compliance

---

#### 3. **Admin Role**
Administrators have full system access for platform management and oversight.

**Access Route:** `/admin/login` or `http://localhost:9927/admin/login`

**Default Account:**
```
Email: admin@silsilat.finance
Password: admin123
```

**Features:**
- Full platform oversight
- User management
- System configuration
- Compliance monitoring
- Override capabilities
- Analytics and reporting

---

**Note:** After first login, it is highly recommended to change the default passwords for security purposes.

## Architecture Diagram
![Architecture Diagram](./architecture-diagram.png)

## Deployed Hedera IDs
### Users
- [0.0.6617344](https://hashscan.io/testnet/account/0.0.6617344) Silsilat Treasury
- [0.0.7154335](https://hashscan.io/testnet/account/0.0.7154335)
- [0.0.7154336](https://hashscan.io/testnet/account/0.0.7154336)

### SAGs
- [0.0.7154750](https://hashscan.io/testnet/token/0.0.7154750)
- [0.0.7155070](https://hashscan.io/testnet/token/0.0.7155070)
- [0.0.7155114](https://hashscan.io/testnet/token/0.0.7155114)

### Proof of transactions
- [Proof of transaction 1](https://hashscan.io/testnet/transaction/1761723773.975551287)
- [Proof of transaction 2](https://hashscan.io/testnet/transaction/1761713460.366859998)


## Assumptions
- Have a Hedera Account as an operator account with public & private keys before system initialization
- Have fastforex API Keys
- Generated ssh-keygen for JWT Authentication

## Demo Site
Visit: silsilat.finance

## Hedera Certificate from Team Members
- [Jasim](https://explore.hashpack.app/nft/0.0.3872504/457)
- [Tik Joe](https://drive.google.com/file/d/1pycTJRjsKw1_dRq12rv9McH6sbAv7U8O/view?usp=sharing)

## Submission Artifacts
Pitch deck: https://drive.google.com/file/d/1mvBWx-V3NDk6_Z0qWosWiXgKGcvnoqBk/view?usp=sharing

Video demo: https://youtu.be/s-yEVtYtf-0

## Project Documentation
Read our full project documentation here: docs.silsilat.finance


