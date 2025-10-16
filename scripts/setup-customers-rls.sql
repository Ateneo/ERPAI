-- Configurar Row Level Security (RLS) para la tabla customers
-- Este script habilita RLS y crea políticas para permitir acceso a usuarios autenticados

-- Habilitar RLS en la tabla customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON customers;
DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON customers;
DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON customers;
DROP POLICY IF EXISTS "Permitir eliminación a usuarios autenticados" ON customers;

-- Política para permitir lectura (SELECT) a usuarios autenticados
CREATE POLICY "Permitir lectura a usuarios autenticados"
ON customers
FOR SELECT
TO authenticated
USING (true);

-- Política para permitir inserción (INSERT) a usuarios autenticados
CREATE POLICY "Permitir inserción a usuarios autenticados"
ON customers
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir actualización (UPDATE) a usuarios autenticados
CREATE POLICY "Permitir actualización a usuarios autenticados"
ON customers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para permitir eliminación (DELETE) a usuarios autenticados
CREATE POLICY "Permitir eliminación a usuarios autenticados"
ON customers
FOR DELETE
TO authenticated
USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'customers'
ORDER BY policyname;

-- Confirmar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'customers';
