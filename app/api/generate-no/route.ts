import { NextResponse } from "next/server";
import { poolSecond } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // 1. Ambil parameter category dari Query String (misal: ?category=INSPECT)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toUpperCase();

    if (!category) {
      return NextResponse.json(
        { error: "Parameter 'category' diperlukan" },
        { status: 400 }
      );
    }

    const prefix = `PLANNING-${category}-`;

    // 2. Query ke database menggunakan pool dari @/lib/db
    // Kita mencari nomor terakhir yang diawali dengan prefix tersebut
    const query = `
      SELECT kode_planning 
      FROM tb_m_planning 
      WHERE kode_planning LIKE $1 
      ORDER BY kode_planning DESC 
      LIMIT 1
    `;

    const result = await poolSecond.query(query, [`${prefix}%`]);

    let newNumber = 1;

    if (result.rows.length > 0) {
      // 3. Ambil nomor terakhir, pecah berdasarkan '-', ambil bagian terakhir (angka)
      const lastNo = result.rows[0].kode_planning;
      const parts = lastNo.split("-");
      const lastSeq = parts[parts.length - 1]; // Mengambil bagian '0001'
      
      // Tambah 1 dari urutan terakhir
      newNumber = parseInt(lastSeq, 10) + 1;
    }

    // 4. Format menjadi 4 digit (0001, 0002, dst)
    const paddedNumber = newNumber.toString().padStart(4, "0");
    const generatedNo = `${prefix}${paddedNumber}`;

    return NextResponse.json({
      success: true,
      category,
      generatedNo,
    });

  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Gagal membuat nomor otomatis", details: error.message },
      { status: 500 }
    );
  }
}