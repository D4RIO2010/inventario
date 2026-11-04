'use client';

import {
  X,
  Tag,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Layers,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export default function ProductDetailModal({
  isOpen,
  onClose,
  product = null,
  onEdit,
}) {
  if (!isOpen || !product) return null;

  const costNum = Number(product.cost_price) || 0;
  const sellingNum = Number(product.selling_price) || Number(product.price) || 0;
  const stockNum = Number(product.stock) || 0;
  const minStockNum = Number(product.min_stock) || 5;

  const profitPerUnit = sellingNum - costNum;
  const marginPercent =
    sellingNum > 0 ? ((profitPerUnit / sellingNum) * 100).toFixed(1) : '0.0';

  const totalCostValue = stockNum * costNum;
  const totalSellingValue = stockNum * sellingNum;
  const totalPotentialProfit = stockNum * profitPerUnit;

  const isCritical = stockNum <= minStockNum;
  const isOutOfStock = stockNum === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 transition-all flex flex-col max-h-[92vh]">
        {/* Brand Accent Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-600 to-red-600" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                <Tag className="w-3 h-3" />
                {product.category}
              </span>
              {product.available ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  <CheckCircle2 className="w-3 h-3" />
                  Disponible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <XCircle className="w-3 h-3" />
                  No disponible
                </span>
              )}
              {isCritical && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                  <AlertTriangle className="w-3 h-3" />
                  {isOutOfStock ? 'Agotado' : 'Stock Crítico'}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h3>
            {product.code && (
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                Código OEM: <span className="font-bold text-slate-700 dark:text-slate-300">{product.code}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* PRICING BREAKDOWN: PRECIO COSTO vs PRECIO VENTA AL PÚBLICO */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                Estructura de Precios y Ganancia
              </h4>
              <span className="text-[11px] font-semibold text-slate-400">
                Moneda: Dólares Americanos ($ USD)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Precio Costo */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Precio Costo (Compra)
                </span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-200 font-mono tracking-tight">
                  ${costNum.toFixed(2)}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Costo de adquisición por unidad
                </p>
              </div>

              {/* 2. Precio Venta al Público (PVP) */}
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border-2 border-blue-500/30 dark:border-blue-600/40 shadow-xs">
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block mb-1">
                  Precio Venta al Público (PVP)
                </span>
                <span className="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono tracking-tight">
                  ${sellingNum.toFixed(2)}
                </span>
                <p className="text-[11px] text-blue-600 dark:text-blue-300/80 mt-1">
                  Precio final de venta al cliente
                </p>
              </div>

              {/* 3. Margen y Ganancia Unitaria */}
              <div
                className={`p-4 rounded-2xl border ${
                  profitPerUnit >= 0
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold ${
                      profitPerUnit >= 0
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-red-700 dark:text-red-400'
                    }`}
                  >
                    Margen Comercial
                  </span>
                  <span
                    className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                      profitPerUnit >= 0
                        ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {marginPercent}%
                  </span>
                </div>
                <span
                  className={`text-2xl font-black font-mono tracking-tight block ${
                    profitPerUnit >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {profitPerUnit >= 0 ? '+' : ''}${profitPerUnit.toFixed(2)}
                </span>
                <p
                  className={`text-[11px] mt-1 ${
                    profitPerUnit >= 0
                      ? 'text-emerald-700 dark:text-emerald-300/80'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Ganancia neta por unidad
                </p>
              </div>
            </div>
          </div>

          {/* STOCK & INVENTORY VALUATION */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Estado de Inventario y Valorización en Almacén
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Stock Actual */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Stock Físico
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                  {stockNum} unids
                </span>
              </div>

              {/* Mínimo Crítico */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Umbral Mínimo
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                  {minStockNum} unids
                </span>
              </div>

              {/* Inversión en Almacén (Costo x Stock) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                  Inversión (Al Costo)
                </span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-1 block font-mono">
                  ${totalCostValue.toFixed(2)}
                </span>
              </div>

              {/* Venta Proyectada (PVP x Stock) */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <span className="text-[11px] text-blue-700 dark:text-blue-300 block font-medium">
                  Venta Total (PVP)
                </span>
                <span className="text-base font-extrabold text-blue-700 dark:text-blue-300 mt-1 block font-mono">
                  ${totalSellingValue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* DESCRIPTION / COMPATIBILITY */}
          {product.description && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Descripción & Compatibilidad de Motos
              </h5>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* TIMESTAMPS / METADATA */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Registrado: {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'Reciente'}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Taller Aragua • Yamaha Autorizado
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Cerrar
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-[0.98]"
            >
              <Edit2 className="w-4 h-4" />
              <span>Editar Repuesto</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
