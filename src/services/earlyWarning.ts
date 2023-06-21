import { request } from 'umi';

export type SalesTargetItem = {
    store_id: number;
    asin: string;
    sku: string;
    us_sales_target: string;
    ca_sales_target: string;
    jp_sales_target: string;
    uk_sales_target: string;
    eu_sales_target: string;
    au_sales_target: string;
    walmart_us_sales_target: string;
    is_alarm: number;
    daily_sales: number;
    weekly_sales: number;
    inventory: number;
    salesTarget: number; // 前端计算的销售目标
    dailyOverValue: number; // 前端计算的日均销量
    daily_sales_country: {
        country_id: number;
        number: number;
    }[];
    weekly_sales_country: {
        country_id: number;
        number: number;
    }[];
    inventory_country: {
        country_id: number;
        number: number;
    }[];
}

// salesTarget/getList
export type SalesTargetListParams = {
    start_time: string;
    end_time: string;
}
export async function getSalesTargetList(params?: SalesTargetListParams) {
    return request('/api/salesTarget/getList', {
        method: 'POST',
        data: params
    });
}