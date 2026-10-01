import { useSyncExternalStore } from 'react';

/**
 * Qué alumno tiene la ficha única abierta. Es un estado mínimo compartido para
 * poder abrir la misma ficha desde Fichas, Ocio, Intensivos o la Agenda sin
 * pasar más props por App.tsx.
 */
let alumnoAbierto: string | null = null;
const suscriptores = new Set<() => void>();

function avisar() {
  suscriptores.forEach((fn) => fn());
}

export function abrirFichaAlumno(alumnoId: string | null | undefined) {
  const id = String(alumnoId || '').trim();
  if (!id || id === alumnoAbierto) return;
  alumnoAbierto = id;
  avisar();
}

export function cerrarFichaAlumno() {
  if (alumnoAbierto === null) return;
  alumnoAbierto = null;
  avisar();
}

export function useFichaAlumnoAbierta(): string | null {
  return useSyncExternalStore(
    (fn) => {
      suscriptores.add(fn);
      return () => suscriptores.delete(fn);
    },
    () => alumnoAbierto,
    () => null
  );
}
