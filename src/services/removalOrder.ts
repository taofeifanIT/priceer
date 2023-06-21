import { request } from 'umi';

export type listingItem = {
    page: number;
    len: number;
}

export type checkItems = {
    content: {
        id: number;
        uuid: string;
        match: string;
        claim: string;
        condition: string;
        images: any[];
    }[];
}

export type addClaimNumberParams = {
    id: number;
    claim_number: string;
}

export type TableListItem = {
    store_name: string;
    shipment_date_timestamp: number;
    order_id: string;
    msku: string;
    request_date_timestamp: number;
    tracking_number: string;
    carrier: string;
    tracking_last_status: string;
    shipped_quantity: number;
    shipment_status: string;
    match: string;
    progress: number;
    sku_total: number;
    tracking_status: string;
    po: string;
    po_id: number;
}

export type ShipmentDetailsItem = {
    id: number;
    uuid: string;
    msku: string;
    fnsku: string;
    shipped_quantity: number;
    sku_icon: string;
    sku_image: string;
    match: string; // 前端自定义字段
    claim: string; // 前端自定义字段
    condition: string; // 前端自定义字段
    claimData: any[]; // 前端自定义字段
    conditionData: any[]; // 前端自定义字段
    images: { thumb_name: string, file_name: string }[];
    bar_code: string;
    memo_images: string;
}

export type actionItems = {
    callback: (params?: any) => void;
}

export async function getList(params: listingItem) {
    return request('/api/removalOrder/getList', {
        method: 'post',
        data: params
    });
}

export async function getShipmentList(params: listingItem) {
    return request('/api/removalOrder/getShipmentList', {
        method: 'post',
        data: params
    });
}

export async function checkShipment(params: checkItems) {
    return request('/api/removalOrder/checkShipment', {
        method: 'POST',
        data: params
    });
}

export async function addClaimNumber(params: addClaimNumberParams) {
    return request('/api/removalOrder/addClaimNumber', {
        method: 'POST',
        data: params
    });
}

export async function getShipmentDetails(params: { tracking_number: string }) {
    return request('/api/removalOrder/getShipmentDetails', {
        method: 'POST',
        data: params
    });
}
// getClaimList
export async function getClaimList(params: listingItem) {
    return request('/api/removalOrder/getClaimList', {
        method: 'POST',
        data: params
    });
}

// addReimbursement
export async function addReimbursement(params: { id: number, reimburse_number: string, reimburse_money: number }) {
    return request('/api/removalOrder/addReimbursement', {
        method: 'POST',
        data: params
    });
}

// downloadInfo
export function downloadInfo(id: number) {
    return `http://api-rp.itmars.net/removalOrder/downloadInfo?id=${id}`
}

// addReimburseMoney
export async function addReimburseMoney(params: { id: number, reimburse_money: number }) {
    return request('/api/removalOrder/addReimburseMoney', {
        method: 'POST',
        data: params
    });
}

// addReimburseNumber
export async function addReimburseNumber(params: { id: number, reimburse_number: string }) {
    return request('/api/removalOrder/addReimburseNumber', {
        method: 'POST',
        data: params
    });
}

// /removalOrder/editMemo
export async function editMemo(params: { id: number, memo: string }) {
    return request('/api/removalOrder/editMemo', {
        method: 'POST',
        data: params
    });
}

// /removalOrder/saveMemoImages
export async function saveMemoImages(params: { id: number, images: string[] }) {
    return request('/api/removalOrder/saveMemoImages', {
        method: 'POST',
        data: params
    });
}

// /removalOrder/finishFail
export async function finishFail(params: { id: number }) {
    return request('/api/removalOrder/finishFail', {
        method: 'POST',
        data: params
    });
}