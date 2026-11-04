'use client';

import { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, Terminal, ShieldAlert, Sparkles } from 'lucide-react';

const SQL_MIGRATION = `-- Si tu tabla 'products' ya existe, corre esto en el SQL Editor de Supabase:
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS selling_price NUMERIC(12, 2) DEFAULT 0.00;
UPDATE public.products SET selling_price = price WHERE (selling_price IS NULL OR selling_price = 0) AND price > 0;`;

const SQL_FULL_SCRIPT = `-- ================================================================
-- TALLER ARAGUA - LOCAL AUTORIZADO YAMAHA
-- Script de inicialización de Base de Datos para Supabase
-- Tabla: products (Gestión de Inventario de Repuestos con Costo y PVP)
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    category VARCHAR(100) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    available BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso completo a usuarios autenticados" ON public.products;
CREATE POLICY "Acceso completo a usuarios autenticados"
ON public.products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura pública de repuestos" ON public.products;
CREATE POLICY "Lectura pública de repuestos"
ON public.products
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "Modificación completa con anon key" ON public.products;
CREATE POLICY "Modificación completa con anon key"
ON public.products
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Insertar repuestos iniciales de Yamaha para Taller Aragua con Costo y PVP
INSERT INTO public.products (name, code, category, cost_price, selling_price, price, stock, min_stock, available, description)
VALUES
('Aceite Yamalube 4T 10W-40 Semisintético 1L', 'LUB-10W40-FS', 'Lubricantes', 7.50, 11.50, 11.50, 48, 10, true, 'Aceite original Yamaha para motores de 4 tiempos de alta tecnología.'),
('Filtro de Aire Original Yamaha NMAX 155 / Aerox', '2DP-E4451-00', 'Filtros', 11.00, 18.00, 18.00, 14, 5, true, 'Elemento filtrante de aire genuino para scooter Yamaha NMAX 155.'),
('Pastillas de Freno Delantero Yamaha MT-03 / MT-07', '1WS-W0045-00', 'Frenos', 21.00, 34.50, 34.50, 4, 6, true, 'Juego de pastillas sinterizadas OEM de alto rendimiento de frenado.'),
('Bujía NGK Laser Iridium Yamaha R15 / MT-15', 'CR9EIX', 'Eléctrico', 8.50, 14.00, 14.00, 25, 8, true, 'Bujía de encendido de iridio para máxima respuesta y combustión.'),
('Kit de Arrastre Cadena y Piñón Yamaha FZ-16 / FZ-25', '21C-W001A-00', 'Transmisión', 42.00, 65.00, 65.00, 3, 5, true, 'Kit completo con piñón de ataque, catalina y cadena reforzada con o-ring.'),
('Correa de Transmisión CVT Yamaha BWS 125 / Cygnus', '5S9-E7641-00', 'Transmisión', 17.50, 28.00, 28.00, 8, 4, true, 'Banda de tracción dentada reforzada con aramida para scooters.'),
('Disco de Embrague (Kit 5 Discos) Yamaha YBR 125', '5VL-E6321-00', 'Motor', 14.00, 22.50, 22.50, 2, 5, true, 'Discos de fricción originales para embrague de YBR 125 y XTZ 125.'),
('Batería Yuasa 12V 6Ah Sellada Gel (Yamaha FZ/R15)', 'YTZ7S-GEL', 'Eléctrico', 26.00, 42.00, 42.00, 6, 3, true, 'Batería libre de mantenimiento de alto poder de arranque en frío.'),
('Juego de Neumáticos Michelin Pilot Street 140/70-17', 'MICH-14070-17', 'Chasis y Ruedas', 72.00, 110.00, 110.00, 5, 2, true, 'Cubierta trasera deportiva para Yamaha MT-03, R3 y FZ-25.'),
('Amortiguador Trasero Mono-Shock Yamaha XTZ 125', '2JS-F2210-00', 'Suspensión', 54.00, 85.00, 85.00, 2, 3, true, 'Amortiguador hidráulico presurizado original para motocross/enduro.'),
('Faro Delantero Óptica LED Yamaha Crypton 115', '4S3-H4310-10', 'Iluminación', 28.00, 45.00, 45.00, 1, 3, true, 'Conjunto óptico frontal de reemplazo directo con homologación oficial.'),
('Líquido de Frenos Yamalube DOT 4 Racing 500ml', 'YAM-DOT4-500', 'Lubricantes', 5.20, 8.50, 8.50, 20, 5, true, 'Fluido para sistemas hidráulicos de frenos y embrague con alto punto de ebullición.')
ON CONFLICT (code) DO NOTHING;`;

export default function SqlSetupModal({ isOpen, onClose, onRetryConnection }) {
  const [copiedMigration, setCopiedMigration] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  if (!isOpen) return null;

  const handleCopyMigration = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopiedMigration(true);
    setTimeout(() => setCopiedMigration(false), 3000);
  };

  const handleCopyFull = () => {
    navigator.clipboard.writeText(SQL_FULL_SCRIPT);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-600 to-red-600" />

        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Configuración y Migración SQL en Supabase
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sincronización de columnas <code className="text-blue-600 font-bold">cost_price</code> (Costo) y <code className="text-blue-600 font-bold">selling_price</code> (PVP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* OPTION 1: QUICK MIGRATION FOR EXISTING TABLE */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/40 border-2 border-blue-200 dark:border-blue-900 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-blue-950 dark:text-blue-200 flex items-center gap-1.5 text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Opción Rápida: Si ya tienes tu tabla 'products' creada en Supabase
              </span>
              <button
                onClick={handleCopyMigration}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
              >
                {copiedMigration ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMigration ? '¡Copiado!' : 'Copiar 3 Líneas'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
              Ejecuta estas 3 líneas en el <strong>SQL Editor</strong> de Supabase para agregar las columnas de Precio Costo y PVP sin perder ningún dato:
            </p>
            <pre className="p-3 bg-slate-900 text-blue-200 text-xs font-mono rounded-xl overflow-x-auto border border-slate-800">
              {SQL_MIGRATION}
            </pre>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs font-bold mb-2">
                1
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">Abre Supabase</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Entra a tu proyecto en <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-2.5 h-2.5" /></a>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs font-bold mb-2">
                2
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">Ve a SQL Editor</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                En el menú lateral izquierdo, haz clic en el icono <strong>SQL Editor</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs font-bold mb-2">
                3
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200">Pega y Presiona Run</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Pega el código copiado y haz clic en el botón verde <strong>Run</strong>.
              </p>
            </div>
          </div>

          {/* Code block with full script */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300 rounded-t-xl text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Script Completo de Inicialización (supabase_schema.sql)
              </span>
              <button
                onClick={handleCopyFull}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
              >
                {copiedFull ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFull ? '¡Copiado!' : 'Copiar Script Completo'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-b-xl overflow-x-auto max-h-48 border border-t-0 border-slate-700">
              {SQL_FULL_SCRIPT}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Los cambios se guardan y reflejan automáticamente en el inventario.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Cerrar
            </button>
            {onRetryConnection && (
              <button
                onClick={() => {
                  onRetryConnection();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
              >
                Reintentar Conexión
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
