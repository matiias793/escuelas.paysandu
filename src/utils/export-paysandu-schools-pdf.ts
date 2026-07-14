import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  labelArea,
  labelComensalesSecundaria,
  labelServicio,
  labelTipo,
  PAYSANDU_SCHOOL_EXPORT_FILTER_LABELS,
} from '@/constants/paysandu-school-labels';
import type { PaysanduSchoolExportFilter, PaysanduSchoolRow } from '@/types/paysandu-school';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Montevideo',
  }).format(new Date(iso));
}

export function exportPaysanduSchoolsPdf(
  filter: PaysanduSchoolExportFilter,
  rows: PaysanduSchoolRow[],
) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const title = `Escuelas Paysandú — ${PAYSANDU_SCHOOL_EXPORT_FILTER_LABELS[filter]}`;

  doc.setFontSize(15);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.text(`Generado: ${formatDate(new Date().toISOString())}`, 14, 23);
  doc.text(`Total: ${rows.length} escuela(s)`, 14, 29);

  autoTable(doc, {
    startY: 34,
    head: [
      [
        'Nº',
        'Localidad',
        'Área',
        'Tipo',
        'Servicio alimentación',
        'Agua mineral',
        'Comensales secundaria (CBR / Liceo / UTU / CEI)',
        'Pareja comedor',
        'Administra comedor',
        'Foto fachada',
        'Google Maps',
      ],
    ],
    body: rows.map((r) => [
      String(r.school_number),
      r.nombre?.trim() || '—',
      labelArea(r.area),
      labelTipo(r.tipo),
      labelServicio(r.servicio_alimentacion),
      r.recibe_partida_agua_mineral ? 'Sí' : 'No',
      labelComensalesSecundaria(r.comensales_secundaria),
      r.comparte_comedor_con ? `Nº ${r.comparte_comedor_con}` : '—',
      r.comedor_administrado_por ? `Nº ${r.comedor_administrado_por}` : '—',
      r.facade_photo_path ? 'Sí' : 'No',
      r.google_maps_url?.trim() || '—',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  const slug = filter.replace(/_/g, '-');
  doc.save(`escuelas-paysandu-${slug}.pdf`);
}
