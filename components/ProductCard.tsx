import React from 'react';
import { Plus, Tag, Coffee, Trash2, Edit } from 'lucide-react';
import { Producto } from '../types';

interface ProductCardProps {
  producto: Producto;
  onAdd: (producto: Producto) => void;
  onEdit: (producto: Producto) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ producto, onAdd, onEdit, onDelete }) => {
  // Función para formatear precios: muestra decimales solo si existen
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CO', { maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
            <Coffee size={12} />
            <span>{producto.categoria}</span>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(producto); }}
              className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
              title="Editar"
            >
              <Edit size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(producto.id); }}
              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">{producto.nombre}</h3>
        <p className="text-sm text-slate-500 mb-3 line-clamp-2 min-h-[2.5em]">
          {producto.descripcion || 'Sin descripción disponible.'}
        </p>
        
        <div className="flex items-center text-xs text-slate-400 mb-4">
          <Tag size={12} className="mr-1" />
          <span>Cód: <span className="font-mono text-slate-600">{producto.codigo || 'DESCONOCIDO'}</span></span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <span className="text-xl font-bold text-slate-900">${formatPrice(producto.precio)}</span>
        <button 
          onClick={() => onAdd(producto)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg flex items-center transition-colors active:scale-95"
        >
          <Plus size={20} />
          <span className="ml-2 text-sm font-medium">Agregar</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;