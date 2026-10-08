import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  FileSpreadsheet,
  Printer,
  Edit2,
  Trash2,
  Copy,
  Check,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { StoredLaptop, LaptopStatus } from '../types/index.ts';
import { exportStoredLaptopsToExcel } from '../utils/excel.ts';

interface SearchTabProps {
  storedLaptops: StoredLaptop[];
  onUpdateLaptop: (updated: StoredLaptop) => void;
  onDeleteLaptop: (id: string) => void;
  onEditLaptop: (laptop: StoredLaptop) => void;
  onNavigateToPlacement: () => void;
}

const RAK_OPTIONS = [
  'Rak 1', 'Rak 2', 'Rak 3', 'Rak 4',
  'Rak 5', 'Rak 6', 'Rak 7', 'Rak 8',
];

const SHELVING_OPTIONS = [
  'Shelving 1', 'Shelving 2', 'Shelving 3', 'Shelving 4',
];

export const SearchTab: React.FC<SearchTabProps> = ({
  storedLaptops,
  onUpdateLaptop,
  onDeleteLaptop,
  onEditLaptop,
  onNavigateToPlacement,
}) => {
  const [keyword, setKeyword] = useState<string>('');
  const [filterRak, setFilterRak] = useState<string>('');
  const [filterShelving, setFilterShelving] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'tanggal' | 'sn' | 'nama' | 'rak'>('tanggal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedSn, setCopiedSn] = useState<string | null>(null);

  // Filter & Urutkan
  const filteredData = useMemo(() => {
    const q = keyword.toLowerCase().trim();

    return storedLaptops
      .filter((item) => {
        const matchKeyword =
          !q ||
          item.sn.toLowerCase().includes(q) ||
          item.nama.toLowerCase().includes(q) ||
          item.keterangan.toLowerCase().includes(q);

        const matchRak = !filterRak || item.lokasiRak === filterRak;
        const matchShelving = !filterShelving || item.shelving === filterShelving;
        const matchStatus = !filterStatus || item.status === filterStatus;

        return matchKeyword && matchRak && matchShelving && matchStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'tanggal') {
          comp = a.tanggalDisimpan.localeCompare(b.tanggalDisimpan);
        } else if (sortBy === 'sn') {
          comp = a.sn.localeCompare(b.sn);
        } else if (sortBy === 'nama') {
          comp = a.nama.localeCompare(b.nama);
        } else if (sortBy === 'rak') {
          const rakDiff = a.lokasiRak.localeCompare(b.lokasiRak);
          comp = rakDiff !== 0 ? rakDiff : a.shelving.localeCompare(b.shelving);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [storedLaptops, keyword, filterRak, filterShelving, filterStatus, sortBy, sortOrder]);

  // Statistik Ringkasan
  const stats = useMemo(() => {
    const total = storedLaptops.length;
    const tersedia = storedLaptops.filter((s) => s.status === 'Tersedia').length;
    const dipinjam = storedLaptops.filter((s) => s.status === 'Dipinjam').length;
    const maintenance = storedLaptops.filter(
      (s) => s.status === 'Maintenance' || s.status === 'Keluar'
    ).length;
    const uniqueRacks = new Set(storedLaptops.map((s) => s.lokasiRak)).size;

    return { total, tersedia, dipinjam, maintenance, uniqueRacks };
  }, [storedLaptops]);

  const handleReset = () => {
    setKeyword('');
    setFilterRak('');
    setFilterShelving('');
    setFilterStatus('');
  };

  const handleCopySn = (sn: string) => {
    navigator.clipboard.writeText(sn);
    setCopiedSn(sn);
    setTimeout(() => setCopiedSn(null), 2000);
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data yang dapat diekspor.');
      return;
    }
    const filename = `Data_Penyimpanan_Laptop_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportStoredLaptopsToExcel(filteredData, filename);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSort = (field: 'tanggal' | 'sn' | 'nama' | 'rak') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: LaptopStatus) => {
    switch (status) {
      case 'Tersedia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Tersedia
          </span>
        );
      case 'Dipinjam':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Dipinjam
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            Maintenance
          </span>
        );
      case 'Keluar':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            Keluar
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan Metrik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Unit Laptop</span>
            <Layers className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Tersebar di {stats.uniqueRacks} rak aktif
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Unit Tersedia</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {stats.tersedia}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Siap dialokasikan</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sedang Dipinjam</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {stats.dipinjam}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Unit keluar sementara</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Maintenance / Keluar</span>
            <AlertTriangle className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700 font-mono tabular-nums">
            {stats.maintenance}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Servis atau mutasi</div>
        </div>
      </div>

      {/* Filter & Bar Pencarian */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari Serial Number atau Model Laptop..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Filter Rak */}
          <div className="md:col-span-2">
            <select
              value={filterRak}
              onChange={(e) => setFilterRak(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">Semua Rak</option>
              {RAK_OPTIONS.map((rak) => (
                <option key={rak} value={rak}>
                  {rak}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Shelving */}
          <div className="md:col-span-2">
            <select
              value={filterShelving}
              onChange={(e) => setFilterShelving(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">Semua Shelving</option>
              {SHELVING_OPTIONS.map((sh) => (
                <option key={sh} value={sh}>
                  {sh}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="md:col-span-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="">Semua Status Unit</option>
              <option value="Tersedia">Tersedia di Rak</option>
              <option value="Dipinjam">Sedang Dipinjam</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Keluar">Keluar Gudang</option>
            </select>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset Filter</span>
            </button>
            <span className="text-xs text-slate-500">
              Menampilkan <strong className="text-slate-800 font-mono tabular-nums">{filteredData.length}</strong> dari{' '}
              <strong className="text-slate-800 font-mono tabular-nums">{storedLaptops.length}</strong> unit
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Cetak Laporan</span>
            </button>
            <button
              onClick={handleExport}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Ekspor ke Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Data Hasil Pencarian */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th
                  onClick={() => toggleSort('sn')}
                  className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Serial Number</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('nama')}
                  className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Merek / Model</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('rak')}
                  className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Lokasi Rak</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Shelving
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-medium text-slate-700">Tidak ada unit laptop yang ditemukan.</p>
                      <p className="text-xs text-slate-400">
                        Coba sesuaikan kata kunci pencarian atau simpan unit laptop baru ke dalam rak.
                      </p>
                      {storedLaptops.length === 0 && (
                        <button
                          onClick={onNavigateToPlacement}
                          className="mt-3 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                        >
                          + Buka Penempatan Laptop
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Serial Number */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 group">
                        <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.sn}
                        </span>
                        <button
                          onClick={() => handleCopySn(item.sn)}
                          title="Salin Serial Number"
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity"
                        >
                          {copiedSn === item.sn ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Merek / Model */}
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.nama}
                    </td>

                    {/* Lokasi Rak */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {item.lokasiRak}
                      </span>
                    </td>

                    {/* Shelving */}
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded">
                        {item.shelving}
                      </span>
                    </td>

                    {/* Keterangan */}
                    <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate" title={item.keterangan}>
                      {item.keterangan || '-'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditLaptop(item)}
                          title="Edit Unit / Pindah Rak"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus unit ${item.nama} (SN: ${item.sn}) dari data rak?`)) {
                              onDeleteLaptop(item.id);
                            }
                          }}
                          title="Hapus dari Penyimpanan"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
