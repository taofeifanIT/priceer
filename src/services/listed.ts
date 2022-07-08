import { request } from 'umi';



export type listingItem = {
    page: number;
    len: number;
}


export async function listing(params: listingItem) {
    return request('/api/listing/index', {
        method: 'POST',
        data: params
    });
}