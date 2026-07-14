export interface Partido {
  id: number;
  fase: string;
  grupo: string;
  estadio: string;
  equipo_local: string;
  equipo_visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  jugado?: boolean;
  prediccion?: {
    id: number; // <--- AGREGA ESTA LÍNEA
    goles_local: number | null;
    goles_visitante: number | null;
    bloqueado: boolean;
  };
  puntos_obtenidos?: number;
}
export interface PrediccionResagada {
  id: number;
  prediccion_id: number;
  nombre_usuario: string;
  goles_local_asignado: number;
  goles_visitante_asignado: number;
}