import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Trash2, Edit, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { getInventory, createProduct, updateProduct, deleteProduct } from '../lib/api';
import ProductModal from './ProductModal';
import MovementModal from './MovementModal';

export default function InventoryApp() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [productModal, setProductModal] = useState({ isOpen: false, product: null });
  const [movementModal, setMovementModal] = useState({ isOpen: false, type: 'in', product: null });
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawData = await getInventory();
      // Recalcular matemáticamente siempre para asegurar precisión 
      // frente a ediciones manuales en Google Sheets
      const data = rawData.map(p => {
        const inicial = Number(p.stockInicial) || 0;
        const entradas = Number(p.entradas) || 0;
        const salidas = Number(p.salidas) || 0;
        const costo = Number(p.costo) || 0;
        
        p.stockActual = inicial + entradas - salidas;
        p.valorTotal = p.stockActual * costo;
        return p;
      });
      setProducts(data);
    } catch (err) {
      setError('Error al cargar el inventario. Verifique la conexión o configure PUBLIC_API_URL.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (formData) => {
    try {
      // Calcular campos automáticos
      const inicial = Number(formData.stockInicial) || 0;
      const entradas = Number(formData.entradas) || 0;
      const salidas = Number(formData.salidas) || 0;
      formData.stockActual = inicial + entradas - salidas;
      formData.valorTotal = formData.stockActual * (Number(formData.costo) || 0);

      if (productModal.product) {
        // Is edit
        await updateProduct(formData.sku, formData);
      } else {
        // Is new
        await createProduct(formData);
      }
      await fetchProducts();
      setProductModal({ isOpen: false, product: null });
    } catch (err) {
      alert("Error al guardar el producto.");
    }
  };

  const handleSaveMovement = async (sku, amount) => {
    try {
      const p = products.find(x => x.sku === sku);
      if(!p) return;
      // Depending on structure of update logic, we can just send the adjusted entries/exits or just call updateProduct.
      // We will assume `updateProduct` can just overwrite the whole object but we calc the new in/out here.
      // OR we just use `updateProduct` to send `{ entradas: p.entradas + amount }` if it's entry.
      let updatedData = { ...p };
      if (amount > 0) {
        updatedData.entradas = (Number(p.entradas) || 0) + amount;
      } else {
        updatedData.salidas = (Number(p.salidas) || 0) + Math.abs(amount);
      }
      
      // Recalcular stockActual y valorTotal antes de enviarlo
      const inicial = Number(updatedData.stockInicial) || 0;
      const entradas = Number(updatedData.entradas) || 0;
      const salidas = Number(updatedData.salidas) || 0;
      updatedData.stockActual = inicial + entradas - salidas;
      updatedData.valorTotal = updatedData.stockActual * (Number(updatedData.costo) || 0);
      
      await updateProduct(sku, updatedData);
      await fetchProducts();
      setMovementModal({ isOpen: false, type: 'in', product: null });
    } catch (err) {
      alert("Error al registrar el movimiento.");
    }
  };

  const handleDelete = async (sku) => {
    if(!window.confirm(`¿Seguro que deseas eliminar el producto ${sku}?`)) return;
    setIsDeleting(sku);
    try {
      await deleteProduct(sku);
      await fetchProducts();
    } catch (err) {
      alert("Error al eliminar el producto.");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lowerQ = searchQuery.toLowerCase();
    return products.filter(p => 
      String(p.nombre || '').toLowerCase().includes(lowerQ) || 
      String(p.sku || '').toLowerCase().includes(lowerQ)
    );
  }, [products, searchQuery]);

  const dashboardStats = useMemo(() => {
    let totalValue = 0;
    let outOfStock = 0;
    const categories = new Set();

    products.forEach(p => {
      const actual = Number(p.stockActual) || 0;
      const costo = Number(p.costo) || 0;
      totalValue += (actual * costo);
      if (actual <= 0) outOfStock++;
      if (p.categoria) categories.add(p.categoria);
    });

    return { totalValue, outOfStock, totalCategories: categories.size };
  }, [products]);

  const getStatusStyle = (actual, minimo) => {
    const numActual = Number(actual) || 0;
    const numMinimo = Number(minimo) || 0;
    if (numActual <= 0) {
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Agotado' };
    }
    if (numActual <= numMinimo) {
      return { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Poco Inventario' };
    }
    return { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'En Stock' };
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-800 to-indigo-900 pb-24 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <Package className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Inventario <span className="text-sky-300 font-light">v2.0</span></h1>
                <p className="text-sky-200 mt-1">Control centralizado y dinámico de tus existencias</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:min-w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-sky-200" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por Nombre o SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-white/10 text-white placeholder-sky-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 sm:text-sm transition-colors duration-200"
                />
              </div>
              <button 
                onClick={() => fetchProducts()} 
                className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors border border-white/20"
                title="Recargar datos"
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
              <button 
                onClick={() => setProductModal({ isOpen: true, product: null })}
                className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/30"
              >
                <Plus size={20} className="mr-1" /> Nuevo Producto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-10 opacity-70"></div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Valor Total</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">
                ${dashboardStats.totalValue.toLocaleString('es-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-4">Stock en almacén × Costo unitario</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -z-10 opacity-70"></div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Productos Agotados</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{dashboardStats.outOfStock}</p>
            </div>
            <p className="text-xs text-slate-400 mt-4">Requieren atención inmediata</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 opacity-70"></div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Categorías</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{dashboardStats.totalCategories}</p>
            </div>
            <p className="text-xs text-slate-400 mt-4">Diversidad de inventario</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
             {loading && products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <RefreshCw className="animate-spin mb-4" size={32} />
                  <p>Cargando inventario...</p>
                </div>
             ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Package className="mb-4 opacity-50" size={48} />
                  <p className="text-lg">No hay productos registrados.</p>
                </div>
             ) : (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Producto</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría / Detalles</th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Financiero</th>
                      <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const status = getStatusStyle(p.stockActual, p.stockMinimo);
                      return (
                        <tr key={p.sku} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">{p.nombre}</span>
                              <span className="text-xs text-slate-400 font-mono mt-0.5">{p.sku}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700">{p.categoria || '-'}</span>
                              <span className="text-[11px] text-slate-500 mt-1">
                                Talla: {p.talla || '-'} | Color: {p.color || '-'} | Marca: {p.marca || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} ring-1 ring-inset ring-black/5`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-bold text-slate-800 text-lg leading-none">{p.stockActual}</span>
                              <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Min: {p.stockMinimo}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-medium text-slate-700">${Number(p.costo).toFixed(2)}</span>
                              <span className="text-[10px] text-slate-400 mt-0.5">Venta: ${Number(p.precio).toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setMovementModal({ isOpen: true, type: 'in', product: p })}
                                className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                                title="Sumar Entrada"
                              >
                                <ArrowUpRight size={18} />
                              </button>
                              <button 
                                onClick={() => setMovementModal({ isOpen: true, type: 'out', product: p })}
                                className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                                title="Restar Salida"
                              >
                                <ArrowDownRight size={18} />
                              </button>
                              <div className="w-px h-5 bg-slate-200 mx-1"></div>
                              <button 
                                onClick={() => setProductModal({ isOpen: true, product: p })}
                                className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(p.sku)}
                                disabled={isDeleting === p.sku}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                title="Eliminar"
                              >
                                {isDeleting === p.sku ? <RefreshCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             )}
          </div>
        </div>
      </div>

      <ProductModal 
        isOpen={productModal.isOpen} 
        onClose={() => setProductModal({ isOpen: false, product: null })}
        product={productModal.product}
        onSave={handleSaveProduct}
      />

      <MovementModal 
        isOpen={movementModal.isOpen}
        onClose={() => setMovementModal({ isOpen: false, type: 'in', product: null })}
        product={movementModal.product}
        type={movementModal.type}
        onSave={handleSaveMovement}
      />
    </div>
  );
}
