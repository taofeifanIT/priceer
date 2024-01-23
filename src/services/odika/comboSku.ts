import { request } from 'umi';

type ComboSkuListResponse = {
    code: number;
    msg: string;
    data: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        data: ComboSkuItem[];
    }
}

export type ComboSkuItemItem = {
    id: number;
    sku: string;
    land_price: string;
    quantity: string;
}

export type ComboSkuItem = {
    id: number;
    seller_sku: string;
    price: string;
    create_name: string;
    items: ComboSkuItemItem[];
};

// odika_sku/combo_sku_list   设置响应的数据类型 为 ComboSkuListResponse
export async function combo_sku_list(params?: any): Promise<ComboSkuListResponse> {
    return request('/api/odika_sku/combo_sku_list', {
        method: 'POST',
        data: params
    });
}

// odika_sku/combo_sku_add
export async function combo_sku_add(params: any) {
    return request('/api/odika_sku/combo_sku_add', {
        method: 'POST',
        data: params
    });
}

// odika_sku/combo_sku_del
export async function combo_sku_del(params: {
    id: number;
}) {
    return request('/api/odika_sku/combo_sku_del', {
        method: 'POST',
        data: params
    });
}