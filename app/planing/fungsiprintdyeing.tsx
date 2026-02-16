// fungsiprintdyeing.tsx
import React from 'react';
import moment from 'moment';
import "moment/locale/id"; // Import locale Indonesia
moment.locale("id");      // Set global ke bahasa Indonesia

export default function DyeingReport({ kodePlanning, all }: { kodePlanning: string, all?: any }) {
  const groupedByMachine = all.details.reduce((acc: any, item : any) => {
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
          PLANNING DYEING {moment(all.tgl_planning_awal).format("dddd, D MMMM YYYY")}
          {moment(all.tgl_planning_awal).isSame(all.tgl_planning_akhir, 'day')
            ? ''
            : ` S/D ${moment(all.tgl_planning_akhir).format("dddd, D MMMM YYYY")}`
          }
        </h1>
        <hr />


        {Object.keys(groupedByMachine).map((machineName) => {
        const datesInMachine = groupedByMachine[machineName];
        
        return (
          <table key={machineName}>
            <thead>
              {/* Baris Nama Mesin */}
              <tr>
                <th colSpan={12} className="machine-title py-1">
                  {machineName} (SPEK MESIN DISINI)
                </th>
                <th className="bg-blue-date">TGL PLANNING</th>
              </tr>
              {/* Header Kolom Utama */}
              <tr>
                <th style={{width: 30}}>NO</th>
                <th>BUYER</th>
                <th>ITEM</th>
                <th>KODE GREIGE</th>
                <th>TD</th>
                <th>BATCH</th>
                <th>QTY</th>
                <th>WARNA</th>
                <th>PROSES</th>
                <th>RODA</th>
                <th>BERAT</th>
                <th>EX</th>
                <th>KETERANGAN</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(datesInMachine).map((date) => (
                <React.Fragment key={date}>
                  {datesInMachine[date].map((row: any, idx: number) => (
                    <tr key={row.id}>
                      <td align="center">{idx + 1}</td>
                      <td>{row.buyer}</td>
                      <td>{row.item}</td>
                      <td>{row.kode_greige}</td>
                      <td>{row.td}</td>
                      <td>{row.batch}</td>
                      <td align="right">{parseFloat(row.qty).toLocaleString('id-ID')}</td>
                      <td>{row.warna}</td>
                      <td>{row.proses}</td>
                      <td align="center">{row.roda}</td>
                      <td align="center">{row.berat_kain}</td>
                      <td>{row.ex}</td>
                      {/* Sel Tanggal: Hanya muncul di baris pertama tiap kelompok tanggal */}
                      {idx === 0 ? (
                        <td>
                          {date}
                        </td>
                      ) : <td>{row.keterangan}</td>}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        );
      })}

        <div className="mt-6 flex flex-col w-full border-t-2 border-black pt-2 text-[10px] font-bold">
  <div className="flex justify-between w-full">
    
    {/* Kiri: Section Note */}
    <div className="flex flex-col gap-1 w-2/3">
        <span className="w-40">NOTE : </span>
      <div className="flex">
        <span className="w-4 ml-44">1.</span>
        <span>JALANKAN MESIN SESUAI DENGAN PLANNING PER MESIN</span>
      </div>
      <div className="flex">
        <span className="w-4 ml-44">2.</span>
        <span>SEBELUM MASUK KAIN KE DALAM MESIN, DI BACA KARTU PROSESNYA</span>
      </div>
      <div className="flex">
        <span className="w-4 ml-44">3.</span>
        <span>APABILA ADA KETIDAK SESUAIAN ANTARA PLANNING DENGAN LAPANGAN HARAP DI TANYAKAN KE PPIC</span>
      </div>
      <div className="flex">
        <span className="w-4 ml-44">4.</span>
        <span>APABILA ADA MASALAH/ KENDALA HARUS ADA INFORMASI KE PPIC (PA NORMAN)</span>
      </div>
      <div className="flex">
        <span className="w-4 ml-44">5.</span>
        <span>BUDAYAKAN MEMBACA DAN BERTANYA !!!</span>
      </div>
      <div className="flex">
        <span className="w-4 ml-44">6.</span>
        <span>PASTIKAN MESIN BENAR-BENAR BERSIH SETELAH CUCI MESIN</span>
      </div>
    </div>

    {/* Kanan: Section Tanda Tangan */}
    <div className="flex flex-col items-end pr-10 min-w-[300px]">
      <div className="flex gap-24 italic">
        {/* Membuat */}
        <div className="flex flex-col items-center">
          <p className="mb-14">Membuat,</p>
          <p className="font-bold underline uppercase decoration-1 underline-offset-4">PPIC</p>
        </div>
        
        {/* Mengetahui */}
        <div className="flex flex-col items-center">
          <p className="mb-14">Mengetahui,</p>
          <p className="font-bold underline uppercase decoration-1 underline-offset-4">Pak Budi</p>
        </div>
      </div>
    </div>

  </div>
</div>
      </div>
    </div>
  );
}