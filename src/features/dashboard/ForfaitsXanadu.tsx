import React from 'react';
import {
  avisosForfaits,
  calcularForfaitsDia,
  textoWhatsappForfaits,
  type TurnoForfaitEntrada,
} from './forfaitsDiaLogic';

// FF / Corporate para Xanadú (23/11/2026): botón en Trabajo en pista con el
// previsto y el real (niños marcados «Presente») por turno. Solo lectura.

type Props = {
  fecha: string; // AAAA-MM-DD
  entradas: TurnoForfaitEntrada[];
};

function fechaLarga(fecha: string) {
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  const dia = d.toLocaleDateString('es-ES', { weekday: 'long' });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function ForfaitsXanadu({ fecha, entradas }: Props) {
  const [abierto, setAbierto] = React.useState(false);
  const [copiado, setCopiado] = React.useState(false);
  const resumen = calcularForfaitsDia(entradas);
  const avisos = avisosForfaits(resumen);
  const texto = textoWhatsappForfaits(fechaLarga(fecha), resumen, 'real');

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt('Copia el texto', texto);
    }
  }

  return (
    <div className="pc-ff">
      <button type="button" className={`pc-ff-boton${abierto ? ' is-on' : ''}`} onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
        🎟️ FF / Corporate
      </button>
      {abierto && (
        <div className="pc-ff-panel">
          {resumen.turnos.length === 0 ? (
            <p className="pc-ff-vacio">Hoy no hay grupos publicados de Baby ni de Intensivos.</p>
          ) : (
            <>
              <table className="pc-ff-tabla">
                <thead>
                  <tr>
                    <th>Turno</th>
                    <th>FF<small>pista grande</small></th>
                    <th>Corporate<small>pista pequeña</small></th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.turnos.map((t) => (
                    <tr key={t.turno}>
                      <td>
                        <b>{t.turno}</b>
                        <small>{t.modalidades.join(' + ')}</small>
                      </td>
                      <td><b>{t.ff.real}</b><small>previsto {t.ff.previsto}</small></td>
                      <td><b>{t.corporate.real}</b><small>previsto {t.corporate.previsto}</small></td>
                    </tr>
                  ))}
                  {resumen.turnos.length > 1 && (
                    <tr className="pc-ff-total">
                      <td><b>Total día</b></td>
                      <td><b>{resumen.total.ff.real}</b><small>previsto {resumen.total.ff.previsto}</small></td>
                      <td><b>{resumen.total.corporate.real}</b><small>previsto {resumen.total.corporate.previsto}</small></td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className="pc-ff-nota">Real = niños marcados como presentes. Solo cuentan Baby e Intensivos.</p>
              {avisos.map((a) => (
                <p key={a} className="pc-ff-aviso">⚠️ {a}</p>
              ))}
              <div className="pc-ff-acciones">
                <a className="pc-ff-wa" href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noreferrer">
                  💬 Enviar real por WhatsApp
                </a>
                <button type="button" className="pc-ff-copiar" onClick={() => void copiar()}>
                  {copiado ? '✓ Copiado' : '📋 Copiar real'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
