import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, product, onSave }) {
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    categoria: '',
    ubicacion: '',
    stockInicial: 0,
    entradas: 0,
    salidas: 0,
    stockMinimo: 0,
    costo: 0,
    precio: 0,
    proveedor: '',
    fechaUltimaEntrada: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        nombre: product.nombre || '',
        categoria: product.categoria || '',
        ubicacion: product.ubicacion || '',
        stockInicial: product.stockInicial || 0,
        entradas: product.entradas || 0,
        salidas: product.salidas || 0,
        stockMinimo: product.stockMinimo || 0,
        costo: product.costo || 0,
        precio: product.precio || 0,
        proveedor: product.proveedor || '',
        fechaUltimaEntrada: product.fechaUltimaEntrada || ''
      });
    } else {
      setFormData({
        sku: '',
        nombre: '',
        categoria: '',
        ubicacion: '',
        stockInicial: 0,
        entradas: 0,
        salidas: 0,
        stockMinimo: 0,
        costo: 0,
        precio: 0,
        proveedor: '',
        fechaUltimaEntrada: new Date().toISOString().split('T')[0]
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden mt-10 mb-10">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm font-semibold text-sky-600 mb-2 uppercase tracking-wider">Información Básica</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Código *</label>
              <input required type="text" name="sku" value={formData.sku} onChange={handleChange} disabled={!!product} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none ${product ? 'bg-slate-100 cursor-not-allowed' : ''}`} placeholder="ITEM-001" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto *</label>
              <input required type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="Laptop Dell XPS" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="Electrónicos" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
              <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="Estante A-1" />
            </div>

            <div className="col-span-1 md:col-span-2 mt-4">
              <p className="text-sm font-semibold text-sky-600 mb-2 uppercase tracking-wider">Cantidades</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Inicial</label>
              <input type="number" name="stockInicial" value={formData.stockInicial} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
              <input type="number" name="stockMinimo" value={formData.stockMinimo} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entradas Acumuladas</label>
              <input type="number" name="entradas" value={formData.entradas} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salidas Acumuladas</label>
              <input type="number" name="salidas" value={formData.salidas} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>

            <div className="col-span-1 md:col-span-2 mt-4">
              <p className="text-sm font-semibold text-sky-600 mb-2 uppercase tracking-wider">Información Financiera y Logística</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Costo Unitario ($)</label>
              <input type="number" step="0.01" name="costo" value={formData.costo} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio de Venta ($)</label>
              <input type="number" step="0.01" name="precio" value={formData.precio} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
              <input type="text" name="proveedor" value={formData.proveedor} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Última Entrada</label>
              <input type="date" name="fechaUltimaEntrada" value={formData.fechaUltimaEntrada} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none" />
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center font-medium disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 border-t-2"></span>
              ) : (
                <Save className="mr-2" size={18} />
              )}
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
