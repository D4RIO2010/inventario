'use client';

import {
  Package,
  Layers,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

export default function DashboardStats({ products = [], onFilterCritical }) {
  // Calculations
  const totalItems = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);

  // Total valuations
  const totalCostValue = products.reduce(
    (acc, p) => acc + (Number(p.stock) || 0) * (Number(p.cost_price) || 0),
    0
  );

  const totalSellingValue = products.reduce(
    (acc, p) =>
      acc + (Number(p.stock) || 0) * (Number(p.selling_price) || Number(p.price) || 0),
    0
  );

  const totalPotentialProfit = totalSellingValue - totalCostValue;

  const criticalProducts = products.filter(
    (p) => (Number(p.stock) || 0) <= (Number(p.min_stock) || 5)
  );
  const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) === 0).length;

  const formattedSellingValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(totalSellingValue);

  const formattedCostValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(totalCostValue);

  const formattedProfitValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(totalPotentialProfit);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {/* 1. Total Repuestos */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Repuestos Registrados
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalItems}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            repuestos registrados
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          Catálogo activo de taller
        </p>
      </div>

      {/* 2. Unidades en Almacén */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total en Almacén
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalStockUnits.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            unidades físicas
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Disponibilidad en estantes y bodega
        </p>
      </div>

      {/* 3. Valor Total Inventario (PVP y Costo) */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Valor de Inventario (PVP)
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formattedSellingValue}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
          <span className="flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
            Inversión Costo: <strong>{formattedCostValue}</strong>
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Margen Bruto Proyectado: +{formattedProfitValue}
          </span>
        </div>
      </div>

      {/* 4. ALERTA VISUAL ROJA: Stock Crítico */}
      <div
        className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 border transition-all duration-300 shadow-sm hover:shadow-md ${
          criticalProducts.length > 0
            ? 'bg-gradient-to-br from-red-50 to-red-100/60 dark:from-red-950/40 dark:to-slate-900 border-red-200 dark:border-red-900/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                criticalProducts.length > 0
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Stock Crítico / Alerta
            </span>
            {criticalProducts.length > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
            )}
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              criticalProducts.length > 0
                ? 'bg-red-600 text-white border-red-700 shadow-lg shadow-red-600/30 animate-pulse-subtle'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                criticalProducts.length > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {criticalProducts.length}
            </span>
            <span
              className={`text-xs font-semibold ${
                criticalProducts.length > 0
                  ? 'text-red-700 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              repuestos
            </span>
          </div>

          {criticalProducts.length > 0 && onFilterCritical && (
            <button
              onClick={onFilterCritical}
              className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline underline-offset-2 transition"
            >
              Filtrar crítica
            </button>
          )}
        </div>

        <p
          className={`mt-2 text-xs flex items-center gap-1.5 ${
            criticalProducts.length > 0
              ? 'text-red-700 dark:text-red-300 font-medium'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {criticalProducts.length > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <span>
                {outOfStockCount > 0
                  ? `${outOfStockCount} agotado(s) - Requerir pedido urgente`
                  : 'Nivel bajo - Requiere reposición de stock'}
              </span>
            </>
          ) : (
            'Todos los repuestos tienen niveles óptimos'
          )}
        </p>
      </div>
    </div>
  );
}
