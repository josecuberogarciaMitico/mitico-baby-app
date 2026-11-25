// 25/11: los 15 listados de Intensivos se pedían de nuevo en cada cambio de
// pantalla (Entrenamientos, Fichas, Ocio, Informes…). Con la base de datos
// pequeña, esas ráfagas provocaban «statement timeout». Al pasar por otras
// pantallas solo se vuelven a pedir si la última carga tiene más de 2 minutos.
// La pantalla de Intensivos y cualquier cambio en un intensivo siguen
// recargando siempre.
const VIGENCIA_MS = 2 * 60 * 1000;
let ultimaCarga = 0;

export function marcarIntensivosCargados(ahora: number = Date.now()) {
  ultimaCarga = ahora;
}

export function intensivosRecientes(ahora: number = Date.now()) {
  return ultimaCarga > 0 && ahora - ultimaCarga < VIGENCIA_MS;
}

export function olvidarCargaIntensivos() {
  ultimaCarga = 0;
}
