// FF / Corporate para Xanadú (23/11/2026). Lógica pura, sin React.
// Por día y turno: cuántos niños van a pista grande (FF, se paga forfait) y a
// pista pequeña (Corporate, se paga instalación). «Previsto» = niños del grupo;
// «Real» = los marcados como «Presente». Solo cuentan Baby e Intensivos.

export type TipoPase = 'ff' | 'corporate' | 'sin_pista';

/** Pista grande (también los grupos mixtos «Pequeña/Grande») = FF; pequeña = Corporate. */
export function tipoPasePista(pista: string | null | undefined): TipoPase {
  const t = String(pista || '').toLowerCase();
  if (t.includes('grande')) return 'ff';
  if (t.includes('peque')) return 'corporate';
  return 'sin_pista';
}

/** Solo Baby e Intensivos (Ocio y el resto no se pasan a Xanadú). */
export function cuentaParaXanadu(modalidad: string | null | undefined): boolean {
  const m = String(modalidad || '').trim().toLowerCase();
  return m === 'baby' || m.startsWith('intensivo');
}

export type GrupoForfait = {
  pista: string | null | undefined;
  previstos: number;
  presentes: number;
  sinMarcar: number;
};

export type TurnoForfaitEntrada = {
  horaInicio: string;
  horaFin: string;
  modalidad: string | null | undefined;
  grupos: GrupoForfait[];
};

export type Cuenta = { previsto: number; real: number };
export type TurnoForfait = {
  turno: string;
  modalidades: string[];
  ff: Cuenta;
  corporate: Cuenta;
  sinPista: number;
  sinMarcar: number;
};
export type ResumenForfaits = {
  turnos: TurnoForfait[];
  total: { ff: Cuenta; corporate: Cuenta; sinPista: number; sinMarcar: number };
};

const hhmm = (h: string) => String(h || '').slice(0, 5);
const nombreModalidad = (m: string) => {
  const t = String(m || '').trim().toLowerCase();
  return t.startsWith('intensivo') ? 'Intensivos' : t === 'baby' ? 'Baby' : String(m || '').trim();
};

/** Agrupa por turno (hora inicio–fin), juntando las modalidades que coinciden. */
export function calcularForfaitsDia(entradas: TurnoForfaitEntrada[]): ResumenForfaits {
  const mapa = new Map<string, TurnoForfait>();
  for (const e of entradas) {
    if (!cuentaParaXanadu(e.modalidad)) continue;
    const turno = `${hhmm(e.horaInicio)}–${hhmm(e.horaFin)}`;
    const t = mapa.get(turno) || {
      turno,
      modalidades: [],
      ff: { previsto: 0, real: 0 },
      corporate: { previsto: 0, real: 0 },
      sinPista: 0,
      sinMarcar: 0,
    };
    const mod = nombreModalidad(String(e.modalidad || ''));
    if (mod && !t.modalidades.includes(mod)) t.modalidades.push(mod);
    for (const g of e.grupos) {
      const tipo = tipoPasePista(g.pista);
      const previstos = Math.max(0, Number(g.previstos) || 0);
      const presentes = Math.max(0, Number(g.presentes) || 0);
      if (tipo === 'sin_pista') t.sinPista += previstos;
      else {
        t[tipo].previsto += previstos;
        t[tipo].real += presentes;
      }
      t.sinMarcar += Math.max(0, Number(g.sinMarcar) || 0);
    }
    mapa.set(turno, t);
  }
  const turnos = [...mapa.values()].sort((a, b) => a.turno.localeCompare(b.turno));
  const total = turnos.reduce(
    (acc, t) => ({
      ff: { previsto: acc.ff.previsto + t.ff.previsto, real: acc.ff.real + t.ff.real },
      corporate: { previsto: acc.corporate.previsto + t.corporate.previsto, real: acc.corporate.real + t.corporate.real },
      sinPista: acc.sinPista + t.sinPista,
      sinMarcar: acc.sinMarcar + t.sinMarcar,
    }),
    { ff: { previsto: 0, real: 0 }, corporate: { previsto: 0, real: 0 }, sinPista: 0, sinMarcar: 0 }
  );
  return { turnos, total };
}

/** Mensaje para Mónica / Xanadú: totales por turno y del día, sin nombres. */
export function textoWhatsappForfaits(fechaTexto: string, r: ResumenForfaits, cual: 'real' | 'previsto' = 'real'): string {
  const lineas = [`FF / Corporate · ${fechaTexto}${cual === 'previsto' ? ' (previsto)' : ''}`];
  for (const t of r.turnos) {
    lineas.push(`${t.turno} (${t.modalidades.join(' + ')}): FF ${t.ff[cual]} · Corporate ${t.corporate[cual]}`);
  }
  if (r.turnos.length > 1) lineas.push(`Total día: FF ${r.total.ff[cual]} · Corporate ${r.total.corporate[cual]}`);
  return lineas.join('\n');
}

/** Avisos antes de enviar el real: niños sin marcar o grupos sin pista. */
export function avisosForfaits(r: ResumenForfaits): string[] {
  const avisos: string[] = [];
  if (r.total.sinMarcar > 0) {
    avisos.push(
      `${r.total.sinMarcar} ${r.total.sinMarcar === 1 ? 'niño sin marcar' : 'niños sin marcar'}: el «real» aún puede cambiar.`
    );
  }
  if (r.total.sinPista > 0) {
    avisos.push(`${r.total.sinPista} ${r.total.sinPista === 1 ? 'niño en un grupo' : 'niños en grupos'} sin pista: no cuentan ni como FF ni como Corporate.`);
  }
  return avisos;
}
