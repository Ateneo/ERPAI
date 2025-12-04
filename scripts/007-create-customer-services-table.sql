-- Tabla para vincular servicios contratados a clientes (Preventa de servicios)
CREATE TABLE IF NOT EXISTS customer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Información de la preventa
  numero_presupuesto VARCHAR(50),
  fecha_venta DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_facturar DATE,
  tipo_vencimiento VARCHAR(50) DEFAULT 'En la fecha',
  fecha_vencimiento DATE,
  
  -- Personal asignado
  comercial VARCHAR(255),
  colaborador VARCHAR(255),
  telemarketing VARCHAR(255),
  
  -- Tipo de contrato
  tipo_contrato VARCHAR(50) DEFAULT 'cliente', -- 'cliente' o 'colaborador'
  tiempo_contrato VARCHAR(50) DEFAULT 'ano', -- 'ano' o 'ano_mantenimiento'
  
  -- Totales
  importe_total DECIMAL(10,2) DEFAULT 0,
  
  -- Observaciones
  observaciones_factura TEXT,
  
  -- Estado
  estado VARCHAR(50) DEFAULT 'borrador', -- 'borrador', 'pendiente', 'aprobada', 'facturada', 'cancelada'
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de líneas de servicio (servicios contratados en la preventa)
CREATE TABLE IF NOT EXISTS customer_service_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_service_id UUID NOT NULL REFERENCES customer_services(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  
  -- Datos del servicio (se copian para histórico)
  service_code VARCHAR(50),
  service_name VARCHAR(500) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  unidades INTEGER NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Orden de presentación
  orden INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de complementos
CREATE TABLE IF NOT EXISTS customer_service_complements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_service_id UUID NOT NULL REFERENCES customer_services(id) ON DELETE CASCADE,
  
  complemento VARCHAR(500),
  precio DECIMAL(10,2) DEFAULT 0,
  observaciones TEXT,
  
  -- Orden de presentación
  orden INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_customer_services_customer ON customer_services(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_services_estado ON customer_services(estado);
CREATE INDEX IF NOT EXISTS idx_customer_services_fecha ON customer_services(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_customer_service_lines_service ON customer_service_lines(customer_service_id);
CREATE INDEX IF NOT EXISTS idx_customer_service_complements_service ON customer_service_complements(customer_service_id);

-- Deshabilitar RLS para acceso público
ALTER TABLE customer_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_service_lines DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_service_complements DISABLE ROW LEVEL SECURITY;

-- Función para actualizar el importe total
CREATE OR REPLACE FUNCTION update_customer_service_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_services
  SET importe_total = (
    SELECT COALESCE(SUM(total), 0)
    FROM customer_service_lines
    WHERE customer_service_id = COALESCE(NEW.customer_service_id, OLD.customer_service_id)
  ) + (
    SELECT COALESCE(SUM(precio), 0)
    FROM customer_service_complements
    WHERE customer_service_id = COALESCE(NEW.customer_service_id, OLD.customer_service_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.customer_service_id, OLD.customer_service_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar totales
DROP TRIGGER IF EXISTS trigger_update_service_total_lines ON customer_service_lines;
CREATE TRIGGER trigger_update_service_total_lines
AFTER INSERT OR UPDATE OR DELETE ON customer_service_lines
FOR EACH ROW EXECUTE FUNCTION update_customer_service_total();

DROP TRIGGER IF EXISTS trigger_update_service_total_complements ON customer_service_complements;
CREATE TRIGGER trigger_update_service_total_complements
AFTER INSERT OR UPDATE OR DELETE ON customer_service_complements
FOR EACH ROW EXECUTE FUNCTION update_customer_service_total();

-- Función para generar número de presupuesto
CREATE OR REPLACE FUNCTION generate_presupuesto_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  year_prefix VARCHAR(4);
BEGIN
  IF NEW.numero_presupuesto IS NULL OR NEW.numero_presupuesto = '' THEN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_presupuesto FROM 6) AS INTEGER)), 0) + 1
    INTO next_num
    FROM customer_services
    WHERE numero_presupuesto LIKE 'P' || year_prefix || '%';
    NEW.numero_presupuesto := 'P' || year_prefix || '-' || LPAD(next_num::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_presupuesto ON customer_services;
CREATE TRIGGER trigger_generate_presupuesto
BEFORE INSERT ON customer_services
FOR EACH ROW EXECUTE FUNCTION generate_presupuesto_number();
