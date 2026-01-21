import { NextResponse } from "next/server";
import {poolSecond} from "@/lib/db";
import moment from "moment";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kode_planning: string }> } 
) {
  const { kode_planning } = await params;

  try {
    // 1. Ambil data Master
    console.log('kode_planning',kode_planning);
    
    const masterRes = await poolSecond.query(
      "SELECT * FROM tb_m_planning WHERE kode_planning = $1",
      [kode_planning]
    );

    if (masterRes.rows.length === 0) {
      return NextResponse.json({ message: "Data tidak ditemukan" }, { status: 404 });
    }

    // 2. Ambil data Detail (tb_d_planning)
    const detailRes = await poolSecond.query(
      "SELECT * FROM tb_d_planning WHERE kode_planning = $1",
      [kode_planning]
    );

    // 3. Gabungkan dan Format
    const data = {
      ...masterRes.rows[0],
      details: detailRes.rows.map((d: any) => ({
        ...d,
        tgl_planning: d.tgl_planning ? moment(d.tgl_planning).add(7, 'hours').format("DD-MM-YYYY") : null,
      }))
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}