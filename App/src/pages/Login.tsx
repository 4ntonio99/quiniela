import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

import './login/login.scss';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
        </div>
      </form>
      <div className='bk'></div>
    </section>
  );
}