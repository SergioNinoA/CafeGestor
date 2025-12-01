import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CategoriaProducto, SuggestionResponse } from "../types";

// Inicialización perezosa (Lazy initialization)
// Esto evita que la aplicación se rompa al cargar si la API KEY no está configurada
let aiClient: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiClient) {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      console.warn("API Key de Gemini no configurada.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const generarDatosProducto = async (nombreProducto: string): Promise<SuggestionResponse | null> => {
  try {
    const ai = getAiClient();
    
    if (!ai) {
      alert("La funcionalidad de IA requiere una API KEY configurada en el servidor.");
      return null;
    }

    const prompt = `Genera datos realistas para un producto de cafetería llamado "${nombreProducto}". 
    Estima un precio en USD, inventa un código de producto corto (ej: CAF-01) y una descripción breve y apetitosa en español.
    Clasifícalo en una de las siguientes categorías: Café, Panadería, Pastelería, Bebida Fría, Sándwich, Otro.`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        precio: { type: Type.NUMBER, description: "Precio estimado del producto" },
        codigo: { type: Type.STRING, description: "Código de inventario sugerido (ej: CRO-01)" },
        descripcion: { type: Type.STRING, description: "Descripción corta en español" },
        categoria: { 
          type: Type.STRING, 
          enum: Object.values(CategoriaProducto),
          description: "Categoría del producto"
        }
      },
      required: ["precio", "codigo", "descripcion", "categoria"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SuggestionResponse;
    }
    return null;

  } catch (error) {
    console.error("Error al generar datos con Gemini:", error);
    return null;
  }
};