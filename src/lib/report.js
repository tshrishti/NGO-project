// Build and download a CSV of needs; also a simple print-to-PDF trigger.

function csvCell(v) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function needsToCSV(needs) {
  const headers = ['id', 'title', 'category', 'urgency', 'status', 'ngoName', 'assignedName', 'lat', 'lng', 'createdAt', 'fulfilledAt']
  const rows = needs.map((n) =>
    [
      n.id, n.title, n.category, n.urgency, n.status, n.ngoName, n.assignedName || '',
      n.location?.lat ?? '', n.location?.lng ?? '',
      n.createdAt ? new Date(n.createdAt).toISOString() : '',
      n.fulfilledAt ? new Date(n.fulfilledAt).toISOString() : '',
    ].map(csvCell).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export function downloadCSV(needs, filename = 'reliefLink-report.csv') {
  const blob = new Blob([needsToCSV(needs)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function printReport() {
  window.print()
}
