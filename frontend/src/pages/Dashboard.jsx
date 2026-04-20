import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, pendientes: 0, aprobados: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/viajes')
      .then(res => {
        const data = res.data;
        setStats({
          total: data.length,
          pendientes: data.filter(v => v.estado === 'PENDIENTE').length,
          aprobados: data.filter(v => v.estado === 'APROBADO').length
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Viáticos FNC</h1>
          <div className="flex items-center gap-4">
            <span>{user?.nombre}</span>
            <button onClick={logout} className="bg-blue-800 px-3 py-1 rounded text-sm">
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Panel de Control</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-gray-500 text-sm">Total Registros</h3>
            <p className="text-3xl font-bold">{loading ? '...' : stats.total}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm">Pendientes</h3>
            <p className="text-3xl font-bold text-yellow-600">{loading ? '...' : stats.pendientes}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-500 text-sm">Aprobados</h3>
            <p className="text-3xl font-bold text-green-600">{loading ? '...' : stats.aprobados}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/upload" className="card hover:bg-blue-50 transition-colors">
            <h3 className="text-xl font-bold mb-2">📤 Cargar Formato</h3>
            <p className="text-gray-600">Subir archivo formato.xlsx para legalizar viáticos</p>
          </Link>
          <Link to="/centralizado" className="card hover:bg-blue-50 transition-colors">
            <h3 className="text-xl font-bold mb-2">📊 Centralizado</h3>
            <p className="text-gray-600">Ver y gestionar todos los viáticos cargados</p>
          </Link>
        </div>
      </div>
    </div>
  );
}