import React from 'react';
import { Layers, Search, LayoutGrid, Database, Download } from 'lucide-react';
import { downloadMasterTemplate } from '../utils/excel.ts';

interface HeaderProps {
  activeTab: 'penempatan' | 'pencarian' | 'visual' | 'master';
  onTabChange: (tab: 'penempatan' | 'pencarian' | 'visual' | 'master') => void;
  totalStored: number;
  totalMaster: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  totalStored,
  totalMaster,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                Penyimpanan Laptop
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:block">
                Manajemen Rak & Shelving Gudang
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onTabChange('penempatan')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'penempatan'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Penempatan ke Rak</span>
            </button>

            <button
              onClick={() => onTabChange('pencarian')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'pencarian'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Cari Lokasi ({totalStored})</span>
            </button>

            <button
              onClick={() => onTabChange('visual')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'visual'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden md:inline">Denah Rak</span>
            </button>

            <button
              onClick={() => onTabChange('master')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'master'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="h-4 w-4" />
              <span className="hidden md:inline">Master Data ({totalMaster})</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={downloadMasterTemplate}
              title="Unduh format template Excel untuk master data laptop"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap hidden sm:flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Template Excel</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
