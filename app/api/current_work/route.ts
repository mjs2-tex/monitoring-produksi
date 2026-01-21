export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {pool} from "@/lib/db";
import moment from "moment";

export async function GET(request: Request) {

    try {
        const query = `
     

SELECT b.date_start + INTERVAL '7 hours' AS date_start, 
       b.date_finished + INTERVAL '7 hours' AS date_finished, 
       lcf.code AS warna_code, pav.name AS warna_name, 
       mm.number AS mesin_no, mm.name AS mesin, c.name AS wc, 
       b.*, b.state, a.id AS production_id, d.id AS product_id, 
       e.uom_id AS uom_id, uom.name AS uom_name, md.name AS design, 
       sol.color_no, sol.name AS sol_name, sc.name AS no_sc, 
       so.name AS no_so, a.id AS id_mo, b.id, b.next_work_order_id, 
       a.name, a.no_batch, e.name AS nama_produk, a.product_qty, 
       c.name AS workcenter_on_ready, b.name AS no_urutan, part."name" as nama_customer
FROM mrp_production a 
LEFT JOIN mrp_workorder b ON a.id = b.production_id 
LEFT JOIN mrp_workcenter c ON b.workcenter_id = c.id 
LEFT JOIN product_product d ON a.product_id = d.id 
LEFT JOIN product_template e ON d.product_tmpl_id = e.id 
LEFT JOIN sale_order so ON a.sale_id = so.id 
LEFT JOIN sale_contract sc ON so.contract_id = sc.id 
LEFT JOIN sale_order_line sol ON a.sale_line_id = sol.id 
LEFT JOIN master_design md ON so.design_id = md.id 
LEFT JOIN mrp_machine mm ON b.mesin_id = mm.id 
LEFT JOIN mrp_bom mb ON a.bom_id = mb.id 
LEFT JOIN labdip_color_final lcf ON mb.color_final_id = lcf.id 
LEFT JOIN product_attribute_value pav ON a.color_id = pav.id 
LEFT JOIN uom_uom uom ON e.uom_id = uom.id 
LEFT JOIN
    res_partner AS part ON so.partner_id = part.id
WHERE a.name <> '' 

  AND 
    (b.date_start AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') >= CURRENT_DATE - INTERVAL '1 day'
    AND 
    (b.date_start AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') < CURRENT_DATE + INTERVAL '1 day'

  AND b."state" = 'progress'
 ORDER BY mm.number, b.date_start, b."state"   


    `;

        const { rows } = await pool.query(query);

        const mod = rows.map((item: any) => ({
    ...item,
    date_start: item.date_start 
        ? moment(item.date_start).add(7, 'hours').format("DD-MM-YYYY HH:mm") 
        : null,
    date_finished: item.date_finished 
        ? moment(item.date_finished).add(7, 'hours').format("DD-MM-YYYY HH:mm") 
        : null,
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
