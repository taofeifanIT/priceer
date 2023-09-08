import { request } from 'umi';
// removalOrder/dashboard

export async function removalOrderDashboard() {
    return request('/api/removalOrder/dashboard', {
        method: 'POST'
    });
}

// removalOrder/nextWeekPredict
export async function removalOrderNextWeekPredict(data?: { store_id?: number[] }) {
    return request('/api/removalOrder/nextWeekPredict', {
        method: 'POST',
        data
    });
}


// removalOrder/getROInfo
export async function removalOrderGetROInfo(data?: { store_id?: number[], start_date?: string, end_date?: string }) {
    return request('/api/removalOrder/getROInfo', {
        method: 'POST',
        data
    });
}

// removalOrder/getWarehouseInfo
export async function removalOrderGetWarehouseInfo(data?: { store_id?: number[], start_date?: string, end_date?: string, type: number }) {
    return request('/api/removalOrder/getWarehouseInfo', {
        method: 'POST',
        data
    });
}

// removalOrder/getClaimInfo
export async function removalOrderGetClaimInfo(data?: { store_id?: number[], start_date?: string, end_date?: string }) {
    return request('/api/removalOrder/getClaimInfo', {
        method: 'POST',
        data
    });
}

// removalOrder/notReceived
export async function removalOrderNotReceived(data?: { type: 1 | 2 | 3 }) {
    return request('/api/removalOrder/notReceived', {
        method: 'POST',
        data
    });
}