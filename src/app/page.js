'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { INITIAL_PRODUCTS } from '@/lib/initialData';
import { hydrateProduct, hydrateProducts, setCachedCostPrice } from '@/lib/priceUtils';
import Navbar from '@/components/Navbar';
import DashboardStats from '@/components/DashboardStats';
import CriticalStockAlert from '@/components/CriticalStockAlert';
import ProductTable from '@/components/ProductTable';
import ProductModal from '@/components/ProductModal';
import ProductDetailModal from '@/components/ProductDetailModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import SqlSetupModal from '@/components/SqlSetupModal';
import AuthScreen from '@/components/AuthScreen';
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Database,
  Info,
  X,
  Code2,
} from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTableMissing, setIsTableMissing] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Toast notifications
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Fetch products from Supabase
  const fetchProducts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Check if table does not exist in Supabase schema (PGRST205)
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          setIsTableMissing(true);
          // Use realistic initial Yamaha items with cost and selling prices
          setProducts((prev) => (prev.length > 0 ? prev : hydrateProducts(INITIAL_PRODUCTS)));
        } else {
          console.error('Error al cargar repuestos:', error);
          showToast(`Error al consultar Supabase: ${error.message}`, 'error');
        }
      } else if (data) {
        setIsTableMissing(false);
        // Hydrate data ensuring cost_price, selling_price, and price are present
        const hydrated = hydrateProducts(data);
        setProducts(hydrated);
      }
    } catch (err) {
      console.error('Error general al conectar con Supabase:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch and Realtime subscription
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchProducts();

    // Subscribe to real-time changes if table exists
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Cambio en tiempo real recibido de Supabase:', payload);
          fetchProducts(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, fetchProducts]);

  // Handle Create or Edit Product
  const handleSaveProduct = async (productData) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // EDIT MODE
        const targetId = editingProduct.id;
        setCachedCostPrice(targetId, productData.cost_price);

        let usedFallback = false;

        if (!isTableMissing) {
          // Attempt update with cost_price and selling_price
          const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', targetId);

          if (error) {
            // If cost_price or selling_price column is not yet in Supabase schema
            if (
              error.code === 'PGRST204' ||
              error.message?.includes('cost_price') ||
              error.message?.includes('selling_price')
            ) {
              usedFallback = true;
              const fallbackData = { ...productData };
              delete fallbackData.cost_price;
              delete fallbackData.selling_price;
              fallbackData.price = productData.selling_price;

              const retry = await supabase
                .from('products')
                .update(fallbackData)
                .eq('id', targetId);

              if (retry.error) throw retry.error;
            } else {
              throw error;
            }
          }
        }

        // Optimistic / local state update with full price structure
        setProducts((prev) =>
          prev.map((p) =>
            p.id === targetId
              ? {
                  ...p,
                  ...productData,
                  updated_at: new Date().toISOString(),
                }
              : p
          )
        );

        if (usedFallback) {
          showToast(
            `"${productData.name}" actualizado. (Nota: Para sincronizar Precio Costo en Supabase, ejecuta el comando SQL de actualización en Supabase).`
          );
        } else {
          showToast(`Repuesto "${productData.name}" actualizado correctamente con ambos precios.`);
        }
      } else {
        // CREATE MODE
        const newId = crypto.randomUUID();
        setCachedCostPrice(newId, productData.cost_price);

        const newRecord = {
          ...productData,
          id: newId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        let usedFallback = false;

        if (!isTableMissing) {
          const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select();

          if (error) {
            if (
              error.code === 'PGRST204' ||
              error.message?.includes('cost_price') ||
              error.message?.includes('selling_price')
            ) {
              usedFallback = true;
              const fallbackData = { ...productData };
              delete fallbackData.cost_price;
              delete fallbackData.selling_price;
              fallbackData.price = productData.selling_price;

              const retry = await supabase
                .from('products')
                .insert([fallbackData])
                .select();

              if (retry.error) throw retry.error;
              if (retry.data && retry.data[0]) {
                newRecord.id = retry.data[0].id;
                setCachedCostPrice(newRecord.id, productData.cost_price);
              }
            } else {
              throw error;
            }
          } else if (data && data[0]) {
            newRecord.id = data[0].id;
            setCachedCostPrice(newRecord.id, productData.cost_price);
          }
        }

        setProducts((prev) => [newRecord, ...prev]);

        if (usedFallback) {
          showToast(
            `"${productData.name}" registrado con éxito. (Nota: Recuerda aplicar la migración SQL para almacenar el Precio Costo en Supabase).`
          );
        } else {
          showToast(`Repuesto "${productData.name}" registrado con Precio Costo y PVP.`);
        }
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Error al guardar repuesto:', err);
      showToast(`Error al guardar: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    setIsDeleting(true);
    try {
      if (!isTableMissing) {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) throw error;
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Repuesto eliminado del inventario.');
      setIsDeleteModalOpen(false);
      setDeletingProduct(null);
    } catch (err) {
      console.error('Error al eliminar repuesto:', err);
      showToast(`Error al eliminar: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Stock Update directly from row buttons
  const handleQuickUpdateStock = async (product, newStock) => {
    if (newStock < 0) return;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
    );

    try {
      if (!isTableMissing) {
        const { error } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', product.id);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error al actualizar stock rápido:', err);
      showToast(`Error de stock: ${err.message}`, 'error');
      // Revert if error
      fetchProducts(true);
    }
  };

  // Route protection & loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xl p-2 animate-pulse">
          <img
            src="/logo.png"
            alt="Taller Aragua 2003 C.A"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="mt-4 text-base font-extrabold text-slate-800 dark:text-slate-200">
          Taller Aragua 2003 C.A
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Verificando sesión segura con Supabase Auth...
        </p>
      </div>
    );
  }

  // Not authenticated -> show login screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold ${
              notification.type === 'error'
                ? 'bg-red-600 text-white border-red-700 shadow-red-600/30'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        onRefresh={() => fetchProducts(false)}
        isRefreshing={isRefreshing}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        isTableMissing={isTableMissing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner if table is not created yet in Supabase */}
        {isTableMissing && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-700/50">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Database className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <span>Conexión Supabase Activa (Paso de Inicialización)</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/30 border border-blue-400/40">
                    Modo Demostración Activo
                  </span>
                </h4>
                <p className="text-xs text-blue-200 mt-0.5">
                  La tabla <code className="font-bold text-white">public.products</code> aún no se ha creado en tu proyecto de Supabase. Estamos utilizando los repuestos oficiales Yamaha en memoria para que pruebes toda la aplicación.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-white text-blue-900 hover:bg-blue-50 shadow-md transition flex-shrink-0"
            >
              <span>Ver y Copiar Script SQL</span>
            </button>
          </div>
        )}

        {/* Dashboard KPIs (including PVP and Cost Valuations) */}
        <DashboardStats
          products={products}
          onFilterCritical={() => {
            setOnlyCritical(true);
            setSelectedCategory('Todos');
          }}
        />

        {/* Red Visual Critical Stock Alert Banner */}
        <CriticalStockAlert
          products={products}
          onQuickRestock={(item) => {
            setEditingProduct(item);
            setIsProductModalOpen(true);
          }}
        />

        {/* Dynamic Products CRUD Table with Cost Price and PVP */}
        <ProductTable
          products={products}
          loading={loading}
          onOpenCreateModal={() => {
            setEditingProduct(null);
            setIsProductModalOpen(true);
          }}
          onOpenEditModal={(product) => {
            setEditingProduct(product);
            setIsProductModalOpen(true);
          }}
          onOpenDetailModal={(product) => {
            setViewingProduct(product);
            setIsDetailModalOpen(true);
          }}
          onOpenDeleteModal={(product) => {
            setDeletingProduct(product);
            setIsDeleteModalOpen(true);
          }}
          onQuickUpdateStock={handleQuickUpdateStock}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onlyCritical={onlyCritical}
          setOnlyCritical={setOnlyCritical}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} Taller Aragua • Concesionario & Taller Autorizado Yamaha.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Supabase Cloud</span>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingProduct(null);
        }}
        product={viewingProduct}
        onEdit={(prod) => {
          setEditingProduct(prod);
          setIsProductModalOpen(true);
        }}
      />

      {/* Create / Edit Modal (Input both Cost Price and PVP) */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        product={editingProduct}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        product={deletingProduct}
        isDeleting={isDeleting}
      />

      {/* Supabase SQL Setup Instructions Modal */}
      <SqlSetupModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        onRetryConnection={() => fetchProducts(false)}
      />
    </div>
  );
}
