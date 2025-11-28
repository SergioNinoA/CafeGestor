import React from 'react';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { ItemCarrito } from '../types';

interface CartProps {
  items: ItemCarrito[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClear: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onRemove, onUpdateQuantity, onClear }) => {
  const total = items.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);

  // Función auxiliar para formatear precios inteligentemente
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', { maximumFractionDigits: 2 });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <ShoppingBag size={48} className="mb-4 opacity-50" />
        <p className="text-center font-medium">Tu pedido está vacío</p>
        <p className="text-sm">Agrega productos del menú</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 flex items-center">
          <ShoppingBag className="mr-2" size={20} />
          Pedido Actual
        </h2>
        <button 
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline"
        >
          Limpiar todo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item) => (
          <div key={item.producto.id} className="flex justify-between items-start group">
            <div className="flex-1">
              <h4 className="font-medium text-slate-800 text-sm">{item.producto.nombre}</h4>
              <p className="text-xs text-slate-500">
                {item.producto.codigo || 'S/C'} — ${formatPrice(item.producto.precio)} c/u
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-slate-100 rounded-lg">
                <button 
                  onClick={() => onUpdateQuantity(item.producto.id, -1)}
                  className="p-1 hover:text-red-500 transition-colors"
                  disabled={item.cantidad <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.cantidad}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.producto.id, 1)}
                  className="p-1 hover:text-green-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="text-right w-20">
                <div className="font-bold text-sm text-slate-900">
                  ${formatPrice(item.producto.precio * item.cantidad)}
                </div>
              </div>
              <button 
                onClick={() => onRemove(item.producto.id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-900 text-white">
        <div className="flex justify-between items-center mb-1 text-slate-300 text-sm">
          <span>Subtotal</span>
          <span>${formatPrice(total)}</span>
        </div>
        <div className="flex justify-between items-center mb-4 text-slate-300 text-sm">
          <span>Impuestos (0%)</span>
          <span>$0</span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
          <span className="text-lg font-bold">Total a Pagar</span>
          <span className="text-2xl font-bold text-amber-400">${formatPrice(total)}</span>
        </div>
        <button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-4 rounded-lg transition-colors">
          Cobrar Pedido
        </button>
      </div>
    </div>
  );
};

export default Cart;