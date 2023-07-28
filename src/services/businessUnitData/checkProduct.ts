import { request } from 'umi';

export type CheckProductItem = {
    id: number;
    asin: string;
    us_import_tax: number;
    brand: string;
    sku: string;
    sales_price: number;
    platform_fee: number;
    ship_fee: number;
    purchase_price: number;
    margin_rate: number;
    unit_price: number;
    bsr: string[];
    status: number;
    username: string;
    first_status: number; // pm审核的
    first_memo: string;
    second_status: number; // mellon审核的
    second_memo: string;
}

// businessUnitData/getCheckList
export async function getCheckList(params?: any) {
    return request('/api/businessUnitData/getCheckList', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/updateStatus
export async function updateStatus(params?: any) {
    return request('/api/businessUnitData/updateStatus', {
        method: 'POST',
        data: params
    });
}