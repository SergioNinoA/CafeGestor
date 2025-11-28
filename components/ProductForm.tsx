import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Save } from 'lucide-react';
import { Producto, CategoriaProducto } from '../types';
import { generarDatosProducto } from '../services/gemini';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producto: Producto) => void;
  productToEdit?: Producto | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [codigo, setCodigo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaProducto>(CategoriaProducto.OTRO);
  const [descripcion, setDescripcion] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setNombre(productToEdit.nombre);
      setPrecio(productToEdit.precio.toString());
      setCodigo(productToEdit.codigo || '');
      setCategoria(productToEdit.categoria);
      setDescripcion(productToEdit.descripcion || '');
    } else {
      limpiarFormulario();
    }
  }, [productToEdit, isOpen]);

  const limpiarFormulario = () => {
    setNombre('');
    setPrecio('');
    setCodigo('');
    setCategoria(CategoriaProducto.OTRO);
    setDescripcion('');
  };

  const handleGenerateAI = async () => {
    if (!nombre.trim()) return;
    
    setIsGenerating(true);
    const sugerencia = await generarDatosProducto(nombre);
    setIsGenerating(false);

    if (sugerencia) {
      setPrecio(sugerencia.precio.toString());
      setCodigo(sugerencia.codigo);
      setDescripcion(sugerencia.descripcion);
      setCategoria(sugerencia.categoria);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) return;

    const nuevoProducto: Producto = {
      id: productToEdit ? productToEdit.id : crypto.randomUUID(),
      nombre,
      precio: parseFloat(precio),
      codigo: codigo.trim() === '' ? undefined : codigo,
      categoria,
      descripcion
    };

    onSave(nuevoProducto);
    limpiarFormulario();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Producto</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                placeholder="Ej. Latte Vainilla"
                required
              />
              {!productToEdit && (
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !nombre.trim()}
                  className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  title="Completar con IA"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                </button>
              )}
            </div>
            {!productToEdit && <p className="text-xs text-slate-500 mt-1">💡 Escribe el nombre y pulsa la estrella para autocompletar.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaProducto)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
            >
              {Object.values(CategoriaProducto).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none h-20 resize-none"
              placeholder="Descripción breve..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 mt-2"
          >
            <Save size={20} />
            <span>Guardar Producto</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;