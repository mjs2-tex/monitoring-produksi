export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {

    try {
        const query = `
select a.no_batch, a.name, a.td_id, b."name" as no_td, a.batch_type, c."ref" as no_om, d."name" as nama_customer, f."name" as nama_produk, g."name" as warna_name, i.default_code as kode_greige, k."name" as nama_proses, (SELECT berat_xwr 
 FROM stock_picking 
 WHERE origin LIKE a.name || ' OBAT DYE%') AS berat_roda, a.qty_yard_kp as qty_yard
from mrp_production a 
LEFT JOIN
test_development as b on a.td_id = b.id
left JOIN
sale_order as c on a.sale_id = c."id"
LEFT JOIN
    res_partner AS d ON a.partner_id = d.id
LEFT JOIN
    product_product AS e ON a.product_id = e.id
LEFT JOIN
    product_template as f ON e.product_tmpl_id = f.id
LEFT JOIN
    product_attribute_value as g ON a.color_id = g.id
left join
    product_product as h on a.greige_id = h."id"
left JOIN 
    product_template as i on h.product_tmpl_id = i."id"
left JOIN
    master_opc as j on a.process_type = j.id
left join 
    opc as k on j.opc_id = k.id

WHERE a."state" IN ('pending', 'ready', 'progress') and a.type_id = 2
    `;

        const { rows } = await pool.query(query);



        return NextResponse.json({
            success: true,
            data: rows,
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
