-- Tabla de servicios
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_services_code ON services(code);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_customer ON services(customer_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

-- Deshabilitar RLS para acceso sin autenticación
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_services_updated_at ON services;
CREATE TRIGGER trigger_update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();

-- Secuencia para generar códigos automáticos
CREATE SEQUENCE IF NOT EXISTS service_code_seq START WITH 1;

-- Función para generar código de servicio
CREATE OR REPLACE FUNCTION generate_service_code()
RETURNS VARCHAR AS $$
DECLARE
  new_code VARCHAR;
  next_val INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 2) AS INTEGER)), 0) + 1 INTO next_val FROM services WHERE code ~ '^S[0-9]+$';
  new_code := 'S' || LPAD(next_val::TEXT, 4, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;
