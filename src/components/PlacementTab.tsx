import React, { useState } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Info,
  Archive,
  Sparkles,
} from 'lucide-react';
import { MasterLaptop, StoredLaptop, PlacementRowItem } from '../types/index.ts';
import { parseMasterExcelFile, downloadMasterTemplate } from '../utils/excel.ts';

interface PlacementTabProps {
  masterLaptopData: MasterLaptop[];
  onUpdateMasterData: (newData: MasterLaptop[], mode: 'append' | 'replace') => void;
  storedLaptops: StoredLaptop[];
  onSavePlacement: (items: StoredLaptop[]) => void;
  onNavigateToSearch: () => void;
}

const RAK_OPTIONS = [
  'Rak 1', 'Rak 2', 'Rak 3', 'Rak 4',
  'Rak 5', 'Rak 6', 'Rak 7', 'Rak 8',
];

const SHELVING_OPTIONS = [
  'Shelving 1', 'Shelving 2', 'Shelving 3', 'Shelving 4',
];

export const PlacementTab: React.FC<PlacementTabProps> = ({
  masterLaptopData,
  onUpdateMasterData,
  storedLaptops,
  onSavePlacement,
  onNavigateToSearch,
}) => {
  const [lokasiRak, setLokasiRak] = useState<string>('Rak 1');
  const [shelvingRak, setShelvingRak] = useState<string>('Shelving 1');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [rows, setRows] = useState<PlacementRowItem[]>([
    { id: 'row-1', nama: '', sn: '', keterangan: '' },
  ]);

  // Hitung jumlah laptop saat ini di rak & shelving terpilih
  const currentShelfCount = storedLaptops.filter(
    (item) => item.lokasiRak === lokasiRak && item.shelving === shelvingRak
  ).length;

  const currentRackTotal = storedLaptops.filter(
    (item) => item.lokasiRak === lokasiRak
  ).length;

  // Handle Excel upload
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);
    setImportStatus(null);

    try {
      const parsedData = await parseMasterExcelFile(file);
      onUpdateMasterData(parsedData, 'append');
      setImportStatus(
        `Berhasil memuat ${parsedData.length} data master laptop dari file "${file.name}".`
      );
    } catch (err: any) {
      setImportError(err.message || 'Gagal membaca file Excel.');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  // Tambah 1 baris
  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        nama: '',
        sn: '',
        keterangan: '',
      },
    ]);
  };

  // Tambah 5 baris cepat
  const handleAddMultipleRows = (count: number) => {
    const newItems: PlacementRowItem[] = Array.from({ length: count }, (_, i) => ({
      id: `row-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
      nama: '',
      sn: '',
      keterangan: '',
    }));
    setRows((prev) => [...prev, ...newItems]);
  };

  // Hapus baris
  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      alert('Minimal harus ada satu baris laptop dalam daftar penempatan.');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Autocomplete nama -> SN
  const handleNamaChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const cleanVal = value.trim();
        // Cek apakah ada di master laptop
        const matched = masterLaptopData.find(
          (m) => m.nama.toLowerCase() === cleanVal.toLowerCase()
        );

        return {
          ...row,
          nama: value,
          sn: matched ? matched.sn : row.sn,
        };
      })
    );
  };

  // Autocomplete SN -> nama
  const handleSnChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const cleanVal = value.trim();
        const matched = masterLaptopData.find(
          (m) => m.sn.toLowerCase() === cleanVal.toLowerCase()
        );

        return {
          ...row,
          sn: value,
          nama: matched ? matched.nama : row.nama,
        };
      })
    );
  };

  const handleKeteranganChange = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, keterangan: value } : row))
    );
  };

  // Simpan penempatan
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lokasiRak || !shelvingRak) {
      alert('Silakan pilih Lokasi Rak dan Shelving terlebih dahulu.');
      return;
    }

    const validRows = rows.filter((r) => r.nama.trim() && r.sn.trim());

    if (validRows.length === 0) {
      alert('Harap isi setidaknya satu unit laptop dengan Nama dan Serial Number yang valid.');
      return;
    }

    // Cek duplikasi SN di antara baris yang diinput saat ini
    const snSet = new Set<string>();
    for (const r of validRows) {
      const snKey = r.sn.trim().toUpperCase();
      if (snSet.has(snKey)) {
        alert(`Serial Number ganda terdeteksi dalam input: ${r.sn}. Setiap laptop harus memiliki SN unik.`);
        return;
      }
      snSet.add(snKey);
    }

    // Cek apakah SN sudah ada di penyimpanan rak sebelumnya
    const alreadyStored = storedLaptops.filter((s) =>
      snSet.has(s.sn.trim().toUpperCase())
    );
    if (alreadyStored.length > 0) {
      const confirmSave = confirm(
        `Peringatan: ${alreadyStored.length} Serial Number sudah tersimpan di database (${alreadyStored
          .map((item) => `${item.sn} di ${item.lokasiRak} - ${item.shelving}`)
          .join(', ')}).\n\nApakah Anda tetap ingin memindahkan / menyimpan unit ini ke ${lokasiRak} (${shelvingRak})?`
      );
      if (!confirmSave) return;
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newStoredItems: StoredLaptop[] = validRows.map((r, idx) => ({
      id: `stored-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      nama: r.nama.trim(),
      sn: r.sn.trim(),
      lokasiRak,
      shelving: shelvingRak,
      keterangan: r.keterangan.trim() || 'Unit tersimpan di rak',
      status: 'Tersedia',
      tanggalDisimpan: formattedDate,
    }));

    onSavePlacement(newStoredItems);

    setSaveSuccessMsg(
      `Berhasil menyimpan ${newStoredItems.length} unit laptop ke ${lokasiRak} (${shelvingRak})!`
    );

    // Reset baris form
    setRows([{ id: `row-${Date.now()}`, nama: '', sn: '', keterangan: '' }]);

    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Box Import Excel Master */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-xs shrink-0 mt-0.5">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-blue-950">
                  1. Impor Master Data Laptop (Excel / CSV)
                </h3>
                <span className="text-xs text-blue-800 font-medium bg-blue-100/70 px-2 py-0.5 rounded">
                  {masterLaptopData.length} master model terdaftar
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed max-w-2xl">
                Unggah file Excel (Kolom A: Nama/Model Laptop, Kolom B: Serial Number) untuk fitur
                auto-fill data otomatis saat input penempatan rak.
              </p>

              {importStatus && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-2 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 w-fit">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}

              {importError && (
                <div className="flex items-center gap-1.5 text-xs text-red-700 font-medium mt-2 bg-red-50 px-2.5 py-1 rounded border border-red-200 w-fit">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={downloadMasterTemplate}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Contoh Format</span>
            </button>

            <label className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs">
              <Upload className="h-3.5 w-3.5" />
              <span>{isImporting ? 'Memproses...' : 'Upload Excel Master'}</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelUpload}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Datalist untuk Autocomplete dari Master Data */}
      <datalist id="laptopListOptions">
        {masterLaptopData.map((item) => (
          <option key={item.id} value={item.nama}>
            SN: {item.sn} {item.spesifikasi ? `(${item.spesifikasi})` : ''}
          </option>
        ))}
      </datalist>

      {/* Alert Berhasil Simpan */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3 text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-medium">{saveSuccessMsg}</p>
          </div>
          <button
            onClick={onNavigateToSearch}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap"
          >
            Lihat di Tab Pencarian →
          </button>
        </div>
      )}

      {/* Form Penempatan */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <div className="border-b border-slate-100 pb-5 mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Penempatan Laptop ke Rak Penyimpanan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan rak dan shelving tujuan, lalu masukkan unit laptop yang akan disimpan.
          </p>
        </div>

        {/* Pemilihan Rak & Shelving */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="lokasiRak" className="text-xs font-semibold text-slate-700">
                Lokasi Rak
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Total unit di {lokasiRak}: <strong className="text-slate-800">{currentRackTotal}</strong>
              </span>
            </div>
            <select
              id="lokasiRak"
              value={lokasiRak}
              onChange={(e) => setLokasiRak(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            >
              {RAK_OPTIONS.map((rak) => (
                <option key={rak} value={rak}>
                  {rak}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="shelvingRak" className="text-xs font-semibold text-slate-700">
                Shelving Rak (Tingkat)
              </label>
              <span className="text-[11px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Unit di {shelvingRak}: <strong className="text-blue-900">{currentShelfCount} unit</strong>
              </span>
            </div>
            <select
              id="shelvingRak"
              value={shelvingRak}
              onChange={(e) => setShelvingRak(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            >
              {SHELVING_OPTIONS.map((shelf) => (
                <option key={shelf} value={shelf}>
                  {shelf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel Input Laptop */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800">
                2. Daftar Unit Laptop yang Disimpan
              </span>
              <span className="text-xs text-slate-500">
                ({rows.length} baris diinput)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddMultipleRows(5)}
                className="text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors py-1 px-2 rounded hover:bg-slate-50"
              >
                + Tambah 5 Baris Cepat
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-2xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-8 text-center">
                    #
                  </th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-5/12">
                    Nama / Model Laptop
                  </th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-3/12">
                    Serial Number (SN)
                  </th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-3/12">
                    Keterangan (Opsional)
                  </th>
                  <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider w-14 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-xs text-slate-400 font-mono text-center">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        list="laptopListOptions"
                        value={row.nama}
                        onChange={(e) => handleNamaChange(row.id, e.target.value)}
                        placeholder="Ketik / pilih model laptop..."
                        required
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.sn}
                          onChange={(e) => handleSnChange(row.id, e.target.value)}
                          placeholder="Otomatis atau ketik SN..."
                          required
                          className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {row.sn && (
                          <span
                            title="Serial number terisi"
                            className="absolute right-2 top-2 text-[10px] text-slate-400 font-mono"
                          >
                            ✓
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.keterangan}
                        onChange={(e) => handleKeteranganChange(row.id, e.target.value)}
                        placeholder="Contoh: Kondisi Baik, Siap Assign..."
                        className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={rows.length === 1}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAddRow}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>+ Tambah Baris Laptop</span>
            </button>

            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Tip: Memilih nama laptop akan otomatis mengisi Serial Number jika terdaftar di Master Data.
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Akan disimpan ke: <strong className="text-slate-800">{lokasiRak}</strong> &rarr;{' '}
            <strong className="text-slate-800">{shelvingRak}</strong>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <Archive className="h-4 w-4" />
            <span>Simpan Penempatan Laptop</span>
          </button>
        </div>
      </form>
    </div>
  );
};
