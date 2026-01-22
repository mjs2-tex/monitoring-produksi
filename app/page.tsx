import CurrentWork from "@/components/current_work";
import CurrentWorkMesin from "@/components/current_work_mesin";
import DeliveryBatchTable from "@/components/delivery_batch";
import QcFailed from "@/components/qc_failed";
import moment from "moment";
import Image from "next/image";
import 'moment/locale/id'; // Impor bahasa Indonesia
import PlanningNowTable from "@/components/PlanningNowTable";

moment.locale('id'); // Setel agar menggunakan bahasa Indonesia secara global

export default function Home() {

  return (
    <div className="w-full h-[calc(100vh-70px)] flex p-2 gap-2">

      {/* Kolom 1: QC FAILED */}
      <div className="w-[33%] bg-white rounded-2xl border border-slate-200 p-5 flex flex-col shadow-sm">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 mb-4 border-l-3 border-sky-500 pl-3">
          PEKERJAAN SEDANG BERJALAN
        </h2>
        <CurrentWorkMesin />
      </div>

      {/* Kolom 2: PLANNING */}
      <div className="w-[33%] bg-white rounded-2xl border border-blue-100 p-5 px-1 flex flex-col shadow-lg shadow-blue-900/5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1 ml-4">Planning Hari Ini</h2>
        <h2 className="text-2xl font-black text-slate-900 mb-4 ml-4">{moment().format("dddd, DD MMMM YYYY")}</h2>

        <PlanningNowTable />
      </div>

      {/* Kolom 3: Delivery & Position */}
      <div className="w-[33%] flex flex-col gap-4">
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-3">Delivery Batch (± 7 Hari)</h2>
          <DeliveryBatchTable />
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-1">| QC FAILED</h2>
          <p className="text-[9px] text-slate-400 uppercase mb-3 font-bold">Selama 4 Bulan Terakhir</p>
          <QcFailed />
        </div>
      </div>

    </div>


  );
}
