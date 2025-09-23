-- Función para crear evento automáticamente cuando se crea una factura
CREATE OR REPLACE FUNCTION create_invoice_calendar_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO calendar_events (
        title,
        type,
        event_date,
        client_id,
        related_id,
        amount,
        description,
        status
    ) VALUES (
        'Factura #' || NEW.invoice_number,
        'invoice',
        NEW.issue_date,
        (SELECT id FROM customers WHERE name = NEW.customer_name LIMIT 1),
        NEW.id,
        NEW.total_amount,
        'Factura emitida - ' || NEW.customer_name,
        CASE 
            WHEN NEW.status = 'paid' THEN 'completed'
            WHEN NEW.status = 'sent' THEN 'sent'
            ELSE 'pending'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear evento automáticamente cuando se crea un contrato
CREATE OR REPLACE FUNCTION create_contract_calendar_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO calendar_events (
        title,
        type,
        event_date,
        client_id,
        related_id,
        amount,
        description,
        status
    ) VALUES (
        'Contrato - ' || NEW.template_name,
        'contract',
        NEW.created_at::date,
        NEW.customer_id,
        NEW.id,
        NEW.amount,
        'Contrato generado para ' || (SELECT name FROM customers WHERE id = NEW.customer_id),
        'completed'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de contratos generados si no existe
CREATE TABLE IF NOT EXISTS generated_contracts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    template_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'generated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
