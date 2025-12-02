-- Tabla de facturas con integración Verifactu
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Numeración
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  series VARCHAR(20) DEFAULT 'F',
  
  -- Origen
  preventa_id UUID REFERENCES preventas(id) ON DELETE SET NULL,
  
  -- Cliente
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  customer_name VARCHAR(255) NOT NULL,
  customer_tax_id VARCHAR(20) NOT NULL,
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_postal_code VARCHAR(10),
  customer_province VARCHAR(100),
  customer_country VARCHAR(100) DEFAULT 'España',
  
  -- Fechas
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  
  -- Estado
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending, sent, paid, cancelled
  
  -- Importes
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 21.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Verifactu
  verifactu_id VARCHAR(100),
  verifactu_status VARCHAR(50), -- pending, submitted, accepted, rejected
  verifactu_submitted_at TIMESTAMP WITH TIME ZONE,
  verifactu_response JSONB,
  verifactu_qr_code TEXT,
  
  -- Observaciones
  notes TEXT,
  internal_notes TEXT,
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  -- Comercial
  salesperson_id UUID,
  salesperson_name VARCHAR(255)
);

-- Líneas de factura
CREATE TABLE IF NOT EXISTS invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Descripción
  description TEXT NOT NULL,
  code VARCHAR(50),
  
  -- Cantidades
  quantity DECIMAL(12,4) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,4) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Impuestos
  tax_rate DECIMAL(5,2) DEFAULT 21.00,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  
  -- Totales
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  
  -- Orden
  line_order INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_preventa_id ON invoices(preventa_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_verifactu_status ON invoices(verifactu_status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);

-- Deshabilitar RLS
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines DISABLE ROW LEVEL SECURITY;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number(p_series VARCHAR DEFAULT 'F')
RETURNS VARCHAR AS $$
DECLARE
  v_year VARCHAR(4);
  v_next_num INT;
  v_invoice_number VARCHAR(50);
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM p_series || v_year || '-(\d+)') AS INT)
  ), 0) + 1
  INTO v_next_num
  FROM invoices
  WHERE invoice_number LIKE p_series || v_year || '-%';
  
  v_invoice_number := p_series || v_year || '-' || LPAD(v_next_num::TEXT, 6, '0');
  
  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;
