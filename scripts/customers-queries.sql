-- Consultas útiles para trabajar con clientes

-- Ver todos los clientes por sector
SELECT 
    sector,
    COUNT(*) as total_clientes
FROM customers 
WHERE is_active = true
GROUP BY sector 
ORDER BY total_clientes DESC;

-- Clientes del sector formación
SELECT 
    name,
    contact_person,
    email,
    phone,
    city,
    notes
FROM customers 
WHERE sector = 'sector formación' 
AND is_active = true
ORDER BY name;

-- Clientes del sector auditoría
SELECT 
    name,
    contact_person,
    email,
    phone,
    city,
    notes
FROM customers 
WHERE sector = 'sector auditoria' 
AND is_active = true
ORDER BY name;

-- Buscar clientes por ciudad
SELECT 
    name,
    sector,
    contact_person,
    email,
    address
FROM customers 
WHERE city = 'Madrid' 
AND is_active = true
ORDER BY sector, name;

-- Clientes con website
SELECT 
    name,
    sector,
    website,
    email
FROM customers 
WHERE website IS NOT NULL 
AND is_active = true
ORDER BY sector, name;

-- Estadísticas por provincia
SELECT 
    province,
    COUNT(*) as total_clientes,
    COUNT(DISTINCT sector) as sectores_diferentes
FROM customers 
WHERE is_active = true
GROUP BY province 
ORDER BY total_clientes DESC;
