import { request } from 'umi';

// businessUnitData/getList
export async function getBusinessUnitDataList(params?: { sku: string }) {
    return request('/api/businessUnitData/getList', {
        method: 'POST',
        data: params
    });
}