import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { registerUser } from './login.service';

export const useLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleRegister = async () => {
    try {
      await registerUser({ username, password });
      await login(username, password);
    } catch (error: any) {
      alert(`Error: ${JSON.stringify(error.response?.data?.detail || "Error")}`);
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

  return { username, setUsername, password, setPassword, handleRegister, handleLogin };
};