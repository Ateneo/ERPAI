-- Create preventas table
CREATE TABLE IF NOT EXISTS preventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_presupuesto VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  cliente_nombre VARCHAR(255) NOT NULL,
  colaborador VARCHAR(255),
  telemarketing VARCHAR(255),
  fecha_venta DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_facturar DATE,
  tipo_vencimiento VARCHAR(50) DEFAULT 'En la fecha',
  fecha_vencimiento DATE,
  comercial VARCHAR(255) NOT NULL,
  tipo_contrato VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (tipo_contrato IN ('cliente', 'colaborador')),
  tiempo_contrato VARCHAR(20) NOT NULL DEFAULT 'año' CHECK (tiempo_contrato IN ('año', 'año_mantenimiento')),
  importe_total DECIMAL(12, 2) DEFAULT 0,
  observaciones TEXT,
  estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'pendiente', 'aprobado', 'facturado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preventa_servicios table
CREATE TABLE IF NOT EXISTS preventa_servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preventa_id UUID NOT NULL REFERENCES preventas(id) ON DELETE CASCADE,
  servicio VARCHAR(255) NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL DEFAULT 0,
  unidades INTEGER NOT NULL DEFAULT 1,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preventa_complementos table
CREATE TABLE IF NOT EXISTS preventa_complementos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preventa_id UUID NOT NULL REFERENCES preventas(id) ON DELETE CASCADE,
  complemento VARCHAR(255) NOT NULL,
  precio DECIMAL(12, 2) NOT NULL DEFAULT 0,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_preventas_cliente_id ON preventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_preventas_estado ON preventas(estado);
CREATE INDEX IF NOT EXISTS idx_preventas_fecha_venta ON preventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_preventas_comercial ON preventas(comercial);
CREATE INDEX IF NOT EXISTS idx_preventa_servicios_preventa_id ON preventa_servicios(preventa_id);
CREATE INDEX IF NOT EXISTS idx_preventa_complementos_preventa_id ON preventa_complementos(preventa_id);

-- Enable RLS
ALTER TABLE preventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE preventa_servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE preventa_complementos ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your auth setup)
CREATE POLICY "Allow all operations on preventas" ON preventas FOR ALL USING (true);
CREATE POLICY "Allow all operations on preventa_servicios" ON preventa_servicios FOR ALL USING (true);
CREATE POLICY "Allow all operations on preventa_complementos" ON preventa_complementos FOR ALL USING (true);
