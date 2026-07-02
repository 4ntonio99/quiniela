import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Ranking() {
  const [lista, setLista] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarRanking = async () => {
      try {
        const res = await api.get('/usuarios/ranking');
        console.log("Datos recibidos:", res.data); // <--- MIRA LA CONSOLA DEL NAVEGADOR (F12)
        setLista(res.data);
      } catch (err) {
        console.error("Error al cargar ranking:", err);
      }
    };
    cargarRanking();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-center text-3xl font-bold mb-4">Ranking</h1>
      <button onClick={() => navigate('/')} className="bg-gray-700 px-4 py-2 rounded mb-4">Volver</button>
      
      <div className="max-w-md mx-auto bg-gray-800 p-4 rounded">
        {lista.length === 0 ? (
          <p className="text-center">No hay datos o cargando...</p>
        ) : (
          lista.map((u, i) => (
            <div key={i} className="flex justify-between p-2 border-b border-gray-700">
              <span>{u.username}</span>
              <span className="text-yellow-400">{u.puntos} puntos</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}