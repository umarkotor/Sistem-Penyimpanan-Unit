export interface MasterLaptop {
  id: string;
  nama: string;
  sn: string;
  brand?: string;
  spesifikasi?: string;
}

export type LaptopStatus = 'Tersedia' | 'Dipinjam' | 'Maintenance' | 'Keluar';

export interface StoredLaptop {
  id: string;
  sn: string;
  nama: string;
  lokasiRak: string;
  shelving: string;
  keterangan: string;
  status: LaptopStatus;
  tanggalDisimpan: string;
  tanggalUpdate?: string;
}

export interface PlacementRowItem {
  id: string;
  nama: string;
  sn: string;
  keterangan: string;
}
