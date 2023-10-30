import { request } from 'umi';


export type SecondaryInspectionProductItem = {
    id: number;
    asin_us: string;
    sku: string;
    upc_us: string;
    title: string;
    brand: string;
    length: number;
    width: number;
    height: number;
    currency1: string;
    sales_price_min: string;
    sales_price_type1: string;
    invoice_item_name: string;
    serialized: string;
    asin_ca: string;
    asin_au: string;
    add_id: number;
    cn_hs_code: string;
    cn_tax_rebate_rate: string;
    us_hs_code: string;
    canada_hts_code: string;
    coo: string;
    us_import_tax_rate: string;
    canada_import_tax_rate: string;
    king_of_item: string;
    amazon_us_referral_fee: string;
    amazon_can_referral_fee: string;
    amazon_au_referral_fee: string;
    shipping_risk: string;
    upc_ca: string;
    currency2: string;
    sales_price_max: string;
    sales_price_type2: string;
    fba_us_fulfillment_fee: string;
    fba_can_fulfillment_fee: string;
    fba_au_fulfillment_fee: string;
    amazon_ca_price: string;
    amazon_au_price: string;
    store_id: string;
    nick_name: string;
    tax_schedule: string;
    include_children: string;
    sync_to_channeladvisor: string;
    member1: string;
    member2: string;
    member3: string;
    username: string;
}

// businessUnitData/listProduct
export async function listProduct(params?: any) {
    return request('/api/businessUnitData/listProduct', {
        method: 'POST',
        data: params
    });
}

// businessUnitData/modifyParam
export async function modifyParam(params: {
    id: number,
    name: string,
    value: string
}) {
    return request('/api/businessUnitData/modifyParam', {
        method: 'POST',
        data: params
    });
}