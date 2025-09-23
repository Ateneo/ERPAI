-- Añadir columnas de Verifactu a la tabla customers si no existen

-- Verificar si las columnas ya existen antes de añadirlas
DO $$ 
BEGIN
    -- Añadir verifactu_id si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'verifactu_id') THEN
        ALTER TABLE customers ADD COLUMN verifactu_id TEXT;
        RAISE NOTICE 'Columna verifactu_id añadida';
    ELSE
        RAISE NOTICE 'Columna verifactu_id ya existe';
    END IF;

    -- Añadir verifactu_status si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'verifactu_status') THEN
        ALTER TABLE customers ADD COLUMN verifactu_status TEXT DEFAULT 'pending';
        RAISE NOTICE 'Columna verifactu_status añadida';
    ELSE
        RAISE NOTICE 'Columna verifactu_status ya existe';
    END IF;

    -- Añadir verifactu_message si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'verifactu_message') THEN
        ALTER TABLE customers ADD COLUMN verifactu_message TEXT;
        RAISE NOTICE 'Columna verifactu_message añadida';
    ELSE
        RAISE NOTICE 'Columna verifactu_message ya existe';
    END IF;

    -- Añadir verifactu_synced_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'verifactu_synced_at') THEN
        ALTER TABLE customers ADD COLUMN verifactu_synced_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Columna verifactu_synced_at añadida';
    ELSE
        RAISE NOTICE 'Columna verifactu_synced_at ya existe';
    END IF;
END $$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_customers_verifactu_id ON customers(verifactu_id);
CREATE INDEX IF NOT EXISTS idx_customers_verifactu_status ON customers(verifactu_status);
CREATE INDEX IF NOT EXISTS idx_customers_verifactu_synced_at ON customers(verifactu_synced_at);

-- Actualizar clientes existentes que no tengan estado de Verifactu
UPDATE customers 
SET verifactu_status = 'pending' 
WHERE verifactu_status IS NULL;

-- Verificar el resultado
SELECT 
    COUNT(*) as total_customers,
    COUNT(verifactu_id) as with_verifactu_id,
    verifactu_status,
    COUNT(*) as count_by_status
FROM customers 
GROUP BY verifactu_status
ORDER BY verifactu_status;

RAISE NOTICE 'Script de columnas Verifactu completado exitosamente';
