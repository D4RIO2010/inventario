'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product = null,
  isDeleting = false,
}) {
  if (!isOpen || !product) return null;

  const costNum = Number(product.cost_price) || 0;
  const sellingNum = Number(product.selling_price) || Number(product.price) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 transition-all">
        {/* Yamaha Red alert top stripe */}
        <div className="h-1.5 bg-red-600" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-900">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            ¿Eliminar este repuesto del inventario?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Esta acción no se puede deshacer. El registro del repuesto será retirado de la base de datos de Taller Aragua.
          </p>

          {/* Product details to delete */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {product.name}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {product.category}
              </span>
              <span>•</span>
              <span>Stock: {product.stock} unids</span>
              <span>•</span>
              <span>Costo: ${costNum.toFixed(2)}</span>
              <span>•</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                PVP: ${sellingNum.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onConfirm(product.id)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 disabled:opacity-50 transition active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar Repuesto'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
