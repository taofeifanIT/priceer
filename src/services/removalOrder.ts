import { request } from 'umi';

export type listingItem = {
    page: number;
    len: number;
}

export type checkItems = {
    id: number;
    shipment_tatus: string;
    memo?: string;
    images?: string;
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

export async function addClaimNumber(params: checkItems) {
    return request('/api/removalOrder/addClaimNumber', {
        method: 'POST',
        data: params
    });
}