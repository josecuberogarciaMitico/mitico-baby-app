import { useState, type CSSProperties, type FormEvent } from 'react';
import {
  actualizarPasswordInvitacionApp,
  limpiarUrlAuthApp,
  obtenerUsuarioAuthApp,
} from '../services/auth/authService';
import type { SesionAuthApp } from '../services/auth/authTypes';

const shell: CSSProperties = {
  minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 18,
  background: 'linear-gradient(135deg, #eaf3ff 0%, #f8fbff 42%, #ecfdf5 100%)', color: '#0f172a',
};
const card: CSSProperties = {
  width: '100%', maxWidth: 520, background: 'rgba(255,255,255,0.92)', border: '1px solid #dbeafe',
  borderRadius: 28, boxShadow: '0 24px 70px rgba(15,23,42,0.16)', padding: 24,
};
const input: CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 16,
  padding: '13px 14px', fontSize: 16,
};
const primaryButton: CSSProperties = {
  width: '100%', border: 0, borderRadius: 16, padding: '14px 18px', background: '#2563eb',
  color: '#fff', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: '0 14px 24px rgba(37,99,235,0.24)',
};
export const authShellApp = shell;
export const authCardApp = card;
const label: CSSProperties = { display: 'grid', gap: 7, fontWeight: 800, marginBottom: 12 };
const errorBox: CSSProperties = {
  background: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', borderRadius: 16,
  padding: 12, marginBottom: 12, fontWeight: 800,
};

function Header({ mode = 'login' }: { mode?: 'login' | 'invite' | 'recovery' }) {
  const passwordFlow = mode !== 'login';
  return <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
    <img src="/logo-cabecera-mitico.png" alt="Mítico Club" style={{ width: 64, height: 64, borderRadius: 18, objectFit: 'contain', background: '#fff', border: '1px solid #e5e7eb' }} />
    <div>
      <p style={{ margin: 0, color: passwordFlow ? '#16a34a' : '#2563eb', fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>
        {mode === 'recovery' ? 'Recuperación de acceso' : mode === 'invite' ? 'Invitación aceptada' : 'Acceso privado'}
      </p>
      <h1 style={{ margin: '4px 0 0', fontSize: 26 }}>{mode === 'recovery' ? 'Crea una contraseña nueva' : mode === 'invite' ? 'Crea tu contraseña' : 'Mítico Baby / Ocio'}</h1>
    </div>
  </div>;
}

export function PantallaLoginApp({ onLogin, onRecuperarPassword }: {
  onLogin: (email: string, password: string) => Promise<void>;
  onRecuperarPassword: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function recuperar() {
    setError(''); setMensaje('');
    if (!email.trim()) { setError('Escribe primero el email de tu cuenta.'); return; }
    try {
      setRecuperando(true); await onRecuperarPassword(email.trim());
      setMensaje('Te hemos enviado un email para crear una contraseña nueva. Revisa también spam o correo no deseado.');
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'No se ha podido enviar el email de recuperación.');
    } finally { setRecuperando(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!email.trim() || !password) { setError('Mete email y contraseña.'); return; }
    try { setCargando(true); await onLogin(email.trim(), password); }
    catch (cause: unknown) { setError(cause instanceof Error ? cause.message : 'No se ha podido iniciar sesión.'); }
    finally { setCargando(false); }
  }

  return <main style={shell}><form onSubmit={submit} style={card}>
    <Header />
    <p style={{ marginTop: 0, color: '#475569', lineHeight: 1.45 }}>Entra con tu email y contraseña. Si eres entrenador, solo verás tu panel de trabajo.</p>
    <label style={label}>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={input} placeholder="tu@email.com" autoComplete="email" /></label>
    <label style={{ ...label, marginBottom: 16 }}>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={input} placeholder="Contraseña" autoComplete="current-password" /></label>
    {error && <div style={errorBox}>{error}</div>}
    {mensaje && <div style={{ ...errorBox, background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0', lineHeight: 1.4 }}>{mensaje}</div>}
    <button type="submit" disabled={cargando || recuperando} style={{ ...primaryButton, opacity: cargando || recuperando ? 0.7 : 1 }}>{cargando ? 'Entrando...' : 'Entrar'}</button>
    <button type="button" disabled={cargando || recuperando} onClick={recuperar} style={{ width: '100%', marginTop: 10, border: '1px solid #bfdbfe', borderRadius: 16, padding: '13px 16px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 900, fontSize: 15, cursor: 'pointer', opacity: cargando || recuperando ? 0.7 : 1 }}>
      {recuperando ? 'Enviando recuperación...' : '¿Has olvidado tu contraseña?'}
    </button>
  </form></main>;
}

export function PantallaCrearPasswordApp({ sesionInvitacion, modo = 'invite', onCompletado }: {
  sesionInvitacion: SesionAuthApp; modo?: 'invite' | 'recovery';
  onCompletado: (session: SesionAuthApp) => Promise<void>;
}) {
  const [password, setPassword] = useState(''); const [repeat, setRepeat] = useState('');
  const [cargando, setCargando] = useState(false); const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (password.length < 8) { setError('La contraseña debe tener mínimo 8 caracteres.'); return; }
    if (password !== repeat) { setError('Las contraseñas no coinciden.'); return; }
    try {
      setCargando(true); await actualizarPasswordInvitacionApp(sesionInvitacion.access_token, password);
      const user = await obtenerUsuarioAuthApp(sesionInvitacion.access_token);
      await onCompletado({ ...sesionInvitacion, user }); limpiarUrlAuthApp();
    } catch (cause: unknown) { setError(cause instanceof Error ? cause.message : 'No se ha podido guardar la contraseña.'); }
    finally { setCargando(false); }
  }
  const recovery = modo === 'recovery';
  return <main style={shell}><form onSubmit={submit} style={card}>
    <Header mode={modo} />
    <p style={{ marginTop: 0, color: '#475569', lineHeight: 1.45 }}>{recovery ? 'Escribe una contraseña nueva. Después entrarás directamente en tu cuenta.' : 'Pon tu contraseña para entrar después con email y contraseña desde el móvil.'}</p>
    <label style={label}>Nueva contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={input} placeholder="Mínimo 8 caracteres" autoComplete="new-password" /></label>
    <label style={{ ...label, marginBottom: 16 }}>Repetir contraseña<input type="password" value={repeat} onChange={(event) => setRepeat(event.target.value)} style={input} placeholder="Repite la contraseña" autoComplete="new-password" /></label>
    {error && <div style={errorBox}>{error}</div>}
    <button type="submit" disabled={cargando} style={{ ...primaryButton, opacity: cargando ? 0.7 : 1 }}>{cargando ? 'Guardando...' : recovery ? 'Guardar contraseña nueva y entrar' : 'Guardar contraseña y entrar'}</button>
  </form></main>;
}

export function PantallaAuthErrorApp({ mensaje, onSalir }: { mensaje: string; onSalir: () => void }) {
  return <main style={shell}><section style={card}>
    <h1 style={{ marginTop: 0 }}>Acceso pendiente de configurar</h1>
    <p style={{ color: '#475569', lineHeight: 1.45 }}>{mensaje}</p>
    <button type="button" onClick={onSalir} style={primaryButton}>Volver al login</button>
  </section></main>;
}
