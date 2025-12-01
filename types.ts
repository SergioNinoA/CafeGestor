export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  codigo?: string; // Opcional, si falta se muestra "Desconocido"
  categoria: CategoriaProducto;
  descripcion?: string;
}

export enum CategoriaProducto {
  CAFE = 'Café',
  PANADERIA = 'Panadería',
  PASTELERIA = 'Pastelería',
  BEBIDA_FRIA = 'Bebida Fría',
  SANDWICH = 'Sándwich',
  OTRO = 'Otro'
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

export interface SuggestionResponse {
  precio: number;
  codigo: string;
  descripcion: string;
  categoria: CategoriaProducto;
}