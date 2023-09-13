import { request } from 'umi';

// dashboard/getSalesAndRefundRank
export async function getSalesAndRefundRank() {
    return request('/api/dashboard/getSalesAndRefundRank', {
        method: 'POST'
    });
}