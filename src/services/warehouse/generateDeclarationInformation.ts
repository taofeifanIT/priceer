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
    chinese_customs_clearance_name: string;
    g_w_weight: string;
    n_w_weight: string;
    actual_volume_cbm: string;
    needEdit: boolean; // 前端自定义字段
    cn_hs_code: string;
}

export type paramType = {
    invoiceNumber: string
    templateNumber: number
    soNumber: string
    numberOfCases: string
    deliveryNumbers: string
    shippingFee: string
    premium: number
    soldFor: string
    gwWeightSum: number
    nwWeightSum: number
    data: tInfoByNSItems[]
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