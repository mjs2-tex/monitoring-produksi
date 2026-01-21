import { NextResponse } from "next/server";
import { poolSecond } from "@/lib/db"; // Sesuaikan path ke file pool Anda
import moment from "moment";

export async function GET() {
  try {
    const query = `
      SELECT * FROM tb_m_planning
      ORDER BY tgl_dokumen DESC
    `;

    const result = await poolSecond.query(query);

    // Mapping untuk koreksi waktu +7 jam agar sesuai WIB saat dikirim ke frontend
    const modData = result.rows.map((item: any) => ({
      ...item,
      tgl_planning_awal: item.tgl_planning_awal ? moment(item.tgl_planning_awal).add(7, 'hours').format("DD-MM-YYYY") : null,
      tgl_planning_akhir: item.tgl_planning_akhir ? moment(item.tgl_planning_akhir).add(7, 'hours').format("DD-MM-YYYY") : null,
      tgl_dokumen: item.tgl_dokumen ? moment(item.tgl_dokumen).add(7, 'hours').format("DD-MM-YYYY HH:mm") : null,
    }));

    return NextResponse.json({ data: modData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Ambil satu client dari pool untuk menjalankan transaksi
  const client = await poolSecond.connect();

  try {
    const body = await req.json();
    const { header, details } = body;

    // MULAI TRANSAKSI
    await client.query('BEGIN');

    // 1. Insert ke Master (tb_m_planning)
    const masterQuery = `
      INSERT INTO tb_m_planning (
        kode_planning, tgl_planning_awal, tgl_planning_akhir, 
        jumlah_planning, user_planning, status, tgl_dokumen, tgl_update
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const masterValues = [
      header.kode_planning,
      moment(header.tgl_planning_awal, "YYYY-MM-DD").toDate(),
      moment(header.tgl_planning_akhir, "YYYY-MM-DD").toDate(),
      details.length,
      header.user_planning,
      header.status,
      new Date(), // tgl_dokumen
      new Date()  // tgl_update
    ];

    const masterRes = await client.query(masterQuery, masterValues);

    // 2. Insert ke Detail (tb_d_planning) menggunakan Loop
    // Jika data sangat banyak (ratusan), lebih baik gunakan unnest/multiple insert, 
    // tapi untuk puluhan data, loop ini sudah cukup aman.
    for (const item of details) {
      const detailQuery = `
        INSERT INTO tb_d_planning (
          id, kode_planning, buyer, item, td, batch, 
          qty, warna, proses, roda, berat_kain, ex, tgl_planning, mesin, kode_greige, urutan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
      `;

      const detailValues = [
        item.id_temp, // Anda mengirimkan ID dari frontend
        header.kode_planning,
        item.buyer,
        item.item,
        item.td,
        item.batch,
        item.qty,
        item.warna,
        item.proses,
        item.roda,
        item.berat_kain,
        item.ex,
        moment(item.tgl_planning, "YYYY-MM-DD").toDate(),
        item.mesin,
        item.kode_greige,
        item.urutan
      ];

      await client.query(detailQuery, detailValues);
    }

    // COMMIT TRANSAKSI (Simpan semua jika tidak ada error)
    await client.query('COMMIT');

    return NextResponse.json({
      message: 'Success',
      data: masterRes.rows[0]
    }, { status: 201 });

  } catch (error: any) {
    // ROLLBACK jika terjadi error di tengah jalan (Data batal masuk semua)
    await client.query('ROLLBACK');
    console.error("Database Error:", error.message);

    return NextResponse.json({
      message: "Database Error: " + error.message
    }, { status: 500 });

  } finally {
    // PENTING: Kembalikan koneksi ke pool agar tidak terjadi "too many clients"
    client.release();
  }
}

export async function PUT(req: Request) {
  const client = await poolSecond.connect();

  try {
    const body = await req.json();
    const { header, details } = body;

    // Pastikan kode_planning ada untuk proses update
    if (!header.kode_planning) {
      return NextResponse.json({ message: "Kode Planning tidak ditemukan" }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. UPDATE Master (tb_m_planning)
    const updateMasterQuery = `
      UPDATE tb_m_planning SET 
        tgl_planning_awal = $1, 
        tgl_planning_akhir = $2, 
        jumlah_planning = $3, 
        user_planning = $4, 
        status = $5, 
        tgl_update = $6
      WHERE kode_planning = $7
      RETURNING *;
    `;

    const masterValues = [
      moment(header.tgl_planning_awal, "YYYY-MM-DD").toDate(),
      moment(header.tgl_planning_akhir, "YYYY-MM-DD").toDate(),
      details.length,
      header.user_planning,
      header.status,
      new Date(), // tgl_update selalu diperbarui saat PUT
      header.kode_planning
    ];

    const masterRes = await client.query(updateMasterQuery, masterValues);

    if (masterRes.rowCount === 0) {
        throw new Error("Data master tidak ditemukan di database.");
    }

    // 2. DELETE Detail Lama (tb_d_planning)
    // Kita hapus semua detail berdasarkan kode_planning sebelum insert yang baru
    await client.query('DELETE FROM tb_d_planning WHERE kode_planning = $1', [header.kode_planning]);

    // 3. INSERT Detail Baru (tb_d_planning)
    for (const item of details) {
      const detailQuery = `
        INSERT INTO tb_d_planning (
          id, kode_planning, buyer, item, td, batch, 
          qty, warna, proses, roda, berat_kain, ex, tgl_planning, mesin, kode_greige, urutan
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
      `;

      const detailValues = [
        item.id_temp || item.id, // Gunakan id_temp atau id asli jika sudah ada
        header.kode_planning,
        item.buyer,
        item.item,
        item.td,
        item.batch,
        item.qty,
        item.warna,
        item.proses,
        item.roda,
        item.berat_kain,
        item.ex,
        moment(item.tgl_planning, "YYYY-MM-DD").toDate(),
        item.mesin,
        item.kode_greige,
        item.urutan
      ];

      await client.query(detailQuery, detailValues);
    }

    await client.query('COMMIT');

    return NextResponse.json({
      message: 'Update Success',
      data: masterRes.rows[0]
    }, { status: 200 });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Database Update Error:", error.message);

    return NextResponse.json({
      message: "Database Error: " + error.message
    }, { status: 500 });

  } finally {
    client.release();
  }
}
