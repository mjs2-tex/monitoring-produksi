"use client";

import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import BaruEditModalCWR from "./modal/BaruEditModalCWR";

type PlanningMaster = {
  kode_planning: string;
  tgl_planning_awal: string;
  tgl_planning_akhir: string;
  jumlah_planning: number;
  user_planning: string;
  status: string;
  tgl_dokumen: string;
};

const columnHelper = createColumnHelper<PlanningMaster>();

export default function PlanningPage() {
  const router = useRouter();
  const [data, setData] = useState<PlanningMaster[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [masterState, setMasterState] = useState("BARU");
  const [masterData, setMasterData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/planning?type=CWR");
      const json = await res.json();
      setData(json.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    columnHelper.accessor("kode_planning", {
      header: "Kode Planning",
      cell: (info) => <span className="font-bold text-blue-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor("tgl_planning_awal", {
      header: "Tgl Awal",
    }),
    columnHelper.accessor("tgl_planning_akhir", {
      header: "Tgl Akhir",
    }),
    columnHelper.accessor("jumlah_planning", {
      header: "Qty",
    }),
    columnHelper.accessor("user_planning", {
      header: "User",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue()?.toLowerCase();
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
            status === 'done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {status}
          </span>
        );
      },
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

    const getOneDetail = async (kodePlanning: string) => {
    try {
      const res = await fetch(`/api/planning/${kodePlanning}`);
      const json = await res.json();
      setMasterData(json.data);
      setMasterState("EDIT");
      setShowModal(true);
    } catch (error) {
      console.error("Gagal mengambil data detail:", error);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-70px)] flex flex-col p-4 gap-2 bg-slate-50 text-slate-800">
      {showModal && (
        <BaruEditModalCWR
          isOpen={showModal}
          onClose={() => {setShowModal(false); setMasterData([]);}}
          title="Tambah Data Planning CWR"
          masterState={masterState}
          masterData={masterData}
          fetchData={fetchData}
        />
      )}
      <h2 className="text-2xl font-bold italic">| Planning CWR</h2>
      
      <div className="w-full h-full bg-white rounded-2xl border border-slate-200 p-5 flex flex-col shadow-sm overflow-hidden">
        
        {/* Header: Search & Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
          <div className="relative w-full max-w-sm">
            {/* Search Icon (SVG) */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Cari data planning..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>

          <button 
            onClick={() => {
              // router.push("/planing/add")
              setMasterState("BARU");
              setShowModal(true)
            }}
            className="group flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            {/* Plus Icon (SVG) */}
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Data Planing
          </button>
        </div>

        {/* Container Table */}
        <div className="flex-1 overflow-auto border border-slate-100 rounded-xl relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-xs font-medium text-slate-500">Memuat data...</span>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 uppercase text-[11px] tracking-wider">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-5 py-4 font-bold border-b border-slate-100">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-50">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onDoubleClick={async() => await getOneDetail(row.original.kode_planning)} 
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3.5 text-slate-600 border-b border-slate-50">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-5 py-10 text-center text-slate-400 italic">
                      Data tidak ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 px-2">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            Total {data.length} records found
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-1 mx-2">
               <span className="text-sm font-bold text-slate-700">{table.getState().pagination.pageIndex + 1}</span>
               <span className="text-slate-300">/</span>
               <span className="text-sm text-slate-500">{table.getPageCount()}</span>
            </div>

            <button 
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-slate-50 transition-all text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}