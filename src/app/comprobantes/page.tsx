'use client';

import { useState, useEffect, useCallback } from 'react';
import { Receipt, Search, FolderPlus, Download, Trash, FileText, Upload, Edit, Save, X, Folder, ChevronRight, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseAuth } from '@/lib/contexts/SupabaseAuthContext';
import * as supabaseDB from '@/lib/services/supabaseDatabase';

type Folder = {
  id: string;
  name: string;
  createdAt: string;
};

type Comprobante = {
  id: string;
  user_id: string;
  description: string;
  file_name: string;
  file_type: string;
  file_url: string;
  folder_id: string;
  created_at?: string;
};

export default function Comprobantes() {
  // Auth context
  const { user } = useSupabaseAuth();
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
  const [filteredComprobantes, setFilteredComprobantes] = useState<Comprobante[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState('');
  const [editingFolderName, setEditingFolderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Filtrar comprobantes
  const filterComprobantes = useCallback(() => {
    let filtered = [...comprobantes];
    
    // Filtrar por carpeta si hay una seleccionada
    if (currentFolder) {
      filtered = filtered.filter(comp => comp.folder_id === currentFolder);
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(comp => 
        comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComprobantes(filtered);
  }, [searchTerm, comprobantes, currentFolder]);

  // Actualizar filtro cuando cambien las dependencias
  useEffect(() => {
    filterComprobantes();
  }, [filterComprobantes]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar carpetas del localStorage
        const savedFolders = localStorage.getItem('folders');
        if (savedFolders) {
          try {
            setFolders(JSON.parse(savedFolders));
          } catch (e) {
            console.error("Error parsing folders:", e);
            // Si hay error, crear carpeta por defecto
            createDefaultFolder();
          }
        } else {
          // Crear carpeta por defecto
          createDefaultFolder();
        }

        // Cargar comprobantes del localStorage
        const savedComprobantes = localStorage.getItem('comprobantes');
        if (savedComprobantes) {
          try {
            const parsed = JSON.parse(savedComprobantes);
            setComprobantes(parsed);
            setFilteredComprobantes(parsed);
          } catch (e) {
            console.error("Error parsing comprobantes:", e);
            setComprobantes([]);
            setFilteredComprobantes([]);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    const createDefaultFolder = () => {
      const defaultFolder: Folder = {
        id: 'default',
        name: 'General',
        createdAt: new Date().toISOString()
      };
      setFolders([defaultFolder]);
      localStorage.setItem('folders', JSON.stringify([defaultFolder]));
    };

    loadData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!description || !selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // En un entorno real, aquí se llamaría a la API de Supabase para subir el archivo
      // Por ahora, simulamos una carga usando localStorage
      
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newComprobante: Comprobante = {
        id: Date.now().toString(),
        user_id: user?.id || 'mock-user-id',
        description,
        file_name: selectedFile?.name || 'Sin archivo',
        file_type: selectedFile?.type || '',
        file_url: URL.createObjectURL(selectedFile),
        folder_id: currentFolder || folders[0]?.id || 'default',
        created_at: new Date().toISOString()
      };

      const updatedComprobantes = [...comprobantes, newComprobante];
      setComprobantes(updatedComprobantes);

      // Guardar en localStorage
      localStorage.setItem('comprobantes', JSON.stringify(updatedComprobantes));

      // Limpiar formulario
      setSelectedFile(null);
      setDescription('');

      // Reset the file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error("Error al subir el comprobante:", err);
      setError(err instanceof Error ? err : new Error("Error al subir el comprobante"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteComprobante = (id: string) => {
    try {
      const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este comprobante?');
      
      if (!confirmDelete) return;
      
      const updatedComprobantes = comprobantes.filter(comp => comp.id !== id);
      setComprobantes(updatedComprobantes);
      localStorage.setItem('comprobantes', JSON.stringify(updatedComprobantes));
    } catch (err) {
      console.error("Error al eliminar el comprobante:", err);
      setError(err instanceof Error ? err : new Error("Error al eliminar el comprobante"));
    }
  };

  const handleAddFolder = () => {
    try {
      if (!newFolderName.trim()) return;
      
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        createdAt: new Date().toISOString()
      };

      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      localStorage.setItem('folders', JSON.stringify(updatedFolders));

      setNewFolderName('');
      setIsAddingFolder(false);

      // Seleccionar la nueva carpeta
      setCurrentFolder(newFolder.id);
    } catch (err) {
      console.error("Error al añadir carpeta:", err);
      setError(err instanceof Error ? err : new Error("Error al añadir carpeta"));
    }
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const saveEditedFolder = () => {
    try {
      if (!editingFolderName.trim()) return;

      const updatedFolders = folders.map(folder => 
        folder.id === editingFolderId
          ? { ...folder, name: editingFolderName.trim() }
          : folder
      );

      setFolders(updatedFolders);
      localStorage.setItem('folders', JSON.stringify(updatedFolders));

      setEditingFolderId('');
      setEditingFolderName('');
    } catch (err) {
      console.error("Error al editar carpeta:", err);
      setError(err instanceof Error ? err : new Error("Error al editar carpeta"));
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    try {
      if (folders.length <= 1) {
        alert('No puedes eliminar la única carpeta');
        return;
      }

      // Obtener comprobantes en esta carpeta
      const comprobanteInFolder = comprobantes.filter(comp => comp.folder_id === folderId);

      if (comprobanteInFolder.length > 0) {
        const confirmDelete = window.confirm(
          `Esta carpeta contiene ${comprobanteInFolder.length} comprobante(s). ¿Deseas eliminar la carpeta y mover los comprobantes a la carpeta general?`
        );

        if (confirmDelete) {
          // Mover comprobantes a carpeta general o la primera disponible
          const defaultFolderId = folders.find(f => f.id !== folderId)?.id || '';

          const updatedComprobantes = comprobantes.map(comp =>
            comp.folder_id === folderId
              ? { ...comp, folder_id: defaultFolderId }
              : comp
          );

          setComprobantes(updatedComprobantes);
          localStorage.setItem('comprobantes', JSON.stringify(updatedComprobantes));
        } else {
          return;
        }
      }

      const updatedFolders = folders.filter(folder => folder.id !== folderId);
      setFolders(updatedFolders);
      localStorage.setItem('folders', JSON.stringify(updatedFolders));

      // Si la carpeta actual es la que estamos eliminando, cambiar a otra
      if (currentFolder === folderId) {
        setCurrentFolder(updatedFolders[0]?.id || '');
      }
    } catch (err) {
      console.error("Error al eliminar carpeta:", err);
      setError(err instanceof Error ? err : new Error("Error al eliminar carpeta"));
    }
  };

  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark-theme">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
          <p>Cargando comprobantes...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si existe
  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500 rounded-lg mb-6 dark-theme">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-gray-300">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 dark-theme">
      <h1 className="text-2xl font-bold">Comprobantes</h1>

      {/* Cabecera con búsqueda y acciones */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar comprobantes..."
            className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
            onClick={() => document.getElementById('upload-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Upload size={16} />
            <span>Subir</span>
          </button>

          <button
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 rounded-md hover:bg-gray-700 flex items-center gap-2"
            onClick={() => setIsAddingFolder(true)}
          >
            <FolderPlus size={16} />
            <span>Nueva carpeta</span>
          </button>
        </div>
      </div>

      {/* Barra lateral con carpetas y área principal */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Lista de carpetas */}
        <div className="md:w-64 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Carpetas</h2>
          <ul className="space-y-1">
            <li
              className={`px-3 py-2 rounded-md cursor-pointer flex items-center justify-between ${
                currentFolder === '' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'
              }`}
              onClick={() => setCurrentFolder('')}
            >
              <div className="flex items-center gap-2">
                <Folder size={16} />
                <span>Todas</span>
              </div>
            </li>

            {folders.map(folder => (
              <li
                key={folder.id}
                className={`px-3 py-2 rounded-md cursor-pointer ${
                  currentFolder === folder.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700 text-gray-300'
                } group`}
                onClick={() => setCurrentFolder(folder.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Folder size={16} />
                    {editingFolderId === folder.id ? (
                      <input
                        type="text"
                        className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white w-full"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditedFolder()}
                        autoFocus
                      />
                    ) : (
                      <span>{folder.name}</span>
                    )}
                  </div>

                  {editingFolderId === folder.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEditedFolder();
                        }}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolderId('');
                          setEditingFolderName('');
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditFolder(folder);
                        }}
                        className="text-gray-400 hover:text-blue-400"
                      >
                        <Edit size={14} />
                      </button>
                      {/* No permitir eliminar la única carpeta */}
                      {folders.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {isAddingFolder && (
            <div className="mt-3">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Nombre de carpeta"
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-white w-full"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                  autoFocus
                />
                <button
                  onClick={handleAddFolder}
                  className="text-green-400 hover:text-green-300 p-1.5"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={() => {
                    setIsAddingFolder(false);
                    setNewFolderName('');
                  }}
                  className="text-red-400 hover:text-red-300 p-1.5"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Área principal de comprobantes */}
        <div className="flex-1 space-y-6">
          {/* Formulario de subida */}
          <form 
            id="upload-form"
            className="bg-gray-800 rounded-lg p-5" 
            onSubmit={handleSubmit}
          >
            <h2 className="text-lg font-semibold mb-4">Subir comprobante</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Factura de compra, Recibo de pago, etc."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Carpeta</label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentFolder}
                  onChange={(e) => setCurrentFolder(e.target.value)}
                >
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-gray-400 mb-1">Archivo</label>
                <div className="relative border-2 border-dashed border-gray-600 rounded-md p-4 text-center hover:border-gray-500 transition-colors">
                  <input
                    id="file-input"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="space-y-2 flex flex-col items-center justify-center">
                    <Upload className="text-gray-400 mx-auto" size={30} />
                    {selectedFile ? (
                      <p className="text-indigo-400">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-gray-300">Arrastra un archivo o haz clic para seleccionar</p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG, JPEG (máx. 10MB)</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isUploading || !selectedFile || !description}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  isUploading || !selectedFile || !description
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Subir comprobante</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Lista de comprobantes */}
          <div className="bg-gray-800 rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">
              {currentFolder
                ? `Comprobantes en ${folders.find(f => f.id === currentFolder)?.name}`
                : 'Todos los comprobantes'}
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({filteredComprobantes.length})
              </span>
            </h2>

            {filteredComprobantes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? (
                  <p>No se encontraron comprobantes que coincidan con la búsqueda.</p>
                ) : currentFolder ? (
                  <p>No hay comprobantes en esta carpeta.</p>
                ) : (
                  <p>No hay comprobantes guardados.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredComprobantes.map(comprobante => (
                  <div key={comprobante.id} className="bg-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-800 p-2 rounded-lg">
                          <Receipt size={24} className="text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{comprobante.description}</h3>
                          <p className="text-xs text-gray-400 mt-1">{new Date(comprobante.created_at || '').toLocaleDateString()}</p>
                          <p className="text-sm text-gray-300 mt-2 truncate" title={comprobante.file_name}>
                            {comprobante.file_name}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Folder size={12} className="mr-1" />
                            <span>
                              {folders.find(f => f.id === comprobante.folder_id)?.name || 'General'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {/* Añadir botón para vincular a transacción */}
                        <Link href={`/transacciones?receiptId=${comprobante.id}`}>
                          <button
                            className="p-1.5 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors"
                            title="Vincular a transacción"
                          >
                            <LinkIcon size={16} />
                          </button>
                        </Link>
                        <button
                          className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                          title="Descargar comprobante"
                          onClick={() => window.open(comprobante.file_url, '_blank')}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteComprobante(comprobante.id)}
                          className="p-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                          title="Eliminar comprobante"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 