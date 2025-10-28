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
---

