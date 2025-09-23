-- Script para verificar el estado de la tabla customers

-- Verificar si la tabla existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') 
        THEN '✅ La tabla customers existe'
        ELSE '❌ La tabla customers NO existe'
    END as estado_tabla;

-- Mostrar estructura completa de la tabla
SELECT 
    column_name as "Columna",
    data_type as "Tipo",
    character_maximum_length as "Longitud",
    is_nullable as "Permite NULL",
    column_default as "Valor por defecto"
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Verificar índices
SELECT 
    indexname as "Índice",
    indexdef as "Definición"
FROM pg_indexes 
WHERE tablename = 'customers';

-- Verificar triggers
SELECT 
    trigger_name as "Trigger",
    event_manipulation as "Evento",
    action_statement as "Acción"
FROM information_schema.triggers 
WHERE event_object_table = 'customers';

-- Contar registros existentes
SELECT 
    COUNT(*) as "Total registros",
    COUNT(DISTINCT sector) as "Sectores únicos",
    COUNT(CASE WHEN sector IS NOT NULL THEN 1 END) as "Con sector definido"
FROM customers;

-- Mostrar sectores existentes si hay datos
SELECT 
    sector,
    COUNT(*) as cantidad
FROM customers 
GROUP BY sector 
ORDER BY cantidad DESC;
