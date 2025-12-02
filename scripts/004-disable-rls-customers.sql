-- Deshabilitar RLS en la tabla customers para permitir acceso sin autenticación
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'customers';
