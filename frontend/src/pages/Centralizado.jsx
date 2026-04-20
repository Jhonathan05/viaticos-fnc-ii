import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Centralizado() {
  const { user } = useAuth();
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', cedula: '' });
  const [exporting, setExporting] = useState(false);

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
    <div>
      <div className="card mb-6">
        <h2 className="title">Centralizado de Viáticos</h2>

        <form onSubmit={handleFilter} className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="label">Fecha inicio</label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Fecha fin</label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Cédula</label>
            <input
              type="text"
              value={filtros.cedula}
              onChange={(e) => setFiltros({ ...filtros, cedula: e.target.value })}
              className="input"
              placeholder="Filtrar por cédula"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn btn-primary">Filtrar</button>
            <button type="button" onClick={() => { setFiltros({ fecha_inicio: '', fecha_fin: '', cedula: '' }); fetchViajes(); }} className="btn btn-secondary">Limpiar</button>
          </div>
        </form>

        <button onClick={handleExport} className="btn btn-secondary mb-4">
          Exportar a Excel
        </button>

        {loading ? (
          <p className="text-center py-4">Cargando...</p>
        ) : viajes.length === 0 ? (
          <p className="text-center py-4 text-tertiary">No hay registros</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Concepto</th>
                  <th>Fecha Pago</th>
                  <th>Valor</th>
                  <th>Destino</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {viajes.map((v) => (
                  <tr key={v.id}>
                    <td>{v.cedula.toString()}</td>
                    <td>{v.concepto}</td>
                    <td>{v.fecha_pago?.split('T')[0]}</td>
                    <td>${Number(v.valor).toLocaleString()}</td>
                    <td>{v.destino}</td>
                    <td>
                      <span className={`badge ${v.estado === 'APROBADO' ? 'badge-success' : v.estado === 'RECHAZADO' ? 'badge-error' : ''}`}>
                        {v.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}