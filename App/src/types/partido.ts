export interface Partido {
  id: number;
  fase: string;
  grupo: string;
  estadio: string;
  equipo_local: string;
  equipo_visitante: string;
  // Estos son los únicos campos de goles que tu API envía realmente
  goles_local: number | null;
  goles_visitante: number | null;
  jugado?: boolean; // Asegúrate de tener este para saber si se jugó
  prediccion?: {
    goles_local: number | null;
    goles_visitante: number | null;
    bloqueado: boolean;
  };
  puntos_obtenidos?: number;
}