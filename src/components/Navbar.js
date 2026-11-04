'use client';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Sun,
  Moon,
  LogOut,
  Wrench,
  ShieldCheck,
  Database,
  RefreshCw,
} from 'lucide-react';

export default function Navbar({ onRefresh, isRefreshing, onOpenSqlModal, isTableMissing }) {
  const { theme, toggleTheme, mounted } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-0.5 overflow-hidden flex-shrink-0">
              <img
                src="/logo.png"
                alt="Taller Aragua 2003 C.A"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-lg text-slate-900 dark:text-white">
                  TALLER <span className="text-red-600 dark:text-red-500">ARAGUA</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">2003 C.A</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <ShieldCheck className="w-3 h-3 text-red-500" />
                  Autorizado Yamaha
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Venta de Repuestos de Motos en General
              </p>
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Indicator: Only show Script SQL button if table is actually missing */}
            {isTableMissing ? (
              <button
                onClick={onOpenSqlModal}
                title="Configuración de Base de Datos Supabase"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition animate-pulse"
              >
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Script SQL Pendiente</span>
              </button>
            ) : (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>En Línea (Supabase)</span>
              </div>
            )}

            {/* Refresh Data Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Sincronizar inventario con Supabase"
                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
                />
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2 rounded-lg text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Admin Badge */}
            <div className="hidden lg:flex flex-col text-right pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Administrador
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                {user?.email || 'admin@talleraragua.com'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={signOut}
              title="Cerrar Sesión de Administrador"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/50 transition focus:outline-none shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
