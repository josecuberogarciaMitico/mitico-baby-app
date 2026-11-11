// A+ preparados para la pista grande (11/11): lo último que se ha cargado de
// Supabase. Lo rellena el aviso de Entrenamientos y lo usa el recomendador de
// grupos (que es síncrono) para juntar a los «listos para la grande».

export type PreparadoGrande = {
  alumno_id: string;
  alumno: string;
  estado: 'listo' | 'casi';
  motivo: string;
  fecha: string | null;
  fuente: 'entrenador' | 'habilidades';
};

let actuales = new Map<string, PreparadoGrande>();

export function ponerPreparadosGrande(filas: PreparadoGrande[]) {
  actuales = new Map(filas.map((f) => [f.alumno_id, f]));
}

export function preparadosGrandeActuales(): Map<string, PreparadoGrande> {
  return actuales;
}
