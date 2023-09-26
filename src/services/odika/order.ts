import { request } from 'umi';

export type OrderListItem = {
    id: number;
    store_name: string;
    amazon_order_id: string;
    order_item_id: string;
    seller_sku: string;
    asin: string;
    order_status: string;
    title: string;
    is_replacement_order: number;
    shipping_tracking_number: string;
    quantity_ordered: number;
    ack_status: string;
    ack_reason: string;
    auto_order: number;
    shipping_address: {
        StateOrRegion: string;
        PostalCode: string;
        City: string;
        CountryCode: string;
        Phone?: string;
        Name?: string;
        AddressLine1?: string;
        AddressLine2?: string;
    };
    carrier: string;
    warehouse_id: number;
    warehouse_order_code: string;
    shipping_fee: number;
    shipping_currency: string;
    shipping_method: string;
    warehouse_code: string;
    warehouse_name: string;
}

// odikaOrder/getList
export async function getList(params: { amazon_order_id?: number, order_item_id?: string, seller_sku?: string, asin?: string, order_status?: number, auto_order?: string }) {
    return request('/api/odikaOrder/getList', {
        method: 'POST',
        data: params,
    });
}