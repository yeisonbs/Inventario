import React, { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function MovementModal({ isOpen, onClose, product, type, onSave }) {
  const [cantidad, setCantidad] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !product) return null;

  const isEntrada = type === 'in';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) return;
    
    setLoading(true);
    // Para entradas es positivo, para salidas es negativo
    const amountToUpdate = isEntrada ? Number(cantidad) : -Number(cantidad);
    await onSave(product.sku, amountToUpdate);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isEntrada ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-center gap-2">
            {isEntrada ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
            <h2 className="text-lg font-bold">
              {isEntrada ? 'Registrar Entrada' : 'Registrar Salida'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-1">Producto:</p>
            <p className="font-semibold text-slate-800">{product.nombre}</p>
            <p className="text-xs text-slate-400">SKU: {product.sku} | Stock actual: {product.stockActual}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cantidad a {isEntrada ? 'sumar (ingresar)' : 'restar (retirar)'}
            </label>
            <input 
              required 
              type="number" 
              min="1"
              value={cantidad} 
              onChange={(e) => setCantidad(e.target.value)} 
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-xl text-center ${isEntrada ? 'focus:border-green-500 border-green-200' : 'focus:border-red-500 border-red-200'}`} 
              placeholder="0" 
            />
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button 
              type="submit" 
              disabled={loading || !cantidad} 
              className={`w-full py-3 text-white rounded-lg transition-colors flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed ${isEntrada ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white border-t-2"></span>
              ) : (
                isEntrada ? 'Confirmar Entrada' : 'Confirmar Salida'
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="w-full py-3 border text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
