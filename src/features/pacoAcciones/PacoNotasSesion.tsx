import { useEffect, useState } from 'react';
import { cerrarNotaPaco, notasPacoDeSesion, type NotaPacoSesion } from './pacoNotasService';
import './PacoNotasSesion.css';

type Props = {
  sesionId: string;
  // Cambia cuando cambian los grupos o los niños del turno: se vuelve a mirar.
  firma: string;
};

// Memoria de Paco en la Agenda: al abrir un turno, recuerda lo que Jose apuntó
// de los niños que están en él. En rojo si el niño está en el grupo de un
// entrenador con el que la familia tiene un problema.
export function PacoNotasSesion({ sesionId, firma }: Props) {
  const [notas, setNotas] = useState<NotaPacoSesion[]>([]);
  const [cerrando, setCerrando] = useState('');

  useEffect(() => {
    let vigente = true;
    if (!sesionId) {
      setNotas([]);
      return;
    }
    notasPacoDeSesion(sesionId)
      .then((filas) => {
        if (vigente) setNotas(filas);
      })
      .catch(() => {
        if (vigente) setNotas([]);
      });
    return () => {
      vigente = false;
    };
  }, [sesionId, firma]);

  if (!notas.length) return null;

  const hecho = async (nota: NotaPacoSesion) => {
    setCerrando(nota.id);
    try {
      await cerrarNotaPaco(nota.id);
      setNotas((actuales) => actuales.filter((n) => n.id !== nota.id));
    } catch {
      // Si falla se queda visible; no se pierde nada.
    } finally {
      setCerrando('');
    }
  };

  return (
    <section className="paco-notas" aria-label="Notas de Paco sobre niños de este turno">
      <span className="paco-notas__kicker">📝 Paco te recuerda</span>
      <ul className="paco-notas__lista">
        {notas.map((n) => (
          <li key={`${n.id}:${n.grupo || ''}`} className={`paco-notas__fila${n.conflicto ? ' paco-notas__fila--conflicto' : ''}`}>
            <div className="paco-notas__texto">
              <strong>{n.alumno}</strong>
              <span>
                {n.conflicto ? `⚠️ Está en «${n.grupo}» con ${n.entrenador}. ` : ''}
                {n.texto}
                {n.una_vez ? ' · solo esta vez' : ''}
              </span>
            </div>
            {n.una_vez && (
              <button
                type="button"
                className="paco-notas__hecho"
                disabled={cerrando === n.id}
                onClick={() => void hecho(n)}
              >
                {cerrando === n.id ? '…' : 'Hecho'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
