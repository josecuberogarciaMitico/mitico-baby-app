import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AltaNivelInicialApp } from '../../core/enrolment/enrolmentTypes';
import {
  altasRespondidasSinAvisarApp,
  contarAltasPendientesRevisarApp,
  depurarAvisadasApp,
} from '../../core/enrolment/respondedNotice';

const CLAVE_AVISADAS = 'mitico_altas_respondidas_avisadas_v1';
const INTERVALO_MS = 60_000;
const MIN_ENTRE_CONSULTAS_MS = 5_000;

function leerAvisadas(): string[] {
  try {
    const valor = JSON.parse(window.localStorage.getItem(CLAVE_AVISADAS) || '[]');
    return Array.isArray(valor) ? valor.map(String) : [];
  } catch {
    return [];
  }
}

function guardarAvisadas(ids: string[]) {
  try {
    window.localStorage.setItem(CLAVE_AVISADAS, JSON.stringify(ids));
  } catch {
    // Sin almacenamiento (modo privado, etc.): el aviso seguirá funcionando
    // durante la sesión, solo que podría repetirse al recargar.
  }
}

export type AltasRespondidasAvisoApp = {
  pendientes: number;
  nuevas: AltaNivelInicialApp[];
  marcarVistas: () => void;
};

// Consulta en segundo plano las altas (misma RPC que la pantalla Altas / Test)
// para avisar cuando una familia responde el test. No toca el estado de la
// pantalla de Altas ni muestra errores: si la consulta falla, se reintenta
// en el siguiente ciclo.
export function useAltasRespondidasAviso(input: {
  activo: boolean;
  altas: AltaNivelInicialApp[];
  obtener: () => Promise<AltaNivelInicialApp[]>;
}): AltasRespondidasAvisoApp {
  const { activo, altas } = input;
  const [snapshot, setSnapshot] = useState<AltaNivelInicialApp[] | null>(null);
  const [avisadas, setAvisadas] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : leerAvisadas()
  );
  const obtenerRef = useRef(input.obtener);
  obtenerRef.current = input.obtener;
  const consultandoRef = useRef(false);
  const ultimaConsultaRef = useRef(0);

  // Si la pantalla de Altas recarga la lista (Actualizar, validar, añadir...),
  // usamos esos datos para que el número del menú se actualice al momento.
  const primeraAltasRef = useRef(true);
  useEffect(() => {
    if (primeraAltasRef.current) {
      primeraAltasRef.current = false;
      return;
    }
    if (activo) setSnapshot(altas);
  }, [activo, altas]);

  useEffect(() => {
    if (!activo || typeof window === 'undefined') return;
    let cancelado = false;

    const consultar = async () => {
      if (document.visibilityState === 'hidden') return;
      const ahora = Date.now();
      if (consultandoRef.current || ahora - ultimaConsultaRef.current < MIN_ENTRE_CONSULTAS_MS) {
        return;
      }
      consultandoRef.current = true;
      ultimaConsultaRef.current = ahora;
      try {
        const datos = await obtenerRef.current();
        if (!cancelado && Array.isArray(datos)) setSnapshot(datos);
      } catch {
        // Silencioso a propósito.
      } finally {
        consultandoRef.current = false;
      }
    };

    const alVolver = () => {
      if (document.visibilityState === 'visible') void consultar();
    };

    void consultar();
    const intervalo = window.setInterval(() => void consultar(), INTERVALO_MS);
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', alVolver);
    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', alVolver);
    };
  }, [activo]);

  const avisadasSet = useMemo(() => new Set(avisadas), [avisadas]);
  const nuevas = useMemo(
    () => (activo && snapshot ? altasRespondidasSinAvisarApp(snapshot, avisadasSet) : []),
    [activo, snapshot, avisadasSet]
  );
  const pendientes = activo && snapshot ? contarAltasPendientesRevisarApp(snapshot) : 0;

  const marcarVistas = useCallback(() => {
    if (!snapshot || nuevas.length === 0) return;
    const siguiente = depurarAvisadasApp(
      [...avisadas, ...nuevas.map((alta) => alta.id)],
      snapshot
    );
    setAvisadas(siguiente);
    guardarAvisadas(siguiente);
  }, [avisadas, nuevas, snapshot]);

  return { pendientes, nuevas, marcarVistas };
}
