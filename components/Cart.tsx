import React, { useState } from 'react';
import { Trash2, ShoppingBag, Minus, Plus, Calculator, Banknote } from 'lucide-react';
import { ItemCarrito } from '../types';

interface CartProps {
  items: ItemCarrito[];
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClear: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onRemove, onUpdateQuantity, onClear }) => {
  const [pago, setPago] = useState('');

  const total = items.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  const montoPago = parseFloat(pago) || 0;
  const cambio = montoPago - total;

  // Función auxiliar para formatear precios inteligentemente
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', { maximumFractionDigits: 2 });
  };

  const handleCobrar = () => {
    if (items.length === 0) return;

    if (montoPago === 0) {
      if(window.confirm(`Total a cobrar: $${formatPrice(total)}\n\n¿Deseas registrar la venta sin calcular cambio?`)){
         onClear();
         setPago('');
      }
      return;
    }

    if (cambio < 0) {
      alert(`⚠️ Falta dinero.\n\nEl cliente debe pagar $${formatPrice(Math.abs(cambio))} más.`);
      return;
    }

    // Confirmación final con el cambio
    if (window.confirm(`✅ Venta Exitosa\n\nTotal: $${formatPrice(total)}\nPagado: $${formatPrice(montoPago)}\n\n--------------------------------\nCAMBIO A DEVOLVER: $${formatPrice(cambio)}\n--------------------------------\n\n¿Finalizar y limpiar pedido?`)) {
      onClear();
      setPago('');
    }
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

      <div className="p-4 bg-slate-900 text-white shadow-inner-lg">
        <div className="flex justify-between items-center mb-1 text-slate-300 text-sm">
          <span>Subtotal</span>
          <span>${formatPrice(total)}</span>
        </div>
        
        {/* Input de Pago */}
        <div className="flex justify-between items-center mt-3 mb-2">
          <label htmlFor="inputPago" className="flex items-center text-amber-400 text-sm font-medium">
            <Calculator size={16} className="mr-2" />
            Paga con:
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              id="inputPago"
              type="number"
              value={pago}
              onChange={(e) => setPago(e.target.value)}
              placeholder="0"
              className="w-32 bg-slate-800 border border-slate-700 rounded-lg py-1 pl-6 pr-2 text-right text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Sección de Cambio / Vueltas */}
        <div className={`flex justify-between items-center py-2 border-t border-slate-700 transition-all ${montoPago > 0 ? 'opacity-100' : 'opacity-50'}`}>
          <span className="text-sm font-medium text-slate-300">Cambio / Vueltas</span>
          <span className={`text-xl font-bold ${cambio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${formatPrice(cambio)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-600">
          <span className="text-lg font-bold">Total a Pagar</span>
          <span className="text-2xl font-bold text-amber-400">${formatPrice(total)}</span>
        </div>

        <button 
          onClick={handleCobrar}
          className={`w-full mt-4 font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center ${
            montoPago > 0 && cambio >= 0
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)]'
              : 'bg-amber-500 hover:bg-amber-600 text-slate-900'
          }`}
        >
          <Banknote className="mr-2" size={20} />
          {montoPago > 0 && cambio >= 0 ? 'Finalizar Venta' : 'Cobrar Pedido'}
        </button>
      </div>
    </div>
  );
};

export default Cart;