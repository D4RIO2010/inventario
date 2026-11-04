'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Filter,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
  Tag,
  PackageX,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/initialData';

export default function ProductTable({
  products = [],
  loading = false,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenDetailModal,
  onQuickUpdateStock,
  selectedCategory,
  setSelectedCategory,
  onlyCritical,
  setOnlyCritical,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'unavailable'
  const [sortBy, setSortBy] = useState('name_asc');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search term (by name, code, category, or description)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = p.name?.toLowerCase().includes(term);
          const matchCode = p.code?.toLowerCase().includes(term);
          const matchCat = p.category?.toLowerCase().includes(term);
          const matchDesc = p.description?.toLowerCase().includes(term);
          if (!matchName && !matchCode && !matchCat && !matchDesc) return false;
        }

        // Category filter
        if (selectedCategory && selectedCategory !== 'Todos') {
          if (p.category !== selectedCategory) return false;
        }

        // Critical stock filter
        if (onlyCritical) {
          const isCritical = (Number(p.stock) || 0) <= (Number(p.min_stock) || 5);
          if (!isCritical) return false;
        }

        // Availability filter
        if (availabilityFilter === 'available' && !p.available) return false;
        if (availabilityFilter === 'unavailable' && p.available) return false;

        return true;
      })
      .sort((a, b) => {
        const costA = Number(a.cost_price) || 0;
        const costB = Number(b.cost_price) || 0;
        const sellingA = Number(a.selling_price) || Number(a.price) || 0;
        const sellingB = Number(b.selling_price) || Number(b.price) || 0;
        const stockA = Number(a.stock) || 0;
        const stockB = Number(b.stock) || 0;

        switch (sortBy) {
          case 'name_asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'name_desc':
            return (b.name || '').localeCompare(a.name || '');
          case 'selling_price_desc':
            return sellingB - sellingA;
          case 'selling_price_asc':
            return sellingA - sellingB;
          case 'cost_price_desc':
            return costB - costA;
          case 'cost_price_asc':
            return costA - costB;
          case 'stock_asc':
            return stockA - stockB;
          case 'stock_desc':
            return stockB - stockA;
          default:
            return 0;
        }
      });
  }, [products, searchTerm, selectedCategory, onlyCritical, availabilityFilter, sortBy]);

  // Export to CSV feature (includes both Cost and PVP)
  const exportToCSV = () => {
    if (filteredProducts.length === 0) return;
    const headers = [
      'ID',
      'Nombre',
      'Código OEM',
      'Categoría',
      'Precio Costo USD',
      'Precio Venta PVP USD',
      'Margen Ganancia USD',
      'Margen %',
      'Stock Actual',
      'Stock Mínimo',
      'Total Inversión Costo USD',
      'Total Venta PVP USD',
      'Disponible',
      'Descripción',
    ];

    const rows = filteredProducts.map((p) => {
      const cost = Number(p.cost_price) || 0;
      const selling = Number(p.selling_price) || Number(p.price) || 0;
      const stock = Number(p.stock) || 0;
      const minStock = Number(p.min_stock) || 5;
      const profit = selling - cost;
      const marginPct = selling > 0 ? ((profit / selling) * 100).toFixed(1) : '0.0';

      return [
        `"${p.id || ''}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.code || '').replace(/"/g, '""')}"`,
        `"${p.category || ''}"`,
        cost.toFixed(2),
        selling.toFixed(2),
        profit.toFixed(2),
        `"${marginPct}%"`,
        stock,
        minStock,
        (cost * stock).toFixed(2),
        (selling * stock).toFixed(2),
        p.available ? 'SI' : 'NO',
        `"${(p.description || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Inventario_Taller_Aragua_Precios_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('Todos');
    setOnlyCritical(false);
    setAvailabilityFilter('all');
    setSortBy('name_asc');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
        {/* Top bar: Title + Action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Catálogo de Repuestos</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {filteredProducts.length} de {products.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control de inventario con <strong>Precio Costo</strong> y <strong>Precio de Venta al Público (PVP)</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Export CSV button */}
            <button
              onClick={exportToCSV}
              disabled={filteredProducts.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 transition"
              title="Descargar reporte completo en Excel/CSV con precios de costo y PVP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            {/* New Product Button */}
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white shadow-md shadow-blue-600/25 transition active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Repuesto</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por repuesto, código, categoría o moto..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    Categoría: {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Critical Filter Toggle */}
          <div className="md:col-span-2">
            <button
              onClick={() => setOnlyCritical(!onlyCritical)}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                onlyCritical
                  ? 'bg-red-600 text-white border-red-700 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${onlyCritical ? 'text-white' : 'text-red-500'}`} />
              <span>Stock Crítico</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            >
              <option value="name_asc">Nombre: A - Z</option>
              <option value="name_desc">Nombre: Z - A</option>
              <option value="selling_price_desc">PVP Venta: Mayor a Menor</option>
              <option value="selling_price_asc">PVP Venta: Menor a Mayor</option>
              <option value="cost_price_desc">Precio Costo: Mayor a Menor</option>
              <option value="cost_price_asc">Precio Costo: Menor a Mayor</option>
              <option value="stock_asc">Stock: Menor a Mayor</option>
              <option value="stock_desc">Stock: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(searchTerm || selectedCategory !== 'Todos' || onlyCritical || availabilityFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtros aplicados:
            </span>
            {searchTerm && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-medium">
                Texto: "{searchTerm}"
              </span>
            )}
            {selectedCategory !== 'Todos' && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 font-medium">
                Categoría: {selectedCategory}
              </span>
            )}
            {onlyCritical && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Solo Stock Crítico
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-1"
            >
              Restablecer todos
            </button>
          </div>
        )}
      </div>

      {/* Responsive Table with Cost Price and Selling Price */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3.5">
                Repuesto / Descripción
              </th>
              <th scope="col" className="px-3 py-3.5">
                Categoría
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Precio Costo
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Precio Venta (PVP)
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">
                Stock Almacén
              </th>
              <th scope="col" className="px-4 py-3.5 text-right hidden lg:table-cell">
                Valor en Almacén
              </th>
              <th scope="col" className="px-3 py-3.5 text-center">
                Estado
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
            {/* Loading State */}
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded w-28"></div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-14 ml-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-24 mx-auto"></div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-right">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-20 mx-auto"></div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-20 mx-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                      <PackageX className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                      No se encontraron repuestos
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                      {searchTerm || selectedCategory !== 'Todos' || onlyCritical
                        ? 'No hay piezas que coincidan con los filtros seleccionados.'
                        : 'El inventario está actualmente vacío. Comienza registrando un repuesto.'}
                    </p>
                    {searchTerm || selectedCategory !== 'Todos' || onlyCritical ? (
                      <button
                        onClick={clearFilters}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        Limpiar filtros
                      </button>
                    ) : (
                      <button
                        onClick={onOpenCreateModal}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                      >
                        + Registrar Primer Repuesto
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              /* Render Filtered Products */
              filteredProducts.map((product) => {
                const stockNum = Number(product.stock) || 0;
                const minStockNum = Number(product.min_stock) || 5;
                const costNum = Number(product.cost_price) || 0;
                const sellingNum = Number(product.selling_price) || Number(product.price) || 0;

                const profitPerUnit = sellingNum - costNum;
                const marginPercent =
                  sellingNum > 0 ? ((profitPerUnit / sellingNum) * 100).toFixed(0) : '0';

                const totalCostValue = stockNum * costNum;
                const totalSellingValue = stockNum * sellingNum;

                const isCritical = stockNum <= minStockNum;
                const isOutOfStock = stockNum === 0;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isCritical ? 'bg-red-50/30 dark:bg-red-950/15' : ''
                    }`}
                  >
                    {/* 1. Name & Description (Clickable to view full details) */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => onOpenDetailModal && onOpenDetailModal(product)}
                          className="text-left font-bold text-slate-900 dark:text-white leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Clic para ver detalles completos del repuesto"
                        >
                          {product.name}
                        </button>
                        {product.description && (
                          <span
                            className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-xs sm:max-w-md"
                            title={product.description}
                          >
                            {product.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 2. Category */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        {product.category}
                      </span>
                    </td>

                    {/* 3. PRECIO COSTO */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                          ${costNum.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Costo compra
                        </span>
                      </div>
                    </td>

                    {/* 4. PRECIO VENTA AL PÚBLICO (PVP) */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-xs sm:text-sm font-extrabold text-blue-700 dark:text-blue-400">
                          ${sellingNum.toFixed(2)}
                        </span>
                        {sellingNum > 0 && (
                          <span
                            className={`text-[10px] font-semibold ${
                              profitPerUnit >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-500'
                            }`}
                          >
                            {profitPerUnit >= 0 ? '+' : ''}${profitPerUnit.toFixed(2)} ({marginPercent}%)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Stock Almacén with Quick Adjust buttons */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-2">
                        {/* Quick Minus */}
                        {onQuickUpdateStock && (
                          <button
                            onClick={() => onQuickUpdateStock(product, stockNum - 1)}
                            disabled={stockNum <= 0}
                            title="Disminuir 1 unidad"
                            className="text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Stock Badge */}
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                            isOutOfStock
                              ? 'bg-red-600 text-white border-red-700 animate-pulse-subtle'
                              : isCritical
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200 border-red-300 dark:border-red-800'
                              : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isCritical && <AlertTriangle className="w-3 h-3 flex-shrink-0" />}
                          <span>{stockNum} unids</span>
                          {isCritical && (
                            <span className="text-[10px] font-normal opacity-80">
                              (Mín: {minStockNum})
                            </span>
                          )}
                        </div>

                        {/* Quick Plus */}
                        {onQuickUpdateStock && (
                          <button
                            onClick={() => onQuickUpdateStock(product, stockNum + 1)}
                            title="Incrementar 1 unidad"
                            className="text-slate-400 hover:text-emerald-600 transition"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 6. Subtotal Almacén (Venta PVP vs Inversión Costo) */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right hidden lg:table-cell font-mono text-xs">
                      <div className="flex flex-col items-end">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">
                          ${totalSellingValue.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Inv: ${totalCostValue.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* 7. Availability */}
                    <td className="px-3 py-3.5 whitespace-nowrap text-center">
                      {product.available ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                          <CheckCircle2 className="w-3 h-3" />
                          Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          <XCircle className="w-3 h-3" />
                          No disponible
                        </span>
                      )}
                    </td>

                    {/* 8. Action Buttons (View Details, Edit, Delete) */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Details Button */}
                        <button
                          onClick={() => onOpenDetailModal && onOpenDetailModal(product)}
                          title="Ver detalles completos y precios del repuesto"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onOpenEditModal(product)}
                          title="Editar repuesto y precios"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onOpenDeleteModal(product)}
                          title="Eliminar repuesto"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/60 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> de{' '}
            <strong>{products.length}</strong> repuestos registrados en Taller Aragua.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span> PVP: Venta al Público
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Costo: Adquisición
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600"></span> Stock Crítico
          </span>
        </div>
      </div>
    </div>
  );
}
