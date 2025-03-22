'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, Check, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { addComprobante } from '@/lib/services/supabaseDatabase';
import { useSupabaseAuth } from '@/lib/contexts/SupabaseAuthContext';

function NuevoComprobanteContent() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transactionId');
  
  // Estados para el formulario
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Cargar detalles de la transacción si se proporciona un ID
  useEffect(() => {
    if (transactionId) {
      const fetchTransactionDetails = async () => {
        try {
          const storedTransactions = localStorage.getItem('transactions');
          if (storedTransactions) {
            const parsedTransactions = JSON.parse(storedTransactions);
            const transaction = parsedTransactions.find((t: any) => t.id === transactionId);
            
            if (transaction) {
              setTransactionDetails(transaction);
              setDescription(transaction.description || '');
              setDate(transaction.date || new Date().toISOString().split('T')[0]);
              setCategory(transaction.category || '');
            }
          }
        } catch (error) {
          console.error('Error al cargar la transacción:', error);
        }
      };
      
      fetchTransactionDetails();
    } else {
      // Si no hay transacción, establecer la fecha actual
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionId]);
  
  // Manejar la selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validar tipo de archivo (imágenes y PDF)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Solo se permiten archivos JPG, PNG o PDF');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Generar preview para imágenes
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // Para PDFs mostramos un ícono
        setPreviewUrl(null);
      }
    }
  };
  
  // Eliminar el archivo seleccionado
  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    // Resetear el input file
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Debes iniciar sesión para subir comprobantes');
      return;
    }
    
    if (!file) {
      setError('Debes seleccionar un archivo');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Crear objeto de comprobante
      const newReceipt = {
        user_id: user.id,
        description: description || file.name,
        file_name: file.name,
        file_type: file.type,
        file_url: '', // Se llenará en la función addComprobante
        folder_id: '', // Valor por defecto, se puede cambiar si hay carpetas
        date: date || new Date().toISOString().split('T')[0],
        transaction_id: transactionId || null,
      };
      
      // Guardar en Supabase
      const { data, error: uploadError } = await addComprobante(newReceipt, file);
      
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      // También guardamos en localStorage para desarrollo
      const storedReceipts = localStorage.getItem('comprobantes');
      const receipts = storedReceipts ? JSON.parse(storedReceipts) : [];
      receipts.push(newReceipt);
      localStorage.setItem('comprobantes', JSON.stringify(receipts));
      
      // Si hay una transacción asociada, actualizarla
      if (transactionId) {
        const storedTransactions = localStorage.getItem('transactions');
        if (storedTransactions) {
          const transactions = JSON.parse(storedTransactions);
          const updatedTransactions = transactions.map((t: any) => 
            t.id === transactionId 
              ? { ...t, receipt_id: Date.now().toString() }
              : t
          );
          localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        }
      }
      
      setIsSuccess(true);
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        router.push(transactionId ? '/transacciones' : '/comprobantes');
      }, 1500);
      
    } catch (err) {
      console.error('Error al guardar el comprobante:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el comprobante');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <button 
          onClick={() => router.back()} 
          className="p-2 text-gray-400 hover:text-gray-300 rounded-full hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-100">
          {transactionId ? 'Asociar Comprobante' : 'Nuevo Comprobante'}
        </h1>
      </div>
      
      {transactionDetails && (
        <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-100">Detalles de la Transacción</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Descripción:</p>
              <p className="text-gray-200">{transactionDetails.description || 'Sin descripción'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Monto:</p>
              <p className={transactionDetails.type === 'income' ? 'text-green-500' : 'text-red-500'}>
                {transactionDetails.type === 'income' ? '+' : '-'} ${Math.abs(parseFloat(transactionDetails.amount.toString())).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Fecha:</p>
              <p className="text-gray-200">{new Date(transactionDetails.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Categoría:</p>
              <p className="text-gray-200">{transactionDetails.category || 'Sin categoría'}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}
      
      {isSuccess && (
        <div className="mb-6 bg-green-900/30 border border-green-500 text-green-400 p-4 rounded-lg flex items-center gap-2">
          <Check size={20} />
          <span>Comprobante guardado correctamente</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-sm">
        {/* Área de drop de archivos */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Archivo de Comprobante</label>
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Vista previa" 
                className="w-full h-64 object-contain border border-gray-700 rounded-lg mb-2 bg-gray-900"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : file ? (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-900 flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 text-blue-500 p-2 rounded-lg">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 text-gray-400 hover:text-red-400"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors mb-2" onClick={() => document.getElementById('file-upload')?.click()}>
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full">
                  <Upload size={24} />
                </div>
                <p className="font-medium text-gray-200">Haz clic para seleccionar un archivo</p>
                <p className="text-sm text-gray-400">o arrastra y suelta aquí</p>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG o PDF (máx. 5MB)</p>
              </div>
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        {/* Descripción */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm text-gray-400 mb-2">Descripción</label>
          <input
            type="text"
            id="description"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
            placeholder="Descripción del comprobante"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        {/* Categoría */}
        <div className="mb-6">
          <label htmlFor="category" className="block text-sm text-gray-400 mb-2">Categoría</label>
          <input
            type="text"
            id="category"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
            placeholder="Categoría (opcional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        
        {/* Fecha */}
        <div className="mb-6">
          <label htmlFor="date" className="block text-sm text-gray-400 mb-2">Fecha</label>
          <input
            type="date"
            id="date"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        {/* Botones */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isLoading || isSuccess
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar Comprobante</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente principal que envuelve el contenido en un Suspense
export default function NuevoComprobante() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4 flex justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>}>
      <NuevoComprobanteContent />
    </Suspense>
  );
} 