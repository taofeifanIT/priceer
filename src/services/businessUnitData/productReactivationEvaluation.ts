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
    us_tax_rate: string;
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
    sales_price: string;
    platform_fee: string;
    ship_fee: string;
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
    memo: string;
    unitCost: number; // 前端新增字段
    person_sales_price: string;
    sales_target: number;
    status: number;
    tax_rate: string;
    us_sales_target_modify_time: string;
    is_timeout: number;
    reason: string;
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

export function batchEdit() {
    return `${API_URL}/businessUnitData/batchEdit`
}

// downloadTemplate
export function downloadTemplate() {
    return `${API_URL}/example/business.xlsx`
}

// updatePurchasePrice
export async function updateSalesPrice(params: { id: number, sales_price: number }) {
    return request('/api/businessUnitData/updateSalesPrice', {
        method: 'POST',
        data: params
    });
}

// updateSalesTarget
export async function updateSalesTarget(params: { id: number, sales_target: number }) {
    return request('/api/businessUnitData/updateSalesTarget', {
        method: 'POST',
        data: params
    });

}

// updateState
export async function updateState(params: { id: number, status: number }) {
    return request('/api/businessUnitData/updateState', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/updateTax
export async function updateTax(params: { id: number, tax: number }) {
    return request('/api/businessUnitData/updateTax', {
        method: 'POST',
        data: params
    });
}