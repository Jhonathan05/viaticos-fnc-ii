import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Upload() {
  const { user } = useAuth();
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

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

  return (
    <div>
      <div className="card">
        <h2 className="title">Cargar Formato de Viáticos</h2>
        
        <div className="mb-6 p-4 bg-strong rounded-sm">
          <p className="text-sm mb-2"><strong>Instrucciones:</strong></p>
          <ul className="text-sm text-tertiary list-disc list-inside">
            <li>Suba el archivo formato.xlsx debidamente diligenciado</li>
            <li>El archivo debe seguir el formato de la plantilla estándar</li>
            <li>Después de subir, podrá revisar y confirmar los datos</li>
          </ul>
        </div>

        {error && (
          <div className="error mb-4">
            {error}
          </div>
        )}

        {resultado && (
          <div className="success mb-4">
            <p className="font-medium">Procesado exitosamente</p>
            <p>Registros exitosos: {resultado.exitosos}</p>
            {resultado.errores > 0 && <p>Errores: {resultado.errores}</p>}
            {resultado.errores > 0 && (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer">Ver detalles de errores</summary>
                <pre className="mt-2 p-2 bg-strong rounded text-tertiary">
                  {JSON.stringify(resultado.detalle, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="border-2 border-dashed border-default rounded-sm p-8 text-center mb-6">
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
              <p className="text-sm text-tertiary">{(archivo.size / 1024).toFixed(1)} KB</p>
              <button onClick={() => { setArchivo(null); fileRef.current.value = ''; }} className="text-red-500 text-sm mt-2">
                Cambiar archivo
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current.click()} className="text-secondary">
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
  );
}