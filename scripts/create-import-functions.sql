-- Create utility functions for customer data import and management
-- These functions help with data validation, search, and statistics

-- Function to validate Spanish tax IDs (NIF/CIF/NIE)
CREATE OR REPLACE FUNCTION validate_spanish_tax_id(tax_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  clean_id TEXT;
  first_char CHAR(1);
  numbers TEXT;
  control_char CHAR(1);
  expected_letter CHAR(1);
  letter_map TEXT := 'TRWAGMYFPDXBNJZSQVHLCKE';
  sum_value INTEGER := 0;
  i INTEGER;
  double_digit INTEGER;
BEGIN
  -- Return false for null or empty input
  IF tax_id IS NULL OR LENGTH(TRIM(tax_id)) = 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Clean and normalize the tax ID
  clean_id := UPPER(TRIM(REGEXP_REPLACE(tax_id, '[^A-Z0-9]', '', 'g')));
  
  -- Check length
  IF LENGTH(clean_id) != 9 THEN
    RETURN FALSE;
  END IF;
  
  first_char := SUBSTRING(clean_id FROM 1 FOR 1);
  
  -- Validate NIF (DNI) - starts with number
  IF first_char ~ '[0-9]' THEN
    numbers := SUBSTRING(clean_id FROM 1 FOR 8);
    control_char := SUBSTRING(clean_id FROM 9 FOR 1);
    
    -- Check if numbers are valid
    IF numbers !~ '^[0-9]{8}$' THEN
      RETURN FALSE;
    END IF;
    
    -- Calculate expected letter
    expected_letter := SUBSTRING(letter_map FROM (numbers::INTEGER % 23) + 1 FOR 1);
    
    RETURN control_char = expected_letter;
  END IF;
  
  -- Validate CIF - starts with letter A-W (excluding some)
  IF first_char ~ '[ABCDEFGHJNPQRSUVW]' THEN
    numbers := SUBSTRING(clean_id FROM 2 FOR 7);
    control_char := SUBSTRING(clean_id FROM 9 FOR 1);
    
    -- Check if numbers are valid
    IF numbers !~ '^[0-9]{7}$' THEN
      RETURN FALSE;
    END IF;
    
    -- For simplicity, accept any valid control character for CIF
    RETURN control_char ~ '[0-9A-J]';
  END IF;
  
  -- Validate NIE - starts with X, Y, or Z
  IF first_char ~ '[XYZ]' THEN
    numbers := SUBSTRING(clean_id FROM 2 FOR 7);
    control_char := SUBSTRING(clean_id FROM 9 FOR 1);
    
    -- Check if numbers are valid
    IF numbers !~ '^[0-9]{7}$' THEN
      RETURN FALSE;
    END IF;
    
    -- Convert first letter to number and calculate
    CASE first_char
      WHEN 'X' THEN numbers := '0' || numbers;
      WHEN 'Y' THEN numbers := '1' || numbers;
      WHEN 'Z' THEN numbers := '2' || numbers;
    END CASE;
    
    expected_letter := SUBSTRING(letter_map FROM (numbers::INTEGER % 23) + 1 FOR 1);
    
    RETURN control_char = expected_letter;
  END IF;
  
  -- If none of the above patterns match
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to search customers with relevance scoring
CREATE OR REPLACE FUNCTION search_customers(
  search_query TEXT,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  tax_id TEXT,
  city TEXT,
  province TEXT,
  sector TEXT,
  is_active BOOLEAN,
  verifactu_status TEXT,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.tax_id,
    c.city,
    c.province,
    c.sector,
    c.is_active,
    c.verifactu_status,
    (
      CASE WHEN c.name ILIKE '%' || search_query || '%' THEN 10 ELSE 0 END +
      CASE WHEN c.email ILIKE '%' || search_query || '%' THEN 8 ELSE 0 END +
      CASE WHEN c.tax_id ILIKE '%' || search_query || '%' THEN 9 ELSE 0 END +
      CASE WHEN c.phone ILIKE '%' || search_query || '%' THEN 7 ELSE 0 END +
      CASE WHEN c.commercial_name ILIKE '%' || search_query || '%' THEN 6 ELSE 0 END +
      CASE WHEN c.contact_person ILIKE '%' || search_query || '%' THEN 5 ELSE 0 END +
      CASE WHEN c.city ILIKE '%' || search_query || '%' THEN 3 ELSE 0 END +
      CASE WHEN c.sector ILIKE '%' || search_query || '%' THEN 2 ELSE 0 END
    )::NUMERIC AS relevance_score
  FROM customers c
  WHERE 
    c.name ILIKE '%' || search_query || '%' OR
    c.email ILIKE '%' || search_query || '%' OR
    c.tax_id ILIKE '%' || search_query || '%' OR
    c.phone ILIKE '%' || search_query || '%' OR
    c.commercial_name ILIKE '%' || search_query || '%' OR
    c.contact_person ILIKE '%' || search_query || '%' OR
    c.city ILIKE '%' || search_query || '%' OR
    c.sector ILIKE '%' || search_query || '%'
  ORDER BY relevance_score DESC, c.name ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get customer statistics
CREATE OR REPLACE FUNCTION get_customer_statistics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_customers', (SELECT COUNT(*) FROM customers),
    'active_customers', (SELECT COUNT(*) FROM customers WHERE is_active = true),
    'inactive_customers', (SELECT COUNT(*) FROM customers WHERE is_active = false),
    'by_verifactu_status', (
      SELECT json_object_agg(
        COALESCE(verifactu_status, 'pending'), 
        count
      )
      FROM (
        SELECT 
          COALESCE(verifactu_status, 'pending') as verifactu_status,
          COUNT(*) as count
        FROM customers 
        GROUP BY COALESCE(verifactu_status, 'pending')
      ) status_counts
    ),
    'by_province', (
      SELECT json_agg(
        json_build_object(
          'province', province,
          'count', count
        )
      )
      FROM (
        SELECT 
          COALESCE(province, 'Sin especificar') as province,
          COUNT(*) as count
        FROM customers 
        WHERE province IS NOT NULL
        GROUP BY province
        ORDER BY count DESC
        LIMIT 10
      ) province_counts
    ),
    'by_sector', (
      SELECT json_agg(
        json_build_object(
          'sector', sector,
          'count', count
        )
      )
      FROM (
        SELECT 
          COALESCE(sector, 'Sin especificar') as sector,
          COUNT(*) as count
        FROM customers 
        WHERE sector IS NOT NULL
        GROUP BY sector
        ORDER BY count DESC
        LIMIT 10
      ) sector_counts
    ),
    'by_risk_level', (
      SELECT json_object_agg(
        COALESCE(risk_level, 'medium'), 
        count
      )
      FROM (
        SELECT 
          COALESCE(risk_level, 'medium') as risk_level,
          COUNT(*) as count
        FROM customers 
        GROUP BY COALESCE(risk_level, 'medium')
      ) risk_counts
    ),
    'financial_summary', (
      SELECT json_build_object(
        'total_credit_limit', COALESCE(SUM(credit_limit), 0),
        'average_credit_limit', COALESCE(AVG(credit_limit), 0),
        'total_annual_revenue', COALESCE(SUM(annual_revenue), 0),
        'average_annual_revenue', COALESCE(AVG(annual_revenue), 0),
        'total_orders', COALESCE(SUM(total_orders), 0),
        'average_order_value', COALESCE(AVG(average_order_value), 0)
      )
      FROM customers
      WHERE is_active = true
    ),
    'recent_activity', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'name', name,
          'created_at', created_at,
          'updated_at', updated_at
        )
      )
      FROM (
        SELECT id, name, created_at, updated_at
        FROM customers
        ORDER BY updated_at DESC
        LIMIT 5
      ) recent
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to clean duplicate customers
CREATE OR REPLACE FUNCTION clean_duplicate_customers()
RETURNS TABLE (
  action TEXT,
  customer_name TEXT,
  tax_id TEXT,
  details TEXT
) AS $$
DECLARE
  duplicate_record RECORD;
  keep_id UUID;
  duplicate_count INTEGER;
BEGIN
  -- Find duplicates by tax_id
  FOR duplicate_record IN
    SELECT 
      c.tax_id,
      COUNT(*) as count,
      MIN(c.created_at) as first_created,
      array_agg(c.id ORDER BY c.created_at) as ids,
      array_agg(c.name ORDER BY c.created_at) as names
    FROM customers c
    WHERE c.tax_id IS NOT NULL
    GROUP BY c.tax_id
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the first created customer
    keep_id := duplicate_record.ids[1];
    duplicate_count := array_length(duplicate_record.ids, 1) - 1;
    
    -- Return info about what we're keeping
    RETURN QUERY SELECT 
      'KEEP'::TEXT,
      duplicate_record.names[1]::TEXT,
      duplicate_record.tax_id::TEXT,
      format('Keeping oldest record (created: %s)', duplicate_record.first_created)::TEXT;
    
    -- Mark duplicates as inactive instead of deleting
    FOR i IN 2..array_length(duplicate_record.ids, 1) LOOP
      UPDATE customers 
      SET 
        is_active = false,
        notes = COALESCE(notes || E'\n\n', '') || 
                format('DUPLICATE: Marked as inactive on %s. Original kept with ID: %s', 
                       NOW()::DATE, keep_id),
        updated_at = NOW()
      WHERE id = duplicate_record.ids[i];
      
      RETURN QUERY SELECT 
        'DEACTIVATE'::TEXT,
        duplicate_record.names[i]::TEXT,
        duplicate_record.tax_id::TEXT,
        format('Marked as inactive (duplicate of %s)', duplicate_record.names[1])::TEXT;
    END LOOP;
  END LOOP;
  
  -- Find duplicates by email
  FOR duplicate_record IN
    SELECT 
      c.email,
      COUNT(*) as count,
      MIN(c.created_at) as first_created,
      array_agg(c.id ORDER BY c.created_at) as ids,
      array_agg(c.name ORDER BY c.created_at) as names
    FROM customers c
    WHERE c.email IS NOT NULL 
      AND c.is_active = true
      AND c.tax_id IS NULL  -- Only check email duplicates for records without tax_id
    GROUP BY c.email
    HAVING COUNT(*) > 1
  LOOP
    RETURN QUERY SELECT 
      'WARNING'::TEXT,
      string_agg(duplicate_record.names[i], ', ')::TEXT,
      duplicate_record.email::TEXT,
      format('Found %s customers with same email but no tax_id', 
             array_length(duplicate_record.ids, 1))::TEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to import customer from TSV data
CREATE OR REPLACE FUNCTION import_customer_from_tsv(
  tsv_line TEXT,
  column_mapping JSON DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  fields TEXT[];
  customer_data JSON;
  result JSON;
  customer_id UUID;
BEGIN
  -- Split TSV line into fields
  fields := string_to_array(tsv_line, E'\t');
  
  -- Default column mapping if not provided
  IF column_mapping IS NULL THEN
    column_mapping := json_build_object(
      'name', 1,
      'tax_id', 2,
      'email', 3,
      'phone', 4,
      'address', 5,
      'city', 6,
      'postal_code', 7,
      'province', 8,
      'sector', 9
    );
  END IF;
  
  -- Build customer data from fields
  customer_data := json_build_object(
    'name', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'name')::INTEGER]), ''), NULL),
    'tax_id', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'tax_id')::INTEGER]), ''), NULL),
    'email', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'email')::INTEGER]), ''), NULL),
    'phone', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'phone')::INTEGER]), ''), NULL),
    'address', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'address')::INTEGER]), ''), NULL),
    'city', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'city')::INTEGER]), ''), NULL),
    'postal_code', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'postal_code')::INTEGER]), ''), NULL),
    'province', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'province')::INTEGER]), ''), NULL),
    'sector', COALESCE(NULLIF(TRIM(fields[(column_mapping->>'sector')::INTEGER]), ''), NULL)
  );
  
  -- Validate required fields
  IF customer_data->>'name' IS NULL OR customer_data->>'tax_id' IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Missing required fields: name and tax_id are mandatory',
      'data', customer_data
    );
  END IF;
  
  -- Validate tax_id format
  IF NOT validate_spanish_tax_id(customer_data->>'tax_id') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid Spanish tax ID format',
      'data', customer_data
    );
  END IF;
  
  -- Check for existing customer with same tax_id
  SELECT id INTO customer_id
  FROM customers 
  WHERE tax_id = customer_data->>'tax_id'
  LIMIT 1;
  
  IF customer_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Customer with this tax_id already exists',
      'existing_id', customer_id,
      'data', customer_data
    );
  END IF;
  
  -- Insert new customer
  BEGIN
    INSERT INTO customers (
      id,
      name,
      tax_id,
      email,
      phone,
      address,
      city,
      postal_code,
      province,
      country,
      sector,
      is_active,
      verifactu_status,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      customer_data->>'name',
      customer_data->>'tax_id',
      customer_data->>'email',
      customer_data->>'phone',
      customer_data->>'address',
      customer_data->>'city',
      customer_data->>'postal_code',
      customer_data->>'province',
      'España',
      customer_data->>'sector',
      true,
      'pending',
      NOW(),
      NOW()
    ) RETURNING id INTO customer_id;
    
    RETURN json_build_object(
      'success', true,
      'message', 'Customer imported successfully',
      'customer_id', customer_id,
      'data', customer_data
    );
    
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM,
      'data', customer_data
    );
  END;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_customers_search_name ON customers USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_customers_search_email ON customers USING gin(to_tsvector('spanish', email));
CREATE INDEX IF NOT EXISTS idx_customers_search_commercial_name ON customers USING gin(to_tsvector('spanish', commercial_name));

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_spanish_tax_id(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION search_customers(TEXT, INTEGER, INTEGER) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_customer_statistics() TO PUBLIC;
GRANT EXECUTE ON FUNCTION clean_duplicate_customers() TO PUBLIC;
GRANT EXECUTE ON FUNCTION import_customer_from_tsv(TEXT, JSON) TO PUBLIC;

COMMIT;
