-- Función para crear evento automáticamente cuando se crea una factura
CREATE OR REPLACE FUNCTION create_invoice_calendar_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear evento para fecha de vencimiento de la factura
    INSERT INTO calendar_events (
        title,
        description,
        start_date,
        end_date,
        event_type,
        client_id,
        related_type,
        related_id,
        reminder_minutes
    ) VALUES (
        'Vencimiento factura ' || NEW.invoice_number,
        'Fecha de vencimiento de la factura ' || NEW.invoice_number || ' por importe de ' || NEW.total_amount || '€',
        NEW.due_date,
        NEW.due_date + INTERVAL '1 hour',
        'invoice_due',
        NEW.customer_id::UUID,
        'invoice',
        NEW.id::VARCHAR,
        1440 -- 24 hours reminder
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear evento automáticamente cuando se crea un contrato
CREATE OR REPLACE FUNCTION create_contract_calendar_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear evento para fecha de inicio del contrato
    IF NEW.start_date IS NOT NULL THEN
        INSERT INTO calendar_events (
            title,
            description,
            start_date,
            end_date,
            event_type,
            client_id,
            related_type,
            related_id,
            reminder_minutes
        ) VALUES (
            'Inicio contrato: ' || NEW.title,
            'Fecha de inicio del contrato ' || NEW.title,
            NEW.start_date,
            NEW.start_date + INTERVAL '1 hour',
            'contract_start',
            NEW.customer_id::UUID,
            'contract',
            NEW.id::VARCHAR,
            2880 -- 48 hours reminder
        );
    END IF;
    
    -- Crear evento para fecha de fin del contrato
    IF NEW.end_date IS NOT NULL THEN
        INSERT INTO calendar_events (
            title,
            description,
            start_date,
            end_date,
            event_type,
            client_id,
            related_type,
            related_id,
            reminder_minutes
        ) VALUES (
            'Fin contrato: ' || NEW.title,
            'Fecha de finalización del contrato ' || NEW.title,
            NEW.end_date,
            NEW.end_date + INTERVAL '1 hour',
            'contract_end',
            NEW.customer_id::UUID,
            'contract',
            NEW.id::VARCHAR,
            10080 -- 1 week reminder
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de contratos generados si no existe (con UUID)
CREATE TABLE IF NOT EXISTS generated_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    template_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    amount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'generated',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para sincronizar eventos existentes (ejecutar una vez)
CREATE OR REPLACE FUNCTION sync_existing_data_to_calendar()
RETURNS void AS $$
BEGIN
    -- Limpiar eventos existentes para evitar duplicados
    DELETE FROM calendar_events WHERE event_type IN ('contract_start', 'contract_end', 'invoice_due', 'follow_up');
    
    -- Sincronizar clientes como eventos de tipo 'event'
    INSERT INTO calendar_events (
        title,
        event_type,
        event_date,
        client_id,
        description,
        status
    )
    SELECT 
        'Cliente registrado: ' || name,
        'event',
        created_at::date,
        id,
        'Nuevo cliente registrado - ' || sector,
        'completed'
    FROM customers
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
    
END;
$$ LANGUAGE plpgsql;

-- Función para sincronizar automáticamente eventos cuando se crea una factura
CREATE OR REPLACE FUNCTION sync_invoice_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear evento para fecha de vencimiento de la factura
    IF NEW.due_date IS NOT NULL THEN
        INSERT INTO calendar_events (
            title,
            description,
            start_date,
            end_date,
            event_type,
            status,
            client_id,
            related_type,
            related_id,
            reminder_minutes
        ) VALUES (
            'Vencimiento Factura ' || NEW.invoice_number,
            'Fecha de vencimiento de la factura ' || NEW.invoice_number || ' por importe de ' || NEW.total_amount || '€',
            NEW.due_date - INTERVAL '1 hour',
            NEW.due_date,
            'payment_due',
            'scheduled',
            NEW.customer_id::UUID,
            'invoice',
            NEW.id::VARCHAR,
            1440 -- Recordatorio 24 horas antes
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para sincronizar eventos cuando se crea un contrato
CREATE OR REPLACE FUNCTION sync_contract_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear evento para fecha de inicio del contrato
    IF NEW.start_date IS NOT NULL THEN
        INSERT INTO calendar_events (
            title,
            description,
            start_date,
            end_date,
            event_type,
            status,
            client_id,
            related_type,
            related_id,
            reminder_minutes
        ) VALUES (
            'Inicio Contrato: ' || COALESCE(NEW.title, 'Sin título'),
            'Inicio del contrato con ' || (SELECT name FROM customers WHERE id = NEW.customer_id::uuid),
            NEW.start_date,
            NEW.start_date + INTERVAL '1 hour',
            'contract_start',
            'scheduled',
            NEW.customer_id::UUID,
            'contract',
            NEW.id::VARCHAR,
            2880 -- Recordatorio 48 horas antes
        );
    END IF;
    
    -- Crear evento para fecha de fin del contrato si existe
    IF NEW.end_date IS NOT NULL THEN
        INSERT INTO calendar_events (
            title,
            description,
            start_date,
            end_date,
            event_type,
            status,
            client_id,
            related_type,
            related_id,
            reminder_minutes
        ) VALUES (
            'Fin Contrato: ' || COALESCE(NEW.title, 'Sin título'),
            'Finalización del contrato con ' || (SELECT name FROM customers WHERE id = NEW.customer_id::uuid),
            NEW.end_date - INTERVAL '1 hour',
            NEW.end_date,
            'contract_end',
            'scheduled',
            NEW.customer_id::UUID,
            'contract',
            NEW.id::VARCHAR,
            10080 -- Recordatorio 1 semana antes
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para sincronizar eventos cuando se registra un nuevo cliente
CREATE OR REPLACE FUNCTION create_customer_welcome_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear evento de seguimiento 3 días después del registro
    INSERT INTO calendar_events (
        title,
        description,
        start_date,
        end_date,
        event_type,
        client_id,
        related_type,
        related_id,
        reminder_minutes
    ) VALUES (
        'Seguimiento Cliente: ' || NEW.name,
        'Llamada de seguimiento para el nuevo cliente ' || NEW.name,
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '3 days' + INTERVAL '30 minutes',
        'follow_up',
        NEW.id::UUID,
        'customer',
        NEW.id::VARCHAR,
        60 -- Recordatorio 1 hora antes
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar eventos cuando se elimina un cliente
CREATE OR REPLACE FUNCTION cleanup_customer_events()
RETURNS TRIGGER AS $$
BEGIN
    -- Marcar eventos relacionados como cancelados en lugar de eliminarlos
    UPDATE calendar_events 
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE client_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener eventos del calendario con información del cliente
CREATE OR REPLACE FUNCTION get_calendar_events_with_customer(
    start_date_param TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date_param TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 month'
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    event_type VARCHAR(50),
    client_id UUID,
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    related_type VARCHAR(50),
    related_id VARCHAR(255),
    location VARCHAR(255),
    attendees TEXT[],
    is_all_day BOOLEAN,
    reminder_minutes INTEGER,
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id,
        ce.title,
        ce.description,
        ce.start_date,
        ce.end_date,
        ce.event_type,
        ce.client_id,
        c.name as client_name,
        c.email as client_email,
        ce.related_type,
        ce.related_id,
        ce.location,
        ce.attendees,
        ce.is_all_day,
        ce.reminder_minutes,
        ce.status
    FROM calendar_events ce
    LEFT JOIN customers c ON ce.client_id = c.id
    WHERE ce.start_date >= start_date_param 
    AND ce.start_date <= end_date_param
    ORDER BY ce.start_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener próximos eventos (recordatorios)
CREATE OR REPLACE FUNCTION get_upcoming_events(
    hours_ahead INTEGER DEFAULT 24
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    client_name VARCHAR(255),
    reminder_minutes INTEGER,
    minutes_until_event INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id,
        ce.title,
        ce.description,
        ce.start_date,
        c.name as client_name,
        ce.reminder_minutes,
        EXTRACT(EPOCH FROM (ce.start_date - NOW()))/60 as minutes_until_event
    FROM calendar_events ce
    LEFT JOIN customers c ON ce.client_id = c.id
    WHERE ce.start_date > NOW()
    AND ce.start_date <= NOW() + (hours_ahead || ' hours')::INTERVAL
    AND ce.status = 'scheduled'
    ORDER BY ce.start_date ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_invoice_calendar_event() IS 'Crea eventos de calendario automáticamente para facturas';
COMMENT ON FUNCTION create_contract_calendar_event() IS 'Crea eventos de calendario automáticamente para contratos';
COMMENT ON FUNCTION create_customer_welcome_event() IS 'Crea eventos de bienvenida automáticamente para nuevos clientes';
COMMENT ON FUNCTION get_calendar_events_with_customer(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) IS 'Obtiene eventos del calendario con información del cliente';
COMMENT ON FUNCTION get_upcoming_events(INTEGER) IS 'Obtiene próximos eventos para recordatorios';

-- Verificar que las funciones se crearon correctamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%sync%' OR routine_name LIKE '%calendar%'
ORDER BY routine_name;

-- Ejecutar sincronización inicial
SELECT sync_existing_data_to_calendar();

-- Crear triggers (drop existing ones first)
DROP TRIGGER IF EXISTS trigger_invoice_calendar_event ON invoices;
DROP TRIGGER IF EXISTS trigger_contract_calendar_event ON generated_contracts;
DROP TRIGGER IF EXISTS trigger_customer_welcome_event ON customers;

-- Note: These triggers will only work if the referenced tables exist
-- Uncomment when invoices and contracts tables are created

-- CREATE TRIGGER trigger_invoice_calendar_event
--     AFTER INSERT ON invoices
--     FOR EACH ROW
--     EXECUTE FUNCTION create_invoice_calendar_event();

-- CREATE TRIGGER trigger_contract_calendar_event
--     AFTER INSERT ON generated_contracts
--     FOR EACH ROW
--     EXECUTE FUNCTION create_contract_calendar_event();

CREATE TRIGGER trigger_customer_welcome_event
    AFTER INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION create_customer_welcome_event();
