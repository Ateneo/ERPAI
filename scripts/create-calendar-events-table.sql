-- Crear tabla de eventos del calendario
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('contract', 'invoice', 'quote', 'meeting', 'event')),
    event_date DATE NOT NULL,
    event_time TIME,
    client_id INTEGER REFERENCES customers(id),
    related_id INTEGER, -- ID de la factura, contrato, etc. relacionado
    amount DECIMAL(10,2),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_type ON calendar_events(type);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client ON calendar_events(client_id);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_events_updated_at();
