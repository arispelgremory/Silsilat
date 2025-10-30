-- Suyula Liquid - Comprehensive Database Schema
-- PostgreSQL 15+ with UUID extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- CORE USER MANAGEMENT TABLES
-- =============================================

-- Users table - Core user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nationality VARCHAR(3), -- ISO 3166-1 alpha-3
    preferred_language VARCHAR(5) DEFAULT 'en', -- ISO 639-1
    profile_image_url TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User addresses
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('home', 'work', 'billing', 'shipping')),
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User roles and permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id)
);

-- =============================================
-- KYC & VERIFICATION TABLES
-- =============================================

-- KYC verification records
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('identity', 'address', 'income', 'bank_account')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'expired')),
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    document_expiry_date DATE,
    verification_method VARCHAR(50), -- 'manual', 'automated', 'third_party'
    verified_by UUID REFERENCES users(id),
    verification_score DECIMAL(5,2), -- AI confidence score
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}',
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Document uploads
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kyc_verification_id UUID REFERENCES kyc_verifications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    encryption_key VARCHAR(255), -- For encrypted storage
    is_encrypted BOOLEAN DEFAULT FALSE,
    ocr_text TEXT, -- Extracted text from OCR
    ai_analysis JSONB DEFAULT '{}', -- AI analysis results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- JEWELRY & COLLATERAL MANAGEMENT
-- =============================================

-- Jewelry categories and types
CREATE TABLE jewelry_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES jewelry_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jewelry items submitted by users
CREATE TABLE jewelry_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES jewelry_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metal_type VARCHAR(50), -- 'gold', 'silver', 'platinum', 'palladium'
    metal_purity VARCHAR(20), -- '24k', '22k', '18k', '925', etc.
    weight_grams DECIMAL(10,3),
    gemstone_type VARCHAR(100),
    gemstone_carat DECIMAL(8,3),
    brand VARCHAR(100),
    purchase_price DECIMAL(15,2),
    purchase_date DATE,
    purchase_receipt_url TEXT,
    certificate_type VARCHAR(50), -- 'GIA', 'SSEF', 'Gübelin', etc.
    certificate_number VARCHAR(100),
    certificate_url TEXT,
    estimated_value DECIMAL(15,2),
    market_value DECIMAL(15,2),
    insurance_value DECIMAL(15,2),
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
    condition_notes TEXT,
    storage_location VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'stored', 'returned')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jewelry images
CREATE TABLE jewelry_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jewelry_item_id UUID NOT NULL REFERENCES jewelry_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('main', 'detail', 'certificate', 'receipt')),
    image_order INTEGER DEFAULT 0,
    ai_analysis JSONB DEFAULT '{}', -- Computer vision analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI valuations
CREATE TABLE ai_valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jewelry_item_id UUID NOT NULL REFERENCES jewelry_items(id) ON DELETE CASCADE,
    valuation_model VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    estimated_value DECIMAL(15,2) NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    value_breakdown JSONB NOT NULL DEFAULT '{}',
    market_factors JSONB DEFAULT '{}',
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expert valuations
CREATE TABLE expert_valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jewelry_item_id UUID NOT NULL REFERENCES jewelry_items(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES users(id),
    estimated_value DECIMAL(15,2) NOT NULL,
    valuation_notes TEXT,
    certification_level VARCHAR(50),
    valuation_report_url TEXT,
    is_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NFT representations of jewelry
CREATE TABLE jewelry_nfts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jewelry_item_id UUID NOT NULL REFERENCES jewelry_items(id) ON DELETE CASCADE,
    blockchain_network VARCHAR(50) NOT NULL, -- 'ethereum', 'polygon', etc.
    contract_address VARCHAR(42) NOT NULL,
    token_id VARCHAR(100) NOT NULL,
    token_uri TEXT,
    metadata_ipfs_hash VARCHAR(100),
    mint_transaction_hash VARCHAR(66),
    mint_block_number BIGINT,
    minted_at TIMESTAMP WITH TIME ZONE,
    is_burned BOOLEAN DEFAULT FALSE,
    burn_transaction_hash VARCHAR(66),
    burned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- LOAN MANAGEMENT TABLES
-- =============================================

-- Loan products and configurations
CREATE TABLE loan_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    min_duration_days INTEGER NOT NULL,
    max_duration_days INTEGER NOT NULL,
    profit_rate DECIMAL(5,4) NOT NULL, -- Islamic profit rate (not interest)
    processing_fee_rate DECIMAL(5,4) DEFAULT 0,
    late_payment_fee DECIMAL(10,2) DEFAULT 0,
    max_ltv_ratio DECIMAL(5,4) NOT NULL, -- Loan-to-Value ratio
    is_active BOOLEAN DEFAULT TRUE,
    shariah_compliant BOOLEAN DEFAULT TRUE,
    terms_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loan applications
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_product_id UUID NOT NULL REFERENCES loan_products(id),
    jewelry_item_id UUID NOT NULL REFERENCES jewelry_items(id),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    requested_amount DECIMAL(15,2) NOT NULL,
    requested_duration_days INTEGER NOT NULL,
    purpose TEXT,
    employment_status VARCHAR(50),
    monthly_income DECIMAL(15,2),
    existing_debts DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'cancelled')),
    risk_score DECIMAL(5,2),
    approval_notes TEXT,
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Active loans
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_application_id UUID NOT NULL REFERENCES loan_applications(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_number VARCHAR(50) UNIQUE NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    profit_rate DECIMAL(5,4) NOT NULL,
    total_profit DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    disbursed_amount DECIMAL(15,2) NOT NULL,
    outstanding_balance DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted', 'extended', 'early_settled')),
    disbursement_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    collateral_release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment schedules
CREATE TABLE payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    profit_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    paid_amount DECIMAL(15,2) DEFAULT 0,
    paid_date DATE,
    late_fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments and transactions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    payment_schedule_id UUID REFERENCES payment_schedules(id),
    user_id UUID NOT NULL REFERENCES users(id),
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    exchange_rate DECIMAL(10,6) DEFAULT 1,
    payment_date DATE NOT NULL,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB DEFAULT '{}',
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loan extensions
CREATE TABLE loan_extensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    extension_days INTEGER NOT NULL,
    extension_fee DECIMAL(10,2) NOT NULL,
    additional_profit DECIMAL(15,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    new_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INVESTMENT PLATFORM TABLES
-- =============================================

-- Investment opportunities
CREATE TABLE investment_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    raised_amount DECIMAL(15,2) DEFAULT 0,
    min_investment DECIMAL(15,2) NOT NULL,
    max_investment DECIMAL(15,2),
    expected_return_rate DECIMAL(5,4) NOT NULL,
    investment_duration_days INTEGER NOT NULL,
    risk_rating VARCHAR(10) CHECK (risk_rating IN ('low', 'medium', 'high')),
    shariah_compliant BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'funded', 'closed', 'cancelled')),
    funding_deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Individual investments
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_opportunity_id UUID NOT NULL REFERENCES investment_opportunities(id),
    investor_id UUID NOT NULL REFERENCES users(id),
    investment_amount DECIMAL(15,2) NOT NULL,
    expected_return DECIMAL(15,2) NOT NULL,
    actual_return DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled')),
    investment_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investment returns and distributions
CREATE TABLE investment_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
    return_type VARCHAR(20) NOT NULL CHECK (return_type IN ('profit', 'principal', 'bonus')),
    amount DECIMAL(15,2) NOT NULL,
    distribution_date DATE NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SHARIAH ADVISORY GROUP (SAG) TABLES
-- =============================================

-- SAG members and scholars
CREATE TABLE sag_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100), -- Dr., Prof., Sheikh, etc.
    specialization TEXT,
    qualifications TEXT,
    experience_years INTEGER,
    bio TEXT,
    is_chief_scholar BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    appointed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shariah rulings and fatwas
CREATE TABLE shariah_rulings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruling_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    ruling TEXT NOT NULL,
    evidence TEXT,
    category VARCHAR(100),
    issued_by UUID NOT NULL REFERENCES sag_members(id),
    reviewed_by UUID[] DEFAULT '{}', -- Array of SAG member IDs
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'published', 'archived')),
    is_public BOOLEAN DEFAULT FALSE,
    effective_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Shariah compliance reviews
CREATE TABLE shariah_compliance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type VARCHAR(50) NOT NULL, -- 'loan_product', 'investment_opportunity', etc.
    product_id UUID NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES sag_members(id),
    compliance_status VARCHAR(20) DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'non_compliant', 'conditional')),
    review_notes TEXT,
    conditions TEXT,
    review_date DATE NOT NULL,
    next_review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AI RISK & COMPLIANCE TABLES
-- =============================================

-- Risk assessment models
CREATE TABLE risk_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(20) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- 'credit_risk', 'fraud_detection', 'aml_screening'
    algorithm VARCHAR(100),
    training_data_size INTEGER,
    accuracy_score DECIMAL(5,4),
    precision_score DECIMAL(5,4),
    recall_score DECIMAL(5,4),
    f1_score DECIMAL(5,4),
    is_active BOOLEAN DEFAULT TRUE,
    deployment_date DATE,
    last_retrained_at TIMESTAMP WITH TIME ZONE,
    model_file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Risk assessments
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_type VARCHAR(50) NOT NULL,
    subject_type VARCHAR(50) NOT NULL, -- 'user', 'loan_application', 'transaction'
    subject_id UUID NOT NULL,
    risk_model_id UUID NOT NULL REFERENCES risk_models(id),
    risk_score DECIMAL(5,2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    risk_factors JSONB NOT NULL DEFAULT '{}',
    recommendations TEXT,
    assessor_type VARCHAR(20) NOT NULL CHECK (assessor_type IN ('ai', 'human', 'hybrid')),
    assessor_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AML screening results
CREATE TABLE aml_screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    screening_type VARCHAR(50) NOT NULL,
    screening_provider VARCHAR(100),
    screening_reference VARCHAR(255),
    risk_level VARCHAR(20) NOT NULL,
    match_found BOOLEAN DEFAULT FALSE,
    matches JSONB DEFAULT '[]',
    screening_date DATE NOT NULL,
    next_screening_date DATE,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'manual_review')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fraud detection alerts
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    subject_type VARCHAR(50) NOT NULL,
    subject_id UUID NOT NULL,
    description TEXT NOT NULL,
    detection_model VARCHAR(100),
    confidence_score DECIMAL(5,2),
    alert_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance monitoring
CREATE TABLE compliance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    compliance_rule VARCHAR(255),
    action_required BOOLEAN DEFAULT FALSE,
    action_taken TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AUDIT & LOGGING TABLES
-- =============================================

-- System audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path TEXT,
    request_body JSONB,
    response_status INTEGER,
    response_body JSONB,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI model audit logs
CREATE TABLE ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES risk_models(id),
    operation_type VARCHAR(50) NOT NULL, -- 'prediction', 'training', 'evaluation'
    input_data JSONB,
    output_data JSONB,
    confidence_score DECIMAL(5,2),
    processing_time_ms INTEGER,
    model_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- NOTIFICATION & COMMUNICATION TABLES
-- =============================================

-- Notification templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
    subject VARCHAR(255),
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SYSTEM CONFIGURATION TABLES
-- =============================================

-- System settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, key)
);

-- Market data and pricing
CREATE TABLE market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metal_type VARCHAR(50) NOT NULL,
    purity VARCHAR(20),
    price_per_gram DECIMAL(10,4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MYR',
    source VARCHAR(100) NOT NULL,
    price_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metal_type, purity, currency, price_date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User-related indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- KYC indexes
CREATE INDEX idx_kyc_verifications_user_id ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_verifications_status ON kyc_verifications(status);
CREATE INDEX idx_documents_user_id ON documents(user_id);

-- Jewelry indexes
CREATE INDEX idx_jewelry_items_user_id ON jewelry_items(user_id);
CREATE INDEX idx_jewelry_items_status ON jewelry_items(status);
CREATE INDEX idx_jewelry_images_item_id ON jewelry_images(jewelry_item_id);

-- Loan indexes
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_due_date ON loans(due_date);
CREATE INDEX idx_payment_schedules_loan_id ON payment_schedules(loan_id);
CREATE INDEX idx_payment_schedules_due_date ON payment_schedules(due_date);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);

-- Investment indexes
CREATE INDEX idx_investments_investor_id ON investments(investor_id);
CREATE INDEX idx_investments_opportunity_id ON investments(investment_opportunity_id);

-- Risk and compliance indexes
CREATE INDEX idx_risk_assessments_subject ON risk_assessments(subject_type, subject_id);
CREATE INDEX idx_aml_screenings_user_id ON aml_screenings(user_id);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_compliance_events_status ON compliance_events(status);

-- Audit indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jewelry_items_updated_at BEFORE UPDATE ON jewelry_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investment_opportunities_updated_at BEFORE UPDATE ON investment_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shariah_rulings_updated_at BEFORE UPDATE ON shariah_rulings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('super_admin', 'Super Administrator with full system access', '{"all": true}'),
('ceo', 'Chief Executive Officer', '{"dashboard": true, "reports": true, "users": true, "loans": true, "investments": true}'),
('admin', 'System Administrator', '{"users": true, "loans": true, "kyc": true, "compliance": true}'),
('risk_manager', 'Risk Management Officer', '{"risk_assessment": true, "compliance": true, "reports": true}'),
('compliance_officer', 'Compliance Officer', '{"compliance": true, "aml": true, "reports": true}'),
('sag_member', 'Shariah Advisory Group Member', '{"shariah_review": true, "rulings": true}'),
('investor', 'Platform Investor', '{"investments": true, "portfolio": true}'),
('customer', 'End Customer', '{"loans": true, "payments": true, "profile": true}');

-- Insert jewelry categories
INSERT INTO jewelry_categories (name, description) VALUES
('Rings', 'All types of rings including engagement, wedding, and fashion rings'),
('Necklaces', 'Necklaces, chains, and pendants'),
('Bracelets', 'Bracelets and bangles'),
('Earrings', 'All types of earrings'),
('Watches', 'Luxury and precious metal watches'),
('Precious Stones', 'Loose gemstones and diamonds'),
('Gold Bars', 'Investment grade gold bars and coins'),
('Silver Items', 'Silver jewelry and collectibles');

-- Insert loan products
INSERT INTO loan_products (name, description, min_amount, max_amount, min_duration_days, max_duration_days, profit_rate, max_ltv_ratio) VALUES
('Gold Jewelry Loan', 'Shariah-compliant loan against gold jewelry', 500.00, 50000.00, 30, 365, 0.0833, 0.70),
('Diamond Jewelry Loan', 'Premium loan product for diamond jewelry', 1000.00, 100000.00, 30, 365, 0.0917, 0.60),
('Precious Metal Loan', 'Loan against precious metal items', 200.00, 25000.00, 30, 180, 0.0750, 0.75),
('Luxury Watch Loan', 'Specialized loan for luxury timepieces', 2000.00, 200000.00, 30, 365, 0.1000, 0.65);

-- Insert system settings
INSERT INTO system_settings (category, key, value, description) VALUES
('general', 'platform_name', 'Suyula Liquid', 'Platform display name'),
('general', 'default_currency', 'MYR', 'Default platform currency'),
('general', 'default_language', 'en', 'Default platform language'),
('kyc', 'max_document_size_mb', '10', 'Maximum document upload size in MB'),
('kyc', 'document_retention_days', '2555', 'Document retention period in days (7 years)'),
('loans', 'max_loan_amount', '500000', 'Maximum loan amount allowed'),
('loans', 'default_profit_rate', '0.0833', 'Default profit rate (10% annually)'),
('risk', 'min_credit_score', '600', 'Minimum credit score for loan approval'),
('compliance', 'aml_screening_frequency_days', '90', 'AML screening frequency in days'),
('notifications', 'payment_reminder_days', '7', 'Days before due date to send payment reminder');

-- Insert notification templates
INSERT INTO notification_templates (name, type, subject, body_template) VALUES
('welcome_email', 'email', 'Welcome to Suyula Liquid', 'Welcome {{first_name}}! Your account has been created successfully.'),
('kyc_approved', 'email', 'KYC Verification Approved', 'Congratulations {{first_name}}! Your KYC verification has been approved.'),
('loan_approved', 'email', 'Loan Application Approved', 'Great news {{first_name}}! Your loan application for {{loan_amount}} has been approved.'),
('payment_reminder', 'email', 'Payment Reminder', 'Dear {{first_name}}, your payment of {{payment_amount}} is due on {{due_date}}.'),
('payment_overdue', 'email', 'Payment Overdue Notice', 'Dear {{first_name}}, your payment of {{payment_amount}} was due on {{due_date}} and is now overdue.');

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- User summary view
CREATE VIEW user_summary AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_active,
    u.created_at,
    COUNT(DISTINCT la.id) as total_applications,
    COUNT(DISTINCT l.id) as active_loans,
    COALESCE(SUM(l.outstanding_balance), 0) as total_outstanding,
    MAX(kyc.status) as kyc_status
FROM users u
LEFT JOIN loan_applications la ON u.id = la.user_id
LEFT JOIN loans l ON u.id = l.user_id AND l.status = 'active'
LEFT JOIN kyc_verifications kyc ON u.id = kyc.user_id AND kyc.verification_type = 'identity'
GROUP BY u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at;

-- Loan portfolio view
CREATE VIEW loan_portfolio AS
SELECT 
    l.id,
    l.loan_number,
    u.first_name || ' ' || u.last_name as borrower_name,
    l.principal_amount,
    l.outstanding_balance,
    l.due_date,
    l.status,
    ji.name as collateral_item,
    ji.estimated_value as collateral_value,
    CASE 
        WHEN l.due_date < CURRENT_DATE AND l.status = 'active' THEN 'overdue'
        WHEN l.due_date <= CURRENT_DATE + INTERVAL '7 days' AND l.status = 'active' THEN 'due_soon'
        ELSE 'current'
    END as payment_status
FROM loans l
JOIN users u ON l.user_id = u.id
JOIN loan_applications la ON l.loan_application_id = la.id
JOIN jewelry_items ji ON la.jewelry_item_id = ji.id;

-- Investment performance view
CREATE VIEW investment_performance AS
SELECT 
    i.id,
    u.first_name || ' ' || u.last_name as investor_name,
    io.title as opportunity_title,
    i.investment_amount,
    i.expected_return,
    i.actual_return,
    i.status,
    i.investment_date,
    i.maturity_date,
    CASE 
        WHEN i.status = 'completed' THEN (i.actual_return / i.investment_amount - 1) * 100
        ELSE (i.expected_return / i.investment_amount - 1) * 100
    END as return_percentage
FROM investments i
JOIN users u ON i.investor_id = u.id
JOIN investment_opportunities io ON i.investment_opportunity_id = io.id;

-- Risk dashboard view
CREATE VIEW risk_dashboard AS
SELECT 
    'users' as category,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE ra.risk_level IN ('high', 'very_high')) as high_risk_count,
    AVG(ra.risk_score) as avg_risk_score
FROM users u
LEFT JOIN risk_assessments ra ON u.id = ra.subject_id AND ra.subject_type = 'user'
UNION ALL
SELECT 
    'loans' as category,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE ra.risk_level IN ('high', 'very_high')) as high_risk_count,
    AVG(ra.risk_score) as avg_risk_score
FROM loans l
LEFT JOIN risk_assessments ra ON l.id = ra.subject_id AND ra.subject_type = 'loan';

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Calculate loan payment schedule
CREATE OR REPLACE FUNCTION calculate_payment_schedule(
    p_loan_id UUID,
    p_principal DECIMAL(15,2),
    p_profit_rate DECIMAL(5,4),
    p_duration_days INTEGER
) RETURNS VOID AS $$
DECLARE
    total_profit DECIMAL(15,2);
    total_amount DECIMAL(15,2);
    monthly_payment DECIMAL(15,2);
    num_payments INTEGER;
    payment_date DATE;
    i INTEGER;
BEGIN
    -- Calculate total profit and amount
    total_profit := p_principal * p_profit_rate * (p_duration_days / 365.0);
    total_amount := p_principal + total_profit;
    
    -- Determine number of monthly payments
    num_payments := CEIL(p_duration_days / 30.0);
    monthly_payment := total_amount / num_payments;
    
    -- Generate payment schedule
    payment_date := CURRENT_DATE + INTERVAL '30 days';
    
    FOR i IN 1..num_payments LOOP
        INSERT INTO payment_schedules (
            loan_id,
            installment_number,
            due_date,
            principal_amount,
            profit_amount,
            total_amount
        ) VALUES (
            p_loan_id,
            i,
            payment_date,
            p_principal / num_payments,
            total_profit / num_payments,
            monthly_payment
        );
        
        payment_date := payment_date + INTERVAL '30 days';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update loan outstanding balance
CREATE OR REPLACE FUNCTION update_loan_balance(
    p_loan_id UUID,
    p_payment_amount DECIMAL(15,2)
) RETURNS VOID AS $$
BEGIN
    UPDATE loans 
    SET outstanding_balance = outstanding_balance - p_payment_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_loan_id;
    
    -- Check if loan is fully paid
    UPDATE loans 
    SET status = 'completed',
        completion_date = CURRENT_DATE
    WHERE id = p_loan_id 
    AND outstanding_balance <= 0;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SECURITY POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE jewelry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_own_data ON users FOR ALL USING (id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_own_kyc ON kyc_verifications FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_own_documents ON documents FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_own_jewelry ON jewelry_items FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_own_applications ON loan_applications FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_own_loans ON loans FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_own_payments ON payments FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);
CREATE POLICY user_own_investments ON investments FOR ALL USING (investor_id = current_setting('app.current_user_id')::UUID);

-- Admin users can see all data
CREATE POLICY admin_all_access ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.id 
        WHERE ur.user_id = current_setting('app.current_user_id')::UUID 
        AND r.name IN ('super_admin', 'admin', 'ceo')
    )
);

-- =============================================
-- PERFORMANCE OPTIMIZATION
-- =============================================

-- Partitioning for large tables (audit logs)
CREATE TABLE audit_logs_y2024 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE audit_logs_y2025 PARTITION OF audit_logs
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Materialized views for analytics
CREATE MATERIALIZED VIEW daily_loan_stats AS
SELECT 
    DATE(created_at) as loan_date,
    COUNT(*) as total_loans,
    SUM(principal_amount) as total_amount,
    AVG(principal_amount) as avg_amount,
    COUNT(*) FILTER (WHERE status = 'active') as active_loans,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_loans,
    COUNT(*) FILTER (WHERE status = 'defaulted') as defaulted_loans
FROM loans
GROUP BY DATE(created_at)
ORDER BY loan_date;

-- Refresh materialized views daily
CREATE OR REPLACE FUNCTION refresh_daily_stats() RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW daily_loan_stats;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- BACKUP AND MAINTENANCE
-- =============================================

-- Create backup schema for data archival
CREATE SCHEMA IF NOT EXISTS archive;

-- Archive old audit logs (older than 2 years)
CREATE OR REPLACE FUNCTION archive_old_audit_logs() RETURNS VOID AS $$
BEGIN
    -- Move old records to archive
    INSERT INTO archive.audit_logs 
    SELECT * FROM audit_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
    
    -- Delete archived records from main table
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_DATE - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance tasks
-- Note: These would typically be scheduled using pg_cron or external scheduler
-- SELECT cron.schedule('refresh-stats', '0 1 * * *', 'SELECT refresh_daily_stats();');
-- SELECT cron.schedule('archive-logs', '0 2 1 * *', 'SELECT archive_old_audit_logs();');

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE users IS 'Core user information and authentication data';
COMMENT ON TABLE kyc_verifications IS 'KYC verification records and status tracking';
COMMENT ON TABLE jewelry_items IS 'Physical jewelry items used as loan collateral';
COMMENT ON TABLE loans IS 'Active loan records with repayment tracking';
COMMENT ON TABLE investments IS 'Investment records for the crowdfunding platform';
COMMENT ON TABLE risk_assessments IS 'AI-powered risk assessment results';
COMMENT ON TABLE audit_logs IS 'Comprehensive system activity audit trail';

COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password - never store plain text';
COMMENT ON COLUMN loans.profit_rate IS 'Islamic profit rate (not interest) - Shariah compliant';
COMMENT ON COLUMN jewelry_items.estimated_value IS 'AI-estimated market value in platform currency';
COMMENT ON COLUMN risk_assessments.risk_score IS 'Normalized risk score from 0-100';

-- End of schema
