import type { PaysanduSchoolRow } from '@/types/paysandu-school';

type ComedorLinkRow = Pick<
  PaysanduSchoolRow,
  'school_number' | 'comparte_comedor_con' | 'comedor_administrado_por'
>;

/** Obtiene la escuela pareja del comedor compartido (si existe). */
export function getComedorPartner(
  schoolNumber: number,
  rows: ComedorLinkRow[],
): number | null {
  const self = rows.find((r) => r.school_number === schoolNumber);
  const forward = self?.comparte_comedor_con ?? null;
  const reverse =
    rows.find((r) => r.comparte_comedor_con === schoolNumber)?.school_number ?? null;

  if (forward != null) return forward;
  return reverse;
}

export function isComedorPaired(schoolNumber: number, rows: ComedorLinkRow[]): boolean {
  return getComedorPartner(schoolNumber, rows) != null;
}

/** Valor mostrado en el select de administrador. */
export function getComedorAdministradoPor(
  row: ComedorLinkRow,
  partner: number | null,
): number | null {
  if (row.comedor_administrado_por != null) return row.comedor_administrado_por;
  if (partner == null) return null;
  if (row.comparte_comedor_con === partner) return partner;
  if (row.comparte_comedor_con === row.school_number) return row.school_number;
  return null;
}

export type ComedorPairPatch = {
  comparte_comedor_con: number | null;
  comedor_administrado_por: number | null;
};

/** Actualiza ambas escuelas del par al elegir o invertir el administrador. */
export function buildComedorPairPatches(
  schoolNumber: number,
  partner: number,
  administradoPor: number | null,
): Record<number, ComedorPairPatch> {
  if (administradoPor == null) {
    return {
      [schoolNumber]: { comparte_comedor_con: null, comedor_administrado_por: null },
      [partner]: { comparte_comedor_con: null, comedor_administrado_por: null },
    };
  }

  if (administradoPor !== schoolNumber && administradoPor !== partner) {
    return {};
  }

  return {
    [schoolNumber]: {
      comparte_comedor_con: partner,
      comedor_administrado_por: administradoPor,
    },
    [partner]: {
      comparte_comedor_con: schoolNumber,
      comedor_administrado_por: administradoPor,
    },
  };
}
