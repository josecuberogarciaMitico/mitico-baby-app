import { parsePastedRoster } from '../../core/imports/pastedRoster';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { stageManualOcioRoster } from '../aimharder/ocioAimHarderService';
import {
  armManualBabyRoster,
  clearManualBabyRoster,
  installManualBabyFetchAdapter,
  parseManualBabyDateFromText,
  parseManualBabyTimesFromText,
  stageManualBabyRoster,
} from './manualRosterSource';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';

const INTENSIVE_RESTORE_KEY = 'mitico_manual_intensivo_restore_v1';
const INSTALL_FLAG = '__MITICO_MANUAL_ROSTER_BRIDGE_INSTALLED__';

type OcioDay = 'Jueves' | 'Sábado' | 'Domingo';

type RestoreIntensive = {
  intensivoId: string;
  createdAt: number;
};

const OCIO_DAY_CONFIG: Record<OcioDay, { offset: number; start: string; end: string }> = {
  Jueves: { offset: 3, start: '18:00', end: '20:00' },
  Sábado: { offset: 5, start: '09:45', end: '11:45' },
  Domingo: { offset: 6, start: '12:00', end: '14:00' },
};

function normalizeText(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function buttonText(button: Element | null | undefined): string {
  return normalizeText(button?.textContent);
}

function isVisible(element: Element | null | undefined): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
}

function cloneButton(source: HTMLButtonElement, label: string): HTMLButtonElement {
  const button = source.cloneNode(false) as HTMLButtonElement;
  button.removeAttribute('id');
  button.removeAttribute('data-aimharder-native-button');
  button.removeAttribute('disabled');
  button.type = 'button';
  button.textContent = label;
  return button;
}

function createStatus(): HTMLDivElement {
  const status = document.createElement('div');
  status.style.display = 'none';
  status.style.marginTop = '8px';
  status.style.padding = '10px 12px';
  status.style.borderRadius = '10px';
  status.style.fontWeight = '750';
  status.style.fontSize = '13px';
  status.style.lineHeight = '1.4';
  return status;
}

function paintStatus(status: HTMLElement, text: string, error = false) {
  status.textContent = text;
  status.style.display = 'block';
  status.style.background = error ? '#fee2e2' : '#ecfdf5';
  status.style.color = error ? '#991b1b' : '#166534';
  status.style.border = error ? '1px solid #fecaca' : '1px solid #bbf7d0';
}

function createPasteArea(placeholder: string): HTMLTextAreaElement {
  const textarea = document.createElement('textarea');
  textarea.rows = 8;
  textarea.placeholder = placeholder;
  textarea.autocomplete = 'off';
  textarea.spellcheck = false;
  Object.assign(textarea.style, {
    width: '100%',
    minWidth: '0',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    padding: '11px 12px',
    background: '#fff',
    color: '#0f172a',
    font: 'inherit',
    lineHeight: '1.4',
    resize: 'vertical',
  });
  return textarea;
}

function setReactTextarea(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value'
  )?.set;
  if (setter) setter.call(textarea, value);
  else textarea.value = value;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('change', { bubbles: true }));
}

function dateFromAgendaForm(form: Element): string {
  const dateInput = form.querySelector<HTMLInputElement>('input[type="date"]');
  if (dateInput?.value) return dateInput.value.slice(0, 10);

  const text = form.textContent || '';
  const match =
    text.match(/D[ií]a seleccionado:\s*(\d{2})\/(\d{2})\/(\d{4})/i) ||
    text.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

function timesFromAgendaForm(form: Element): { start: string; end: string } {
  const times = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="time"]'));
  return {
    start: String(times[0]?.value || '').slice(0, 5),
    end: String(times[1]?.value || '').slice(0, 5),
  };
}

function emitManualBabyRoster(
  form: Element,
  attendees: Array<{ name: string; guest?: boolean }>
) {
  const { start, end } = timesFromAgendaForm(form);
  window.dispatchEvent(
    new CustomEvent('mitico:aimharder-attendees', {
      detail: {
        fecha: dateFromAgendaForm(form),
        inicio: start,
        fin: end,
        modalidad: 'BABY',
        asistentes: attendees.map((attendee) => ({
          name: attendee.name,
          phone: '',
          birthDate: '',
          clientId: '',
          guest: attendee.guest,
        })),
      },
    })
  );
}

function ensureBabyManualImport() {
  const autoButton = document.querySelector<HTMLButtonElement>(
    '[data-aimharder-native-button="1"]'
  );
  if (!autoButton || !isVisible(autoButton)) return;

  const form = autoButton.closest('#agenda-formulario-listado') || autoButton.closest('form');
  if (!form || form.querySelector('[data-manual-roster-action="baby"]')) return;
  const textarea = form.querySelector<HTMLTextAreaElement>('#agenda-textarea-listado');
  if (!textarea) return;

  const manualButton = cloneButton(autoButton, 'Procesar listado pegado');
  manualButton.dataset.manualRosterAction = 'baby';
  const status = createStatus();

  manualButton.addEventListener('click', () => {
    try {
      const date = dateFromAgendaForm(form);
      const { start, end } = timesFromAgendaForm(form);
      const staged = stageManualBabyRoster({
        date,
        start,
        end,
        rawText: textarea.value,
      });
      setReactTextarea(textarea, staged.names.join('\n'));
      emitManualBabyRoster(form, staged.attendees);
      const guestText = staged.guests > 0 ? ` · ${staged.guests} invitado(s)` : '';
      paintStatus(
        status,
        `✓ ${staged.names.length} alumno(s) detectados${guestText}. Al crear los grupos se usará este listado local sin consultar AimHarder.`
      );
    } catch (error) {
      paintStatus(
        status,
        error instanceof Error ? error.message : 'No se pudo procesar el listado pegado.',
        true
      );
      textarea.focus();
    }
  });

  const submitButton = Array.from(form.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => buttonText(button) === '1 · Volcar listado y crear sesión'
  );
  submitButton?.addEventListener('click', () => {
    // Solo se activa el adaptador local al pulsar el paso que realmente crea
    // esta sesión Baby. Cargar semana y las consultas automáticas siguen
    // saliendo a AimHarder salvo que el usuario haya elegido este flujo manual.
    armManualBabyRoster();
  });

  // Si el usuario decide usar el botón automático después de haber preparado
  // un listado manual, se descarta ese pendiente para que la consulta sea
  // realmente remota y no se mezclen los dos orígenes.
  autoButton.addEventListener('click', clearManualBabyRoster);

  autoButton.insertAdjacentElement('afterend', manualButton);
  manualButton.insertAdjacentElement('afterend', status);
}

function selectedAgendaDate(card?: Element | null): string {
  const dayContainer =
    card?.closest<HTMLElement>('#agenda-dia-seleccionado') ||
    document.querySelector<HTMLElement>('#agenda-dia-seleccionado');
  const heading = dayContainer?.querySelector<HTMLElement>('header h3, h3');
  return parseManualBabyDateFromText(
    card?.getAttribute('data-agenda-session-date'),
    heading?.textContent,
    dayContainer?.textContent
  );
}

function sessionCardTimes(card: Element): { start: string; end: string } {
  return parseManualBabyTimesFromText(
    card.getAttribute('data-agenda-session-time'),
    card.textContent,
    card.closest<HTMLElement>('#agenda-dia-seleccionado')?.textContent
  );
}

function ensureBabyRefreshManualImports() {
  const refreshButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).filter(
    (button) =>
      isVisible(button) &&
      (buttonText(button) === 'Refrescar listado' || buttonText(button) === 'Refrescando…')
  );

  refreshButtons.forEach((autoButton) => {
    const card = autoButton.closest<HTMLElement>('article');
    if (!card || card.querySelector('[data-manual-roster-action="baby-refresh"]')) return;

    const manualButton = cloneButton(autoButton, 'Pegar listado');
    manualButton.dataset.manualRosterAction = 'baby-refresh';
    const panel = document.createElement('div');
    panel.dataset.manualRosterPanel = 'baby-refresh';
    panel.style.display = 'none';
    panel.style.marginTop = '10px';
    panel.style.padding = '10px';
    panel.style.border = '1px solid #e2e8f0';
    panel.style.borderRadius = '12px';
    panel.style.background = '#f8fafc';

    const textarea = createPasteArea(
      'Pega el listado completo de este turno. Se usa para refrescar la misma sesión sin consultar AimHarder.'
    );
    const actionRow = document.createElement('div');
    Object.assign(actionRow.style, {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginTop: '8px',
    });
    const applyButton = cloneButton(autoButton, 'Refrescar con listado pegado');
    const closeButton = cloneButton(autoButton, 'Cerrar');
    const status = createStatus();

    manualButton.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display !== 'none') textarea.focus();
    });
    closeButton.addEventListener('click', () => {
      panel.style.display = 'none';
    });
    applyButton.addEventListener('click', () => {
      try {
        const date = selectedAgendaDate(card);
        const { start, end } = sessionCardTimes(card);
        if (!date) {
          throw new Error(
            'No puedo identificar la fecha de esta sesión Baby. Cierra y vuelve a abrir el día antes de pegar el listado.'
          );
        }
        if (!start || !end) {
          throw new Error(
            'No puedo identificar el horario de esta sesión Baby. No se ha modificado nada.'
          );
        }
        const staged = stageManualBabyRoster({
          date,
          start,
          end,
          rawText: textarea.value,
        });
        if (!armManualBabyRoster()) {
          throw new Error('No se pudo preparar el listado local para este turno Baby.');
        }
        const guestText = staged.guests > 0 ? ` · ${staged.guests} invitado(s)` : '';
        paintStatus(
          status,
          `✓ ${staged.names.length} alumno(s) detectados${guestText}. Refrescando la misma sesión…`
        );
        window.setTimeout(() => autoButton.click(), 30);
      } catch (error) {
        paintStatus(
          status,
          error instanceof Error ? error.message : 'No se pudo procesar el listado pegado.',
          true
        );
      }
    });

    actionRow.append(applyButton, closeButton);
    panel.append(textarea, actionRow, status);
    autoButton.insertAdjacentElement('afterend', manualButton);
    card.append(panel);
    card.dataset.manualRosterRefreshReady = '1';
  });
}

function addIsoDays(iso: string, days: number): string {
  const date = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function selectedOcioWeek(section: Element): string {
  const labels = Array.from(section.querySelectorAll('label'));
  const label = labels.find((item) => /Semana\s+lunes-domingo/i.test(item.textContent || ''));
  return String(label?.querySelector<HTMLSelectElement>('select')?.value || '').slice(0, 10);
}

function activeOcioDay(section: Element): OcioDay | '' {
  const headingMatch = String(section.textContent || '').match(
    /ESTRUCTURA\s+PERMANENTE\s*·\s*(Jueves|Sábado|Domingo)/i
  );
  if (headingMatch) {
    const normalized = headingMatch[1].toLowerCase();
    if (normalized === 'jueves') return 'Jueves';
    if (normalized === 'sábado') return 'Sábado';
    if (normalized === 'domingo') return 'Domingo';
  }

  const days = Object.keys(OCIO_DAY_CONFIG) as OcioDay[];
  for (const day of days) {
    const button = Array.from(section.querySelectorAll<HTMLButtonElement>('button')).find((item) =>
      buttonText(item).startsWith(day)
    );
    if (!button || !isVisible(button)) continue;
    const style = window.getComputedStyle(button);
    const background = style.backgroundColor.replace(/\s+/g, '');
    const border = style.borderColor.replace(/\s+/g, '');
    if (
      background.includes('16,185,129') ||
      border.includes('110,231,183') ||
      button.style.boxShadow.includes('rgba(0,0,0,.14)')
    ) {
      return day;
    }
  }
  return '';
}

function ensureOcioManualImport() {
  const autoButton = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => isVisible(button) && buttonText(button) === 'Actualizar AimHarder'
  );
  if (!autoButton) return;
  const article = autoButton.closest('article');
  const section = autoButton.closest('section');
  if (!article || !section || article.querySelector('[data-manual-roster-action="ocio"]')) return;

  const manualButton = cloneButton(autoButton, 'Pegar listado');
  manualButton.dataset.manualRosterAction = 'ocio';

  const panel = document.createElement('div');
  panel.dataset.manualRosterPanel = 'ocio';
  panel.style.display = 'none';
  panel.style.marginTop = '12px';
  panel.style.paddingTop = '12px';
  panel.style.borderTop = '1px solid #e2e8f0';

  const textarea = createPasteArea(
    'Pega aquí el bloque copiado de AimHarder tal cual: nombres, Reserva el, Última reserva, imágenes, [Invitado]…'
  );
  const actionRow = document.createElement('div');
  Object.assign(actionRow.style, {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '8px',
  });
  const applyButton = cloneButton(autoButton, 'Usar listado pegado');
  const closeButton = cloneButton(autoButton, 'Cerrar');
  const status = createStatus();
  const fallbackDay = document.createElement('select');
  fallbackDay.setAttribute('aria-label', 'Día de Ocio del listado pegado');
  fallbackDay.innerHTML =
    '<option value="">Seleccionar día</option><option>Jueves</option><option>Sábado</option><option>Domingo</option>';
  Object.assign(fallbackDay.style, {
    display: 'none',
    minHeight: '42px',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    padding: '8px 10px',
    background: '#fff',
    font: 'inherit',
  });

  manualButton.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display !== 'none') {
      const inferred = activeOcioDay(section);
      fallbackDay.value = inferred;
      fallbackDay.style.display = inferred ? 'none' : 'block';
      textarea.focus();
    }
  });
  closeButton.addEventListener('click', () => {
    panel.style.display = 'none';
  });

  applyButton.addEventListener('click', () => {
    try {
      const weekStart = selectedOcioWeek(section);
      const day = (activeOcioDay(section) || fallbackDay.value) as OcioDay | '';
      if (!weekStart) throw new Error('Selecciona primero la semana de Ocio.');
      if (!day || !OCIO_DAY_CONFIG[day]) {
        fallbackDay.style.display = 'block';
        throw new Error('Selecciona primero Jueves, Sábado o Domingo.');
      }

      const config = OCIO_DAY_CONFIG[day];
      const result = stageManualOcioRoster({
        weekStart,
        date: addIsoDays(weekStart, config.offset),
        start: config.start,
        end: config.end,
        rawText: textarea.value,
      });
      const guestText = result.guests > 0 ? ` · ${result.guests} invitado(s)` : '';
      paintStatus(
        status,
        `✓ ${result.total} alumno(s) detectados${guestText}. Cargando exactamente la misma vista de semana…`
      );
      window.setTimeout(() => autoButton.click(), 30);
    } catch (error) {
      paintStatus(
        status,
        error instanceof Error ? error.message : 'No se pudo procesar el listado pegado.',
        true
      );
    }
  });

  actionRow.append(applyButton, closeButton);
  panel.append(fallbackDay, textarea, actionRow, status);
  autoButton.insertAdjacentElement('afterend', manualButton);
  article.append(panel);
}

function intensivePanelContext(): {
  panel: HTMLElement;
  course: HTMLElement;
  intensivoId: string;
  title: string;
} | null {
  const heading = Array.from(document.querySelectorAll<HTMLElement>('h4')).find(
    (element) => isVisible(element) && /^Fichas\s*·/i.test(normalizeText(element.textContent))
  );
  if (!heading) return null;
  const panel = heading.closest<HTMLElement>('[id^="intensivo-panel-activo-"]');
  const course = heading.closest<HTMLElement>('[id^="intensivo-curso-"]');
  if (!panel || !course) return null;
  const intensivoId = course.id.replace(/^intensivo-curso-/, '').trim();
  if (!intensivoId) return null;
  return {
    panel,
    course,
    intensivoId,
    title: normalizeText(heading.textContent).replace(/^Fichas\s*·\s*/i, ''),
  };
}

function saveIntensiveRestore(intensivoId: string) {
  try {
    sessionStorage.setItem(
      INTENSIVE_RESTORE_KEY,
      JSON.stringify({ intensivoId, createdAt: Date.now() } satisfies RestoreIntensive)
    );
  } catch {
    // Si el navegador bloquea sessionStorage, la importación sigue siendo válida;
    // simplemente no podremos reabrir automáticamente la ficha tras recargar.
  }
}

function readIntensiveRestore(): RestoreIntensive | null {
  try {
    const raw = sessionStorage.getItem(INTENSIVE_RESTORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RestoreIntensive>;
    const intensivoId = String(parsed?.intensivoId || '').trim();
    const createdAt = Number(parsed?.createdAt || 0);
    if (!intensivoId || !Number.isFinite(createdAt) || Date.now() - createdAt > 120_000) {
      sessionStorage.removeItem(INTENSIVE_RESTORE_KEY);
      return null;
    }
    return { intensivoId, createdAt };
  } catch {
    return null;
  }
}

function clearIntensiveRestore() {
  try {
    sessionStorage.removeItem(INTENSIVE_RESTORE_KEY);
  } catch {
    // noop
  }
}

async function importIntensiveRoster(
  intensivoId: string,
  title: string,
  rawText: string
): Promise<number> {
  const parsed = parsePastedRoster(rawText);
  if (parsed.names.length === 0) {
    throw new Error('No he detectado ningún alumno válido en el listado pegado.');
  }
  if (parsed.duplicates.length > 0) {
    throw new Error(
      `El listado contiene nombres duplicados o indistinguibles: ${parsed.duplicates.join(', ')}.`
    );
  }
  if (
    !window.confirm(
      `¿Volcar ${parsed.names.length} alumno(s) en ${title || 'este intensivo'}? Se crearán fichas nuevas si no existen.`
    )
  ) {
    return 0;
  }

  const client = createSupabaseRestClient({
    supabaseUrl: SUPABASE_URL,
    publishableKey: SUPABASE_ANON_KEY,
    getAccessToken: obtenerAccessTokenSupabaseApp,
  });
  await client.rpcRows('volcar_alumnos_intensivo_app', {
    p_intensivo_id: intensivoId,
    p_texto: parsed.names.join('\n'),
  });
  return parsed.names.length;
}

function ensureIntensiveManualImport() {
  const context = intensivePanelContext();
  if (!context || context.panel.querySelector('[data-manual-roster-action="intensivo"]')) return;

  const sourceButton = Array.from(context.panel.querySelectorAll<HTMLButtonElement>('button')).find(
    (button) => isVisible(button)
  );
  if (!sourceButton) return;

  const manualButton = cloneButton(sourceButton, 'Pegar listado');
  manualButton.dataset.manualRosterAction = 'intensivo';
  const panel = document.createElement('div');
  panel.dataset.manualRosterPanel = 'intensivo';
  panel.style.display = 'none';
  panel.style.marginTop = '12px';
  panel.style.padding = '12px';
  panel.style.border = '1px solid #e2e8f0';
  panel.style.borderRadius = '14px';
  panel.style.background = '#f8fafc';

  const textarea = createPasteArea('Pega aquí el listado completo copiado de AimHarder.');
  const actionRow = document.createElement('div');
  Object.assign(actionRow.style, {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '8px',
  });
  const applyButton = cloneButton(sourceButton, 'Volcar listado');
  const closeButton = cloneButton(sourceButton, 'Cerrar');
  const status = createStatus();

  manualButton.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display !== 'none') textarea.focus();
  });
  closeButton.addEventListener('click', () => {
    panel.style.display = 'none';
  });
  applyButton.addEventListener('click', async () => {
    applyButton.disabled = true;
    try {
      const total = await importIntensiveRoster(
        context.intensivoId,
        context.title,
        textarea.value
      );
      if (total === 0) return;
      paintStatus(status, `✓ ${total} alumno(s) procesados. Actualizando la misma ficha del intensivo…`);
      saveIntensiveRestore(context.intensivoId);
      window.setTimeout(() => window.location.reload(), 200);
    } catch (error) {
      paintStatus(
        status,
        error instanceof Error ? error.message : 'No se pudo volcar el listado del intensivo.',
        true
      );
    } finally {
      applyButton.disabled = false;
    }
  });

  actionRow.append(applyButton, closeButton);
  panel.append(textarea, actionRow, status);

  const header = context.panel.firstElementChild;
  if (header) header.insertAdjacentElement('afterend', manualButton);
  else context.panel.prepend(manualButton);
  manualButton.insertAdjacentElement('afterend', panel);
}

function clickVisibleButtonByText(pattern: RegExp, root: ParentNode = document): boolean {
  const button = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
    (item) => isVisible(item) && pattern.test(buttonText(item))
  );
  if (!button) return false;
  button.click();
  return true;
}

function restoreIntensiveAfterReload() {
  const restore = readIntensiveRestore();
  if (!restore) return;
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const course = document.getElementById(`intensivo-curso-${restore.intensivoId}`);
    if (!course) {
      clickVisibleButtonByText(/^Intensivos$/i);
      if (attempts > 40) {
        clearInterval(timer);
        clearIntensiveRestore();
      }
      return;
    }

    const fichasHeading = Array.from(course.querySelectorAll<HTMLElement>('h4')).find(
      (item) => /^Fichas\s*·/i.test(normalizeText(item.textContent))
    );
    if (fichasHeading) {
      fichasHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      clearInterval(timer);
      clearIntensiveRestore();
      return;
    }

    if (clickVisibleButtonByText(/^Gestionar intensivo$/i, course)) return;
    clickVisibleButtonByText(/^2\s*·\s*Alumnos$/i, course);

    if (attempts > 40) {
      clearInterval(timer);
      clearIntensiveRestore();
    }
  }, 200);
}

function scan() {
  ensureBabyManualImport();
  ensureBabyRefreshManualImports();
  ensureOcioManualImport();
  ensureIntensiveManualImport();
}

export function installManualRosterBridge() {
  const globalWindow = window as typeof window & Record<string, unknown>;
  if (globalWindow[INSTALL_FLAG]) return;
  globalWindow[INSTALL_FLAG] = true;
  installManualBabyFetchAdapter();

  const start = () => {
    scan();
    restoreIntensiveAfterReload();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}

installManualRosterBridge();
