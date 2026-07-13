import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

import './login/login.scss';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showReglas, setShowReglas] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { 
        username: username, 
        password: password, 
        is_admin: false 
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      await login(username, password);
    } catch (error: any) {
      alert(`Error: ${JSON.stringify(error.response?.data?.detail || "Error desconocido")}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) { 
      console.error(error);
      alert('Error: verifica tus credenciales'); 
    }
  };

  return (
    <section >
      <form className='loginForm' onSubmit={handleLogin}>
        <h2 >Binevenido a Quiniela App</h2>
        
        <input type="text" placeholder="Usuario" onChange={(e) => setUsername(e.target.value)} required/>
        <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} required/>
        <div className='btnBox'>
          <button>
            Iniciar Sesión
          </button>
          
          <button type="button" onClick={handleRegister}>
            Registrarse
          </button>

          <button type="button" onClick={() => setShowReglas(true)}>Reglas</button>
        </div>
      </form>
      
      {showReglas && (
        <div className="modal">
          <div className="modal-content">
            <h3>Reglas de la Quiniela</h3>
            <p>Bienvenido a nuestra comunidad de pronósticos. Para asegurar una experiencia justa y transparente para todos, las reglas de participación son las siguientes: <br></br><br></br>

            1. Tipos de Quiniela<br></br>
            Cada usuario cuenta con dos modalidades para participar, cada una con características únicas:<br></br><br></br>

            Quiniela Aleatoria: Es una quiniela diseñada por nuestro sistema de forma automática. Al elegir esta opción, el sistema genera los pronósticos al azar. Una vez generada, el usuario no puede realizar modificaciones en los marcadores.<br></br><br></br>

            Quiniela por Decisión: En esta modalidad, tú tienes el control total. Deberás ingresar manualmente tus pronósticos para cada uno de los partidos disponibles. Es tu oportunidad de demostrar tu conocimiento y estrategia.<br></br><br></br>

            2. Sistema de Puntuación<br></br>
            La puntuación se calcula al finalizar cada partido basándose en los resultados oficiales. Por cada encuentro, puedes acumular hasta 3 puntos de la siguiente manera:<br></br>

            +1 Punto: Por acertar el resultado final del partido (Victoria Local, Victoria Visitante o Empate).<br></br>

            +1 Punto: Por acertar la cantidad exacta de goles anotados por el equipo local.<br></br>

            +1 Punto: Por acertar la cantidad exacta de goles anotados por el equipo visitante.<br></br><br></br>

            3. Consideraciones Generales
            La suma total de puntos de cada usuario se actualizará automáticamente en el ranking general tras la carga de resultados oficiales.<br></br>

            Toda predicción realizada en la modalidad "Por Decisión" debe ser guardada antes del inicio de cada partido.<br></br><br></br>
            <strong>Nota:</strong> Este proyecto es una iniciativa sin fines de lucro, desarrollada exclusivamente con propósitos educativos. Su objetivo es explorar, probar y validar nuevas tecnologías, arquitecturas y procesos de desarrollo de software. Este esfuerzo forma parte de un ejercicio de experimentación técnica orientado a prevenir errores y optimizar soluciones para futuros proyectos profesionales reales.
            <br></br><br></br>
            <strong>versión:</strong> Beta 0.3
            </p>
            <button onClick={() => setShowReglas(false)}>Cerrar</button> {/* 4. Cerrar */}
          </div>
        </div>
      )}
      <div className='bk'></div>
    </section>
  );
}