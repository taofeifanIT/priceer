import { request } from 'umi';

/** pre_listing */
export async function list(params: {
    len: number;
    page: number;
    vendor_sku: string;
    availability?: number;
    brand?: string;
    vpn?: string;
    newegg_id?: string;
    is_delete?: number;
}) {
    return request('/api/pre_listing/index', {
        method: 'POST',
        data: params
    });
}

export type addItems = {
    vendor_sku: string;
    vendor_price: number;
    availability: number;
    brand?: string;
    vpn?: string;
    asin?: string;
    newegg_id?: string;
}

export type editItems = {
    id: number;
    vendor_sku: string;
    vendor_price: number;
    availability: number;
    brand?: string;
    vpn?: string;
    asin?: string;
    newegg_id?: string;
}

export type listingItem = {
    ids: string;
    store_ids: number;
}

export async function add(params: addItems) {
    return request('/api/pre_listing/add', {
        method: 'POST',
        data: params
    });
}

export async function edit(params: addItems) {
    return request('/api/pre_listing/edit', {
        method: 'POST',
        data: params
    });
}

export async function del(id: number) {
    return request('/api/pre_listing/del', {
        method: 'POST',
        data: { id }
    });
}

export async function listing(params: listingItem) {
    return request('/api/pre_listing/listing', {
        method: 'POST',
        data: params
    });
}