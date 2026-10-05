import React from 'react';
import { Square, Circle, ArrowLeftRight } from 'lucide-react';

export type PlatterGeometry = 'square' | 'round' | 'rolling';

interface PlatterGeometrySelectorProps {
  geometry: PlatterGeometry;
  onSelectGeometry: (geom: PlatterGeometry) => void;
}

export const PlatterGeometrySelector: React.FC<PlatterGeometrySelectorProps> = ({
  geometry,
  onSelectGeometry,
}) => {
  const options = [
    {
      id: 'square' as PlatterGeometry,
      title: 'Square Platter',
      subtitle: '4 Corners + Center',
      standard: 'OIML R 76-1 CL 3.6.2.1',
      icon: Square,
      badge: 'Standard Platform',
    },
    {
      id: 'round' as PlatterGeometry,
      title: 'Round Platter',
      subtitle: '3 Supports at 120° + Center',
      standard: 'OIML R 76-1 CL 3.6.2.2',
      icon: Circle,
      badge: 'Precision Balance',
    },
    {
      id: 'rolling' as PlatterGeometry,
      title: 'Rolling Load',
      subtitle: '>4 Supports / Axle Track',
      standard: 'OIML R 76-1 CL 3.6.2.3',
      badge: 'Weighbridge / Track',
      icon: ArrowLeftRight,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-foundation-400 uppercase font-mono tracking-wider">
          PLATTER GEOMETRY & SUPPORT CONFIGURATION
        </span>
        <span className="text-xs font-mono text-foundation-500">
          Load = 1/3 Max (10.000 kg)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isSelected = geometry === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectGeometry(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-100 shadow-xs'
                  : 'bg-foundation-50/60 border-foundation-200 hover:bg-foundation-100/70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-foundation-200 text-foundation-600'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-brand-200 text-brand-900'
                      : 'bg-foundation-200 text-foundation-600'
                  }`}
                >
                  {opt.badge}
                </span>
              </div>

              <div className="mt-2.5">
                <h4 className="text-xs font-bold text-foundation-900 font-sans">
                  {opt.title}
                </h4>
                <p className="text-[11px] text-foundation-500 font-mono mt-0.5">
                  {opt.subtitle}
                </p>
                <span className="text-[10px] text-brand-700 font-mono block mt-1">
                  {opt.standard}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
