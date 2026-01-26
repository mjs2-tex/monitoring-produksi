"use client";

import React, { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import axios from "axios";

// 1. Fetcher Functions
const fetchPlanningToday = async () => {
  const response = await axios.get("/api/planning/filter");
  return response.data.data || []; 
};

const fetchDoneWork = async () => {
  const response = await axios.get("/api/done_work");
  return response.data.data || []; // Asumsi struktur: [{ no_batch, wc, mesin, mo_state }]
};

const PlanningNowTable = () => {
  const columnHelper = createColumnHelper<any>();

  // 2. Mengambil Data Planning (Utama)
  const { data: planningData = [], isError: errPlan } = useQuery({
    queryKey: ["planning_now"],
    queryFn: fetchPlanningToday,
    refetchInterval: 5000,
  });

  // 3. Mengambil Data Real-time Work (Status)
  const { data: workStatus = [] } = useQuery({
    queryKey: ["done_work"],
    queryFn: fetchDoneWork,
    refetchInterval: 3000, // Lebih cepat cek status pengerjaan
  });

  const columns = useMemo(() => [
    columnHelper.accessor("mesin", { 
      header: "MESIN",
      size: 120,
      cell: (info) => <span className="font-black uppercase whitespace-nowrap">{info.getValue()}</span>
    }),
    columnHelper.accessor("batch", { 
      header: "BATCH",
      size: 100,
      cell: (info) => <span className="font-bold whitespace-nowrap">{info.getValue()}</span>
    }),
    columnHelper.accessor("buyer", { header: "BUYER" }),
    columnHelper.accessor("warna", { 
      header: "WARNA",
      cell: (info) => <span className="text-[10px] uppercase">{info.getValue()}</span>
    }),
  ], []);

  const table = useReactTable({
    data: planningData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  useEffect(() => {
    if (planningData.length === 0) return;
    const interval = setInterval(() => {
      table.getCanNextPage() ? table.nextPage() : table.setPageIndex(0);
    }, 12000);
    return () => clearInterval(interval);
  }, [table, planningData]);

  // --- LOGIKA MAPPING WARNA ---
  const getRowStatusColor = (row: any) => {
  // Cari kecocokan data
  const match = workStatus.find((w: any) => {
    // 1. Cek kesamaan Batch (Pastikan string dan hapus spasi jika ada)
    const isBatchMatch = String(w.no_batch).trim() === String(row.batch).trim();

    // 2. Cek apakah nama mesin di workStatus mengandung nama mesin dari Planning
    // Contoh: "JET DYEING HISAKA 1" mengandung "HISAKA 1"
    const isMesinMatch = w.mesin && row.mesin 
      ? String(w.mesin).toUpperCase().includes(String(row.mesin).toUpperCase())
      : false;

    return isBatchMatch && isMesinMatch;
  });

  if (!match) return "bg-white text-slate-700";

  // Penentuan warna berdasarkan state
  const state = match.mo_state?.toLowerCase();
  if (state === "done") {
    return "bg-emerald-500 text-white font-bold"; 
  } 
  if (state === "progress") {
    return "bg-amber-400 text-slate-900 font-bold";
  }

  return "bg-white text-slate-700";
};

  if (errPlan) return <div className="p-4 text-red-500 text-xs font-bold">Error loading data...</div>;

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-lg shadow-inner overflow-hidden border border-slate-300">
      <div className="flex-1 overflow-x-hidden">
        <table className="w-full text-left text-[11px] border-collapse table-fixed">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-slate-900">
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="p-1 font-black text-slate-400 uppercase tracking-widest text-[9px]"
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="overflow-x-hidden">
            {table.getRowModel().rows.map((row, idx) => {
              const statusClass = getRowStatusColor(row.original);
              const isSameMesin = row.original.mesin === table.getRowModel().rows[idx - 1]?.original?.mesin;

              return (
                <tr 
                  key={row.id} 
                  className={`transition-all duration-500 border-b border-slate-200/50 ${statusClass}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="p-1 overflow-hidden"
                      style={{ width: cell.column.getSize() }}
                    >
                      <div className={`${cell.column.id === 'mesin' && isSameMesin && !statusClass.includes('emerald') ? "opacity-20" : "opacity-100"}`}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination Indicator */}
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
        <div className="flex gap-1">
          {table.getPageOptions().map((idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-700 ${table.getState().pagination.pageIndex === idx ? "w-10 bg-blue-500" : "w-2 bg-slate-700"}`} />
          ))}
        </div>
        <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500">
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> PROGRESS</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> DONE</div>
        </div>
      </div>
    </div>
  );
};

export default PlanningNowTable;