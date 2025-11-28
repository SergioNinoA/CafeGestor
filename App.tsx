import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Coffee, LayoutGrid, List, Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import ProductForm from './components/ProductForm';
import { Producto, ItemCarrito, CategoriaProducto } from './types';

const App: React.FC = () => {
  // Estado de Productos
  const [productos, setProductos] = useState<Producto[]>(() => {
    const saved = localStorage.getItem('cafe_productos');
    // Iniciamos con lo guardado para renderizado inmediato, pero el useEffect actualizará con el JSON
    return saved ? JSON.parse(saved) : [];
  });

  // Estado del Carrito
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => {
    const saved = localStorage.getItem('cafe_carrito');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado UI
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart'>('menu');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos desde JSON externo SIEMPRE para asegurar actualización
  useEffect(() => {
    fetch('./productos.json')
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar el archivo de productos');
        return response.json();
      })
      .then((productosDelArchivo: Producto[]) => {
        // LÓGICA DE SINCRONIZACIÓN:
        // 1. El archivo JSON es la autoridad (Source of Truth).
        // 2. Conservamos productos locales SOLO si son nuevos (IDs que no están en el JSON).
        
        const saved = localStorage.getItem('cafe_productos');
        let productosFinales = [...productosDelArchivo];

        if (saved) {
          try {
            const productosLocales: Producto[] = JSON.parse(saved);
            
            // Encontramos productos que creó el usuario localmente (ID no existe en el archivo)
            const productosSoloLocales = productosLocales.filter(local => 
              !productosDelArchivo.some(archivo => archivo.id === local.id)
            );

            // Los agregamos a la lista oficial
            if (productosSoloLocales.length > 0) {
              productosFinales = [...productosFinales, ...productosSoloLocales];
            }
          } catch (e) {
            console.error("Error procesando caché local", e);
          }
        }

        setProductos(productosFinales);
        // Actualizamos localStorage para la próxima vez
        localStorage.setItem('cafe_productos', JSON.stringify(productosFinales));
      })
      .catch(error => {
        console.error('Error cargando productos iniciales:', error);
        // Si falla la carga (ej. offline y sin caché), no hacemos nada y dejamos lo que haya en el state
      });
  }, []);

  // Persistencia del Carrito (Productos ya se persiste en el useEffect de carga y al modificar)
  useEffect(() => {
    localStorage.setItem('cafe_carrito', JSON.stringify(carrito));
  }, [carrito]);

  // Persistencia de Productos (solo cuando agregamos/editamos manualmente)
  useEffect(() => {
    if (productos.length > 0) {
      localStorage.setItem('cafe_productos', JSON.stringify(productos));
    }
  }, [productos]);

  // Lógica de Carrito
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.producto.id === producto.id);
      if (existe) {
        return prev.map(item => 
          item.producto.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== id));
  };

  const actualizarCantidad = (id: string, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.producto.id === id) {
        const nuevaCantidad = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const limpiarCarrito = () => setCarrito([]);

  // Lógica de Productos (CRUD)
  const guardarProducto = (producto: Producto) => {
    if (productos.some(p => p.id === producto.id)) {
      setProductos(prev => prev.map(p => p.id === producto.id ? producto : p));
    } else {
      setProductos(prev => [...prev, producto]);
    }
  };

  const eliminarProducto = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      setProductos(prev => prev.filter(p => p.id !== id));
      eliminarDelCarrito(id);
    }
  };

  const prepararEdicion = (producto: Producto) => {
    setProductoAEditar(producto);
    setIsModalOpen(true);
  };

  const abrirNuevoProducto = () => {
    setProductoAEditar(null);
    setIsModalOpen(true);
  };

  // --- Lógica de Importación / Exportación ---

  const exportarDatos = (formato: 'json' | 'csv') => {
    let contenido = '';
    let tipoMime = '';
    let extension = '';

    if (formato === 'json') {
      contenido = JSON.stringify(productos, null, 2);
      tipoMime = 'application/json';
      extension = 'json';
    } else {
      // Generar CSV
      const headers = ['id', 'nombre', 'precio', 'codigo', 'categoria', 'descripcion'];
      const filas = productos.map(p => {
        return [
          p.id,
          `"${p.nombre.replace(/"/g, '""')}"`,
          p.precio,
          p.codigo || '',
          p.categoria,
          `"${(p.descripcion || '').replace(/"/g, '""')}"`
        ].join(',');
      });
      contenido = '\uFEFF' + [headers.join(','), ...filas].join('\n');
      tipoMime = 'text/csv;charset=utf-8';
      extension = 'csv';
    }

    const blob = new Blob([contenido], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_cafeteria.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const manejarImportacion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let nuevosProductos: Producto[] = [];

        if (file.name.endsWith('.json')) {
          nuevosProductos = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          const lineas = text.split('\n').map(l => l.trim()).filter(l => l);
          const dataRows = lineas.slice(1);
          
          nuevosProductos = dataRows.map(row => {
            const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^",]*))/g;
            const matches = [];
            let match;
            while ((match = regex.exec(row))) {
                let val = match[1] ? match[1].replace(/""/g, '"') : match[2];
                matches.push(val);
            }

            return {
              id: matches[0] || crypto.randomUUID(), 
              nombre: matches[1] || 'Sin Nombre',
              precio: parseFloat(matches[2] || '0'),
              codigo: matches[3],
              categoria: (matches[4] as CategoriaProducto) || CategoriaProducto.OTRO,
              descripcion: matches[5]
            };
          });
        } else {
          alert('Formato no soportado. Usa .json o .csv');
          return;
        }

        if (nuevosProductos.length > 0) {
          const opcion = window.confirm(
            `Se encontraron ${nuevosProductos.length} productos.\n\n` +
            `Presiona ACEPTAR para COMBINAR con tus productos actuales.\n` +
            `Presiona CANCELAR para REEMPLAZAR todo el inventario.`
          );

          if (opcion) {
            setProductos(prev => {
              const mapa = new Map(prev.map(p => [p.id, p]));
              nuevosProductos.forEach(nuevo => {
                mapa.set(nuevo.id, nuevo);
              });
              return Array.from(mapa.values());
            });
            alert('Inventario actualizado y ampliado.');
          } else {
            if(window.confirm("¿Estás seguro? Esto borrará todos los productos actuales.")) {
              setProductos(nuevosProductos);
              alert('Inventario reemplazado completamente.');
            }
          }
        }
      } catch (error) {
        console.error(error);
        alert('Error al leer el archivo. Verifica el formato.');
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const triggerImportar = () => fileInputRef.current?.click();

  // Filtrado
  const productosFiltrados = productos.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                          (p.codigo && p.codigo.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideCategoria = filtroCategoria === 'Todos' || p.categoria === filtroCategoria;
    return coincideTexto && coincideCategoria;
  });

  const cantidadTotalCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 pt-safe">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
              <Coffee size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">CaféGestor</h1>
              <p className="text-xs text-slate-400">Punto de Venta</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-1 mr-2">
              <button 
                onClick={() => exportarDatos('json')} 
                className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-amber-400 transition-colors"
                title="Descargar respaldo JSON"
              >
                <FileJson size={18} />
              </button>
              <button 
                onClick={() => exportarDatos('csv')} 
                className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-green-400 transition-colors"
                title="Descargar Excel/CSV"
              >
                <FileSpreadsheet size={18} />
              </button>
              <div className="w-px h-4 bg-slate-600 mx-1"></div>
              <button 
                onClick={triggerImportar} 
                className="p-2 hover:bg-slate-700 rounded text-slate-300 hover:text-blue-400 transition-colors"
                title="Importar archivo"
              >
                <Upload size={18} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={manejarImportacion} 
                accept=".json,.csv" 
                className="hidden" 
              />
            </div>

            <button 
              className="md:hidden relative p-2"
              onClick={() => setActiveTab(activeTab === 'menu' ? 'cart' : 'menu')}
            >
              <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cantidadTotalCarrito}
              </div>
              {activeTab === 'menu' ? <LayoutGrid size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:flex gap-6 overflow-hidden">
        <section className={`flex-1 flex flex-col ${activeTab === 'cart' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between sticky top-0 z-20">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o código..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:ml-4 hide-scrollbar">
              <button 
                onClick={() => setFiltroCategoria('Todos')}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filtroCategoria === 'Todos' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Todos
              </button>
              {Object.values(CategoriaProducto).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${filtroCategoria === cat ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={triggerImportar}
                className="md:hidden bg-slate-100 text-slate-700 p-2 rounded-lg"
                title="Importar"
              >
                <Upload size={20} />
              </button>
              <button 
                onClick={() => exportarDatos('csv')}
                className="md:hidden bg-slate-100 text-slate-700 p-2 rounded-lg"
                title="Exportar CSV"
              >
                <Download size={20} />
              </button>

              <button 
                onClick={abrirNuevoProducto}
                className="ml-auto bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-lg font-semibold flex items-center shadow-sm hover:shadow active:scale-95 transition-all whitespace-nowrap"
              >
                <Plus size={20} className="mr-2" />
                <span className="hidden sm:inline">Nuevo</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-0 overflow-y-auto">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map(producto => (
                <ProductCard 
                  key={producto.id} 
                  producto={producto} 
                  onAdd={agregarAlCarrito}
                  onEdit={prepararEdicion}
                  onDelete={eliminarProducto}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400">
                <Coffee size={48} className="mx-auto mb-4 opacity-20" />
                <p>No se encontraron productos.</p>
              </div>
            )}
          </div>
        </section>

        <section className={`w-full md:w-96 lg:w-[400px] flex-shrink-0 ${activeTab === 'menu' ? 'hidden md:flex' : 'flex'}`}>
          <div className="sticky top-24 w-full h-[calc(100vh-8rem)]">
            <Cart 
              items={carrito} 
              onRemove={eliminarDelCarrito} 
              onUpdateQuantity={actualizarCantidad}
              onClear={limpiarCarrito}
            />
          </div>
        </section>
      </main>

      {activeTab === 'menu' && cantidadTotalCarrito > 0 && (
        <button 
          onClick={() => setActiveTab('cart')}
          className="md:hidden fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-xl flex items-center justify-center z-40 animate-bounce-subtle"
        >
          <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
            {cantidadTotalCarrito}
          </div>
          <List size={24} />
        </button>
      )}

      <ProductForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={guardarProducto}
        productToEdit={productoAEditar}
      />
    </div>
  );
};

export default App;