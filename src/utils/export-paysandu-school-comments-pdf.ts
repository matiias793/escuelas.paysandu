import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PaysanduSchoolComment } from '@/types/paysandu-school-comment';

function formatPdfDate(iso: string): string {
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Montevideo',
  }).format(new Date(iso));
}

export function exportPaysanduSchoolCommentsPdf(
  schoolNumber: number,
  comments: PaysanduSchoolComment[],
) {
  const doc = new jsPDF({ orientation: 'portrait' });
  const sorted = [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  doc.setFontSize(15);
  doc.text(`Observaciones — Escuela Nº ${schoolNumber}`, 14, 16);
  doc.setFontSize(10);
  doc.text(`Generado: ${formatPdfDate(new Date().toISOString())}`, 14, 23);
  doc.text(`Total: ${sorted.length} observación(es)`, 14, 29);

  autoTable(doc, {
    startY: 34,
    head: [['Fecha', 'Autor', 'Observación']],
    body: sorted.map((c) => [
      formatPdfDate(c.created_at),
      c.author_label,
      c.body,
    ]),
    styles: { fontSize: 9, cellPadding: 2.5, overflow: 'linebreak' },
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 38 },
      2: { cellWidth: 'auto' },
    },
  });

  doc.save(`escuela-${schoolNumber}-observaciones.pdf`);
}
