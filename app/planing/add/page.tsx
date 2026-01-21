"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import BatchSearchModal from "@/components/BatchSearchModal";
import { fetchListMRP } from "./fucntionadd";

export default function AddPlanningPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hisaka 1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [master, setMaster] = useState({
    kode_planning: "",
    user_planning: "",
    tgl_planning_awal: "",
    tgl_planning_akhir: "",
    status: "draft",
  });
  const [dataMRP, setDataMRP] = useState([]);
  const [selectedRow, setSelectedRow] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // State Detail dengan field lengkap sesuai gambar
  const [details, setDetails] = useState<any[]>([]);

  const addRow = () => {
    if (!master.tgl_planning_awal) {
      Swal.fire({
        title: 'Peringatan!',
        text: 'Isi Tanggal Planning Awal di Master terlebih dahulu!',
        icon: 'warning',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
      return;
    }

    const currentTabDetails = details.filter(d => d.mesin === activeTab);
    const lastRow = currentTabDetails[currentTabDetails.length - 1];
    const targetDate = lastRow ? lastRow.tgl_planning : master.tgl_planning_awal;

    const sameGroup = details.filter(
      (d) => d.mesin === activeTab && d.tgl_planning === targetDate
    );

    const newUrutan = sameGroup.length + 1;

    const newRow = {
      id_temp: Date.now(),
      mesin: activeTab,
      tgl_planning: targetDate,
      urutan: newUrutan, // Kolom NO di gambar
      buyer: "",
      item: "",
      kode_greige: "",
      td: "",
      batch: "",
      qty: 0,
      warna: "",
      proses: "",
      roda: "",
      berat_kain: 0,
      ex: "",
      keterangan: ""
    };

    setDetails([...details, newRow]);
  };

  const reorder = (allDetails: any[]) => {
    const groups: { [key: string]: number } = {};
    return allDetails.map((item) => {
      const key = `${item.mesin}-${item.tgl_planning}`;
      groups[key] = (groups[key] || 0) + 1;
      return { ...item, urutan: groups[key] };
    });
  };

  const removeRow = (idTemp: number) => {
    const filtered = details.filter((d) => d.id_temp !== idTemp);
    setDetails(reorder(filtered));
  };

  const updateDetailField = (idTemp: number, field: string, value: any) => {
    // Validasi Batch Unik
    if (field === "batch" && value !== "") {
      const isDuplicate = details.some(
        (d) => d.batch.toLowerCase() === value.toLowerCase() && d.id_temp !== idTemp
      );
      if (isDuplicate) {
        Swal.fire({
          icon: 'error', title: 'Batch Double!', text: `Batch ${value} sudah ada!`,
          timer: 3000, timerProgressBar: true, showConfirmButton: false, toast: true, position: 'top-end'
        });
        return;
      }
    }

    let updated = details.map((d) => (d.id_temp === idTemp ? { ...d, [field]: value } : d));
    if (field === "tgl_planning") updated = reorder(updated);
    setDetails(updated);
  };

  const filteredDetails = details.filter((d) => d.mesin === activeTab);

  const resetForm = () => {
    Swal.fire({
      title: 'Hapus Draft?',
      text: "Semua isian yang belum disimpan akan hilang!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus Semua',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("temp_master");
        localStorage.removeItem("temp_details");
        window.location.reload(); // Refresh halaman untuk reset state
      }
    });
  };

  const handleSave = async () => {
    try {
      // Simulasikan hit API simpan
      console.log("Mengirim data ke database...", { master, details });

      // Jika Berhasil:
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data planning telah disimpan ke database.',
        timer: 2000,
        showConfirmButton: false
      });

      // HAPUS LOCAL STORAGE SETELAH BERHASIL
      localStorage.removeItem("temp_master");
      localStorage.removeItem("temp_details");

      // Redirect kembali ke halaman list
      router.push("/planning");

    } catch (error) {
      Swal.fire('Gagal!', 'Terjadi kesalahan saat menyimpan.', 'error');
    }
  };
  const loadData = async () => {
    setLoading(true);
    const data = await fetchListMRP();
    setDataMRP(data);
    setLoading(false);
  };


  // 1. useEffect untuk Load data dari LocalStorage saat halaman pertama kali dibuka
  useEffect(() => {
    const savedMaster = localStorage.getItem("temp_master");
    const savedDetails = localStorage.getItem("temp_details");

    loadData();
    if (savedMaster) {
      console.log('savedMaster', savedMaster);
      const temp = JSON.parse(savedMaster);
      setMaster({
        kode_planning: temp.kode_planning || "",
        user_planning: temp.user_planning || "",
        tgl_planning_awal: temp.tgl_planning_awal || "",
        tgl_planning_akhir: temp.tgl_planning_akhir || "",
        status: temp.status || "draft",
      })
    };
    if (savedDetails) setDetails(JSON.parse(savedDetails));
  }, []);

  // 2. useEffect untuk Simpan data ke LocalStorage setiap kali ada perubahan
  // Kita beri jeda (debounce) agar tidak memberatkan browser setiap kali ngetik
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("temp_master", JSON.stringify(master));
      localStorage.setItem("temp_details", JSON.stringify(details));
      console.log("Progress disimpan otomatis ke local storage...");
    }, 1000); // Simpan 1 detik setelah user berhenti berinteraksi

    return () => clearTimeout(timeoutId);
  }, [master, details]);

  return (
    <div className="w-full h-[calc(100vh-70px)] flex flex-col p-4 gap-3 bg-slate-50 text-slate-800 overflow-hidden">

      <h2 className="text-xl font-bold italic">| Planning Dyeing -- BARU</h2>

      {/* SECTION MASTER */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-5 gap-4 items-end">
        {/* ... (Input master sama seperti sebelumnya) ... */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Kode</label>
          <input type="text" className="text-sm border-b border-slate-200 py-1 focus:outline-none focus:border-blue-500" value={master.kode_planning || ''} onChange={(e) => setMaster({ ...master, kode_planning: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">User</label>
          <input type="text" className="text-sm border-b border-slate-200 py-1 focus:outline-none focus:border-blue-500" value={master.user_planning || ''} onChange={(e) => setMaster({ ...master, user_planning: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Tgl Awal</label>
          <input type="date" className="text-sm border-b border-slate-200 py-1 focus:outline-none focus:border-blue-500" value={master.tgl_planning_awal || ''} onChange={(e) => setMaster({ ...master, tgl_planning_awal: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Tgl Akhir</label>
          <input type="date" className="text-sm border-b border-slate-200 py-1 focus:outline-none focus:border-blue-500" value={master.tgl_planning_akhir || ''} onChange={(e) => setMaster({ ...master, tgl_planning_akhir: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
          <select className="text-sm border-b border-slate-200 py-1 focus:outline-none focus:border-blue-500 bg-transparent" value={master.status || ''} onChange={(e) => setMaster({ ...master, status: e.target.value })}>
            <option value="draft">DRAFT</option>
            <option value="open">OPEN</option>
          </select>
        </div>
      </div>

      {/* SECTION DETAIL */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex gap-1 ml-2 overflow-x-auto no-scrollbar">
          {["hisaka 1", "hisaka 2", "hisaka 3", "hisaka 4", "samil 1", "samil 2", "samil 3"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-t-xl border-t border-l border-r text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "bg-slate-200 text-slate-500"}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-b-2xl rounded-tr-2xl p-3 shadow-sm flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal di baris: {filteredDetails[0]?.tgl_planning || '-'}</span>
            <button onClick={addRow} className="px-4 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all">+ Baris</button>
          </div>

          <div className="flex-1 overflow-auto border border-slate-100 rounded-xl">
            <table className="w-full text-[11px] border-separate border-spacing-0">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr className="text-slate-500 uppercase font-black">
                  <th className="px-2 py-3 border-b border-slate-200 text-center w-8">NO</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left w-24">TGL</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">BUYER</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">ITEM</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">KODE GREIGE</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">TD</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">BATCH</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left w-16">QTY</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">WARNA</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">PROSES</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left w-12">RODA</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">BERAT</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left w-12">EX</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-left">KETERANGAN</th>
                  <th className="px-2 py-3 border-b border-slate-200 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDetails.map((row) => (
                  <tr key={row.id_temp} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-2 text-center font-bold text-blue-600">{row.urutan}</td>
                    <td className="px-1"><input type="date" value={row.tgl_planning} className="w-full bg-transparent p-1 focus:outline-none text-[10px]" onChange={(e) => updateDetailField(row.id_temp, 'tgl_planning', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" placeholder="..." value={row.buyer} onChange={(e) => updateDetailField(row.id_temp, 'buyer', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" placeholder="..." value={row.item} onChange={(e) => updateDetailField(row.id_temp, 'item', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" placeholder="..." value={row.kode_greige} onChange={(e) => updateDetailField(row.id_temp, 'kode_greige', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" placeholder="..." value={row.td} onChange={(e) => updateDetailField(row.id_temp, 'td', e.target.value)} /></td>
                    <td className="px-1 border-b border-slate-200">
                      <div className="flex items-center group bg-white rounded border border-transparent focus-within:border-blue-500 transition-all">
                        <input
                          type="text"
                          className="w-full bg-transparent p-1 focus:outline-none font-bold text-slate-700 text-sm"
                          placeholder="..."
                          value={row.batch}
                          onChange={(e) => updateDetailField(row.id_temp, 'batch', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => { setIsModalOpen(true); setSelectedRow(row); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 flex items-center justify-center"
                          title="Cari Batch"
                        >
                          {/* SVG Kaca Pembesar Murni */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                        </button>
                      </div>

                      {/* Modal Component */}




                    </td>
                    <td className="px-1"><input type="number" className="w-full bg-transparent p-1 focus:outline-none" value={row.qty} onChange={(e) => updateDetailField(row.id_temp, 'qty', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" value={row.warna} onChange={(e) => updateDetailField(row.id_temp, 'warna', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" value={row.proses} onChange={(e) => updateDetailField(row.id_temp, 'proses', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" value={row.roda} onChange={(e) => updateDetailField(row.id_temp, 'roda', e.target.value)} /></td>
                    <td className="px-1"><input type="number" className="w-full bg-transparent p-1 focus:outline-none" value={row.berat_kain} onChange={(e) => updateDetailField(row.id_temp, 'berat_kain', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" value={row.ex} onChange={(e) => updateDetailField(row.id_temp, 'ex', e.target.value)} /></td>
                    <td className="px-1"><input type="text" className="w-full bg-transparent p-1 focus:outline-none" value={row.keterangan} onChange={(e) => updateDetailField(row.id_temp, 'keterangan', e.target.value)} /></td>
                    <td className="px-1 text-center">
                      <button onClick={() => removeRow(row.id_temp)} className="text-red-400 hover:text-red-600">×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FIXED ACTION FOOTER */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex justify-between items-center shadow-lg">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4">Ready to save {details.length} total records</span>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-6 py-2 border border-slate-200 rounded-xl text-xs font-black uppercase">Batal</button>
          <button onClick={() => console.log({ master, details })} className="px-10 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-md">Simpan Planning</button>
        </div>
      </div>
      {isModalOpen && (


        <BatchSearchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={dataMRP}
          onSelect={async (val: any) => {
            if (val.no_batch !== "") {
              const isDuplicate = details.some(
                (d) => d.batch.toLowerCase() === val.no_batch.toLowerCase() && d.id_temp !== selectedRow.id_temp
              );
              if (isDuplicate) {
                const result = await Swal.fire({
                  title: 'Batch Double!',
                  text: `Batch ${val.no_batch} sudah ada, apakah akan tetap lanjut dan ganti proses?`,
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Ya, Lanjut!',
                  cancelButtonText: 'Batal'
                });

                // Jika user menekan tombol "Batal"
                if (!result.isConfirmed) {
                  return; // Hentikan proses di sini
                }
              }
            }

            let updated = details.map((d) => (d.id_temp === selectedRow.id_temp ? {
              ...selectedRow,
              batch: val.no_batch,
              buyer: val.nama_customer,
              item: val.nama_produk,
              td: val.no_td,
              warna: val.warna_name,
              kode_greige: val.kode_greige,
              // proses: val.nama_proses,
              berat_kain: val.berat_roda || 0,
              qty: val.qty_yard
            } : d));
            setDetails(updated);
            setIsModalOpen(false);
            setSelectedRow({});
          }}
        />
      )}
    </div>
  );
}