// src/features/login/Login.tsx
import { useLogin } from './useLogin';
import './Login.scss';

export const Login = () => {
  const { username, setUsername, password, setPassword, handleRegister, handleLogin } = useLogin();

  return (
    <div className="login-wrapper">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="text-2xl mb-6 font-bold text-center">Quiniela App</h2>
        
        <input
          type="text"
          placeholder="Usuario"
          className="w-full p-2 mb-4 border rounded bg-gray-700 text-white"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 mb-4 border rounded bg-gray-700 text-white"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-2 transition">
          Iniciar Sesión
        </button>
        
        <button type="button" onClick={handleRegister} className="w-full bg-transparent border border-blue-600 text-blue-400 p-2 rounded hover:bg-blue-600 hover:text-white transition">
          Registrarse
        </button>
      </form>
    </div>
  );
};