import { useEffect, useRef, useState } from 'react';
import type { VolcadoAlumnoIntensivoApp } from './intensiveTypes';

// Tras pegar el listado de AimHarder en un intensivo, los niños sin ficha
// quedan "pendientes de Alta/Test". Este hook:
//  1) busca su fecha de nacimiento y teléfono en la copia de AimHarder
//     (RPC aimharder_contacto_alumno_app, la misma que usa Alta/Test);
//  2) permite crear su Alta/Test de modalidad INTENSIVOS
//     (RPC crear_alta_nivel_inicial_app, la misma del formulario de Altas).
// No cambia nada en Supabase más allá de lo que ya hacen esas dos funciones.

export type ContactoAimHarderIntensivo = {
  estado: 'buscando' | 'encontrado' | 'no_encontrado' | 'varios' | 'error';
  fechaNacimiento?: string | null;
  telefono?: string | null;
};

export type AltaTestIntensivoEstado = {
  estado: 'creando' | 'creado' | 'ya_existe' | 'error';
  detalle?: string;
};

type Dependencias = {
  resultadoVolcado: VolcadoAlumnoIntensivoApp[];
  ejecutarFuncionAuthJson: <T>(nombre: string, body: object) => Promise<T>;
  alCrearAltas?: () => Promise<void> | void;
};

type FilaContacto = {
  nombre: string | null;
  fecha_nacimiento: string | null;
  telefono: string | null;
  coincidencias: number | null;
};

type PosibleExistente = { fuente: string; motivo: string; estado: string | null };

export function useIntensivoAltasTest({
  resultadoVolcado,
  ejecutarFuncionAuthJson,
  alCrearAltas,
}: Dependencias) {
  const [contactos, setContactos] = useState<Record<string, ContactoAimHarderIntensivo>>({});
  const [altas, setAltas] = useState<Record<string, AltaTestIntensivoEstado>>({});
  const buscados = useRef<Set<string>>(new Set());

  const nombresSinFicha = resultadoVolcado
    .filter((registro) => registro.resultado !== 'EXISTENTE')
    .map((registro) => registro.alumno);

  useEffect(() => {
    const pendientes = nombresSinFicha.filter((nombre) => !buscados.current.has(nombre));
    if (pendientes.length === 0) return;
    pendientes.forEach((nombre) => buscados.current.add(nombre));
    setContactos((actual) => {
      const copia = { ...actual };
      pendientes.forEach((nombre) => (copia[nombre] = { estado: 'buscando' }));
      return copia;
    });

    (async () => {
      for (const nombre of pendientes) {
        let resultado: ContactoAimHarderIntensivo;
        try {
          const filas = await ejecutarFuncionAuthJson<FilaContacto[]>(
            'aimharder_contacto_alumno_app',
            { p_nombre: nombre }
          );
          const fila = Array.isArray(filas) ? filas[0] : null;
          const coincidencias = Number(fila?.coincidencias || 0);
          resultado =
            coincidencias === 1
              ? {
                  estado: 'encontrado',
                  fechaNacimiento: fila?.fecha_nacimiento || null,
                  telefono: fila?.telefono || null,
                }
              : { estado: coincidencias > 1 ? 'varios' : 'no_encontrado' };
        } catch {
          resultado = { estado: 'error' };
        }
        setContactos((actual) => ({ ...actual, [nombre]: resultado }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultadoVolcado]);

  function puedeCrearAlta(nombre: string) {
    const contacto = contactos[nombre];
    const alta = altas[nombre];
    return (
      contacto?.estado === 'encontrado' &&
      Boolean(contacto.fechaNacimiento) &&
      Boolean(String(contacto.telefono || '').trim()) &&
      (!alta || alta.estado === 'error')
    );
  }

  async function crearUna(nombre: string): Promise<AltaTestIntensivoEstado> {
    const contacto = contactos[nombre];
    if (!contacto?.fechaNacimiento || !contacto.telefono) {
      return { estado: 'error', detalle: 'Faltan fecha de nacimiento o teléfono.' };
    }
    try {
      const posibles =
        (await ejecutarFuncionAuthJson<PosibleExistente[]>(
          'comprobar_posibles_alumnos_nueva_alta_app',
          { p_nombre_completo: nombre, p_fecha_nacimiento: contacto.fechaNacimiento }
        )) || [];
      const exacto = posibles.find((item) => item.motivo === 'NOMBRE_EXACTO');
      if (exacto) {
        return {
          estado: 'ya_existe',
          detalle:
            exacto.fuente === 'ALTA_TEST'
              ? `Ya tiene Alta/Test (${exacto.estado || 'existente'})`
              : 'Ya tiene ficha activa',
        };
      }
      await ejecutarFuncionAuthJson<string>('crear_alta_nivel_inicial_app', {
        p_nombre_completo: nombre,
        p_fecha_nacimiento: contacto.fechaNacimiento,
        p_modalidad: 'INTENSIVOS',
        p_telefono: contacto.telefono,
        p_ocio_dia_fijo: null,
      });
      return { estado: 'creado' };
    } catch (err) {
      return {
        estado: 'error',
        detalle: err instanceof Error ? err.message : 'No se pudo crear el Alta/Test.',
      };
    }
  }

  async function crearAltasTestIntensivo(nombres: string[]) {
    const aptos = nombres.filter(puedeCrearAlta);
    if (aptos.length === 0) return;
    const confirmar = window.confirm(
      aptos.length === 1
        ? `¿Crear el Alta/Test de ${aptos[0]} (Intensivos)?`
        : `¿Crear ${aptos.length} Altas/Test de Intensivos con los datos de AimHarder?`
    );
    if (!confirmar) return;

    setAltas((actual) => {
      const copia = { ...actual };
      aptos.forEach((nombre) => (copia[nombre] = { estado: 'creando' }));
      return copia;
    });
    for (const nombre of aptos) {
      const resultado = await crearUna(nombre);
      setAltas((actual) => ({ ...actual, [nombre]: resultado }));
    }
    try {
      await alCrearAltas?.();
    } catch {
      // Recargar el listado de Altas es secundario: si falla, no se bloquea nada.
    }
  }

  function reiniciarAltasTestIntensivo() {
    buscados.current = new Set();
    setContactos({});
    setAltas({});
  }

  return {
    contactosAimHarderIntensivo: contactos,
    altasTestIntensivo: altas,
    nombresSinFichaVolcado: nombresSinFicha,
    puedeCrearAltaTestIntensivo: puedeCrearAlta,
    crearAltasTestIntensivo,
    reiniciarAltasTestIntensivo,
  };
}
