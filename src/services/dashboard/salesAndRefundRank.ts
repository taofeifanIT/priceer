import { request } from 'umi';

// dashboard/getSalesAndRefundRank
export async function getSalesAndRefundRank(params: { store_id: number, start_date?: string, end_date?: string }) {
    return request('/api/dashboard/getSalesAndRefundRank', {
        method: 'POST',
        data: params,
    });
}