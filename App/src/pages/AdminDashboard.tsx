import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import type { Partido } from '../types/partido';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [tempResults, setTempResults] = useState<Record<number, { local: number | null, visita: number | null }>>({});
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => { 
    fetchPartidos(); 
    fetchSolicitudes();
  }, []);

  const gestionarSolicitud = async (id: number, aprobar: boolean) => {
    try {
      if (aprobar) { await api.put(`/quinielas/admin/aprobar/${id}`); } 
      else { await api.delete(`/quinielas/admin/rechazar/${id}`); }
      alert(aprobar ? "Quiniela aprobada" : "Solicitud rechazada");
      fetchSolicitudes();
    } catch (error) { alert("Error al procesar solicitud"); }
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

const handleUploadEquipos = async () => {
    if (!selectedFile) return alert("Por favor selecciona un archivo primero");

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        
        // 1. Transformar el texto a un array de objetos
        const equiposActualizados = text.split('\n')
            .filter(line => line.trim() !== '') // Eliminar líneas vacías
            .map(line => {
                const [id, local, visita] = line.split('|');
                return {
                    id: parseInt(id.trim()),           // Convertir ID a número
                    equipo_local: local.trim(),       // Eliminar espacios innecesarios
                    equipo_visitante: visita.trim()   // Eliminar espacios innecesarios
                };
            });

        // 2. Enviar el array de objetos al backend
        try {
            console.log("Enviando al backend:", JSON.stringify(equiposActualizados, null, 2));
            await api.post('/partidos/admin/actualizar-equipos-bulk', equiposActualizados);
            
            alert("¡Equipos actualizados exitosamente!");
            fetchPartidos(); // Recargar la tabla
        } catch (error) {
            console.error(error);
            alert("Error al enviar los datos al servidor");
        }
    };
    reader.readAsText(selectedFile);
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFile(e.target.files[0]);
  };

const ejecutarRecalculo = async () => {
  if (!window.confirm("¿Estás seguro de recalcular todos los puntos? Esto puede tardar unos segundos.")) return;
  
  try {
    await api.post('/partidos/admin/recalcular-todos');
    alert("¡Puntos recalculados exitosamente!");
  } catch (error) {
    alert("Error al recalcular puntos");
  }
};

  const handleUpload = async () => {
    if (!selectedFile) return alert("Por favor selecciona un archivo primero");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post('/partidos/admin/cargar-resultados-txt', formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("¡Resultados actualizados exitosamente!");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTempResults({}); 
      fetchPartidos(); 
    } catch (error) { 
      console.error(error);
      alert("Error al subir el archivo"); 
    }
  };

  const handleInputChange = (id: number, field: 'local' | 'visita', value: string, currentPartido: Partido) => {
    const val = value === '' ? null : parseInt(value);
    setTempResults(prev => ({
      ...prev,
      [id]: {
        local: field === 'local' ? val : (prev[id]?.local ?? currentPartido.goles_local ?? null),
        visita: field === 'visita' ? val : (prev[id]?.visita ?? currentPartido.goles_visitante ?? null)
      }
    }));
  };

  const registrarResultado = async (id: number) => {
    const data = tempResults[id];
    if (!data) return;
    try {
      await api.put(`/partidos/${id}/resultado`, { goles_local: data.local, goles_visitante: data.visita });
      alert("Resultado guardado");
      setTempResults(prev => { const newState = { ...prev }; delete newState[id]; return newState; });
      fetchPartidos();
    } catch (error) { alert("Error al guardar resultado"); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Encabezado con Cerrar Sesión */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-500">
          Cerrar Sesión
        </button>
      </div>
{/* Sección de Solicitudes */}
<div className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
  <h2 className="text-xl font-bold mb-4">Solicitudes Pendientes</h2>
  {solicitudes.map((s) => (
    <div key={s.id} className="flex justify-between p-2 border-b border-gray-700">
      <div>
        <span className="font-semibold">Usuario: {s.username}</span>
        <span className="ml-4 text-sm text-gray-400">
          {/* Ajusta 's.es_aleatoria' al nombre real de tu propiedad en la BD */}
          ({s.is_random ? "Aleatoria" : "Elección"})
        </span>
      </div>
      <div>
        <button onClick={() => gestionarSolicitud(s.id, true)} className="text-green-400 mr-4">Aprobar</button>
        <button onClick={() => gestionarSolicitud(s.id, false)} className="text-red-400">Rechazar</button>
      </div>
    </div>
  ))}
</div>
{/*Actualizar partidos*/}
<div className="bg-gray-800 p-6 rounded-xl mb-8 border border-purple-500">
    <h2 className="text-xl font-bold mb-4">Actualizar Nombres de Equipos (Bulk)</h2>
    <p className="text-sm text-gray-400 mb-4">Formato: ID|EquipoLocal|EquipoVisita</p>
    <div className="flex items-center gap-4">
        <input 
            type="file" 
            accept=".txt" 
            onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} 
            className="text-sm bg-gray-900 p-2 rounded border border-gray-600" 
        />
        <button 
            onClick={handleUploadEquipos} 
            disabled={!selectedFile} 
            className="bg-purple-600 px-4 py-2 rounded font-bold hover:bg-purple-500 disabled:opacity-50"
        >
            Actualizar Equipos
        </button>
    </div>
</div>

<div className="bg-gray-800 p-6 rounded-xl mb-8 border border-green-500">
    <h2 className="text-xl font-bold mb-4">Reportes</h2>
    <button 
        onClick={descargarReporte} 
        className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-500"
    >
        Descargar Reporte TXT (.txt)
    </button>
</div>
{/*Recarga de puntos*/}
<div className="bg-gray-800 p-6 rounded-xl mb-8 border border-yellow-500">
    <h2 className="text-xl font-bold mb-4">Acciones Administrativas</h2>
    <button 
        onClick={ejecutarRecalculo} 
        className="bg-yellow-600 px-6 py-2 rounded font-bold hover:bg-yellow-500"
    >
        Recalcular Puntos Globales
    </button>
</div>

      {/* Carga Masiva */}
      <div className="bg-gray-800 p-6 rounded-xl mb-8 border border-blue-500">
        <h2 className="text-xl font-bold mb-4">Carga Masiva de Resultados</h2>
        <p className="text-sm text-gray-400 mb-4">Formato: ID|Goles Local|Goles Visitante</p>
        <div className="flex items-center gap-4">
          <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFileChange} className="text-sm bg-gray-900 p-2 rounded border border-gray-600" />
          <button onClick={handleUpload} disabled={!selectedFile} className="bg-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-500 disabled:opacity-50">
            Enviar Resultados
          </button>
        </div>
      </div>

      {/* Tabla de Partidos */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Gestionar Resultados</h2>
        <table className="w-full text-center">
          <thead>
            <tr className="text-gray-400 uppercase text-xs">
               <th className="p-3">ID</th><th className="p-3">Local</th><th className="p-3">Goles L</th><th className="p-3">Goles V</th><th className="p-3">Visitante</th><th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
  {partidos
    .sort((a, b) => a.id - b.id) // Ordena por ID de forma ascendente
    .map(p => (
      <tr key={`${p.id}-${p.goles_local}-${p.goles_visitante}`} className="border-t border-gray-700">
        <td className="p-3">{p.id}</td>
        <td className="p-3">{p.equipo_local}</td>
                <td className="p-3">
                  <input 
                    type="number" 
                    value={(tempResults[p.id]?.local ?? p.goles_local ?? '') as (string | number)} 
                    className="w-12 bg-black text-center" 
                    onChange={(e) => handleInputChange(p.id, 'local', e.target.value, p)} 
                  />
                </td>
                <td className="p-3">
                  <input 
                    type="number" 
                    value={(tempResults[p.id]?.visita ?? p.goles_visitante ?? '') as (string | number)} 
                    className="w-12 bg-black text-center" 
                    onChange={(e) => handleInputChange(p.id, 'visita', e.target.value, p)} 
                  />
                </td>
                <td className="p-3">{p.equipo_visitante}</td>
                <td className="p-3">
                  <button onClick={() => registrarResultado(p.id)} className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-500">
                    Guardar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}