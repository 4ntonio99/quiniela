import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import type { Partido } from '../types/partido';

import './admin/admin.scss';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'partidos' | 'quinielas'>('partidos');
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [quinielas, setQuinielas] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [tempResults, setTempResults] = useState<Record<number, { local: number | null, visita: number | null }>>({});
  const [cargando, setCargando] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchPartidos = async () => {
    try {
      const response = await api.get('/partidos/admin/partidos');
      setPartidos([...response.data]); 
    } catch (error) { console.error(error); }
  };

  const fetchSolicitudes = async () => {
    try {
      const response = await api.get('/quinielas/admin/pendientes'); 
      setSolicitudes(response.data);
    } catch (error) { console.error("Error al cargar solicitudes:", error); }
  };

  const fetchQuinielas = async () => {
    try {
      const response = await api.get('/quinielas/admin/todas-las-quinielas');
      setQuinielas(response.data);
    } catch (error) { console.error("Error al cargar quinielas:", error); }
  };

  useEffect(() => { 
    fetchSolicitudes();
    if (activeTab === 'partidos') fetchPartidos();
    else if (activeTab === 'quinielas') fetchQuinielas();
  }, [activeTab]);

  const gestionarSolicitud = async (id: number, aprobar: boolean) => {
    try {
      if (aprobar) await api.put(`/quinielas/admin/aprobar/${id}`);
      else await api.delete(`/quinielas/admin/rechazar/${id}`);
      fetchSolicitudes();
      if (activeTab === 'quinielas') fetchQuinielas();
    } catch (error) { alert("Error al procesar solicitud"); }
  };

const toggleAprobacion = async (id: number, actualEstado: boolean) => {
    try {
        // Llamamos al nuevo endpoint PUT que definimos en el backend
        await api.put(`/quinielas/admin/toggle-aprobacion/${id}`);
        
        // Refrescamos la lista para que el cambio se vea reflejado en la tabla
        fetchQuinielas(); 
    } catch (error) { 
        console.error("Error al cambiar estado:", error);
        alert("No se pudo actualizar el estado de la quiniela"); 
    }
};

  const handleUploadResultados = async () => {
    if (!selectedFile) return alert("Por favor selecciona un archivo primero");
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      await api.post('/partidos/admin/cargar-resultados-txt', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("¡Resultados actualizados exitosamente!");
      fetchPartidos();
    } catch (error) { alert("Error al subir el archivo"); }
  };

  const handleUploadEquipos = async () => {
    if (!selectedFile) return alert("Por favor selecciona un archivo primero");
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        const equiposActualizados = text.split('\n').filter(l => l.trim()).map(l => {
            const [id, local, visita] = l.split('|');
            return { id: parseInt(id.trim()), equipo_local: local.trim(), equipo_visitante: visita.trim() };
        });
        try {
            await api.post('/partidos/admin/actualizar-equipos-bulk', equiposActualizados);
            alert("¡Equipos actualizados!");
            fetchPartidos();
        } catch (error) { alert("Error al actualizar equipos"); }
    };
    reader.readAsText(selectedFile);
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

  const ejecutarRecalculo = async () => {
    if (!window.confirm("¿Recalcular todos los puntos?")) return;
    setCargando(true);
    try {
      await api.post('/partidos/admin/recalcular-todos');
      alert("Recálculo exitoso");
    } catch (error) { alert("Error al recalcular"); }
    finally { setCargando(false); }
  };

  const registrarResultado = async (id: number) => {
    const data = tempResults[id];
    if (!data) return;
    try {
      await api.put(`/partidos/${id}/resultado`, { goles_local: data.local, goles_visitante: data.visita });
      alert("Resultado guardado");
      setTempResults(prev => { const n = { ...prev }; delete n[id]; return n; });
      fetchPartidos();
    } catch (error) { alert("Error al guardar"); }
  };

  const handleInputChange = (id: number, field: 'local' | 'visita', val: string, p: Partido) => {
    const v = val === '' ? null : parseInt(val);
    setTempResults(prev => ({
      ...prev, [id]: {
        local: field === 'local' ? v : (prev[id]?.local ?? p.goles_local ?? null),
        visita: field === 'visita' ? v : (prev[id]?.visita ?? p.goles_visitante ?? null)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      <div className="menuBox">
        <button onClick={() => setActiveTab('partidos')} className={`px-6 py-2 rounded ${activeTab === 'partidos' ? 'bg-blue-600' : 'bg-gray-700'}`}>Gestionar Partidos</button>
        <button onClick={() => setActiveTab('quinielas')} className={`px-6 py-2 rounded ${activeTab === 'quinielas' ? 'bg-blue-600' : 'bg-gray-700'}`}>Ver Todas las Quinielas</button>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">Cerrar Sesión</button>
      </div>

      {activeTab === 'partidos' ? (
        <>
          <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Solicitudes Pendientes</h2>
            {solicitudes.map(s => (
              <div key={s.id} className="flex justify-between p-2 border-b border-gray-700">
                <span>{s.username} ({s.is_random ? "Aleatoria" : "Elección"})</span>
                <div>
                  <button onClick={() => gestionarSolicitud(s.id, true)} className="text-green-400 mr-4">Aprobar</button>
                  <button onClick={() => gestionarSolicitud(s.id, false)} className="text-red-400">Rechazar</button>
                </div>
              </div>
            ))}
          </div>
          <div className="subMenuBox">
            <h2 className="text-xl font-bold mb-4">Herramientas Admin</h2>
            <input type="file" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
            <button onClick={handleUploadResultados} className="bg-blue-600 px-4 py-2 rounded ml-2">Subir Resultados (.txt)</button>
            <button onClick={handleUploadEquipos} className="bg-purple-600 px-4 py-2 rounded ml-2">Actualizar Equipos (.txt)</button>
            <button onClick={ejecutarRecalculo} disabled={cargando} className="bg-yellow-600 px-4 py-2 rounded ml-2">Recalcular Puntos</button>
            <button onClick={descargarReporte} className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-500"> Descargar Reporte TXT (.txt)</button>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <table className="w-full text-center">
              <thead><tr className="text-gray-400"><th>ID</th><th>Local</th><th>Goles L</th><th>Goles V</th><th>Visitante</th><th>Acción</th></tr></thead>
              <tbody>
                {partidos.sort((a,b) => a.id - b.id).map(p => (
                  <tr key={p.id} className="border-t border-gray-700">
                    <td className="p-3">{p.id}</td>
                    <td className="p-3">{p.equipo_local}</td>
                    <td className="p-3"><input type="number" value={(tempResults[p.id]?.local ?? p.goles_local ?? '') as string} className="w-12 bg-black text-center" onChange={(e) => handleInputChange(p.id, 'local', e.target.value, p)} /></td>
                    <td className="p-3"><input type="number" value={(tempResults[p.id]?.visita ?? p.goles_visitante ?? '') as string} className="w-12 bg-black text-center" onChange={(e) => handleInputChange(p.id, 'visita', e.target.value, p)} /></td>
                    <td className="p-3">{p.equipo_visitante}</td>
                    <td className="p-3"><button onClick={() => registrarResultado(p.id)} className="bg-green-600 px-3 py-1 rounded">Guardar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Listado de Todas las Quinielas</h2>
<table className="w-full text-center">
  <thead>
    <tr className="text-gray-400">
      <th>ID</th>
      <th>User ID</th>
      <th>Nombre Usuario</th>
      <th>Puntos</th>
      <th>Tipo</th>
      <th>¿Activa?</th>
      <th>Acción</th>
    </tr>
  </thead>
  <tbody>
    {quinielas.map(q => (
      <tr key={q.id} className="border-t border-gray-700">
        <td className="p-3">{q.id}</td>
        <td className="p-3">{q.user_id}</td>
        <td className="p-3 font-semibold">{q.user_name || 'N/A'}</td>
        <td className="p-3">{q.puntos}</td>
        <td className="p-3">{q.is_random ? 'Aleatoria' : 'Decisión'}</td>
        <td className="p-3">
            {/* Muestra un indicador visual de si está activa */}
            <span className={q.is_approved ? "text-green-500" : "text-gray-500"}>
                {q.is_approved ? 'Sí' : 'No'}
            </span>
        </td>
        <td className="p-3">
<button 
  onClick={() => toggleAprobacion(q.id, q.is_approved)} 
  className={`px-3 py-1 rounded text-sm ${q.is_approved ? 'bg-red-600' : 'bg-green-600'}`}
>
  {q.is_approved ? 'Desaprobar' : 'Aprobar'}
</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      )}
    </div>
  );
}