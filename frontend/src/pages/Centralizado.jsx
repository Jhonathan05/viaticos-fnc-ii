import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Centralizado() {
  const { user } = useAuth();
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ fecha_inicio: '', fecha_fin: '', cedula: '' });
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
    setCurrentPage(1);
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
      console.error(err);
      alert('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = viajes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(viajes.length / itemsPerPage);

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'APROBADO': return 'badge-success';
      case 'RECHAZADO': return 'badge-error';
      case 'PENDIENTE': return 'badge-warning';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Centralizado de Viáticos</h1>
          <p className="page-subtitle">{viajes.length} registros en total</p>
        </div>
        <button onClick={handleExport} className="btn btn-primary">
          {exporting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Exportando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <form onSubmit={handleFilter} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="label">Fecha inicio</label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="label">Fecha fin</label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="label">Cédula</label>
            <input
              type="text"
              value={filtros.cedula}
              onChange={(e) => setFiltros({ ...filtros, cedula: e.target.value })}
              className="input"
              placeholder="Filtrar por cédula"
            />
          </div>
          <div className="flex items-end gap-2 w-full sm:w-auto">
            <button type="submit" className="btn btn-primary flex-1 sm:flex-none">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Filtrar
              </span>
            </button>
            <button 
              type="button" 
              onClick={() => { 
                setFiltros({ fecha_inicio: '', fecha_fin: '', cedula: '' }); 
                fetchViajes(); 
              }} 
              className="btn btn-secondary flex-1 sm:flex-none"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Table or Loading or Empty */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-text-light">Cargando...</p>
          </div>
        </div>
      ) : viajes.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="empty-state-title">No hay registros</h3>
          <p className="empty-state-description">No se encontraron viáticos con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="table-container">
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
              {currentItems.map((v) => (
                <tr key={v.id}>
                  <td className="font-semibold">{v.cedula?.toString()}</td>
                  <td>{v.concepto}</td>
                  <td>{v.fecha_pago?.split('T')[0]}</td>
                  <td className="font-semibold">${Number(v.valor).toLocaleString()}</td>
                  <td>{v.destino}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(v.estado)}`}>
                      {v.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-text-light">
            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, viajes.length)} de {viajes.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary py-2 px-4 text-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary py-2 px-4 text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}