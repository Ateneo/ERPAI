-- Actualizar tabla de customers para incluir campos de Verifactu
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS verifactu_id TEXT,
ADD COLUMN IF NOT EXISTS verifactu_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verifactu_message TEXT,
ADD COLUMN IF NOT EXISTS verifactu_synced_at TIMESTAMP WITH TIME ZONE;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_customers_verifactu_status ON customers(verifactu_status);
CREATE INDEX IF NOT EXISTS idx_customers_verifactu_id ON customers(verifactu_id);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_sector ON customers(sector);
CREATE INDEX IF NOT EXISTS idx_customers_province ON customers(province);

-- Actualizar clientes existentes sin estado de Verifactu
UPDATE customers 
SET verifactu_status = 'pending' 
WHERE verifactu_status IS NULL;

-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;
