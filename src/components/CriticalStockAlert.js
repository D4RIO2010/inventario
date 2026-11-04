'use client';

import { useState } from 'react';
import { AlertOctagon, ChevronDown, ChevronUp, PlusCircle, AlertCircle } from 'lucide-react';

export default function CriticalStockAlert({ products = [], onQuickRestock }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const criticalItems = products.filter(
    (p) => (Number(p.stock) || 0) <= (Number(p.min_stock) || 5)
  );

  if (criticalItems.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/60 p-4 sm:p-5 shadow-sm transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-red-600/20">
            <AlertOctagon className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-red-900 dark:text-red-200">
                Alerta de Inventario Crítico ({criticalItems.length} repuestos bajo el stock mínimo)
              </h3>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-600 text-white tracking-wider">
                Prioridad Alta
              </span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
              Los siguientes repuestos están por debajo de su umbral de seguridad y requieren reposición urgente.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40 transition"
          title={isExpanded ? 'Ocultar lista detallada' : 'Mostrar lista detallada'}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Collapsible Critical List */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-900/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {criticalItems.map((item) => {
            const sellingNum = Number(item.selling_price) || Number(item.price) || 0;
            const costNum = Number(item.cost_price) || 0;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      PVP: ${sellingNum.toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        Number(item.stock) === 0
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'
                      }`}
                    >
                      <AlertCircle className="w-2.5 h-2.5" />
                      {Number(item.stock) === 0 ? 'AGOTADO' : `${item.stock} unids`} (Mín: {item.min_stock})
                    </span>
                  </div>
                </div>

                {onQuickRestock && (
                  <button
                    onClick={() => onQuickRestock(item)}
                    title="Surtir o ajustar stock"
                    className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ajustar</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
