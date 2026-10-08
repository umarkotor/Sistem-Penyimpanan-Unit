import React, { useState } from 'react';
import { X, Save, Layers, Tag, Laptop, Hash } from 'lucide-react';
import { StoredLaptop, LaptopStatus } from '../types/index.ts';

interface EditLaptopModalProps {
  laptop: StoredLaptop | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: StoredLaptop) => void;
}

const RAK_OPTIONS = [
  'Rak 1', 'Rak 2', 'Rak 3', 'Rak 4',
  'Rak 5', 'Rak 6', 'Rak 7', 'Rak 8',
];

const SHELVING_OPTIONS = [
  'Shelving 1', 'Shelving 2', 'Shelving 3', 'Shelving 4',
];

const STATUS_OPTIONS: LaptopStatus[] = [
  'Tersedia', 'Dipinjam', 'Maintenance', 'Keluar',
];

export const EditLaptopModal: React.FC<EditLaptopModalProps> = ({
  laptop,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !laptop) return null;

  const [nama, setNama] = useState(laptop.nama);
  const [sn, setSn] = useState(laptop.sn);
  const [lokasiRak, setLokasiRak] = useState(laptop.lokasiRak);
  const [shelving, setShelving] = useState(laptop.shelving);
  const [keterangan, setKeterangan] = useState(laptop.keterangan);
  const [status, setStatus] = useState<LaptopStatus>(laptop.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    onSave({
      ...laptop,
      nama: nama.trim(),
      sn: sn.trim(),
      lokasiRak,
      shelving,
      keterangan: keterangan.trim(),
      status,
      tanggalUpdate: formattedDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Edit Posisi & Data Unit Laptop
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Serial Number (SN)
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono text-sm">
              <Hash className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={sn}
                onChange={(e) => setSn(e.target.value)}
                required
                className="bg-transparent w-full focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama / Model Laptop
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
              <Laptop className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="bg-transparent w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Rak
              </label>
              <select
                value={lokasiRak}
                onChange={(e) => setLokasiRak(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
              >
                {RAK_OPTIONS.map((rak) => (
                  <option key={rak} value={rak}>
                    {rak}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shelving (Tingkat)
              </label>
              <select
                value={shelving}
                onChange={(e) => setShelving(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
              >
                {SHELVING_OPTIONS.map((sh) => (
                  <option key={sh} value={sh}>
                    {sh}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status Unit
            </label>
            <div className="grid grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                    status === st
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Catatan kondisi fisik, peminjam, atau status..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
