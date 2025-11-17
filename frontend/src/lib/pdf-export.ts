import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface FormField {
  id: string
  label: string
}

interface ResponseData {
  fieldId: string
  value: unknown
}

interface Response {
  id: string
  data: ResponseData[]
  ip: string | null
  createdAt: string
}

export async function exportResponsesToPDF(
  formName: string,
  fields: FormField[],
  responses: Response[]
) {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  // Add title
  doc.setFontSize(18)
  doc.text(`Respostas: ${formName}`, 14, 15)

  // Add metadata
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Total de respostas: ${responses.length}`, 14, 22)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 27)

  // Prepare table headers
  const headers = [
    'Data/Hora',
    ...fields.map((f) => f.label),
    'IP',
  ]

  // Prepare table rows
  const rows = responses.map((response) => {
    const formatDate = (date: string) => {
      return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    const getFieldValue = (fieldId: string) => {
      const field = response.data.find((d) => d.fieldId === fieldId)
      if (!field || field.value === null || field.value === undefined) {
        return '-'
      }
      if (typeof field.value === 'boolean') {
        return field.value ? 'Sim' : 'Não'
      }
      if (Array.isArray(field.value)) {
        return field.value.join(', ')
      }
      return String(field.value)
    }

    return [
      formatDate(response.createdAt),
      ...fields.map((f) => getFieldValue(f.id)),
      response.ip || '-',
    ]
  })

  // Add table to PDF
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 32,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Primary color
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 32, right: 14, bottom: 14, left: 14 },
    theme: 'striped',
    tableWidth: 'auto',
  })

  // Save PDF
  const fileName = `${formName.toLowerCase().replace(/\s+/g, '-')}-respostas.pdf`
  doc.save(fileName)
}
