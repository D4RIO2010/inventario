'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, DollarSign, TrendingUp, HelpCircle } from 'lucide-react';
import { CATEGORIES } from '@/lib/initialData';

const SELECTABLE_CATEGORIES = CATEGORIES.filter((c) => c !== 'Todos');

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  isSubmitting = false,
}) {
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    category: 'Motor',
    cost_price: '',
    selling_price: '',
    stock: '',
    min_stock: '5',
    available: true,
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      const initialCost =
        product.cost_price !== undefined && product.cost_price !== null
          ? String(product.cost_price)
          : '';
      const initialSelling =
        product.selling_price !== undefined && product.selling_price !== null
          ? String(product.selling_price)
          : product.price !== undefined && product.price !== null
          ? String(product.price)
          : '';

      setFormData({
        name: product.name || '',
        category: product.category || 'Motor',
        cost_price: initialCost,
        selling_price: initialSelling,
        stock: product.stock !== undefined ? String(product.stock) : '',
        min_stock: product.min_stock !== undefined ? String(product.min_stock) : '5',
        available: product.available !== undefined ? product.available : true,
        description: product.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Motor',
        cost_price: '',
        selling_price: '',
        stock: '',
        min_stock: '5',
        available: true,
        description: '',
      });
    }
    setErrors({});
  }, [product, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del repuesto es obligatorio.';
    }
    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría.';
    }

    const costNum = parseFloat(formData.cost_price);
    if (formData.cost_price === '' || isNaN(costNum) || costNum < 0) {
      newErrors.cost_price = 'Ingresa un precio de costo válido (≥ 0).';
    }

    const sellingNum = parseFloat(formData.selling_price);
    if (formData.selling_price === '' || isNaN(sellingNum) || sellingNum < 0) {
      newErrors.selling_price = 'Ingresa un precio de venta al público válido (≥ 0).';
    }

    const stockNum = parseInt(formData.stock, 10);
    if (formData.stock === '' || isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = 'Ingresa un stock válido en unidades (0 o más).';
    }

    const minStockNum = parseInt(formData.min_stock, 10);
    if (formData.min_stock === '' || isNaN(minStockNum) || minStockNum < 0) {
      newErrors.min_stock = 'El stock mínimo debe ser 0 o superior.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const costNum = parseFloat(formData.cost_price) || 0;
    const sellingNum = parseFloat(formData.selling_price) || 0;

    const payload = {
      name: formData.name.trim(),
      code: product?.code || null,
      category: formData.category,
      cost_price: costNum,
      selling_price: sellingNum,
      price: sellingNum, // Maintained for database schema backwards compatibility
      stock: parseInt(formData.stock, 10) || 0,
      min_stock: parseInt(formData.min_stock, 10) || 5,
      available: Boolean(formData.available),
      description: formData.description.trim() || null,
    };

    onSubmit(payload);
  };

  // Calculations for live preview
  const costVal = parseFloat(formData.cost_price) || 0;
  const sellingVal = parseFloat(formData.selling_price) || 0;
  const stockVal = parseInt(formData.stock, 10) || 0;

  const unitProfit = sellingVal - costVal;
  const profitMarginPercent =
    sellingVal > 0 ? ((unitProfit / sellingVal) * 100).toFixed(1) : '0.0';

  const totalCostInvestment = costVal * stockVal;
  const totalProjectedSales = sellingVal * stockVal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 transition-all">
        {/* Header with Yamaha Blue / Red Brand Line */}
        <div className="h-1.5 bg-gradient-to-r from-blue-700 via-blue-600 to-red-600" />

        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {isEditing ? 'Editar Repuesto' : 'Registrar Nuevo Repuesto'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Taller Aragua • Venta de Repuestos de Motos en General (Autorizado Yamaha)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre del Repuesto *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Pastillas de freno delanteras, Bujía, Kit arrastre..."
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                  errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              >
                {SELECTABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: PRECIO COSTO Y PRECIO DE VENTA AL PÚBLICO (AMBOS PRECIOS) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Definición de Precios ($ USD) *
              </span>
              {sellingVal > 0 && costVal > 0 && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    unitProfit >= 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {unitProfit >= 0 ? `Ganancia: +$${unitProfit.toFixed(2)} (${profitMarginPercent}%)` : `Pérdida: -$${Math.abs(unitProfit).toFixed(2)}`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Precio Costo */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Precio Costo (Compra al Proveedor) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                      errors.cost_price ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.cost_price ? (
                  <p className="mt-1 text-xs text-red-500">{errors.cost_price}</p>
                ) : (
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Costo real que pagó el taller por la pieza
                  </span>
                )}
              </div>

              {/* 2. Precio Venta al Público (PVP) */}
              <div>
                <label className="block text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  Precio Venta al Público (PVP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition font-bold ${
                      errors.selling_price ? 'border-red-500' : 'border-blue-300 dark:border-blue-700'
                    }`}
                  />
                </div>
                {errors.selling_price ? (
                  <p className="mt-1 text-xs text-red-500">{errors.selling_price}</p>
                ) : (
                  <span className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1 block">
                    Precio final para el cliente del taller
                  </span>
                )}
              </div>
            </div>

            {/* Warning if Cost > Selling Price */}
            {costVal > sellingVal && sellingVal > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  Atención: El <strong>Precio Costo</strong> (${costVal.toFixed(2)}) es superior al <strong>Precio de Venta</strong> (${sellingVal.toFixed(2)}). Esto generará un margen negativo.
                </span>
              </div>
            )}
          </div>

          {/* Row 3: Stock Actual & Min Stock (Alert Threshold) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Stock Actual en Almacén *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                  errors.stock ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                Mínimo Crítico (Alerta Roja) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                placeholder="5"
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                  errors.min_stock ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Alerta roja si stock ≤ este valor
              </span>
            </div>
          </div>

          {/* Row 4: Availability Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Disponibilidad para Venta
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Determina si el repuesto se encuentra disponible en tienda para los clientes
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Row 5: Description / Motorcycle Compatibility */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Descripción & Compatibilidad de Motos
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej: Apto para motos Empire Keeway Horse, Bera SBR, Suzuki GN 125, Yamaha MT-03, etc."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
          </div>

          {/* Subtotal Preview Card: Inversión vs Venta Total */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium block">
                Inversión Total en Almacén:
              </span>
              <span className="text-sm font-extrabold font-mono text-slate-800 dark:text-slate-200">
                ${totalCostInvestment.toFixed(2)} USD
              </span>
            </div>
            <div>
              <span className="text-blue-700 dark:text-blue-300 font-medium block">
                Valor Total Proyectado (PVP):
              </span>
              <span className="text-sm font-extrabold font-mono text-blue-700 dark:text-blue-300">
                ${totalProjectedSales.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white shadow-md shadow-blue-600/30 disabled:opacity-50 transition active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Repuesto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
