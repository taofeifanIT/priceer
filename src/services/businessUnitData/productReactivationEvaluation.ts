import { request } from 'umi';

export type ResaleListItem = {
    id: number;
    internal_id: number;
    asin: string;
    sku: string;
    brand: string;
    category: string;
    cn_hs_code: string;
    us_hs_code: string;
    us_tax_rate: number;
    ca_tax_rate: number;
    jp_tax_rate: number;
    uk_tax_rate: number;
    us_sales_target: string;
    ca_sales_target: string;
    jp_sales_target: string;
    uk_sales_target: string;
    eu_sales_target: string;
    au_sales_target: string;
    walmart_us_sales_target: string;
    store_risk: string;
    shipping_risk: string;
    last_purchase_price: number;
    sales_price: number;
    platform_fee: number;
    ship_fee: number;
    height: number;
    length: number;
    width: number;
    weight: number;
    updated_at: number;
    ship_rate: number;
    margin_rate: number;
    purchase_price: number;
    unit_price: number;
    username: string;
    exchange_rate: number;
    unitCost: number // 前端新增字段
}

export async function getResaleList(params?: any) {
    return request('/api/businessUnitData/getResaleList', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/updatePurchasePrice
export async function updatePurchasePrice(params?: any) {
    return request('/api/businessUnitData/updatePurchasePrice', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/editMemo
export async function editMemo(params: { id: number, memo: string }) {
    return request('/api/businessUnitData/editMemo', {
        method: 'POST',
        data: params
    });
}