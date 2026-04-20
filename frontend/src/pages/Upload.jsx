import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Upload() {
  const { user } = useAuth();
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setArchivo(file);
      setError('');
      setResultado(null);
    } else {
      setError('Solo se permiten archivos .xlsx o .xls');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
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
      setArchivo(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Cargar Viáticos</h1>
        <p className="page-subtitle">Sube el archivo de formato de viáticos</p>
      </div>

      {/* Instructions */}
      <div className="card mb-6 bg-gray-50 border border-gray-100">
        <h3 className="font-semibold text-inverse mb-3">Instrucciones:</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Sube el archivo formato.xlsx debidamente diligenciado</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>El archivo debe seguir el formato de la plantilla estándar</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Después de subir, podrás revisar los datos en el centralizado</span>
          </li>
        </ul>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {resultado && (
        <div className="success bg-green-50 border border-green-200 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-green-800">Procesado exitosamente</p>
              <p className="text-sm text-green-700 mt-1">{resultado.message}</p>
              <p className="text-sm text-green-700">Registros exitosos: {resultado.exitosos}</p>
              {resultado.errores > 0 && (
                <p className="text-sm text-red-700 mt-1">Errores: {resultado.errores}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div 
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          ref={fileRef}
          className="hidden"
          id="file-upload"
        />
        
        {archivo ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-raised rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m3-3v6m0 0l-3-3m3 3L9 8" />
              </svg>
            </div>
            <p className="font-medium text-inverse mb-1">{archivo.name}</p>
            <p className="text-sm text-gray-500 mb-4">{(archivo.size / 1024).toFixed(1)} KB</p>
            <button 
              onClick={() => { setArchivo(null); fileRef.current.value = ''; }} 
              className="text-sm text-red-500 hover:text-red-700"
            >
             Cambiar archivo
            </button>
          </div>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="upload-zone-icon">
              <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="font-medium text-inverse mb-1">
              Arrastra y suelta tu archivo aquí
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400">
              Formatos aceptados: .xlsx, .xls
            </p>
          </label>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!archivo || loading}
        className="btn btn-primary w-full mt-6 py-3"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesando...
          </span>
        ) : 'Pasar a Centralizado'}
      </button>
    </div>
  );
}