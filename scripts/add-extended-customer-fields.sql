-- Add extended fields to customers table
-- This script adds 27 new fields to support comprehensive customer management

-- Add commercial information fields
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS commercial_name TEXT,
ADD COLUMN IF NOT EXISTS legal_form TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS registration_date DATE,
ADD COLUMN IF NOT EXISTS share_capital DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS administrator TEXT,
ADD COLUMN IF NOT EXISTS administrator_nif TEXT;

-- Add business activity fields
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS business_activity TEXT,
ADD COLUMN IF NOT EXISTS cnae_code TEXT,
ADD COLUMN IF NOT EXISTS employees_count INTEGER,
ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2);

-- Add financial fields
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS preferred_payment_method TEXT,
ADD COLUMN IF NOT EXISTS bank_account TEXT,
ADD COLUMN IF NOT EXISTS swift_code TEXT;

-- Add tax and legal fields
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS tax_regime TEXT,
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS social_security_number TEXT,
ADD COLUMN IF NOT EXISTS mutual_insurance TEXT;

-- Add risk assessment
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium';

-- Add customer timeline fields
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS customer_since DATE,
ADD COLUMN IF NOT EXISTS last_order_date DATE,
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_order_value DECIMAL(15,2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_commercial_name ON customers(commercial_name);
CREATE INDEX IF NOT EXISTS idx_customers_legal_form ON customers(legal_form);
CREATE INDEX IF NOT EXISTS idx_customers_cnae_code ON customers(cnae_code);
CREATE INDEX IF NOT EXISTS idx_customers_risk_level ON customers(risk_level);
CREATE INDEX IF NOT EXISTS idx_customers_customer_since ON customers(customer_since);
CREATE INDEX IF NOT EXISTS idx_customers_last_order_date ON customers(last_order_date);

-- Add comments for documentation
COMMENT ON COLUMN customers.commercial_name IS 'Nombre comercial si es diferente de la razón social';
COMMENT ON COLUMN customers.legal_form IS 'Forma jurídica de la empresa (SL, SA, Autónomo, etc.)';
COMMENT ON COLUMN customers.registration_number IS 'Número de registro mercantil';
COMMENT ON COLUMN customers.registration_date IS 'Fecha de constitución de la empresa';
COMMENT ON COLUMN customers.share_capital IS 'Capital social en euros';
COMMENT ON COLUMN customers.administrator IS 'Nombre del administrador principal';
COMMENT ON COLUMN customers.administrator_nif IS 'NIF del administrador';
COMMENT ON COLUMN customers.business_activity IS 'Descripción de la actividad empresarial';
COMMENT ON COLUMN customers.cnae_code IS 'Código CNAE de actividad económica';
COMMENT ON COLUMN customers.employees_count IS 'Número de empleados';
COMMENT ON COLUMN customers.annual_revenue IS 'Facturación anual en euros';
COMMENT ON COLUMN customers.credit_limit IS 'Límite de crédito concedido en euros';
COMMENT ON COLUMN customers.payment_terms IS 'Plazo de pago en días';
COMMENT ON COLUMN customers.preferred_payment_method IS 'Método de pago preferido';
COMMENT ON COLUMN customers.bank_account IS 'Cuenta bancaria (IBAN)';
COMMENT ON COLUMN customers.swift_code IS 'Código SWIFT del banco';
COMMENT ON COLUMN customers.tax_regime IS 'Régimen fiscal aplicable';
COMMENT ON COLUMN customers.vat_number IS 'Número de IVA intracomunitario';
COMMENT ON COLUMN customers.social_security_number IS 'Número de la Seguridad Social';
COMMENT ON COLUMN customers.mutual_insurance IS 'Mutua de accidentes de trabajo';
COMMENT ON COLUMN customers.risk_level IS 'Nivel de riesgo crediticio (low, medium, high)';
COMMENT ON COLUMN customers.customer_since IS 'Fecha desde la que es cliente';
COMMENT ON COLUMN customers.last_order_date IS 'Fecha del último pedido';
COMMENT ON COLUMN customers.total_orders IS 'Número total de pedidos realizados';
COMMENT ON COLUMN customers.average_order_value IS 'Valor medio de los pedidos en euros';

-- Update existing customers with default values where appropriate
UPDATE customers 
SET 
  payment_terms = 30 
WHERE payment_terms IS NULL;

UPDATE customers 
SET 
  risk_level = 'medium' 
WHERE risk_level IS NULL;

UPDATE customers 
SET 
  total_orders = 0 
WHERE total_orders IS NULL;

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_customers_updated_at ON customers;
CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Create a function to normalize customer data
CREATE OR REPLACE FUNCTION normalize_customer_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize tax_id to uppercase
  IF NEW.tax_id IS NOT NULL THEN
    NEW.tax_id = UPPER(TRIM(NEW.tax_id));
  END IF;
  
  -- Normalize email to lowercase
  IF NEW.email IS NOT NULL THEN
    NEW.email = LOWER(TRIM(NEW.email));
  END IF;
  
  -- Normalize phone number (remove spaces and special characters)
  IF NEW.phone IS NOT NULL THEN
    NEW.phone = REGEXP_REPLACE(TRIM(NEW.phone), '[^0-9+]', '', 'g');
  END IF;
  
  -- Normalize postal code
  IF NEW.postal_code IS NOT NULL THEN
    NEW.postal_code = REGEXP_REPLACE(TRIM(NEW.postal_code), '[^0-9]', '', 'g');
  END IF;
  
  -- Set customer_since to current date if not provided and it's a new record
  IF TG_OP = 'INSERT' AND NEW.customer_since IS NULL THEN
    NEW.customer_since = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_normalize_customer_data ON customers;
CREATE TRIGGER trigger_normalize_customer_data
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION normalize_customer_data();

-- Add a check constraint for Spanish postal codes
ALTER TABLE customers 
ADD CONSTRAINT check_spanish_postal_code 
CHECK (postal_code IS NULL OR (postal_code ~ '^[0-9]{5}$' AND postal_code::INTEGER BETWEEN 1000 AND 52999));

-- Add a check constraint for valid payment terms
ALTER TABLE customers 
ADD CONSTRAINT check_payment_terms 
CHECK (payment_terms IS NULL OR payment_terms BETWEEN 0 AND 365);

-- Add a check constraint for positive financial values
ALTER TABLE customers 
ADD CONSTRAINT check_positive_credit_limit 
CHECK (credit_limit IS NULL OR credit_limit >= 0);

ALTER TABLE customers 
ADD CONSTRAINT check_positive_share_capital 
CHECK (share_capital IS NULL OR share_capital >= 0);

ALTER TABLE customers 
ADD CONSTRAINT check_positive_annual_revenue 
CHECK (annual_revenue IS NULL OR annual_revenue >= 0);

ALTER TABLE customers 
ADD CONSTRAINT check_positive_average_order_value 
CHECK (average_order_value IS NULL OR average_order_value >= 0);

-- Add a check constraint for employee count
ALTER TABLE customers 
ADD CONSTRAINT check_employees_count 
CHECK (employees_count IS NULL OR employees_count >= 0);

-- Add a check constraint for total orders
ALTER TABLE customers 
ADD CONSTRAINT check_total_orders 
CHECK (total_orders IS NULL OR total_orders >= 0);

COMMIT;
