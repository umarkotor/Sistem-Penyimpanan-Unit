import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { PlacementTab } from './components/PlacementTab.tsx';
import { SearchTab } from './components/SearchTab.tsx';
import { VisualRackTab } from './components/VisualRackTab.tsx';
import { MasterDataTab } from './components/MasterDataTab.tsx';
import { EditLaptopModal } from './components/EditLaptopModal.tsx';
import { MasterLaptop, StoredLaptop } from './types/index.ts';
import { INITIAL_MASTER_LAPTOPS, INITIAL_STORED_LAPTOPS } from './utils/sampleData.ts';

const STORAGE_KEYS = {
  MASTER: 'LAPTOP_STORAGE_MASTER_DATA',
  STORED: 'LAPTOP_STORAGE_STORED_DATA',
};

export default function App() {
  // Load master laptops from localStorage or default
  const [masterLaptopData, setMasterLaptopData] = useState<MasterLaptop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MASTER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading master data from localStorage', e);
    }
    return INITIAL_MASTER_LAPTOPS;
  });

  // Load stored laptops from localStorage or default
  const [storedLaptops, setStoredLaptops] = useState<StoredLaptop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading stored laptops from localStorage', e);
    }
    return INITIAL_STORED_LAPTOPS;
  });

  const [activeTab, setActiveTab] = useState<'penempatan' | 'pencarian' | 'visual' | 'master'>('penempatan');
  const [editingLaptop, setEditingLaptop] = useState<StoredLaptop | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MASTER, JSON.stringify(masterLaptopData));
    } catch (e) {
      console.error('Error saving master data to localStorage', e);
    }
  }, [masterLaptopData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STORED, JSON.stringify(storedLaptops));
    } catch (e) {
      console.error('Error saving stored data to localStorage', e);
    }
  }, [storedLaptops]);

  // Handler: Update Master Data (Append atau Replace)
  const handleUpdateMasterData = (newData: MasterLaptop[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setMasterLaptopData(newData);
    } else {
      setMasterLaptopData((prev) => {
        const existingSn = new Set(prev.map((m) => m.sn.toLowerCase()));
        const uniqueIncoming = newData.filter((item) => !existingSn.has(item.sn.toLowerCase()));
        return [...prev, ...uniqueIncoming];
      });
    }
  };

  const handleDeleteMasterItem = (id: string) => {
    setMasterLaptopData((prev) => prev.filter((m) => m.id !== id));
  };

  const handleResetToSampleData = () => {
    setMasterLaptopData(INITIAL_MASTER_LAPTOPS);
    setStoredLaptops(INITIAL_STORED_LAPTOPS);
  };

  // Handler: Simpan penempatan baru
  const handleSavePlacement = (newItems: StoredLaptop[]) => {
    // Jika laptop yang sama (SN sama) sudah ada di rak lain, kita perbarui lokasinya
    const incomingSnSet = new Set(newItems.map((n) => n.sn.toUpperCase()));

    setStoredLaptops((prev) => {
      // Filter yang sudah ada agar tidak ganda di database rak
      const filteredPrev = prev.filter((item) => !incomingSnSet.has(item.sn.toUpperCase()));
      return [...newItems, ...filteredPrev];
    });
  };

  // Handler: Update laptop yang diedit
  const handleUpdateStoredLaptop = (updated: StoredLaptop) => {
    setStoredLaptops((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  // Handler: Hapus dari penyimpanan
  const handleDeleteStoredLaptop = (id: string) => {
    setStoredLaptops((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header Aplikasi (Adheres to Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalStored={storedLaptops.length}
        totalMaster={masterLaptopData.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'penempatan' && (
          <PlacementTab
            masterLaptopData={masterLaptopData}
            onUpdateMasterData={handleUpdateMasterData}
            storedLaptops={storedLaptops}
            onSavePlacement={handleSavePlacement}
            onNavigateToSearch={() => setActiveTab('pencarian')}
          />
        )}

        {activeTab === 'pencarian' && (
          <SearchTab
            storedLaptops={storedLaptops}
            onUpdateLaptop={handleUpdateStoredLaptop}
            onDeleteLaptop={handleDeleteStoredLaptop}
            onEditLaptop={(lap) => setEditingLaptop(lap)}
            onNavigateToPlacement={() => setActiveTab('penempatan')}
          />
        )}

        {activeTab === 'visual' && (
          <VisualRackTab
            storedLaptops={storedLaptops}
            onSelectRackForPlacement={(_rak, _shelving) => {
              setActiveTab('penempatan');
            }}
            onEditLaptop={(lap) => setEditingLaptop(lap)}
          />
        )}

        {activeTab === 'master' && (
          <MasterDataTab
            masterLaptopData={masterLaptopData}
            onUpdateMasterData={handleUpdateMasterData}
            onDeleteMasterItem={handleDeleteMasterItem}
            onResetToSampleData={handleResetToSampleData}
          />
        )}
      </main>

      {/* Modal Edit Laptop */}
      <EditLaptopModal
        laptop={editingLaptop}
        isOpen={Boolean(editingLaptop)}
        onClose={() => setEditingLaptop(null)}
        onSave={handleUpdateStoredLaptop}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sistem Manajemen Penyimpanan Laptop &bull; Penempatan & Lokasi Rak</span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>{storedLaptops.length} Unit Tersimpan</span>
            <span>&bull;</span>
            <span>{masterLaptopData.length} Master Model</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
