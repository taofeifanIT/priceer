import { request } from 'umi';

// odika_sku/sku
export async function sku(params: any) {
    return request('/api/odika_sku/sku', {
        method: 'POST',
        data: params,
    });
}