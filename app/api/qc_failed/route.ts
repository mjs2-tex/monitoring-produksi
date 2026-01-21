export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {pool} from "@/lib/db";
import moment from "moment";

export async function GET(request: Request) {

    try {
        const query = `
      SELECT 
a.no_batch,
c."name" as nama_customer,
e."name" as nama_produk,
b."ref" as no_om,
    b.delivery_time,
    CURRENT_DATE AS tanggal_sekarang,
    -- Menggunakan penulisan simpel untuk selisih hari di Postgres
    (DATE_PART('day', b.delivery_time - CURRENT_TIMESTAMP)) AS sisa_hari
FROM 
    mrp_production AS a
LEFT JOIN 
    sale_order AS b ON a.sale_id = b.id
LEFT JOIN
    res_partner AS c ON a.partner_id = c.id
LEFT JOIN
    product_product AS d ON a.product_id = d.id
LEFT JOIN
    product_template as e ON d.product_tmpl_id = e.id
WHERE 
a."state"  IN('to_colse','done')
AND
    b.delivery_time IS NOT NULL
    -- FILTER DIPERBAIKI:
    -- Cari yang delivery_time-nya antara (Hari ini - 7 hari) sampai (Hari ini + 7 hari)
    AND b.delivery_time BETWEEN (CURRENT_DATE - INTERVAL '120 days') AND (CURRENT_DATE + INTERVAL '7 days')
ORDER BY 
    b.delivery_time ASC
    `;

        const { rows } = await pool.query(query);

        const mod = rows.map((item: any, index: any) => ({
            ...item,
            no_piece: index + 1,
            delivery_time: item.delivery_time ? moment(item.delivery_time, "YYYY-MM-DD").format("DD-MM-YYYY") : null,
        }));

        return NextResponse.json({
            success: true,
            data: mod,
        });
    } catch (error: any) {
        console.error("DB ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    }
}
