import React from 'react';
import { RentalStatus, FurnitureCondition } from '../../types';

interface BadgeProps {
  status?: RentalStatus | FurnitureCondition | string;
  variant?: 'status' | 'condition' | 'payment';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, variant = 'status', size = 'md' }) => {
  if (!status) return null;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  let colorClasses = 'bg-slate-100 text-slate-800 border border-slate-200';

  if (variant === 'status') {
    switch (status) {
      case 'Cotización':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
        break;
      case 'Reservado':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';
        break;
      case 'En Camino':
        colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-500/20';
        break;
      case 'Entregado':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
        break;
      case 'En Recolección':
        colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20';
        break;
      case 'Devuelto':
        colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
        break;
      case 'Con Incidencia':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
        break;
      case 'Cancelado':
        colorClasses = 'bg-gray-100 text-gray-500 border-gray-200 line-through';
        break;
    }
  } else if (variant === 'condition') {
    switch (status) {
      case 'Excelente':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'Bueno':
        colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'Detalles menores':
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'En Mantenimiento':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${sizeClasses} ${colorClasses}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
