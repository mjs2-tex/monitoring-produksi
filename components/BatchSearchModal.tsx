import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

interface MRPData {
  no_batch: string;
  nama_customer: string;
  no_om: string;
  nama_produk: string;
  warna_name: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MRPData[];
  onSelect: (batch: string) => void;
}

const columnHelper = createColumnHelper<MRPData>();

export default function BatchSearchModal({ isOpen, onClose, data, onSelect }: ModalProps) {
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(() => [
    columnHelper.accessor('no_batch', { header: 'No. Batch' }),
    columnHelper.accessor('nama_customer', { header: 'Customer' }),
    columnHelper.accessor('no_om', { header: 'No. OM' }),
    columnHelper.accessor('nama_produk', { header: 'Produk' }),
    columnHelper.accessor('warna_name', { header: 'Warna' }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  if (!isOpen) return null;

  const handleConfirmSelect = () => {
    const selectedRow = table.getSelectedRowModel().flatRows[0];
    if (selectedRow) {
      onSelect((selectedRow as any).original);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Pilih Batch MRP</h3>
          <input
            type="text"
            placeholder="Cari..."
            className="rounded border p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 uppercase text-slate-600">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-3">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  onDoubleClick={() => onSelect((row as any).original)}
                  className="cursor-pointer border-t hover:bg-blue-50"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded">Batal</button>
            <button 
              onClick={handleConfirmSelect} 
              className="bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}