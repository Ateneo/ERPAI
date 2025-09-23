// Script para generar un archivo CSV con datos de clientes
// Ejecutar con: node scripts/generate-customers-csv.js

const fs = require("fs")
const path = require("path")

const customers = [
  // Sector Formación
  {
    name: "Academia Superior de Estudios",
    email: "info@academiasuperior.es",
    phone: "+34 915 234 567",
    tax_id: "B12345678",
    address: "Calle Gran Vía 45, 3º",
    city: "Madrid",
    postal_code: "28013",
    province: "Madrid",
    sector: "sector formación",
    contact_person: "María González Ruiz",
    website: "www.academiasuperior.es",
    notes: "Centro de formación especializado en cursos técnicos",
  },
  {
    name: "Instituto Tecnológico Avanzado S.L.",
    email: "contacto@tecnoavanzado.com",
    phone: "+34 933 456 789",
    tax_id: "B23456789",
    address: "Passeig de Gràcia 123",
    city: "Barcelona",
    postal_code: "08008",
    province: "Barcelona",
    sector: "sector formación",
    contact_person: "Carlos Martínez López",
    website: "www.tecnoavanzado.com",
    notes: "Formación en tecnologías digitales y programación",
  },
  {
    name: "Centro de Formación Profesional Integral",
    email: "admin@cfpintegral.es",
    phone: "+34 954 567 890",
    tax_id: "B34567890",
    address: "Avenida de la Constitución 78",
    city: "Sevilla",
    postal_code: "41001",
    province: "Sevilla",
    sector: "sector formación",
    contact_person: "Ana Rodríguez Sánchez",
    website: "www.cfpintegral.es",
    notes: "FP y certificados profesionales",
  },
  {
    name: "Universidad Corporativa Empresarial",
    email: "info@unicorp.es",
    phone: "+34 963 678 901",
    tax_id: "B45678901",
    address: "Calle Colón 156",
    city: "Valencia",
    postal_code: "46004",
    province: "Valencia",
    sector: "sector formación",
    contact_person: "David Fernández García",
    website: "www.unicorp.es",
    notes: "Formación ejecutiva y liderazgo",
  },
  {
    name: "Escuela de Negocios Mediterránea",
    email: "contacto@enmedi.com",
    phone: "+34 952 789 012",
    tax_id: "B56789012",
    address: "Paseo Marítimo 89",
    city: "Málaga",
    postal_code: "29016",
    province: "Málaga",
    sector: "sector formación",
    contact_person: "Laura Jiménez Moreno",
    website: "www.enmedi.com",
    notes: "MBA y programas de postgrado",
  },
  {
    name: "Centro de Idiomas Global",
    email: "info@idiomasglobal.es",
    phone: "+34 985 890 123",
    tax_id: "B67890123",
    address: "Calle Uría 234",
    city: "Oviedo",
    postal_code: "33003",
    province: "Asturias",
    sector: "sector formación",
    contact_person: "Roberto Álvarez Díaz",
    website: "www.idiomasglobal.es",
    notes: "Enseñanza de idiomas para empresas",
  },

  // Sector Auditoría
  {
    name: "Auditoría y Consultoría Peninsular S.L.",
    email: "info@auditpen.com",
    phone: "+34 914 123 456",
    tax_id: "B78901234",
    address: "Calle Serrano 67, 5º",
    city: "Madrid",
    postal_code: "28006",
    province: "Madrid",
    sector: "sector auditoria",
    contact_person: "Miguel Ángel Torres Ruiz",
    website: "www.auditpen.com",
    notes: "Auditoría financiera y consultoría fiscal",
  },
  {
    name: "Despacho Profesional Auditor Catalán",
    email: "contacto@dpac.es",
    phone: "+34 932 234 567",
    tax_id: "B89012345",
    address: "Rambla Catalunya 45",
    city: "Barcelona",
    postal_code: "08007",
    province: "Barcelona",
    sector: "sector auditoria",
    contact_person: "Montserrat Vila Puig",
    website: "www.dpac.es",
    notes: "Auditoría de cuentas anuales y due diligence",
  },
  {
    name: "Consultores Auditores Andaluces",
    email: "admin@caa-audit.es",
    phone: "+34 955 345 678",
    tax_id: "B90123456",
    address: "Calle Sierpes 123",
    city: "Sevilla",
    postal_code: "41004",
    province: "Sevilla",
    sector: "sector auditoria",
    contact_person: "Francisco Javier Morales",
    website: "www.caa-audit.es",
    notes: "Auditoría interna y compliance",
  },
  {
    name: "Gabinete de Auditoría Levantina",
    email: "info@galev.com",
    phone: "+34 964 456 789",
    tax_id: "B01234567",
    address: "Avenida del Puerto 78",
    city: "Valencia",
    postal_code: "46021",
    province: "Valencia",
    sector: "sector auditoria",
    contact_person: "Carmen Soler Martínez",
    website: "www.galev.com",
    notes: "Auditoría de sistemas y procesos",
  },
  {
    name: "Auditores Asociados del Norte",
    email: "contacto@aan.es",
    phone: "+34 944 567 890",
    tax_id: "B12345679",
    address: "Gran Vía 89",
    city: "Bilbao",
    postal_code: "48001",
    province: "Vizcaya",
    sector: "sector auditoria",
    contact_person: "Iñaki Etxebarria Aguirre",
    website: "www.aan.es",
    notes: "Auditoría forense y peritajes",
  },
  {
    name: "Firma de Auditoría Gallega",
    email: "info@fagal.es",
    phone: "+34 981 678 901",
    tax_id: "B23456780",
    address: "Rúa do Franco 45",
    city: "Santiago de Compostela",
    postal_code: "15705",
    province: "A Coruña",
    sector: "sector auditoria",
    contact_person: "Rosario Castro Fernández",
    website: "www.fagal.es",
    notes: "Auditoría de entidades sin ánimo de lucro",
  },
]

// Generar CSV
const csvHeader = "name,email,phone,tax_id,address,city,postal_code,province,sector,contact_person,website,notes\n"
const csvRows = customers
  .map((customer) => {
    return [
      `"${customer.name}"`,
      `"${customer.email}"`,
      `"${customer.phone}"`,
      `"${customer.tax_id}"`,
      `"${customer.address}"`,
      `"${customer.city}"`,
      `"${customer.postal_code}"`,
      `"${customer.province}"`,
      `"${customer.sector}"`,
      `"${customer.contact_person}"`,
      `"${customer.website}"`,
      `"${customer.notes}"`,
    ].join(",")
  })
  .join("\n")

const csvContent = csvHeader + csvRows

// Guardar archivo
const outputPath = path.join(__dirname, "..", "data", "customers.csv")
const outputDir = path.dirname(outputPath)

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

fs.writeFileSync(outputPath, csvContent, "utf8")

console.log("✅ Archivo CSV de clientes generado exitosamente:")
console.log(`📁 Ubicación: ${outputPath}`)
console.log(`📊 Total de clientes: ${customers.length}`)
console.log("\n📈 Distribución por sectores:")

const sectorCount = customers.reduce((acc, customer) => {
  acc[customer.sector] = (acc[customer.sector] || 0) + 1
  return acc
}, {})

Object.entries(sectorCount).forEach(([sector, count]) => {
  console.log(`   • ${sector}: ${count} clientes`)
})
