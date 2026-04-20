import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Upload() {
  const { user, logout } = useAuth();
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setArchivo(file);
      setError('');
      setResultado(null);
    } else {
      setError('Solo se permiten archivos .xlsx o .xls');
    }
  };

  const handleUpload = async () => {
    if (!archivo) return;
    setLoading(true);
    setError('');
    setResultado(null);

    const formData = new FormData();
    formData.append('archivo', archivo);

    try {
      const res = await axios.post('/api/upload/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResultado(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar archivo');
    } finally {
      setLoading(false);
    }
  };

  const descargarPlantilla = async () => {
    try {
      const res = await axios.get('/api/upload/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'formato.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error al descargar plantilla');
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

      <div className="container mx-auto p-6 max-w-2xl">
        <Link to="/" className="text-blue-600 mb-4 inline-block">← Volver</Link>
        
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Cargar Formato de Viáticos</h2>
          
          <div className="mb-6 p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600 mb-2"><strong>Instrucciones:</strong></p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Suba el archivo formato.xlsx debidamente diligenciado</li>
              <li>El archivo debe seguir el formato de la plantilla estándar</li>
              <li>Después de subir, podrá revisar y confirmar los datos</li>
            </ul>
            <button onClick={descargarPlantilla} className="mt-3 text-blue-600 text-sm underline">
              Descargar plantilla
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {resultado && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">✓ Procesado exitosamente</p>
              <p>Registros exitosos: {resultado.exitosos}</p>
              {resultado.errores > 0 && <p>Errores: {resultado.errores}</p>}
              {resultado.errores > 0 && (
                <details className="mt-2 text-sm">
                  <summary>Ver detalles de errores</summary>
                  <pre className="mt-2 p-2 bg-white rounded">
                    {JSON.stringify(resultado.detalle, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              ref={fileRef}
              className="hidden"
            />
            {archivo ? (
              <div>
                <p className="font-medium">{archivo.name}</p>
                <p className="text-sm text-gray-500">{(archivo.size / 1024).toFixed(1)} KB</p>
                <button onClick={() => { setArchivo(null); fileRef.current.value = ''; }} className="text-red-600 text-sm mt-2">
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current.click()} className="text-blue-600">
                Click para seleccionar archivo
              </button>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!archivo || loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Procesando...' : 'Pasar a Centralizado'}
          </button>
        </div>
      </div>
    </div>
  );
}