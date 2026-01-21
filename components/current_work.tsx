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

// 1. Fungsi Fetcher
const fetchCurrentWork = async () => {
  const response = await fetch("/api/current_work");
  if (!response.ok) throw new Error("Network response was not ok");
  const result = await response.json();
  return result.data || []; // Ambil data saja
};

const CurrentWork = () => {
  const columnHelper = createColumnHelper<any>();

  // 2. Gunakan TanStack Query
  const { data: serverData = [], isError } = useQuery({
    queryKey: ["current_work"],
    queryFn: fetchCurrentWork,
    refetchInterval: 5000, // Cek data ke database tiap 5 detik
    refetchIntervalInBackground: true, // Tetap jalan meski tab tidak fokus
  });

  // 3. Kolom Tabel
  const columns = useMemo(() => [
    columnHelper.accessor("no_batch", { header: "BATCH" }),
    columnHelper.accessor("nama_customer", { header: "CUSTOMER" }),
    columnHelper.accessor("nama_produk", { header: "PRODUK" }),
    columnHelper.accessor("mesin_no", { header: "MESIN" }),
    columnHelper.accessor("date_start", { header: "START" }),

  ], []);

  // 4. Inisialisasi Table
  const table = useReactTable({
    data: serverData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  // 5. Efek Auto Slide (Pindah Halaman Otomatis)
  useEffect(() => {
    const interval = setInterval(() => {
      if (table.getCanNextPage()) {
        table.nextPage();
      } else {
        table.setPageIndex(0);
      }
    }, 10000); // Ganti halaman tiap 10 detik
    return () => clearInterval(interval);
  }, [table]);

  if (isError) return <div className="text-red-500 text-[10px]">Error loading data...</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-[11px]">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-100">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-2 font-black text-slate-400 uppercase tracking-widest">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-2 py-3 font-medium">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Indikator Dots */}
      <div className="flex items-center justify-between p-2 ">
        <div className="flex gap-1.5">
          {table.getPageOptions().map((idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                table.getState().pagination.pageIndex === idx ? "w-6 bg-blue-500" : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrentWork;