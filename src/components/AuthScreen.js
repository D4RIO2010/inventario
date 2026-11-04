'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Sun,
  Moon,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        const data = await signUp(email.trim(), password);
        // Supabase may require email confirmation or sign in automatically
        if (data.session) {
          setSuccessMsg('¡Cuenta de administrador creada y sesión iniciada!');
        } else {
          setSuccessMsg(
            '¡Administrador registrado! Si tu proyecto tiene confirmación de correo activa, revisa tu bandeja o puedes iniciar sesión.'
          );
          setMode('login');
        }
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      let message = err.message || 'Error en el proceso de autenticación.';
      if (message.includes('Invalid login credentials')) {
        message = 'Credenciales inválidas. Verifica tu correo y contraseña o crea tu cuenta de administrador en la pestaña Registrar.';
      } else if (message.includes('User already registered')) {
        message = 'Este correo ya está registrado. Por favor inicia sesión.';
        setMode('login');
      } else if (
        message.toLowerCase().includes('rate limit') ||
        message.toLowerCase().includes('frecuencia de correo') ||
        message.toLowerCase().includes('over_email_send_rate_limit')
      ) {
        message = 'Supabase limita el envío de correos en su servidor compartido (máx. 3-4 por hora). Para solucionarlo de inmediato, desactiva "Confirm email" en tu panel de Supabase (Authentication > Providers > Email) o crea el usuario directamente en Authentication > Users > "Add user".';
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@talleraragua.com');
    setPassword('Yamaha2026*');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-100 dark:bg-slate-950 transition-colors relative selection:bg-blue-600 selection:text-white">
      {/* Dark mode button top-right */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          {mounted && theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 mb-3">
            <img
              src="/logo.png"
              alt="Taller Aragua 2003 C.A"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            TALLER <span className="text-red-600 dark:text-red-500">ARAGUA</span>
            <span className="block text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">2003 C.A</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            Distribuidor Autorizado Yamaha
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Portal exclusivo para administración de inventario y repuestos
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition">
          {/* Top colored stripe */}
          <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-600 to-red-600" />

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 m-5 mb-0 bg-slate-100 dark:bg-slate-800/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Registrar Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-800 dark:text-red-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@talleraragua.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Sugerir credenciales
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {mode === 'signup'
                  ? 'Mínimo 6 caracteres para la cuenta de administrador.'
                  : 'Autenticación segura conectada a Supabase Auth.'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-800 hover:to-blue-800 shadow-lg shadow-blue-600/30 disabled:opacity-50 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>
                {loading
                  ? 'Conectando con Supabase...'
                  : mode === 'login'
                  ? 'Ingresar al Sistema'
                  : 'Crear Cuenta de Administrador'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Protección de rutas activa • Taller Aragua C.A. • Maracay, Venezuela
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
