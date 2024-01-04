import { request } from 'umi';


export type NewProductsItem = {
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
    comments: string;
    exchange_rate: number; // 前端新增字段
    first_status: number;
    second_status: number;
    first_memo: string;
    second_memo: string;
    created_at: string;
    upc: string;
    title: string;
    length: number;
    width: number;
    height: number;
    fullfill_cost: number;
    store_id: number;
    invoice_item_name: string;
    is_consistent: number; // 1: 一致 2: 不一致
    purchase_quantity: number;
    ekko: string;
}

// businessUnitData/getNewProduct
export async function getNewProduct(params?: any) {
    return request('/api/businessUnitData/getNewProduct', {
        method: 'POST',
        data: params
    });
}


// businessUnitData/addProductByFile
export function addProductByFile() {
    return `${API_URL}/businessUnitData/addProductByFile`
}


// businessUnitData/editMemoForNew
export async function editMemoForNew(params: { id: number, memo: string }) {
    return request('/api/businessUnitData/editMemoForNew', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/updatePurchasePriceForNew
export async function updatePurchasePriceForNew(params: {
    id: number,
    purchase_price: number
}) {
    return request('/api/businessUnitData/updatePurchasePriceForNew', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/addProduct
export async function addProduct(params?: { asin: string }) {
    return request('/api/businessUnitData/addProduct', {
        method: 'POST',
        data: params
    });
}
// businessUnitData/updateTaxForNew
export async function updateTaxForNew(params: { id: number, tax: number }) {
    return request('/api/businessUnitData/updateTaxForNew', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/getBrandForNew
export async function getBrandForNew() {
    return request('/api/businessUnitData/getBrandForNew', {
        method: 'POST',
    });
}

// businessUnitData/pmSelfCheck
export async function pmSelfCheck(params: { id: number, status: number }) {
    return request('/api/businessUnitData/pmSelfCheck', {
        method: 'POST',
        data: params
    });
}

// updateSalesPriceForNew
export async function updateSalesPriceForNew(params: { id: number, sales_price: number }) {
    return request('/api/businessUnitData/updateSalesPriceForNew', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/editStore
export async function editStore(params: { id: number, store_id: string }) {
    return request('/api/businessUnitData/editStore', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/editPurchaseQuantity
export async function editPurchaseQuantity(params: { id: number, purchase_unit: number }) {
    return request('/api/businessUnitData/editPurchaseQuantity', {
        method: 'POST',
        data: params
    });
}

// editInvoiceItemName
export async function editInvoiceItemName(params: { id: number, invoice_item_name: string }) {
    return request('/api/businessUnitData/editInvoiceItemName', {
        method: 'POST',
        data: params
    });
}

// updateSkuForNew
export async function updateSkuForNew(params: { id: number, sku: string }) {
    return request('/api/businessUnitData/updateSkuForNew', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/modifyCompany
export async function modifyCompany(params: { id: number, ekko: string }) {
    return request('/api/businessUnitData/modifyCompany', {
        method: 'POST',
        data: params
    });
}