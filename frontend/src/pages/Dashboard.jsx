import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
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
    <div>
      <h2 className="title">Panel de Control</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <h3 className="text-tertiary text-sm">Total Registros</h3>
          <p className="text-3xl font-medium">{loading ? '...' : stats.total}</p>
        </div>
        <div className="card">
          <h3 className="text-tertiary text-sm">Pendientes</h3>
          <p className="text-3xl font-medium text-yellow-500">{loading ? '...' : stats.pendientes}</p>
        </div>
        <div className="card">
          <h3 className="text-tertiary text-sm">Aprobados</h3>
          <p className="text-3xl font-medium text-green-500">{loading ? '...' : stats.aprobados}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/upload" className="card hover:bg-strong transition-colors cursor-pointer">
          <h3 className="text-xl font-medium mb-2">Cargar Formato</h3>
          <p className="text-tertiary">Subir archivo formato.xlsx para legalizar viáticos</p>
        </Link>
        <Link to="/centralizado" className="card hover:bg-strong transition-colors cursor-pointer">
          <h3 className="text-xl font-medium mb-2">Centralizado</h3>
          <p className="text-tertiary">Ver y gestionar todos los viáticos cargados</p>
        </Link>
      </div>
    </div>
  );
}