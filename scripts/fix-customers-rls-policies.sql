-- Corregir políticas RLS para permitir acceso a la tabla customers
-- Este script permite acceso tanto a usuarios autenticados como anónimos

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura a usuarios autenticados" ON customers;
DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON customers;
DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON customers;
DROP POLICY IF EXISTS "Permitir eliminación a usuarios autenticados" ON customers;

-- Crear nuevas políticas que permitan acceso a usuarios autenticados Y anónimos
-- Esto es necesario porque el cliente usa la clave anónima (NEXT_PUBLIC_SUPABASE_ANON_KEY)

-- Política para permitir lectura (SELECT)
CREATE POLICY "Permitir lectura a todos"
ON customers
FOR SELECT
TO authenticated, anon
USING (true);

-- Política para permitir inserción (INSERT)
CREATE POLICY "Permitir inserción a todos"
ON customers
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Política para permitir actualización (UPDATE)
CREATE POLICY "Permitir actualización a todos"
ON customers
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Política para permitir eliminación (DELETE)
CREATE POLICY "Permitir eliminación a todos"
ON customers
FOR DELETE
TO authenticated, anon
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
