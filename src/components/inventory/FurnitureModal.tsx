import React, { useState, useEffect } from 'react';
import { FurnitureItem, FurnitureCategory, FurnitureCondition } from '../../types';
import { Modal } from '../common/Modal';
import { Armchair, Image, Tag, DollarSign, Layers } from 'lucide-react';

interface FurnitureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: FurnitureItem | null;
}

const CATEGORIES: FurnitureCategory[] = [
  'Sillas',
  'Mesas',
  'Salas Lounge',
  'Mantelería y Textiles',
  'Barras y Periqueras',
  'Toldos y Carpas',
  'Vajilla y Cristalería',
  'Iluminación y Decoración',
  'Otros',
];

const CONDITIONS: FurnitureCondition[] = [
  'Excelente',
  'Bueno',
  'Detalles menores',
  'En Mantenimiento',
];

export const FurnitureModal: React.FC<FurnitureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Sillas' as FurnitureCategory,
    description: '',
    imageUrl: '',
    totalStock: 10,
    maintenanceStock: 0,
    rentalPricePerDay: 50,
    replacementValue: 500,
    dimensions: '',
    color: '',
    material: '',
    condition: 'Excelente' as FurnitureCondition,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        category: initialData.category,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        totalStock: initialData.totalStock,
        maintenanceStock: initialData.maintenanceStock || 0,
        rentalPricePerDay: initialData.rentalPricePerDay,
        replacementValue: initialData.replacementValue || 0,
        dimensions: initialData.dimensions || '',
        color: initialData.color || '',
        material: initialData.material || '',
        condition: initialData.condition || 'Excelente',
      });
    } else {
      // Auto generate code prefix
      setFormData({
        name: '',
        code: 'ART-' + Math.floor(100 + Math.random() * 900),
        category: 'Sillas',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80',
        totalStock: 20,
        maintenanceStock: 0,
        rentalPricePerDay: 50,
        replacementValue: 600,
        dimensions: '',
        color: '',
        material: '',
        condition: 'Excelente',
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...formData,
      totalStock: Number(formData.totalStock),
      maintenanceStock: Number(formData.maintenanceStock),
      rentalPricePerDay: Number(formData.rentalPricePerDay),
      replacementValue: Number(formData.replacementValue),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar Mueble / Artículo' : 'Registrar Nuevo Mueble'}
      subtitle="Ingresa las especificaciones, cantidades y costos del artículo"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombre del Mobiliario *
            </label>
            <div className="relative">
              <Armchair className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Silla Crossback de Madera Nogal con Cojín"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Código / Clave */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Código / Folio Interno *
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ej: SIL-001"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Categoría *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as FurnitureCategory })
              }
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Precio de Renta por día */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Precio de Renta (por día/evento) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.rentalPricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, rentalPricePerDay: parseFloat(e.target.value) || 0 })
                }
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Costo de Reposición / Daño Total */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Valor de Reposición (Cobro por daño/pérdida)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.replacementValue}
                onChange={(e) =>
                  setFormData({ ...formData, replacementValue: parseFloat(e.target.value) || 0 })
                }
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Inventario Físico Total */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Inventario Total (Unidades Físicas) *
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="1"
                required
                value={formData.totalStock}
                onChange={(e) =>
                  setFormData({ ...formData, totalStock: parseInt(e.target.value) || 0 })
                }
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* En Taller / Mantenimiento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              En Reparación / Taller (No disponibles)
            </label>
            <input
              type="number"
              min="0"
              max={formData.totalStock}
              value={formData.maintenanceStock}
              onChange={(e) =>
                setFormData({ ...formData, maintenanceStock: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Dimensiones */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dimensiones (Largo x Ancho x Alto)
            </label>
            <input
              type="text"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              placeholder="Ej: 1.80m x 0.80m x 0.75m"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Color / Material */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Color
              </label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Ej: Nogal"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Material
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="Ej: Madera Roble"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Estado Físico General */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Condición Física
            </label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value as FurnitureCondition })
              }
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* URL de Foto */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Imagen del mueble
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Image className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://... o usa una imagen local"
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center justify-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all border border-slate-200">
                  <span>Seleccionar imagen local</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result;
                        if (typeof result === 'string') {
                          setFormData((prev) => ({ ...prev, imageUrl: result }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                {formData.imageUrl && (
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    Imagen lista
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descripción y Notas Especiales
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles sobre cuidados, empaque o capacidad..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md transition-all"
          >
            {initialData ? 'Guardar Cambios' : 'Registrar Mueble'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
