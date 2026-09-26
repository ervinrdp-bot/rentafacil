import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { BusinessProfile } from '../../types';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  Upload,
  RotateCcw,
  Check,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';

export const BusinessSettings: React.FC = () => {
  const {
    businessProfile,
    updateBusinessProfile,
    exportDatabase,
    importDatabase,
    resetAllData,
    clearAllData,
    clearOperationsData,
  } = useApp();

  const [formData, setFormData] = useState<BusinessProfile>(businessProfile);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabase(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Business Information Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Perfil de tu Negocio de Mobiliario
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Esta información aparecerá en los contratos digitales, hojas de ruta de choferes y mensajes de WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre de la Empresa */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre Comercial del Negocio *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Eslogan / Giro Comercial
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Teléfono de Atención
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número de WhatsApp para Envíos Automáticos
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* RFC / ID Fiscal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                RFC o Registro Fiscal
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.rfcOrTaxId}
                  onChange={(e) => setFormData({ ...formData, rfcOrTaxId: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dirección Física de Bodega / Matriz
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Cláusulas del Contrato Digital */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cláusulas y Términos del Contrato de Renta Digital
              </label>
              <textarea
                rows={5}
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Este texto aparecerá en el pie de página de los contratos generados en PDF para la firma de tus clientes.
              </p>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Data Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Respaldo y Seguridad de Datos
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Toda tu información se guarda en el navegador de tu equipo de forma segura. Puedes descargar un respaldo en cualquier momento o restaurarlo en otra computadora.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Download backup */}
          <button
            onClick={exportDatabase}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all space-y-2 group"
          >
            <Download className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Descargar Respaldo</h4>
              <p className="text-[11px] text-slate-500">
                Guarda una copia de seguridad en archivo .JSON con todos tus muebles, clientes y pedidos.
              </p>
            </div>
          </button>

          {/* Import backup */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all space-y-2 group"
          >
            <Upload className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Restaurar Respaldo</h4>
              <p className="text-[11px] text-slate-500">
                Carga un archivo de respaldo previo para sincronizar o restaurar tus datos.
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
          </button>

          {/* Clear Operations Only */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  '¿Deseas eliminar todo el historial de rentas y pagos? (Se conservarán tus muebles y clientes registrados).'
                )
              ) {
                clearOperationsData();
              }
            }}
            className="p-4 bg-amber-50/60 hover:bg-amber-50 border border-amber-200/80 rounded-2xl text-left transition-all space-y-2 group"
          >
            <RotateCcw className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Limpiar Rentas y Pagos</h4>
              <p className="text-[11px] text-amber-700/80">
                Borra todas las rentas y pagos para iniciar operaciones en cero, manteniendo tu catálogo.
              </p>
            </div>
          </button>

          {/* Clear All to Zero */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  '⚠️ ¿ATENCIÓN: Deseas vaciar TODO el sistema (muebles, clientes, rentas y pagos) para comenzar 100% desde cero manualmente?'
                )
              ) {
                clearAllData();
              }
            }}
            className="p-4 bg-rose-50/70 hover:bg-rose-50 border border-rose-300 rounded-2xl text-left transition-all space-y-2 group shadow-xs"
          >
            <Trash2 className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-sm font-bold text-rose-900">Vaciar Todo a Cero</h4>
              <p className="text-[11px] text-rose-700/80">
                Elimina toda la información del sistema para ingresar todo tu catálogo y clientes manualmente.
              </p>
            </div>
          </button>
        </div>

        {/* Restore demo data option as small link */}
        <div className="pt-2 text-right">
          <button
            onClick={() => {
              if (
                window.confirm(
                  '¿Deseas recargar los datos demo de ejemplo? Esto reemplazará los datos actuales.'
                )
              ) {
                resetAllData();
              }
            }}
            className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
          >
            Restablecer datos de muestra (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};
