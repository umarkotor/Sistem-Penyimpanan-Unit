import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Hash,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MasterLaptop } from '../types/index.ts';
import { parseMasterExcelFile, downloadMasterTemplate } from '../utils/excel.ts';

interface MasterDataTabProps {
  masterLaptopData: MasterLaptop[];
  onUpdateMasterData: (newData: MasterLaptop[], mode: 'append' | 'replace') => void;
  onDeleteMasterItem: (id: string) => void;
  onResetToSampleData: () => void;
}

export const MasterDataTab: React.FC<MasterDataTabProps> = ({
  masterLaptopData,
  onUpdateMasterData,
  onDeleteMasterItem,
  onResetToSampleData,
}) => {
  const [keyword, setKeyword] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newNama, setNewNama] = useState<string>('');
  const [newSn, setNewSn] = useState<string>('');
  const [newSpec, setNewSpec] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredMaster = useMemo(() => {
    const q = keyword.toLowerCase().trim();
    if (!q) return masterLaptopData;
    return masterLaptopData.filter(
      (m) =>
        m.nama.toLowerCase().includes(q) ||
        m.sn.toLowerCase().includes(q) ||
        (m.spesifikasi && m.spesifikasi.toLowerCase().includes(q))
    );
  }, [masterLaptopData, keyword]);

  const handleExcelUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: 'append' | 'replace'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const parsed = await parseMasterExcelFile(file);
      onUpdateMasterData(parsed, mode);
      setStatusMsg(
        `Berhasil ${mode === 'replace' ? 'mengganti dengan' : 'menambahkan'} ${
          parsed.length
        } master unit dari "${file.name}".`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membaca file Excel.');
    } finally {
      e.target.value = '';
    }
  };

  const handleExportMaster = () => {
    if (masterLaptopData.length === 0) {
      alert('Tidak ada master data untuk diekspor.');
      return;
    }
    const exportData = masterLaptopData.map((item, idx) => ({
      'No': idx + 1,
      'Nama / Model Laptop': item.nama,
      'Serial Number': item.sn,
      'Spesifikasi': item.spesifikasi || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 24 }, { wch: 32 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Laptop');

    XLSX.writeFile(workbook, 'Master_Data_Laptop.xlsx');
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newSn.trim()) {
      setErrorMsg('Nama Laptop dan Serial Number wajib diisi.');
      return;
    }

    // Cek duplikasi SN di master data
    if (masterLaptopData.some((m) => m.sn.toLowerCase() === newSn.trim().toLowerCase())) {
      setErrorMsg(`Serial Number "${newSn}" sudah ada di database master.`);
      return;
    }

    const newItem: MasterLaptop = {
      id: `m-${Date.now()}`,
      nama: newNama.trim(),
      sn: newSn.trim(),
      spesifikasi: newSpec.trim(),
    };

    onUpdateMasterData([newItem], 'append');
    setNewNama('');
    setNewSn('');
    setNewSpec('');
    setShowAddForm(false);
    setStatusMsg(`Berhasil menambahkan master unit ${newItem.nama} (${newItem.sn}).`);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              <span>Master Data Katalog Laptop ({masterLaptopData.length} Unit)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Data referensi model dan Serial Number yang digunakan untuk auto-fill saat penempatan ke rak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Master Baru</span>
            </button>

            <button
              onClick={handleExportMaster}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
              <span>Ekspor Excel</span>
            </button>

            <button
              onClick={downloadMasterTemplate}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Unduh Template</span>
            </button>

            <label className="cursor-pointer px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Tambahan</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => handleExcelUpload(e, 'append')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {statusMsg && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg mt-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mt-3">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Form Tambah Master Manual (Expandable) */}
      {showAddForm && (
        <form
          onSubmit={handleAddNew}
          className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Input Master Data Baru
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nama / Model Laptop *
              </label>
              <input
                type="text"
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                placeholder="Contoh: Lenovo ThinkPad T14"
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Serial Number (SN) *
              </label>
              <input
                type="text"
                value={newSn}
                onChange={(e) => setNewSn(e.target.value)}
                placeholder="Contoh: PF39X1A8"
                required
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Spesifikasi (Opsional)
              </label>
              <input
                type="text"
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                placeholder="Contoh: Core i7, 16GB, 512GB"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
            >
              Simpan ke Master
            </button>
          </div>
        </form>
      )}

      {/* Search & List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari nama model atau Serial Number..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                if (confirm('Kembalikan master data ke data contoh default?')) {
                  onResetToSampleData();
                }
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Reset ke Contoh Bawaan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-2.5 px-4 font-semibold text-slate-600 uppercase tracking-wider w-12 text-center">
                  #
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-600 uppercase tracking-wider w-5/12">
                  Nama / Model Laptop
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-600 uppercase tracking-wider w-3/12">
                  Serial Number (SN)
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-600 uppercase tracking-wider w-3/12">
                  Spesifikasi
                </th>
                <th className="py-2.5 px-4 font-semibold text-slate-600 uppercase tracking-wider w-14 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaster.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada master data laptop yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredMaster.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-center">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {item.nama}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">
                      {item.sn}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">
                      {item.spesifikasi || '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus master laptop "${item.nama}" (${item.sn})?`)) {
                            onDeleteMasterItem(item.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Hapus dari master data"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
