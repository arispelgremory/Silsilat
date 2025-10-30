# Database Interlinking Matrix - Suyula Liquid Platform

## Table Relationship Matrix

### Primary Relationships

| Parent Table | Child Table | Relationship Type | Foreign Key | Cascade Rule | Business Rule |
|--------------|-------------|------------------|-------------|--------------|---------------|
| **users** | user_roles | One-to-Many | user_id | CASCADE | User can have multiple roles |
| **users** | user_addresses | One-to-Many | user_id | CASCADE | User can have multiple addresses |
| **users** | kyc_verifications | One-to-Many | user_id | CASCADE | User can have multiple KYC attempts |
| **users** | documents | One-to-Many | user_id | CASCADE | User can upload multiple documents |
| **users** | jewelry_items | One-to-Many | user_id | CASCADE | User can own multiple jewelry items |
| **users** | loan_applications | One-to-Many | user_id | CASCADE | User can have multiple loan applications |
| **users** | loans | One-to-Many | user_id | RESTRICT | User can have multiple active loans |
| **users** | payments | One-to-Many | user_id | RESTRICT | User can make multiple payments |
| **users** | notifications | One-to-Many | user_id | CASCADE | User can receive multiple notifications |
| **users** | investments | One-to-Many | investor_id | RESTRICT | Investor can make multiple investments |
| **roles** | user_roles | One-to-Many | role_id | RESTRICT | Role can be assigned to multiple users |
| **jewelry_categories** | jewelry_items | One-to-Many | category_id | RESTRICT | Category can have multiple items |
| **jewelry_items** | jewelry_images | One-to-Many | jewelry_item_id | CASCADE | Item can have multiple images |
| **jewelry_items** | ai_valuations | One-to-Many | jewelry_item_id | CASCADE | Item can have multiple valuations |
| **jewelry_items** | expert_valuations | One-to-Many | jewelry_item_id | CASCADE | Item can have expert reviews |
| **jewelry_items** | jewelry_nfts | One-to-One | jewelry_item_id | CASCADE | Item can have one NFT representation |
| **jewelry_items** | loan_applications | One-to-Many | jewelry_item_id | RESTRICT | Item can be used for multiple applications |
| **loan_products** | loan_applications | One-to-Many | loan_product_id | RESTRICT | Product can have multiple applications |
| **loan_applications** | loans | One-to-One | loan_application_id | RESTRICT | Application becomes one loan |
| **loans** | payment_schedules | One-to-Many | loan_id | CASCADE | Loan has multiple payment schedules |
| **loans** | payments | One-to-Many | loan_id | RESTRICT | Loan can have multiple payments |
| **loans** | loan_extensions | One-to-Many | loan_id | CASCADE | Loan can have multiple extensions |
| **loans** | investment_opportunities | One-to-One | loan_id | CASCADE | Loan can be one investment opportunity |
| **blockchain_networks** | jewelry_nfts | One-to-Many | network_id | RESTRICT | Network can have multiple NFTs |
| **sag_members** | shariah_rulings | One-to-Many | member_id | RESTRICT | Member can issue multiple rulings |

### Cross-Module Relationships

\`\`\`sql
-- User Management → KYC System
users.id → kyc_verifications.user_id
users.id → documents.user_id

-- User Management → Jewelry System  
users.id → jewelry_items.user_id

-- Jewelry System → Loan System
jewelry_items.id → loan_applications.jewelry_item_id

-- Loan System → Payment System
loans.id → payments.loan_id
loans.id → payment_schedules.loan_id

-- Loan System → Investment System
loans.id → investment_opportunities.loan_id

-- User Management → Investment System
users.id → investments.investor_id (where user has investor role)

-- Jewelry System → Blockchain System
jewelry_items.id → jewelry_nfts.jewelry_item_id

-- All Systems → Audit System
users.id → audit_logs.user_id
loans.id → audit_logs.entity_id (where entity_type = 'loan')
payments.id → audit_logs.entity_id (where entity_type = 'payment')
\`\`\`

### Data Flow Sequences

#### 1. User Onboarding Flow
\`\`\`
users → user_verification_tokens → kyc_verifications → documents → user_addresses → user_preferences
\`\`\`

#### 2. Jewelry Submission Flow  
\`\`\`
jewelry_items → jewelry_images → ai_valuations → expert_valuations → jewelry_nfts
\`\`\`

#### 3. Loan Application Flow
\`\`\`
loan_applications → risk_assessments → underwriting_decisions → loans → payment_schedules
\`\`\`

#### 4. Payment Processing Flow
\`\`\`
payments → payment_schedules → loans → loan_history → notifications
\`\`\`

#### 5. Investment Flow
\`\`\`
investment_opportunities → investments → investment_portfolios → performance_metrics
\`\`\`

### Referential Integrity Constraints

\`\`\`sql
-- Core user constraints
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role 
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT;

-- Jewelry system constraints
ALTER TABLE jewelry_items ADD CONSTRAINT fk_jewelry_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE jewelry_images ADD CONSTRAINT fk_jewelry_images_item 
  FOREIGN KEY (jewelry_item_id) REFERENCES jewelry_items(id) ON DELETE CASCADE;

-- Loan system constraints
ALTER TABLE loan_applications ADD CONSTRAINT fk_loan_app_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE loan_applications ADD CONSTRAINT fk_loan_app_jewelry 
  FOREIGN KEY (jewelry_item_id) REFERENCES jewelry_items(id) ON DELETE RESTRICT;

ALTER TABLE loans ADD CONSTRAINT fk_loans_application 
  FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE RESTRICT;

-- Payment system constraints
ALTER TABLE payments ADD CONSTRAINT fk_payments_loan 
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE RESTRICT;

ALTER TABLE payment_schedules ADD CONSTRAINT fk_payment_schedule_loan 
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE;

-- Investment system constraints
ALTER TABLE investments ADD CONSTRAINT fk_investments_opportunity 
  FOREIGN KEY (opportunity_id) REFERENCES investment_opportunities(id) ON DELETE RESTRICT;

ALTER TABLE investments ADD CONSTRAINT fk_investments_investor 
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE RESTRICT;
\`\`\`

### Business Logic Constraints

\`\`\`sql
-- Loan-to-Value ratio constraint
ALTER TABLE loans ADD CONSTRAINT chk_loan_ltv_ratio
CHECK (
  principal_amount <= (
    SELECT ji.estimated_value * 0.70 
    FROM jewelry_items ji 
    JOIN loan_applications la ON ji.id = la.jewelry_item_id 
    WHERE la.id = loan_application_id
  )
);

-- Payment amount constraint
ALTER TABLE payments ADD CONSTRAINT chk_payment_amount
CHECK (
  amount <= (
    SELECT outstanding_balance 
    FROM loans 
    WHERE id = loan_id
  )
);

-- User age constraint
ALTER TABLE users ADD CONSTRAINT chk_user_age
CHECK (
  EXTRACT(YEAR FROM AGE(date_of_birth)) >= 18
);

-- Jewelry valuation constraint
ALTER TABLE ai_valuations ADD CONSTRAINT chk_valuation_positive
CHECK (estimated_value > 0);

-- Investment amount constraint
ALTER TABLE investments ADD CONSTRAINT chk_investment_amount
CHECK (amount >= 100); -- Minimum investment amount
\`\`\`

### Unique Constraints and Indexes

\`\`\`sql
-- Unique constraints
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT uk_users_phone UNIQUE (phone_number);
ALTER TABLE jewelry_nfts ADD CONSTRAINT uk_nft_token UNIQUE (blockchain_network, contract_address, token_id);
ALTER TABLE loan_applications ADD CONSTRAINT uk_active_loan_per_jewelry UNIQUE (jewelry_item_id) 
  WHERE status IN ('submitted', 'under_review', 'approved');

-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_jewelry_items_user_id ON jewelry_items(user_id);
CREATE INDEX idx_jewelry_items_status ON jewelry_items(status);
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_loans_user_status ON loans(user_id, status);
CREATE INDEX idx_jewelry_user_category ON jewelry_items(user_id, category_id);
CREATE INDEX idx_payments_loan_status ON payments(loan_id, status);
\`\`\`

### Triggers for Data Consistency

\`\`\`sql
-- Update loan balance after payment
CREATE OR REPLACE FUNCTION update_loan_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE loans 
  SET outstanding_balance = outstanding_balance - NEW.amount,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.loan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_loan_balance
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_balance();

-- Update jewelry status after loan approval
CREATE OR REPLACE FUNCTION update_jewelry_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE jewelry_items 
    SET status = 'collateralized',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = (
      SELECT jewelry_item_id 
      FROM loan_applications 
      WHERE id = NEW.loan_application_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_jewelry_status
  AFTER UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_jewelry_status();

-- Audit trail trigger
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    operation,
    old_values,
    new_values,
    user_id,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    COALESCE(NEW.user_id, OLD.user_id),
    CURRENT_TIMESTAMP
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to key tables
CREATE TRIGGER trg_audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER trg_audit_loans AFTER INSERT OR UPDATE OR DELETE ON loans
  FOR EACH ROW EXECUTE FUNCTION audit_changes();

CREATE TRIGGER trg_audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_changes();
\`\`\`

### Data Validation Rules

\`\`\`sql
-- Email validation
ALTER TABLE users ADD CONSTRAINT chk_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Phone number validation
ALTER TABLE users ADD CONSTRAINT chk_phone_format
CHECK (phone_number ~* '^\+?[1-9]\d{1,14}$');

-- Jewelry weight validation
ALTER TABLE jewelry_items ADD CONSTRAINT chk_weight_positive
CHECK (weight_grams > 0);

-- Loan duration validation
ALTER TABLE loan_applications ADD CONSTRAINT chk_loan_duration
CHECK (duration_days BETWEEN 30 AND 1095); -- 1 month to 3 years

-- Interest rate validation
ALTER TABLE loans ADD CONSTRAINT chk_profit_rate
CHECK (profit_rate >= 0 AND profit_rate <= 1); -- 0% to 100%
\`\`\`

This interlinking matrix ensures data consistency, referential integrity, and optimal performance across the entire Suyula Liquid platform database system.
