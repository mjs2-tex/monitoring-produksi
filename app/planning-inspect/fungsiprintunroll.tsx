// fungsiprintInspect.tsx
import React from 'react';
import moment from 'moment';
import "moment/locale/id"; // Import locale Indonesia
moment.locale("id");      // Set global ke bahasa Indonesia

export default function InspectReport({ kodePlanning, all }: { kodePlanning: string, all?: any }) {
  const groupedByMachine = all.details.reduce((acc: any, item: any) => {
    const machine = item.mesin?.toUpperCase() || "TANPA MESIN";
    if (!acc[machine]) acc[machine] = {};

    // 2. Grouping Kedua: Di dalam Mesin, berdasarkan Tanggal
    const date = item.tgl_planning || "Tanpa Tanggal";
    if (!acc[machine][date]) acc[machine][date] = [];

    acc[machine][date].push(item);
    return acc;
  }, {});

  return (
    <div className="report-container">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape; /* Mengubah orientasi ke Landscape */
            margin: 10px;       /* Tetap margin 10px tiap sisi */
          }
          body * {
            visibility: hidden;
          }
          .report-container, .report-container * {
            visibility: visible;
          }
          .report-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%; 
            display: flex !important;
            flex-direction: column; /* Menyusun konten ke bawah */
            text-align: center;
          }
            table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        th, td { border: 1px solid black; padding: 1px 2px; text-align: left;font-size: 10px; }
        th { background-color: #fef3c7; text-transform: uppercase;font-size: 10px; }
        .machine-header { background-color: white; font-weight: bold; text-align: center; font-size: 10px; border-bottom: 2px solid black; }
        .date-cell { background-color: #dbeafe; font-weight: bold; text-align: center; width: 100px; }
        .note-section { font-size: 9px; font-weight: bold; margin-top: 20px; }
        .signature-section { margin-top: 15px; width: 100%; display: flex; justify-content: space-around; text-align: center; }
        }
      `}</style>

      {/* Konten yang akan tampil di tengah kertas */}
      <div className="flex flex-col ">
        <h1>
          PLANNING Inspect {moment(all.tgl_planning_awal).format("dddd, D MMMM YYYY")}
          {moment(all.tgl_planning_awal).isSame(all.tgl_planning_akhir, 'day')
            ? ''
            : ` S/D ${moment(all.tgl_planning_akhir).format("dddd, D MMMM YYYY")}`
          }
        </h1>
        <hr />

        <table >
          <thead>
            <tr>
              <th>WO REFF</th>
              <th>BUYER</th>
              <th>KODE GREIGE</th>
              <th>ITEM</th>
              <th>BATCH</th>
              <th>QTY</th>
              <th>UOM</th>
              <th>WARNA</th>
              <th>TUBE</th>
              <th>ACT<br />QTY</th>
              <th>NO<br />MESIN</th>
              <th>NO<br />RODA</th>
            </tr>
          </thead>
          <tbody>
            {all.details.map((row: any, idx: number) => (
              <tr key={row.id}>
                <td align="center">{idx + 1}</td>
                <td>{row.buyer}</td>
                <td>{row.kode_greige}</td>
                <td>{row.item}</td>
                <td>{row.batch}</td>
                <td align="right">{parseFloat(row.qty).toLocaleString('id-ID')}</td>
                <td>{row.uom}</td>
                <td>{row.warna}</td>
                <td>{row.tube}</td>
                <td align="center">{row.act_qty}</td>
                <td align="center">{row.no_mesin}</td>
                <td>{row.no_roda}</td>
                <td>
                  {row.keterangan}
                </td>

              </tr>
            ))}
          </tbody>
        </table>



        <div className="mt-6 flex flex-col w-full border-t-2 border-black pt-2 text-[10px] font-bold">
          <div className="flex justify-between w-full">

            {/* Kiri: Section Note */}
            <div className="flex flex-col gap-1 w-2/3">
              <span className="w-40">NOTE : </span>
              <div className="flex">
                <span>Khusus kain wooven, sebelum di obras potong kurang lebih 2 cm agar sambungan lurus, menghindari bowing dan skewing di stenter</span>
              </div>
              <div className="flex">
                <span>Cek kotor tanah, karat dan oli pada kain, jika ditemukan, catat di kolom keterangan pada kartu proses</span>
              </div>
              <div className="flex">
                <span>Cek lebar dan density tiap roll, catat di kartu proses</span>
              </div>
              <div className="flex">
                <span>Pastikan kain yang turun ditulis dalam buku serah terima dan di tanda tangan oleh bagian yang bersangkutan</span>
              </div>
             
            </div>

           

          </div>
        </div>
      </div>
    </div>
  );
}