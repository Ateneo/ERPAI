-- Trigger para facturas (cuando se implemente la tabla invoices)
-- CREATE TRIGGER invoice_calendar_sync
--     AFTER INSERT ON invoices
--     FOR EACH ROW
--     EXECUTE FUNCTION create_invoice_calendar_event();

-- Trigger para contratos generados
CREATE TRIGGER contract_calendar_sync
    AFTER INSERT ON generated_contracts
    FOR EACH ROW
    EXECUTE FUNCTION create_contract_calendar_event();

-- Función para sincronizar eventos existentes (ejecutar una vez)
CREATE OR REPLACE FUNCTION sync_existing_data_to_calendar()
RETURNS void AS $$
BEGIN
    -- Limpiar eventos existentes para evitar duplicados
    DELETE FROM calendar_events WHERE type IN ('contract', 'invoice');
    
    -- Sincronizar clientes como eventos de tipo 'event'
    INSERT INTO calendar_events (
        title,
        type,
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

-- Ejecutar sincronización inicial
SELECT sync_existing_data_to_calendar();
