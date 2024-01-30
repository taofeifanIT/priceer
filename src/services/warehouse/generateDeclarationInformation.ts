import { request } from 'umi';

// shipment/getInfoByNS
export type tInfoByNSItems = {
    customsDeclarationQty: any;
    line: number;
    item: string;
    item_type: string;
    description: string;
    coo: string;
    hts: string;// 前端自定义字段
    weight_in_lbs: string;
    qty: number;
    unit_price_usd: number;
    total_amount: string;
    chinese_customs_clearance_name: string;
    g_w_weight: string;
    n_w_weight: string;
    actual_volume_cbm: string;
    needEdit: boolean; // 前端自定义字段
    blankSpaceBehindUnit: string; // 前端自定义字段
    currency: string; // 前端自定义字段
    sharedEqually: boolean; // 前端自定义字段
    sharedEquallyAmount: number; // 前端自定义字段
    shipingFeeInItem: number; // 前端自定义字段
    premiumInItem: number; // 前端自定义字段
    declarationSum: number; // 前端自定义字段
    baseQty: boolean | number; // 前端自定义字段
    baseUnitPriceUsd: number; // 前端自定义字段
    unit: string; //unit
    cn_hs_code: string;
    brand: string;
    ca_hs_code: string;
    us_hs_code: string;
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
    ultimateDestination: string
    countrtOfOrigin: string
    carrier: string
    totalInvoiceValue: number
    totalAmountAll: number
    data: tInfoByNSItems[]
    hsCode: {
        id: number;
        name: string;
        unit: string;
        type: number;

    }[],
    declarationTotal: number; // 前端自定义字段
    printAll: boolean; // 前端自定义字段
    miscellaneousFee: number; // 前端自定义字段  杂费
    ultimateDestinationCn: string; // 前端自定义字段
}


export type UnitItem = {
    id: number;
    name: string;
    unit: string;
    type: number;
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

// warehouse/list_hs_code
export async function list_hs_code(params: any) {
    return request('/api/warehouse/list_hs_code', {
        method: 'POST',
        data: params
    });
}

// warehouse/add_hs_code
export async function add_hs_code(params: {
    name: string;
    unit: string;
}) {
    return request('/api/warehouse/add_hs_code', {
        method: 'POST',
        data: params
    });
}

// edit_hs_code
export async function edit_hs_code(params: {
    id: number;
    unit: string;
}) {
    return request('/api/warehouse/edit_hs_code', {
        method: 'POST',
        data: params
    });
}

// del_hs_code
export async function del_hs_code(params: {
    id: number;
}) {
    return request('/api/warehouse/del_hs_code', {
        method: 'POST',
        data: params
    });
}

// index/sheet
export async function sheet(params: {
    html: any;
}) {
    return request('/api/warehouse/synthesize', {
        method: 'POST',
        data: params
    });
}