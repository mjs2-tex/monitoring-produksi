import { poolSecond } from '@/lib/db';
import { NextResponse } from 'next/server';
import moment from 'moment';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  // Ambil parameter dari URL
  const type = searchParams.get('type'); // DYEING / INSPECT
  const dateParam = searchParams.get('date') || moment().format('YYYY-MM-DD');

  const client = await poolSecond.connect();

  try {
    // Query Dasar: Kita JOIN Master dan Detail
    // Kita cari yang kode_planning-nya mengandung kata (DYEING/INSPECT) 
    // DAN tgl_planning di tabel DETAIL sesuai tanggal yang dicari
    
    let query = `
      SELECT 
        m.kode_planning,
        m.tgl_planning_awal,
        m.tgl_planning_akhir,
        m.user_planning,
        m.status,
        d.id as id_detail,
        d.buyer,
        d.item,
        d.batch,
        d.qty,
        d.warna,
        d.tgl_planning as tgl_item,
        d.mesin,
        d.urutan
      FROM tb_m_planning m
      JOIN tb_d_planning d ON m.kode_planning = d.kode_planning
      WHERE d.tgl_planning = $1
    `;

    const values: any[] = [dateParam];

    // Jika ada filter TYPE (DYEING/INSPECT), tambahkan kondisi LIKE
    if (type) {
      values.push(`%${type}%`);
      query += ` AND m.kode_planning LIKE $${values.length}`;
    }

    query += ` ORDER BY m.kode_planning ASC, d.mesin ASC, d.urutan ASC`;

    const result = await client.query(query, values);

    return NextResponse.json({
      status: 200,
      message: `Data planning ${type || ''} tanggal ${dateParam}`,
      count: result.rowCount,
      data: result.rows
    });

  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}