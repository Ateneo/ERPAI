-- Insertar datos de ejemplo de clientes españoles
INSERT INTO customers (name, email, phone, tax_id, address, city, postal_code, province, sector, contact_person, website, notes) VALUES

-- Sector Formación
('Academia Superior de Estudios', 'info@academiasuperior.es', '+34 915 234 567', 'B12345678', 'Calle Gran Vía 45, 3º', 'Madrid', '28013', 'Madrid', 'sector formación', 'María González Ruiz', 'www.academiasuperior.es', 'Centro de formación especializado en cursos técnicos'),

('Instituto Tecnológico Avanzado S.L.', 'contacto@tecnoavanzado.com', '+34 933 456 789', 'B23456789', 'Passeig de Gràcia 123', 'Barcelona', '08008', 'Barcelona', 'sector formación', 'Carlos Martínez López', 'www.tecnoavanzado.com', 'Formación en tecnologías digitales y programación'),

('Centro de Formación Profesional Integral', 'admin@cfpintegral.es', '+34 954 567 890', 'B34567890', 'Avenida de la Constitución 78', 'Sevilla', '41001', 'Sevilla', 'sector formación', 'Ana Rodríguez Sánchez', 'www.cfpintegral.es', 'FP y certificados profesionales'),

('Universidad Corporativa Empresarial', 'info@unicorp.es', '+34 963 678 901', 'B45678901', 'Calle Colón 156', 'Valencia', '46004', 'Valencia', 'sector formación', 'David Fernández García', 'www.unicorp.es', 'Formación ejecutiva y liderazgo'),

('Escuela de Negocios Mediterránea', 'contacto@enmedi.com', '+34 952 789 012', 'B56789012', 'Paseo Marítimo 89', 'Málaga', '29016', 'Málaga', 'sector formación', 'Laura Jiménez Moreno', 'www.enmedi.com', 'MBA y programas de postgrado'),

('Centro de Idiomas Global', 'info@idiomasglobal.es', '+34 985 890 123', 'B67890123', 'Calle Uría 234', 'Oviedo', '33003', 'Asturias', 'sector formación', 'Roberto Álvarez Díaz', 'www.idiomasglobal.es', 'Enseñanza de idiomas para empresas'),

-- Sector Auditoría
('Auditoría y Consultoría Peninsular S.L.', 'info@auditpen.com', '+34 914 123 456', 'B78901234', 'Calle Serrano 67, 5º', 'Madrid', '28006', 'Madrid', 'sector auditoria', 'Miguel Ángel Torres Ruiz', 'www.auditpen.com', 'Auditoría financiera y consultoría fiscal'),

('Despacho Profesional Auditor Catalán', 'contacto@dpac.es', '+34 932 234 567', 'B89012345', 'Rambla Catalunya 45', 'Barcelona', '08007', 'Barcelona', 'sector auditoria', 'Montserrat Vila Puig', 'www.dpac.es', 'Auditoría de cuentas anuales y due diligence'),

('Consultores Auditores Andaluces', 'admin@caa-audit.es', '+34 955 345 678', 'B90123456', 'Calle Sierpes 123', 'Sevilla', '41004', 'Sevilla', 'sector auditoria', 'Francisco Javier Morales', 'www.caa-audit.es', 'Auditoría interna y compliance'),

('Gabinete de Auditoría Levantina', 'info@galev.com', '+34 964 456 789', 'B01234567', 'Avenida del Puerto 78', 'Valencia', '46021', 'Valencia', 'sector auditoria', 'Carmen Soler Martínez', 'www.galev.com', 'Auditoría de sistemas y procesos'),

('Auditores Asociados del Norte', 'contacto@aan.es', '+34 944 567 890', 'B12345679', 'Gran Vía 89', 'Bilbao', '48001', 'Vizcaya', 'sector auditoria', 'Iñaki Etxebarria Aguirre', 'www.aan.es', 'Auditoría forense y peritajes'),

('Firma de Auditoría Gallega', 'info@fagal.es', '+34 981 678 901', 'B23456780', 'Rúa do Franco 45', 'Santiago de Compostela', '15705', 'A Coruña', 'sector auditoria', 'Rosario Castro Fernández', 'www.fagal.es', 'Auditoría de entidades sin ánimo de lucro'),

-- Clientes adicionales de otros sectores
('Construcciones Mediterráneas S.A.', 'info@construmed.es', '+34 965 789 012', 'A34567891', 'Polígono Industrial Las Salinas', 'Alicante', '03006', 'Alicante', 'construcción', 'José Luis Hernández', 'www.construmed.es', 'Construcción de viviendas y obra civil'),

('Restaurante El Rincón Gourmet', 'reservas@rincon-gourmet.es', '+34 913 890 123', '12345678Z', 'Plaza Mayor 12', 'Madrid', '28012', 'Madrid', 'hostelería', 'Elena Vázquez Pérez', 'www.rincon-gourmet.es', 'Restaurante de alta cocina'),

('Clínica Dental Sonrisa', 'citas@clinicasonrisa.es', '+34 934 901 234', '23456789A', 'Calle Muntaner 234', 'Barcelona', '08021', 'Barcelona', 'sanidad', 'Dr. Alberto Ruiz Gómez', 'www.clinicasonrisa.es', 'Clínica dental especializada en implantes'),

('Bufete Jurídico Asociados', 'info@bufetejuridico.es', '+34 956 012 345', 'B45678902', 'Avenida Andalucía 67', 'Cádiz', '11005', 'Cádiz', 'servicios jurídicos', 'Letrada María del Mar Ruiz', 'www.bufetejuridico.es', 'Derecho mercantil y laboral'),

('Farmacia Central', 'info@farmaciacentral.es', '+34 987 123 456', '34567890B', 'Plaza del Ayuntamiento 8', 'León', '24003', 'León', 'farmacia', 'Farmacéutica Isabel García', NULL, 'Farmacia comunitaria con servicios especializados'),

('Taller Mecánico Automoción Plus', 'contacto@automocionplus.es', '+34 968 234 567', 'B56789013', 'Polígono San Ginés, Nave 45', 'Murcia', '30169', 'Murcia', 'automoción', 'Mecánico Jefe Pedro Martínez', 'www.automocionplus.es', 'Taller multimarca con ITV'),

('Peluquería y Estética Bella Vista', 'citas@bellavista.es', '+34 942 345 678', '45678901C', 'Calle Hernán Cortés 23', 'Santander', '39003', 'Cantabria', 'belleza', 'Estilista Cristina López', NULL, 'Peluquería unisex y tratamientos estéticos'),

('Librería Papelería El Estudiante', 'ventas@elestudiante.es', '+34 979 456 789', 'B67890124', 'Calle Mayor 156', 'Palencia', '34001', 'Palencia', 'comercio', 'Propietario Manuel Díez', NULL, 'Librería especializada en material educativo');

-- Verificar la inserción
SELECT 
    sector,
    COUNT(*) as total_clientes,
    STRING_AGG(name, ', ' ORDER BY name) as clientes
FROM customers 
GROUP BY sector 
ORDER BY sector;
