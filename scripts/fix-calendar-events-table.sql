-- Drop the existing table if it exists
DROP TABLE IF EXISTS calendar_events CASCADE;

-- Create the calendar_events table with correct UUID types
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50) NOT NULL DEFAULT 'meeting',
    client_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    related_type VARCHAR(50), -- 'invoice', 'contract', 'customer'
    related_id VARCHAR(255), -- ID of the related entity
    location VARCHAR(255),
    attendees TEXT[], -- Array of email addresses
    is_all_day BOOLEAN DEFAULT FALSE,
    reminder_minutes INTEGER DEFAULT 15,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_client_id ON calendar_events(client_id);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_related ON calendar_events(related_type, related_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_calendar_events_updated_at();

-- Insert some sample events
INSERT INTO calendar_events (title, description, start_date, end_date, event_type, location) VALUES
('Reunión de equipo', 'Reunión semanal del equipo de desarrollo', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 'meeting', 'Sala de juntas'),
('Presentación cliente', 'Presentación del proyecto al cliente ABC', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 'presentation', 'Oficina cliente'),
('Revisión facturas', 'Revisión mensual de facturas pendientes', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '30 minutes', 'review', 'Oficina');
