import { request } from 'umi';

// shipment/getInfoByNS
export type tInfoByNSItems = {
    line: number;
    item: string;
    item_type: string;
    description: string;
    coo: string;
    hts: string;
    weight_in_lbs: string;
    qty: number;
    unit_price_usd: number;
    total_amount: string;
}

// shipment/getInfoByNS
export async function getInfoByNS(params?: {
    tranid: string;
}) {
    return request('/api/shipment/getInfoByNS', {
        method: 'POST',
        data: params
    });
}