-- Script alternativo: Eliminar y recrear la tabla customers desde cero
-- ⚠️ CUIDADO: Este script eliminará todos los datos existentes

-- Eliminar la tabla si existe
DROP TABLE IF EXISTS customers CASCADE;

-- Eliminar la función si existe
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Crear la tabla desde cero con la estructura completa
CREATE TABLE customers (
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
CREATE INDEX idx_customers_sector ON customers(sector);
CREATE INDEX idx_customers_tax_id ON customers(tax_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_customers_active ON customers(is_active);

-- Función para actualizar updated_at automáticamente
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Confirmar que la tabla se creó correctamente
SELECT 
    'Tabla customers creada exitosamente' as mensaje,
    COUNT(*) as columnas_totales
FROM information_schema.columns 
WHERE table_name = 'customers';

-- Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;
