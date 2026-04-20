import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Centralizado() {
  const { user, logout } = useAuth();
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', cedula: '' });

  const fetchViajes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filtros).toString();
      const res = await axios.get(`/api/viajes?${params}`);
      setViajes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViajes();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchViajes();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;
    try {
      await axios.delete(`/api/viajes/${id}`);
      fetchViajes();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const [exporting, setExporting] = useState(false);

  const handleExport = async (e) => {
    e.preventDefault();
    if (exporting) return;
    setExporting(true);
    try {
      const params = new URLSearchParams(filtros).toString();
      const res = await axios.get(`/api/upload/export?${params}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'viaticos_centralizado.xlsx');
      document.body.appendChild(link);
      link.click();

      // Cleanup to prevent memory leaks and double-firing issues in some browsers
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (err) {
      alert('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Viáticos FNC</h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="underline">Inicio</Link>
            <button onClick={logout} className="bg-blue-800 px-3 py-1 rounded text-sm">Salir</button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <Link to="/" className="text-blue-600 mb-4 inline-block">← Volver</Link>

        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-4">Centralizado de Viáticos</h2>

          <form onSubmit={handleFilter} className="flex flex-wrap gap-4 mb-4">
            <input
              type="date"
              placeholder="Fecha inicio"
              value={filtros.fecha_inicio}
              onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
              className="input w-auto"
            />
            <input
              type="date"
              placeholder="Fecha fin"
              value={filtros.fecha_fin}
              onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
              className="input w-auto"
            />
            <input
              type="text"
              placeholder="Cédula"
              value={filtros.cedula}
              onChange={(e) => setFiltros({ ...filtros, cedula: e.target.value })}
              className="input w-auto"
            />
            <button type="submit" className="btn btn-primary">Filtrar</button>
            <button type="button" onClick={() => { setFiltros({ fecha_inicio: '', fecha_fin: '', cedula: '' }); fetchViajes(); }} className="btn btn-secondary">Limpiar</button>
          </form>

          <button onClick={handleExport} className="btn btn-secondary mb-4">
            Exportar a Excel
          </button>

          {loading ? (
            <p className="text-center py-4">Cargando...</p>
          ) : viajes.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No hay registros</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border">Cédula</th>
                    <th className="px-4 py-2 border">Concepto</th>
                    <th className="px-4 py-2 border">Fecha Pago</th>
                    <th className="px-4 py-2 border">Valor</th>
                    <th className="px-4 py-2 border">Destino</th>
                    <th className="px-4 py-2 border">Estado</th>
                    <th className="px-4 py-2 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {viajes.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{v.cedula.toString()}</td>
                      <td className="px-4 py-2 border">{v.concepto}</td>
                      <td className="px-4 py-2 border">{v.fecha_pago?.split('T')[0]}</td>
                      <td className="px-4 py-2 border">${Number(v.valor).toLocaleString()}</td>
                      <td className="px-4 py-2 border">{v.destino}</td>
                      <td className="px-4 py-2 border">
                        <span className={`px-2 py-1 rounded text-xs ${v.estado === 'APROBADO' ? 'bg-green-100 text-green-800' : v.estado === 'RECHAZADO' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {v.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        {user?.rol === 'ADMIN' && (
                          <button onClick={() => handleDelete(v.id)} className="text-red-600 text-sm">
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}