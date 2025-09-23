-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  tax_id VARCHAR(20) UNIQUE NOT NULL, -- NIF/CIF español
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'España',
  sector VARCHAR(100) NOT NULL,
  contact_person VARCHAR(255),
  website VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_customers_sector ON customers(sector);
CREATE INDEX IF NOT EXISTS idx_customers_tax_id ON customers(tax_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
