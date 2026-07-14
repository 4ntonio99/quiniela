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
  const [fase, setFase] = useState('Todos');
  const [grupo, setGrupo] = useState('A');
  const [tempPreds, setTempPreds] = useState<Record<number, { local: number | null, visita: number | null }>>({});
  
  const fases = ['Todos', 'Grupos', '16avos', '8avos', '4tos', 'Semifinal', 'Tercer', 'Final'];
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

  const descargarReporte = async () => {
  try {
    const response = await api.get('/quinielas/admin/descargar-reporte', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_quinielas.txt');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    alert("Error al descargar el reporte");
  }
};

  const solicitarGratis = async () => {
    try {
      await api.post('/quinielas/gratis');
      alert("¡Bienvenido! Tu quiniela gratis ha sido activada.");
      fetchQuinielas();
    } catch (error: any) { alert("Ya has solicitado tu quiniela gratuita."); }
  };

  const solicitarQuiniela = async (isRandom: boolean) => {
    try {
      await api.post(`/quinielas/solicitar?is_random=${isRandom}`);
      alert("Solicitud enviada. Espera a que el administrador la apruebe.");
      fetchQuinielas();
    } catch (error) { alert("Error al solicitar quiniela"); }
  };

  useEffect(() => { fetchQuinielas(); fetchRanking(); }, []);
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

// Cambia la definición para recibir dos parámetros
const llenarAleatorio = async (quinielaId: number, partidoId: number) => {
  try {
    // Construye la URL con los dos parámetros
    await api.post(`/quinielas/admin/llenar-aleatorio/${quinielaId}/${partidoId}`);
    alert("Predicción completada aleatoriamente.");
    fetchPartidos(); 
  } catch (error) {
    console.error(error);
    alert("Error al llenar la predicción aleatoriamente.");
  }
};

const partidosFiltrados = [...quinielaData.datos].filter(p => {
    if (fase === 'Ranking' || fase === 'Todos') return true;
    
    const faseBackend = (p.fase || "").toLowerCase().trim();
    const filtroFase = fase.toLowerCase().trim();

    if (fase === 'Grupos') {
        return faseBackend.includes('grupo') && p.grupo === `Grupo ${grupo}`;
    }

    // CAMBIO: Usamos comparación estricta (===) para evitar solapamientos
    // Por ejemplo, 'final' ya no incluirá 'semifinal'
    if (filtroFase === 'final') return faseBackend === 'final';
    if (filtroFase === 'semifinal') return faseBackend === 'semifinal';
    if (filtroFase === 'tercer') return faseBackend.includes('tercer');
    
    return faseBackend.includes(filtroFase);
})
.sort((a, b) => a.id - b.id);

  const yaTieneQuiniela = misQuinielas.length > 0;
  console.log (ranking)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quiniela 2026</h1>
          <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">Salir</button>
        </div>

{/*Descargar reporte */}
        <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-green-500">
    <h2 className="text-xl font-bold mb-4">Reportes</h2>
    <button 
        onClick={descargarReporte} 
        className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-500"
    >
        Descargar Reporte TXT (.txt)
    </button>
</div>

        <div>
          <h2 className="text-xl font-bold mb-4">¿Quieres jugar?</h2>
          <div className="menu">
            <button disabled={yaTieneQuiniela} onClick={solicitarGratis} className={` ${yaTieneQuiniela ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}>Quiniela Gratis</button>
            <button disabled={!yaTieneQuiniela} onClick={() => solicitarQuiniela(false)} className={` ${!yaTieneQuiniela ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}>Comprar Quiniela por predicción</button>
            <button disabled={!yaTieneQuiniela} onClick={() => solicitarQuiniela(true)} className={` ${!yaTieneQuiniela ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'}`}>Comprar Quiniela sorteada</button>
            <button onClick={() => setFase('Ranking')} className="bg-yellow-600 px-4 py-2 rounded font-bold ml-4 hover:bg-yellow-500">Ver Ranking Global</button>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Mis Quinielas Aprobadas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {misQuinielas.map((q) => (
            <button key={q.id} onClick={() => { setQuinielaSeleccionada(q); setFase('Todos'); }} className={`p-4 rounded-xl border-2 ${quinielaSeleccionada?.id === q.id ? 'border-blue-400 bg-gray-800' : 'border-blue-600 bg-blue-900/20'}`}>
              <h3 className="font-bold">{q.is_random ? "Aleatoria" : "Decisión"}-{q.id}</h3>
              <p className="text-xl font-mono text-yellow-400">{q.puntos} pts</p>
            </button>
          ))}
        </div>
      {fase === 'Ranking' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Decisión', 'Aleatoria'].map(tipo => (
            <div key={tipo} className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-bold mb-3 border-b border-gray-600">{tipo}</h3>
              {ranking.filter(r => (tipo === 'Aleatoria' ? r.is_random : !r.is_random))
                .sort((a, b) => b.puntos - a.puntos)
                .map((r, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm items-center">
                    {/* Agregamos el ID de la quiniela aquí */}
                    <div className="flex items-center gap-2">
                      <span>{i + 1}. {r.username}</span>
                    </div>
                    <span className="font-bold text-yellow-400">{r.puntos} pts</span>
                    <span className="text-gray-400 text-xs">#{r.quiniela_id}</span>
                  </div>
                ))}
            </div>
          ))}
        </div>
        ) : (
          quinielaSeleccionada && (
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="fase mb-4">
                {fases.map(f => (
                  <button key={f} onClick={() => setFase(f)} className={`faseBtn mx-[10px] border-4 ${fase === f ? 'btn-seleccionado' : ''}`}>{f}</button>
                ))}
              </div>
              {fase === 'Grupos' && (
                <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-700 pb-4">
                  {grupos.map(g => (
                    <button key={g} onClick={() => setGrupo(g)} className={`px-2 py-1 text-sm rounded mx-[10px] border-2 ${grupo === g ? 'btn-seleccionado' : ''}`}>Grupo {g}</button>
                  ))}
                </div>
              )}
              <table className="w-full text-center border-collapse">
                <thead><tr className="text-gray-400 text-sm"><th className="p-2">ID</th><th className="p-2">Local</th><th className="p-2">Predicción</th><th className="p-2">Visitante</th><th className="p-2">Real</th><th className="p-2">Puntos</th><th className="p-2">Acción</th></tr></thead>
                <tbody>
                  {partidosFiltrados.map((p) => {
                    const faseLower = p.fase ? p.fase.toLowerCase() : "";
                    const esBloqueado = (faseLower.includes('grupo') || faseLower.includes('16avos')) && !quinielaSeleccionada.is_random;
                    return (
                      <tr key={p.id} className="border-b border-gray-700">
                        <td className="p-2 text-gray-500 text-sm">{p.id}</td>
                        <td className="p-2">{p.equipo_local || "Por definir"}</td>
                        <td className="p-2">
                          <input disabled={p.prediccion?.goles_local != null || quinielaSeleccionada.is_random || esBloqueado} value={tempPreds[p.id]?.local ?? p.prediccion?.goles_local ?? ''} onChange={(e) => handleInputChange(p.id, 'local', e.target.value)} className="w-10 bg-gray-900 border border-gray-600 rounded text-center" />
                          <span className="mx-1">-</span>
                          <input disabled={p.prediccion?.goles_local != null || quinielaSeleccionada.is_random || esBloqueado} value={tempPreds[p.id]?.visita ?? p.prediccion?.goles_visitante ?? ''} onChange={(e) => handleInputChange(p.id, 'visita', e.target.value)} className="w-10 bg-gray-900 border border-gray-600 rounded text-center" />
                        </td>
                        <td className="p-2">{p.equipo_visitante || "Por definir"}</td>
                        <td className="p-2 text-blue-400">{(p.goles_local !== null && p.goles_visitante !== null) ? `${p.goles_local} - ${p.goles_visitante}` : "--"}</td>
                        
                        <td className="p-2 text-yellow-400">{(p as any).puntos_obtenidos > 0 ? `+${(p as any).puntos_obtenidos}` : '0'}</td>
<td className="p-2">
  {!esBloqueado && !quinielaSeleccionada.is_random && (
    <>
      {/* 
         Condición: Si el usuario NO ha llenado su marcador (goles_local == null) 
         Y el admin YA subió el resultado real (p.goles_local !== null), 
         mostramos el botón "Llenar Aleatorio".
      */}
      {p.prediccion?.goles_local == null && p.goles_local !== null ? (
<button 
  onClick={() => llenarAleatorio(quinielaSeleccionada.id, p.id)} // Envías quiniela y partido
  className="bg-purple-600 px-2 py-1 rounded text-xs hover:bg-purple-500"
>
  Llenar Aleatorio
</button>
      ) : (
        /* 
           Si no se cumple la condición anterior, pero el usuario todavía 
           puede guardar (o no ha llenado), mostramos el botón "Guardar".
        */
        !(p.prediccion?.goles_local != null) && (
          <button 
            onClick={() => guardarPrediccion(p.id, p)} 
            className="bg-green-600 px-2 py-1 rounded text-xs hover:bg-green-500"
            
          >
            Guardar
          </button>
        )
      )}
    </>
  )}
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}