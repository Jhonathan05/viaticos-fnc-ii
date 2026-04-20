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

  const statCards = [
    {
      label: 'Total Registros',
      value: stats.total,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'text-gray-600'
    },
    {
      label: 'Pendientes',
      value: stats.pendientes,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-yellow-600'
    },
    {
      label: 'Aprobados',
      value: stats.aprobados,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-600'
    }
  ];

  const quickActions = [
    {
      title: 'Cargar Formato',
      description: 'Subir archivo formato.xlsx para legalizar viáticos',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      to: '/upload',
      color: 'bg-raised'
    },
    {
      title: 'Centralizado',
      description: 'Ver y gestionar todos los viáticos cargados',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      to: '/centralizado',
      color: 'bg-gray-700'
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Panel de Control</h1>
        <p className="page-subtitle">Bienvenido, {user?.username}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 ${stat.color.replace('text-', 'bg-')}`}>
              {stat.icon}
            </div>
            <div>
              <p className="stat-value">{loading ? '...' : stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {quickActions.map((action, index) => (
          <Link 
            to={action.to} 
            key={index} 
            className="card card-hover flex items-center gap-4 group"
          >
            <div className={`p-4 rounded-xl text-white ${action.color}`}>
              {action.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-inverse group-hover:text-raised transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-raised transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}