import React, { useState } from 'react';
import { LayoutGrid, Layers, Laptop, Eye, Plus, ArrowRight } from 'lucide-react';
import { StoredLaptop } from '../types/index.ts';

interface VisualRackTabProps {
  storedLaptops: StoredLaptop[];
  onSelectRackForPlacement: (rak: string, shelving: string) => void;
  onEditLaptop: (laptop: StoredLaptop) => void;
}

const RACKS = ['Rak 1', 'Rak 2', 'Rak 3', 'Rak 4', 'Rak 5', 'Rak 6', 'Rak 7', 'Rak 8'];
const SHELVES = ['Shelving 4', 'Shelving 3', 'Shelving 2', 'Shelving 1']; // Top to bottom

export const VisualRackTab: React.FC<VisualRackTabProps> = ({
  storedLaptops,
  onSelectRackForPlacement,
  onEditLaptop,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    rak: string;
    shelving: string;
  } | null>({ rak: 'Rak 1', shelving: 'Shelving 1' });

  // Filter items in the currently selected compartment
  const selectedItems = selectedLocation
    ? storedLaptops.filter(
        (item) =>
          item.lokasiRak === selectedLocation.rak &&
          item.shelving === selectedLocation.shelving
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-blue-600" />
              <span>Denah Visual Rak & Shelving Gudang</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Klik pada kompartemen rak untuk melihat daftar unit laptop yang berada di dalamnya secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-slate-100 border border-slate-300"></span>
              <span>Kosong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-100 border border-blue-400"></span>
              <span>Terisi (1-3 unit)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-600 border border-blue-700"></span>
              <span>Padat (4+ unit)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Rack Grid (8 Racks) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {RACKS.map((rak) => {
            const rackTotal = storedLaptops.filter((item) => item.lokasiRak === rak).length;

            return (
              <div
                key={rak}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between"
              >
                {/* Rack Title */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">{rak}</span>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {rackTotal} unit
                  </span>
                </div>

                {/* Shelving Levels (Shelving 4 down to 1) */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  {SHELVES.map((shelf) => {
                    const shelfItems = storedLaptops.filter(
                      (item) => item.lokasiRak === rak && item.shelving === shelf
                    );
                    const count = shelfItems.length;
                    const isSelected =
                      selectedLocation?.rak === rak && selectedLocation?.shelving === shelf;

                    // Color indicator based on occupancy
                    let bgStyle = 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200';
                    if (count > 0 && count < 4) {
                      bgStyle = 'bg-blue-50/80 hover:bg-blue-100/90 text-blue-900 border-blue-300';
                    } else if (count >= 4) {
                      bgStyle = 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700';
                    }

                    if (isSelected) {
                      bgStyle += ' ring-2 ring-blue-500 ring-offset-1 font-semibold';
                    }

                    return (
                      <button
                        key={shelf}
                        type="button"
                        onClick={() => setSelectedLocation({ rak, shelving: shelf })}
                        className={`w-full text-left p-2 rounded-lg border transition-all text-xs flex items-center justify-between ${bgStyle}`}
                      >
                        <span className="text-[11px] font-medium truncate">
                          {shelf.replace('Shelving ', 'S-')}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums shrink-0">
                          {count} unit
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Add To This Rack Button */}
                <button
                  type="button"
                  onClick={() => onSelectRackForPlacement(rak, 'Shelving 1')}
                  className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 w-full"
                >
                  <Plus className="h-3 w-3" />
                  <span>Isi {rak}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Compartment Detail View */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs sticky top-20">
            {selectedLocation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedLocation.rak} &bull; {selectedLocation.shelving}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar unit tersimpan ({selectedItems.length} unit)
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onSelectRackForPlacement(selectedLocation.rak, selectedLocation.shelving)
                    }
                    className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tempatkan</span>
                  </button>
                </div>

                {selectedItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <p>Kompartemen rak ini masih kosong.</p>
                    <button
                      onClick={() =>
                        onSelectRackForPlacement(selectedLocation.rak, selectedLocation.shelving)
                      }
                      className="mt-2 text-blue-600 hover:underline font-medium"
                    >
                      + Tambah unit laptop ke sini
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100/70 px-1.5 py-0.5 rounded">
                            {item.sn}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {item.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 mt-1.5">
                          {item.nama}
                        </h4>
                        {item.keterangan && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {item.keterangan}
                          </p>
                        )}
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{item.tanggalDisimpan}</span>
                          <button
                            onClick={() => onEditLaptop(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Pilih kompartemen rak pada grid untuk melihat detail unit.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
