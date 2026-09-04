import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FurnitureItem, FurnitureCategory } from '../../types';
import { FurnitureModal } from './FurnitureModal';
import { Badge } from '../common/Badge';
import {
  Plus,
  Search,
  Grid,
  List,
  Edit2,
  Trash2,
  Wrench,
  Armchair,
  Layers,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

const CATEGORIES: ('Todos' | FurnitureCategory)[] = [
  'Todos',
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

export const InventoryList: React.FC = () => {
  const {
    furniture,
    addFurniture,
    updateFurniture,
    deleteFurniture,
    getFurnitureAvailability,
    isAdmin,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'Todos' | FurnitureCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FurnitureItem | null>(null);
  const [maintenanceFilter, setMaintenanceFilter] = useState<boolean>(false);

  // Filter items
  const filteredFurniture = furniture.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.material && item.material.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMaintenance = maintenanceFilter ? item.maintenanceStock > 0 : true;

    return matchesCategory && matchesSearch && matchesMaintenance;
  });

  // Global Inventory Metrics
  const totalPhysicalUnits = furniture.reduce((sum, item) => sum + item.totalStock, 0);
  const totalMaintenanceUnits = furniture.reduce((sum, item) => sum + (item.maintenanceStock || 0), 0);
  const totalInventoryAssetValue = furniture.reduce(
    (sum, item) => sum + item.totalStock * (item.replacementValue || 0),
    0
  );

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: FurnitureItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (data: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      updateFurniture(editingItem.id, data);
    } else {
      addFurniture(data);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Catálogo de Modelos</p>
            <p className="text-xl font-extrabold text-slate-800">{furniture.length} modelos</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-800">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Piezas Físicas</p>
            <p className="text-xl font-extrabold text-slate-800">{totalPhysicalUnits.toLocaleString()} unidades</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-800">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">En Taller / Reparación</p>
            <p className="text-xl font-extrabold text-slate-800">{totalMaintenanceUnits} piezas</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, código (SIL-001), color o material..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Action buttons & View mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaintenanceFilter(!maintenanceFilter)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                maintenanceFilter
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Solo Taller ({totalMaintenanceUnits})
            </button>

            {/* Grid / Table Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Vista Cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Vista Tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agregar Mueble
            </button>
          </div>
        </div>

        {/* Category horizontal scroll list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content View */}
      {filteredFurniture.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <Armchair className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No se encontraron artículos</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Prueba ajustando los filtros de categoría o el término de búsqueda, o registra un nuevo artículo.
          </p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all"
          >
            + Registrar Mueble Ahora
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredFurniture.map((item) => {
            const avail = getFurnitureAvailability(item.id);
            const isLowStock = avail.available <= 2 && avail.available > 0;
            const isOutOfStock = avail.available === 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Image and Code Tag */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback image
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold tracking-wider">
                    {item.code}
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge status={item.condition} variant="condition" size="sm" />
                  </div>

                  {item.maintenanceStock > 0 && (
                    <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Wrench className="w-3 h-3" />
                      {item.maintenanceStock} en taller
                    </div>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mt-0.5">
                      {item.name}
                    </h4>

                    {item.dimensions && (
                      <p className="text-[11px] text-slate-500 mt-1 font-medium">
                        📏 {item.dimensions} {item.color ? `• ${item.color}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Stock Availability Pill Box */}
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Disponibles Hoy:</span>
                      <span
                        className={`px-2 py-0.5 rounded-lg font-extrabold ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {avail.available} de {item.totalStock}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Rentados hoy: {avail.rented}</span>
                      <span>En taller: {avail.maintenance}</span>
                    </div>
                  </div>

                  {/* Pricing and Action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Renta por día</p>
                      <p className="text-base font-extrabold text-slate-900">
                        ${item.rentalPricePerDay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                        title="Editar artículo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => deleteFurniture(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Código / Foto</th>
                  <th className="py-3 px-4">Artículo</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-center">Stock Total</th>
                  <th className="py-3 px-4 text-center">Disponibles</th>
                  <th className="py-3 px-4 text-center">En Taller</th>
                  <th className="py-3 px-4 text-right">Precio Renta</th>
                  <th className="py-3 px-4 text-right">Valor Reposición</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredFurniture.map((item) => {
                  const avail = getFurnitureAvailability(item.id);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-2.5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <span className="font-extrabold text-slate-800">{item.code}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                        <p className="text-[11px] text-slate-400">{item.dimensions || 'Sin medidas'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{item.totalStock}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md font-extrabold ${
                            avail.available > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {avail.available}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-amber-700 font-bold">
                        {item.maintenanceStock || 0}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        ${item.rentalPricePerDay.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-medium">
                        ${item.replacementValue?.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteFurniture(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Furniture Add/Edit Modal */}
      <FurnitureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />
    </div>
  );
};
