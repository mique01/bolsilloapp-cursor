'use client';

import { useState, useEffect } from 'react';
import { Save, Users } from 'lucide-react';

type Settings = {
  livingAlone: boolean;
};

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<Settings>({
    livingAlone: true,
  });

  // Cargar configuración
  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      // Mantener solo la configuración de livingAlone
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({
        livingAlone: parsedSettings.livingAlone !== undefined ? parsedSettings.livingAlone : true
      });
    }
  }, []);

  const handleSettingChange = (key: keyof Settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Configuración guardada correctamente');
  };

  return (
    <div className="space-y-6 dark-theme">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Preferencias personales */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Users size={20} className="text-purple-400" />
            <span>Preferencias personales</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm">Vivo solo</span>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-gray-600 rounded-full">
                  <input
                    type="checkbox"
                    className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
                    checked={settings.livingAlone}
                    onChange={(e) => handleSettingChange('livingAlone', e.target.checked)}
                  />
                  <div 
                    className={`w-6 h-6 transform transition-transform duration-200 ease-in-out bg-white rounded-full ${
                      settings.livingAlone ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                  />
                </div>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                {settings.livingAlone 
                  ? "Gestiona tus gastos de forma individual" 
                  : "Gestiona gastos e ingresos con otras personas"}
              </p>
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save size={20} />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
} 