-- Script para arreglar la tabla customers y añadir la columna sector

-- Primero, verificar si la tabla existe y qué columnas tiene
DO $$
BEGIN
    -- Verificar si la tabla customers existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
        RAISE NOTICE 'La tabla customers ya existe. Verificando estructura...';
        
        -- Verificar si la columna sector existe
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'sector') THEN
            RAISE NOTICE 'Añadiendo columna sector...';
            ALTER TABLE customers ADD COLUMN sector VARCHAR(100);
        ELSE
            RAISE NOTICE 'La columna sector ya existe.';
        END IF;
        
        -- Verificar otras columnas que podrían faltar
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'contact_person') THEN
            RAISE NOTICE 'Añadiendo columna contact_person...';
            ALTER TABLE customers ADD COLUMN contact_person VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'website') THEN
            RAISE NOTICE 'Añadiendo columna website...';
            ALTER TABLE customers ADD COLUMN website VARCHAR(255);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'notes') THEN
            RAISE NOTICE 'Añadiendo columna notes...';
            ALTER TABLE customers ADD COLUMN notes TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'address') THEN
            RAISE NOTICE 'Añadiendo columna address...';
            ALTER TABLE customers ADD COLUMN address TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'city') THEN
            RAISE NOTICE 'Añadiendo columna city...';
            ALTER TABLE customers ADD COLUMN city VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'postal_code') THEN
            RAISE NOTICE 'Añadiendo columna postal_code...';
            ALTER TABLE customers ADD COLUMN postal_code VARCHAR(10);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'province') THEN
            RAISE NOTICE 'Añadiendo columna province...';
            ALTER TABLE customers ADD COLUMN province VARCHAR(100);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'country') THEN
            RAISE NOTICE 'Añadiendo columna country...';
            ALTER TABLE customers ADD COLUMN country VARCHAR(100) DEFAULT 'España';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'phone') THEN
            RAISE NOTICE 'Añadiendo columna phone...';
            ALTER TABLE customers ADD COLUMN phone VARCHAR(20);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'is_active') THEN
            RAISE NOTICE 'Añadiendo columna is_active...';
            ALTER TABLE customers ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'created_at') THEN
            RAISE NOTICE 'Añadiendo columna created_at...';
            ALTER TABLE customers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
            RAISE NOTICE 'Añadiendo columna updated_at...';
            ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
    ELSE
        RAISE NOTICE 'La tabla customers no existe. Se creará desde cero.';
    END IF;
END $$;

-- Ahora crear la tabla completa si no existe
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  tax_id VARCHAR(20) UNIQUE NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'España',
  sector VARCHAR(100),
  contact_person VARCHAR(255),
  website VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hacer que la columna sector sea NOT NULL si no lo es ya
DO $$
BEGIN
    -- Primero actualizar registros existentes que puedan tener sector NULL
    UPDATE customers SET sector = 'sin clasificar' WHERE sector IS NULL;
    
    -- Luego hacer la columna NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'sector' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE customers ALTER COLUMN sector SET NOT NULL;
        RAISE NOTICE 'Columna sector configurada como NOT NULL';
    END IF;
END $$;

-- Crear índices si no existen
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

-- Mostrar la estructura final de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Mostrar estadísticas de la tabla
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT sector) as sectores_diferentes,
    COUNT(CASE WHEN sector IS NULL THEN 1 END) as registros_sin_sector
FROM customers;
