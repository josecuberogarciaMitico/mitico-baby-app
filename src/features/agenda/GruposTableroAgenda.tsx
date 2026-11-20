// 19/11/2026 (Jose): «la forma de ver los grupos me ralla, mil scroll y se ve tosco».
// Tablero en columnas para «Organizar»: todos los grupos del turno a la vista,
// un niño por línea, mover arrastrando o con ⋯. No guarda nada por sí mismo:
// cada acción llama a las mismas funciones de siempre (las pasa AgendaScreen).
// «⚙ Ajustes» y «Trabajo y obs.» abren la tarjeta completa de siempre.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './GruposTablero.css';

export type NinoTablero = {
  clave: string;
  alumnoId: string | null;
  nombre: string;
  nivel: string | null;
  edad: number | string | null;
  /** Solo Intensivos: texto de asistencia y si «No viene» está marcado. */
  asistencia?: string | null;
  noViene?: boolean;
  puedeMarcarNoViene?: boolean;
  /** Enlace de WhatsApp de la familia (si la ficha tiene teléfono). */
  whatsapp?: string | null;
};

export type GrupoTablero = {
  id: string;
  titulo: string;
  niveles: string;
  pista: 'grande' | 'pequena' | 'otra';
  pistaTexto: string;
  punto: string;
  entrenadores: string;
  sinEntrenador: boolean;
  estado: string;
  publicado: boolean;
  aviso: string | null;
  intensivo: boolean;
  puedeGrupoNuevo: boolean;
  ninos: NinoTablero[];
};

type Props = {
  grupos: GrupoTablero[];
  cargando: boolean;
  onMover: (grupoOrigenId: string, alumnoId: string, grupoDestinoId: string) => void;
  onGrupoNuevo: (grupoId: string, alumnoId: string) => void;
  onQuitar: (grupoId: string, alumnoId: string) => void;
  onNoViene: (grupoId: string, alumnoId: string, noVieneAhora: boolean) => void;
  onAjustes: (grupoId: string) => void;
  onTrabajo: (grupoId: string) => void;
  /** Grupo cuya tarjeta completa está abierta debajo (se resalta). */
  grupoAbierto?: string | null;
};

type Menu = { grupoId: string; nino: NinoTablero; top: number; left: number; arriba: number; abajo: number };

export function GruposTableroAgenda({ grupos, cargando, grupoAbierto, onMover, onGrupoNuevo, onQuitar, onNoViene, onAjustes, onTrabajo }: Props) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [arrastre, setArrastre] = useState<{ grupoId: string; alumnoId: string } | null>(null);
  const [sobre, setSobre] = useState<string | null>(null);

  useEffect(() => {
    if (!menu) return;
    const cerrar = () => setMenu(null);
    // El scroll de dentro del propio menú (si es largo) no lo cierra.
    const alHacerScroll = (e: Event) => {
      if (e.target instanceof Node && document.querySelector('.gt-menu')?.contains(e.target)) return;
      setMenu(null);
    };
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    // Se escucha un instante después de abrir, para que el mismo clic que lo abre no lo cierre.
    const t = window.setTimeout(() => {
      window.addEventListener('click', cerrar);
      window.addEventListener('scroll', alHacerScroll, true);
    }, 150);
    window.addEventListener('keydown', tecla);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('click', cerrar);
      window.removeEventListener('scroll', alHacerScroll, true);
      window.removeEventListener('keydown', tecla);
    };
  }, [menu]);

  function abrirMenu(e: React.MouseEvent<HTMLButtonElement>, grupoId: string, nino: NinoTablero) {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    const ancho = 250;
    setMenu({
      grupoId,
      nino,
      top: r.bottom + 4,
      left: Math.max(8, Math.min(window.innerWidth - ancho - 8, r.right - ancho)),
      arriba: r.top,
      abajo: r.bottom,
    });
  }

  const grupoMenu = menu ? grupos.find((g) => g.id === menu.grupoId) : null;
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Si no cabe debajo del botón, se abre hacia arriba (niños al final de la pantalla).
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!menu || !el) return;
    const alto = el.offsetHeight;
    const debajo = menu.abajo + 4;
    const top = debajo + alto <= window.innerHeight - 8 ? debajo : Math.max(8, menu.arriba - alto - 4);
    if (Math.abs(top - menu.top) > 1) setMenu({ ...menu, top });
  }, [menu]);

  return (
    <div className="gt-tablero">
      {grupos.map((g) => (
        <section
          key={g.id}
          className={`gt-col gt-col--${g.pista}${sobre === g.id ? ' is-sobre' : ''}${grupoAbierto === g.id ? ' is-abierto' : ''}`}
          onDragOver={(e) => {
            if (!arrastre || arrastre.grupoId === g.id) return;
            e.preventDefault();
            if (sobre !== g.id) setSobre(g.id);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSobre(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setSobre(null);
            if (arrastre && arrastre.grupoId !== g.id && !cargando) onMover(arrastre.grupoId, arrastre.alumnoId, g.id);
            setArrastre(null);
          }}
        >
          <div className="gt-barra" />
          <header className="gt-cab">
            <div className="gt-titulo">
              <b>{g.titulo}</b>
              <span className="gt-niveles">{g.niveles}</span>
              <span className="gt-num">{g.ninos.length} {g.ninos.length === 1 ? 'niño' : 'niños'}</span>
            </div>
            <div className="gt-meta">
              <span className="gt-pista">{g.pistaTexto}</span>
              <span>{g.punto}</span>
              <span className={g.sinEntrenador ? 'gt-falta' : ''}>· {g.entrenadores}</span>
              <span className={`gt-estado${g.publicado ? ' is-pub' : ''}`}>{g.publicado ? `✓ ${g.estado}` : g.estado}</span>
            </div>
          </header>
          {g.aviso && <div className="gt-aviso">⚠️ {g.aviso}</div>}
          <ul className="gt-ninos">
            {g.ninos.map((n) => (
              <li
                key={n.clave}
                className={`gt-nino${n.noViene ? ' is-noviene' : ''}`}
                draggable={Boolean(n.alumnoId) && !cargando}
                onDragStart={(e) => {
                  if (!n.alumnoId) return;
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', n.nombre);
                  setArrastre({ grupoId: g.id, alumnoId: n.alumnoId });
                }}
                onDragEnd={() => { setArrastre(null); setSobre(null); }}
              >
                <span className="gt-nombre" title={n.whatsapp ? `WhatsApp a la familia de ${n.nombre}` : n.nombre}>
                  {n.whatsapp ? (
                    <a className="gt-wa" href={n.whatsapp} target="_blank" rel="noreferrer" draggable={false}>
                      {n.nombre}
                    </a>
                  ) : (
                    n.nombre
                  )}
                  {n.asistencia && <small className="gt-asis">{n.asistencia}</small>}
                </span>
                {n.nivel && <span className="gt-nivel">{n.nivel}</span>}
                <span className="gt-edad">{n.edad !== null && n.edad !== undefined && n.edad !== '' ? n.edad : ''}</span>
                {n.alumnoId && (
                  <button type="button" className="gt-mas" aria-label={`Opciones de ${n.nombre}`} disabled={cargando} onClick={(e) => abrirMenu(e, g.id, n)}>
                    ⋯
                  </button>
                )}
              </li>
            ))}
            {g.ninos.length === 0 && <li className="gt-vacio">Sin niños</li>}
          </ul>
          <footer className="gt-pie">
            <button type="button" onClick={() => onAjustes(g.id)}>⚙ Ajustes</button>
            <button type="button" onClick={() => onTrabajo(g.id)}>Trabajo y obs.</button>
          </footer>
        </section>
      ))}

      {menu && grupoMenu && menu.nino.alumnoId && createPortal(
        <div ref={menuRef} className="gt-menu" style={{ top: menu.top, left: menu.left }} onClick={(e) => e.stopPropagation()}>
          <div className="gt-menu-nombre">{menu.nino.nombre}</div>
          {grupos.some((d) => d.id !== menu.grupoId) && <div className="gt-menu-lbl">Mover a</div>}
          {grupos
            .filter((d) => d.id !== menu.grupoId)
            .map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => { setMenu(null); onMover(menu.grupoId, menu.nino.alumnoId as string, d.id); }}
              >
                {d.titulo} · {d.niveles} · {d.ninos.length}
              </button>
            ))}
          {grupoMenu.puedeGrupoNuevo && (
            <button type="button" onClick={() => { setMenu(null); onGrupoNuevo(menu.grupoId, menu.nino.alumnoId as string); }}>
              ➕ Grupo nuevo con este niño
            </button>
          )}
          <div className="gt-menu-lbl">Más</div>
          {grupoMenu.intensivo ? (
            menu.nino.puedeMarcarNoViene && (
              <button
                type="button"
                className={menu.nino.noViene ? '' : 'is-peligro'}
                onClick={() => { setMenu(null); onNoViene(menu.grupoId, menu.nino.alumnoId as string, Boolean(menu.nino.noViene)); }}
              >
                {menu.nino.noViene ? 'Vuelve a venir' : 'No viene'}
              </button>
            )
          ) : (
            <button type="button" className="is-peligro" onClick={() => { setMenu(null); onQuitar(menu.grupoId, menu.nino.alumnoId as string); }}>
              Quitar de esta sesión
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

/** «SOFIA ESCARIO ARES» → «Sofia Escario Ares» (más fácil de leer en columnas estrechas). */
export function nombreTablero(nombre: string): string {
  return String(nombre || '')
    .trim()
    .toLowerCase()
    .replace(/(^|[\s\-'])(\p{L})/gu, (_m, sep: string, letra: string) => sep + letra.toUpperCase())
    .replace(/\b(De|Del|La|Las|Los|Y)\b/g, (p) => p.toLowerCase())
    .replace(/^(\p{L})/u, (l) => l.toUpperCase());
}

/**
 * En el tablero, «⚙ Ajustes» y «Trabajo y obs.» enseñan la tarjeta completa de
 * siempre justo debajo del tablero (mismo sitio y mismos estilos que antes, sin
 * ventanas flotantes), con «✕ Cerrar» para volver al tablero.
 * Con «Ver como antes» (activa = false) la lista se pinta como siempre.
 */
export function VentanaAjustesTablero({ activa, titulo, onCerrar, children }: {
  activa: boolean; titulo: string; onCerrar: () => void; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!activa) return;
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [activa, titulo]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!activa) return <>{children}</>;
  return (
    <>
      <div ref={ref} className="gt-ajustes-cab">
        <b>⚙ {titulo}</b>
        <button type="button" onClick={onCerrar}>✕ Cerrar y volver al tablero</button>
      </div>
      {children}
      <div className="gt-ajustes-pie">
        <button type="button" onClick={onCerrar}>✕ Cerrar y volver al tablero</button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// 19/11/2026 (Jose): Paso 3 «Publicar» en lista compacta, un grupo por línea.
// Mismas acciones de siempre (las pasa AgendaScreen): publicar, avisar cambios
// y, en ⋯, retirar de Vista entrenador y ver el grupo completo.

export type GrupoPublicarFila = {
  id: string;
  titulo: string;
  niveles: string;
  detalle: string;
  pista: 'grande' | 'pequena' | 'otra';
  entrenadores: string;
  sinEntrenador: boolean;
  publicado: boolean;
  confirmado: boolean;
  listo: boolean;
  falta: string | null;
  aviso: string | null;
};

export function PublicarListaAgenda({ grupos, cargando, onPublicar, onAvisarCambios, onRetirar, onVerGrupo }: {
  grupos: GrupoPublicarFila[];
  cargando: boolean;
  onPublicar: (grupoId: string) => void;
  onAvisarCambios: (grupoId: string) => void;
  onRetirar: (grupoId: string) => void;
  onVerGrupo: (grupoId: string) => void;
}) {
  const [menu, setMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  useEffect(() => {
    if (!menu) return;
    const cerrar = () => setMenu(null);
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    const t = window.setTimeout(() => {
      window.addEventListener('click', cerrar);
      window.addEventListener('scroll', cerrar, true);
    }, 150);
    window.addEventListener('keydown', tecla);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('click', cerrar);
      window.removeEventListener('scroll', cerrar, true);
      window.removeEventListener('keydown', tecla);
    };
  }, [menu]);
  const grupoMenu = menu ? grupos.find((g) => g.id === menu.id) : null;

  return (
    <div className="gp-lista">
      {grupos.map((g) => (
        <div key={g.id} className={`gp-fila gp-fila--${g.pista}`}>
          <div className="gp-grupo">
            <b>{g.titulo} <span className="gp-niveles">{g.niveles}</span></b>
            <small>{g.detalle}</small>
          </div>
          <div className={`gp-ent${g.sinEntrenador ? ' is-falta' : ''}`}>{g.entrenadores}</div>
          <div className="gp-estado">
            {g.publicado ? (
              <>
                <span className="gp-chip is-pub">✓ Publicado</span>
                <span className={`gp-chip ${g.confirmado ? 'is-conf' : 'is-pend'}`}>{g.confirmado ? 'Confirmado' : 'Sin confirmar'}</span>
              </>
            ) : g.listo ? (
              <span className="gp-chip is-listo">Listo para publicar</span>
            ) : (
              <span className="gp-chip is-no" title={g.falta || ''}>{g.falta || 'Pendiente de completar'}</span>
            )}
            {g.aviso && <span className="gp-chip is-aviso" title={g.aviso}>⚠️ {g.aviso}</span>}
          </div>
          <div className="gp-acciones">
            {!g.publicado && (
              <button type="button" className="gp-btn is-pri" disabled={cargando || !g.listo} title={g.listo ? 'Publicar este grupo en Vista entrenador' : g.falta || ''} onClick={() => onPublicar(g.id)}>
                Publicar
              </button>
            )}
            {g.publicado && g.confirmado && (
              <button type="button" className="gp-btn" disabled={cargando} title="El entrenador ya había confirmado. Úsalo si el grupo ha cambiado y debe volver a confirmar." onClick={() => onAvisarCambios(g.id)}>
                Avisar cambios
              </button>
            )}
            <button
              type="button"
              className="gt-mas"
              aria-label={`Más opciones de ${g.titulo}`}
              onClick={(e) => {
                e.stopPropagation();
                const r = e.currentTarget.getBoundingClientRect();
                setMenu({ id: g.id, top: Math.min(r.bottom + 4, window.innerHeight - 110), left: Math.max(8, r.right - 240) });
              }}
            >
              ⋯
            </button>
          </div>
        </div>
      ))}
      {menu && grupoMenu && createPortal(
        <div className="gt-menu" style={{ top: menu.top, left: menu.left, width: 240 }} onClick={(e) => e.stopPropagation()}>
          <div className="gt-menu-nombre">{grupoMenu.titulo} · {grupoMenu.niveles}</div>
          <button type="button" onClick={() => { setMenu(null); onVerGrupo(grupoMenu.id); }}>Ver grupo completo</button>
          {grupoMenu.publicado && (
            <button type="button" className="is-peligro" disabled={cargando} onClick={() => { setMenu(null); onRetirar(grupoMenu.id); }}>
              Retirar de Vista entrenador
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

/** Cabecera de la sesión: cifras en una fila de etiquetas (antes, 5 cajas grandes). */
export function CifrasSesionAgenda({ cifras }: {
  cifras: Array<{ clave: string; valor: number; texto: string; tono?: 'ok' | 'aviso'; onClick: () => void }>;
}) {
  return (
    <div className="gs-cifras">
      {cifras.map((c) => (
        <button key={c.clave} type="button" className={`gs-cifra${c.tono ? ` is-${c.tono}` : ''}`} onClick={c.onClick}>
          <b>{c.valor}</b> {c.texto}
        </button>
      ))}
    </div>
  );
}
