import { request } from 'umi';

export type SkuListItem = {
    id: number;
    seller_sku: string;
    internal_id: number;
    asin: string;
    sku: string;
    warehouse: {
        name: string;
        pl_sku: string;
        quantity: number;
        quantity_shipped: number;
    }[];
}


// odika_sku/list
export async function list(params: any) {
    return request('/api/odika_sku/list', {
        method: 'POST',
        data: params,
    });
}


// odika_sku/match_list
export async function match_list() {
    return request('/api/odika_sku/match_list', {
        method: 'POST',
    });
}

// odika_sku/edit
export async function edit(params: {
    internal_id: string,
    sku: string,
    seller_sku: string,
}) {
    return request('/api/odika_sku/edit', {
        method: 'POST',
        data: params,
    });
}

// /timer/getListingByAmazon?store=21
export async function getListingByAmazon() {
    return request('/api/timer/getListingByAmazon?store=21', {
        method: 'GET',
    });
}