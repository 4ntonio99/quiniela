import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import type { Partido } from '../types/partido';

import './user/user.scss';

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [quinielaData, setQuinielaData] = useState<{ usuario: string; total_puntos: number; datos: Partido[] }>({ usuario: "", total_puntos: 0, datos: [] });
  const [misQuinielas, setMisQuinielas] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [quinielaSeleccionada, setQuinielaSeleccionada] = useState<any>(null);
  const esPartidoValido = (p: Partido) => p.equipo_local !== null && p.equipo_visitante !== null;
  
  const [fase, setFase] = useState('Ranking'); 
  const [grupo, setGrupo] = useState('A');
  const [tempPreds, setTempPreds] = useState<Record<number, { local: number | null, visita: number | null }>>({});

  const fases = ['Ranking', 'Todos', 'Grupos', '16avos', '8avos', '4tos', 'Semifinal', 'Final'];
  const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  

  const fetchQuinielas = async () => {
    try {
      const res = await api.get('/quinielas/todas');
      const aprobadas = res.data.filter((q: any) => q.is_approved === true);
      setMisQuinielas(aprobadas);
    } catch (error) { console.error("Error al cargar quinielas:", error); }
  };

  const fetchRanking = async () => {
    try {
      const res = await api.get('/quinielas/ranking');
      setRanking(res.data);
    } catch (error) { console.error("Error al cargar ranking:", error); }
  };

  const fetchPartidos = async () => {
    if (!quinielaSeleccionada) return;
    try {
      const res = await api.get(`/partidos/quiniela?quiniela_id=${quinielaSeleccionada.id}`);
      setQuinielaData(res.data);
      setTempPreds({});
    } catch (error: any) { alert(error.response?.data?.detail || "Error al cargar partidos."); }
  };

  const solicitarGratis = async () => {
    try {
      await api.post('/quinielas/gratis');
      alert("¡Bienvenido! Tu quiniela gratis ha sido activada.");
      fetchQuinielas();
    } catch (error: any) { alert(error.response?.data?.detail || "Ya has solicitado tu quiniela gratuita."); }
  };

  const solicitarQuiniela = async (isRandom: boolean) => {
    try {
      await api.post(`/quinielas/solicitar?is_random=${isRandom}`);
      alert("Solicitud enviada. Espera a que el administrador la apruebe.");
      fetchQuinielas();
    } catch (error) { alert("Error al solicitar quiniela"); }
  };

  useEffect(() => { 
    fetchQuinielas(); 
    fetchRanking();
  }, []);

  useEffect(() => { fetchPartidos(); }, [quinielaSeleccionada]);

  const handleInputChange = (id: number, field: 'local' | 'visita', value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    setTempPreds(prev => ({ ...prev, [id]: { ...prev[id] || { local: null, visita: null }, [field]: numValue } }));
  };

  const guardarPrediccion = async (id: number, p: Partido) => {
    if (!quinielaSeleccionada) return;
    const pred = tempPreds[id];
    const golesLocal = pred?.local ?? p.prediccion?.goles_local;
    const golesVisita = pred?.visita ?? p.prediccion?.goles_visitante;
    if (golesLocal === null || golesVisita === null) return;
    try {
      await api.post('/predicciones/', { quiniela_id: quinielaSeleccionada.id, partido_id: id, goles_local_pred: golesLocal, goles_visitante_pred: golesVisita });
      alert("¡Predicción guardada!");
      fetchPartidos();
    } catch (error) { alert("Error al guardar predicción"); }
  };

const partidosFiltrados = quinielaData.datos.filter(p => {
    // CAMBIO: Ya no filtramos por "esPartidoValido" de forma global.
    // Esto permite que el componente muestre los partidos según la fase seleccionada.
    
    // 1. Filtro de Fases
    if (fase === 'Ranking') return false;
    if (fase === 'Todos') return true;

    const pFase = p.fase.toLowerCase();
    const filtroFase = fase.toLowerCase();

    // Lógica para mostrar partidos de la fase seleccionada
    return pFase.includes(filtroFase);
});
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Quiniela 2026</h1>
            <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">Salir</button>
        </div>

<div className="bg-gray-800 p-6 rounded-xl mb-8 border border-blue-500">
    <h2 className="text-xl font-bold mb-4">¿Quieres jugar?</h2>
    <div className="dashContainer">
        {/* Solo mostramos el botón de gratis si NO hay quinielas */}
        {misQuinielas.length === 0 && (
            <button onClick={solicitarGratis}>¡Obtener mi Quiniela GRATIS!</button>
        )}
        
        {/* Estos siempre se muestran, o puedes envolverlos también si lo deseas */}
        <button onClick={() => solicitarQuiniela(false)}>Solicitar por Decisión</button>
        <button onClick={() => solicitarQuiniela(true)}>Solicitar Aleatoria</button>
    </div>
</div>

        <h2 className="text-xl font-bold mb-4">Mis Quinielas Aprobadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {misQuinielas.map((q) => (
            <button key={q.id} onClick={() => setQuinielaSeleccionada(q)} className={`p-4 rounded-xl border-2 ${quinielaSeleccionada?.id === q.id ? 'border-blue-400 bg-gray-800' : 'border-blue-600 bg-blue-900/20'}`}>
              <h3 className="font-bold">{q.is_random ? "Aleatoria" : "Decisión"}-{q.id}</h3>
              <p className="text-xl font-mono text-yellow-400">{q.puntos} pts</p>
            </button>
          ))}
        </div>

        {quinielaSeleccionada && (
          <div className="bg-gray-800 p-6 rounded-xl">
             <div className="fase">
               {fases.map(f => <button key={f} onClick={() => setFase(f)} className="faseBtn">{f}</button>)}
             </div>

             {fase === 'Ranking' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['Decisión', 'Aleatoria'].map(tipo => (
                        <div key={tipo} className="bg-gray-700 p-4 rounded-lg">
                            <h3 className="font-bold mb-3 border-b border-gray-600">{tipo}</h3>
                            {ranking.filter(r => (tipo === 'Aleatoria' ? r.is_random : !r.is_random))
                               .sort((a, b) => b.puntos - a.puntos)
                               .map((r, i) => (
                                 <div key={i} className="flex justify-between py-1 text-sm">
                                    <span>{i + 1}. {r.username}</span>
                                    <span className="font-bold text-yellow-400">{r.puntos} pts</span>
                                 </div>
                            ))}
                        </div>
                    ))}
                </div>
             ) : (
                <>
                    {fase === 'Grupos' && (
                        <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-700 pb-4">
                            {grupos.map(g => <button key={g} onClick={() => setGrupo(g)} className={`px-2 py-1 text-sm rounded ${grupo === g ? 'bg-green-600' : 'bg-gray-700'}`}>Grupo {g}</button>)}
                        </div>
                    )}
                    <table className="w-full text-center border-collapse">
                        <tbody>
                            {partidosFiltrados.map((p) => (
<tr key={p.id} className="border-b border-gray-700">
    {/* AQUÍ ES DONDE REEMPLAZAS LAS CELDAS */}
    <td className="p-2">{p.equipo_local || "Por definir"}</td>
    
    <td className="p-2">
        <input 
            disabled={p.prediccion?.goles_local != null || quinielaSeleccionada.is_random} 
            value={tempPreds[p.id]?.local ?? p.prediccion?.goles_local ?? ''} 
            onChange={(e) => handleInputChange(p.id, 'local', e.target.value)} 
            className="w-12 bg-gray-900 border border-gray-600 rounded text-center" 
        />
        <span className="mx-1">-</span>
        <input 
            disabled={p.prediccion?.goles_local != null || quinielaSeleccionada.is_random} 
            value={tempPreds[p.id]?.visita ?? p.prediccion?.goles_visitante ?? ''} 
            onChange={(e) => handleInputChange(p.id, 'visita', e.target.value)} 
            className="w-12 bg-gray-900 border border-gray-600 rounded text-center" 
        />
    </td>
    
    <td className="p-2">{p.equipo_visitante || "Por definir"}</td>
    
    <td className="p-2">
        {!(p.prediccion?.goles_local != null) && !quinielaSeleccionada.is_random && (
            <button onClick={() => guardarPrediccion(p.id, p)} className="bg-green-600 px-2 py-1 rounded text-xs">Guardar</button>
        )}
    </td>
</tr>
                            ))}
                        </tbody>
                    </table>
                </>
             )}
          </div>
        )}
      </div>
    </div>
  );
}