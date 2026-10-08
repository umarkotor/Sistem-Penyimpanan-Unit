import * as XLSX from 'xlsx';
import { MasterLaptop, StoredLaptop } from '../types/index.ts';

/**
 * Membaca file Excel (.xlsx, .xls, .csv) dan mengekstrak data master laptop.
 * Mendukung header baris 1 (Nama Laptop, Serial Number) atau baris data langsung.
 */
export async function parseMasterExcelFile(file: File): Promise<MasterLaptop[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  if (!workbook.SheetNames.length) {
    throw new Error('File Excel tidak memiliki sheet yang valid.');
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rawRows.length <= 1) {
    throw new Error('File Excel kosong atau hanya memiliki header.');
  }

  const result: MasterLaptop[] = [];
  const startIndex = 1; // Mengabaikan baris header pertama

  for (let i = startIndex; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (row && row.length >= 2) {
      const rawNama = row[0] !== undefined && row[0] !== null ? String(row[0]).trim() : '';
      const rawSn = row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : '';
      const spec = row[2] ? String(row[2]).trim() : '';

      if (rawNama && rawSn) {
        result.push({
          id: `master-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          nama: rawNama,
          sn: rawSn,
          spesifikasi: spec,
        });
      }
    }
  }

  if (result.length === 0) {
    throw new Error('Tidak ditemukan data valid pada Kolom A (Nama) dan Kolom B (Serial Number).');
  }

  return result;
}

/**
 * Mengunduh template Excel master data kosong untuk diisi oleh pengguna.
 */
export function downloadMasterTemplate(): void {
  const templateData = [
    ['Nama / Model Laptop', 'Serial Number', 'Spesifikasi / Keterangan (Opsional)'],
    ['Lenovo ThinkPad T14 Gen 3', 'PF39X1A8', 'Core i7, 16GB RAM, 512GB SSD'],
    ['Dell Latitude 5430', 'DL5430-8841A', 'Core i5, 16GB RAM, 256GB SSD'],
    ['HP EliteBook 840 G8', '5CG1283M09', 'Core i7, 16GB RAM, 512GB SSD'],
    ['MacBook Pro 14" M2', 'C02G789PQ1', 'M2 Pro 16GB, 512GB SSD'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  worksheet['!cols'] = [{ wch: 32 }, { wch: 24 }, { wch: 36 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Laptop');

  XLSX.writeFile(workbook, 'Template_Master_Data_Laptop.xlsx');
}

/**
 * Ekspor data penyimpanan laptop ke file Excel (.xlsx).
 */
export function exportStoredLaptopsToExcel(laptops: StoredLaptop[], filename = 'Data_Penyimpanan_Laptop.xlsx'): void {
  const exportData = laptops.map((item, index) => ({
    'No': index + 1,
    'Serial Number': item.sn,
    'Merek / Model': item.nama,
    'Lokasi Rak': item.lokasiRak,
    'Shelving': item.shelving,
    'Keterangan': item.keterangan || '-',
    'Status': item.status,
    'Tanggal Disimpan': item.tanggalDisimpan,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 22 },
    { wch: 32 },
    { wch: 14 },
    { wch: 14 },
    { wch: 28 },
    { wch: 14 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Penyimpanan Laptop');

  XLSX.writeFile(workbook, filename);
}
