import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { listProduct, modifyParam } from '@/services/businessUnitData/secondaryInspectionProduct'
import type { SecondaryInspectionProductItem } from '@/services/businessUnitData/secondaryInspectionProduct'
import SetValueComponent from '@/components/SetValueComponent';

// id: number;
// asin_us: string;
// sku: string;
// upc_us: string;
// title: string;
// brand: string;
// length: number;
// width: number;
// height: number;
// currency1: string;
// sales_price_min: string;
// sales_price_type1: string;
// invoice_item_name: string;
// serialized: string;
// asin_ca: string;
// asin_au: string;
// add_id: number;
// cn_hs_code: string;
// us_hs_code: string;
// canada_hts_code: string;
// coo: string;
// us_import_tax_rate: string;
// canada_import_tax_rate: string;
// king_of_item: string;
// amazon_us_referral_fee: string;
// amazon_can_referral_fee: string;
// amazon_au_referral_fee: string;
// shipping_risk: string;
// upc_ca: string;
// currency2: string;
// sales_price_max: string;
// sales_price_type2: string;
// fba_us_fulfillment_fee: string;
// fba_can_fulfillment_fee: string;
// fba_au_fulfillment_fee: string;
// amazon_ca_price: string;
// amazon_au_price: string;
// store_id: string;
// nick_name: string;
// tax_schedule: string;
// include_children: string;
// sync_to_channeladvisor: string;
// member1: string;
// member2: string;
// member3: string;
// username: string;
const columns: ProColumns<SecondaryInspectionProductItem>[] = [
    {
        title: 'ITEM NAME/NUMBER',
        dataIndex: 'sku',
        width: 160,
        search: false,
    },
    {
        title: 'Display Name',
        dataIndex: 'sku',
        width: 160,
        search: false,
    },
    // invoice_item_name
    {
        title: 'Invoice Item Name',
        dataIndex: 'invoice_item_name',
        width: 160,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.invoice_item_name}
                api={modifyParam}
                otherParams={{ name: 'invoice_item_name' }}
                refresh={() => action.reload()}
            />
        },
    },
    // SERIALIZED (CUSTOMIZED)
    {
        title: 'Serialized',
        dataIndex: 'serialized',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.serialized}
                api={modifyParam}
                otherParams={{ name: 'serialized' }}
                refresh={() => action.reload()}
            />
        },
    },
    // UPC CODE
    {
        title: 'UPC',
        dataIndex: 'upc_us',
        width: 130,
        ellipsis: true,
        search: false,
    },
    // ASIN US
    {
        title: 'ASIN US',
        dataIndex: 'asin_us',
        width: 120,
        search: false,
    },
    // ASIN AU
    {
        title: 'ASIN AU',
        dataIndex: 'asin_au',
        width: 120,
        search: false,
    },
    // Item PM
    {
        title: 'Item PM',
        dataIndex: 'username',
        width: 100,
        search: false,
    },
    // Purchase Description
    {
        title: 'Purchase Description',
        dataIndex: 'title',
        width: 200,
        ellipsis: true,
        search: false,
    },
    {
        title: 'Brand',
        dataIndex: 'brand',
        width: 130,
        ellipsis: true,
        search: false,
    },
    // Cn HS code
    {
        title: 'CN HS Code',
        dataIndex: 'cn_hs_code',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.cn_hs_code}
                api={modifyParam}
                otherParams={{ name: 'cn_hs_code' }}
                refresh={() => action.reload()}
            />
        },
    },
    // CNTax rebate rate
    {
        title: 'CN Tax Rebate Rate',
        dataIndex: 'cn_tax_rebate_rate',
        width: 150,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.cn_tax_rebate_rate}
                api={modifyParam}
                otherParams={{ name: 'cn_tax_rebate_rate' }}
                refresh={() => action.reload()}
            />
        }
    },
    // US HS Code{
    {
        title: 'US HS Code',
        dataIndex: 'us_hs_code',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.us_hs_code}
                api={modifyParam}
                otherParams={{ name: 'us_hs_code' }}
                refresh={() => action.reload()}
            />
        }
    },
    // CANADA HTS CODE
    {
        title: 'Canada HTS Code',
        dataIndex: 'canada_hts_code',
        width: 140,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.canada_hts_code}
                api={modifyParam}
                otherParams={{ name: 'canada_hts_code' }}
                refresh={() => action.reload()}
            />
        }
    },
    // COO
    {
        title: 'COO',
        dataIndex: 'coo',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.coo}
                api={modifyParam}
                otherParams={{ name: 'coo' }}
                refresh={() => action.reload()}
            />
        }
    },
    // US import tax rate
    {
        title: 'US Import Tax Rate',
        dataIndex: 'us_import_tax_rate',
        width: 150,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.us_import_tax_rate}
                api={modifyParam}
                otherParams={{ name: 'us_import_tax_rate' }}
                refresh={() => action.reload()}
            />
        },
    },
    // CANADA import tax rate
    {
        title: 'Canada Import Tax Rate',
        dataIndex: 'canada_import_tax_rate',
        width: 175,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.canada_import_tax_rate}
                api={modifyParam}
                otherParams={{ name: 'canada_import_tax_rate' }}
                refresh={() => action.reload()}
            />
        },
    },
    // Kind of item
    {
        title: 'Kind of Item',
        dataIndex: 'king_of_item',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.king_of_item}
                api={modifyParam}
                otherParams={{ name: 'king_of_item' }}
                refresh={() => action.reload()}
            />
        }
    },
    // AMAZON US Referral Fee
    {
        title: 'Amazon US Referral Fee',
        dataIndex: 'amazon_us_referral_fee',
        width: 180,
        search: false,
    },
    // AMAZON CAN Referral Fee
    {
        title: 'Amazon CAN Referral Fee',
        dataIndex: 'amazon_can_referral_fee',
        width: 190,
        search: false,
    },
    // AMAZON AU Referral Fee
    {
        title: 'Amazon AU Referral Fee',
        dataIndex: 'amazon_au_referral_fee',
        width: 180,
        search: false,
    },
    // SHIPPING RISK
    {
        title: 'Shipping Risk',
        dataIndex: 'shipping_risk',
        width: 120,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.shipping_risk}
                api={modifyParam}
                otherParams={{ name: 'shipping_risk' }}
                refresh={() => action.reload()}
            />
        }
    },
    // UPC - CA
    {
        title: 'UPC - CA',
        dataIndex: 'upc_ca',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.upc_ca}
                api={modifyParam}
                otherParams={{ name: 'upc_ca' }}
                refresh={() => action.reload()}
            />
        }
    },
    // Title
    {
        title: 'Title',
        dataIndex: 'title',
        width: 200,
        ellipsis: true,
        search: false,
    },
    // Description -CA
    {
        title: 'Description - CA',
        dataIndex: 'title',
        width: 200,
        ellipsis: true,
        search: false,
    },
    // Height
    {
        title: 'Height',
        dataIndex: 'height',
        width: 100,
        search: false,
    },
    {
        title: 'Width',
        dataIndex: 'width',
        width: 100,
        search: false,
    },
    {
        title: 'Length',
        dataIndex: 'length',
        width: 100,
        search: false,
    },
    {
        title: 'Currency',
        dataIndex: 'currency1',
        width: 100,
        search: false,
    },
    // Price1
    {
        title: 'Price1',
        dataIndex: 'sales_price_min',
        width: 100,
        search: false,
    },
    // Price level 1
    {
        title: 'Price level 1',
        dataIndex: 'sales_price_type1',
        width: 120,
        search: false,
    },
    // Currency2
    {
        title: 'Currency2',
        dataIndex: 'currency2',
        width: 100,
        search: false,
    },
    // Price2
    {
        title: 'Price2',
        dataIndex: 'sales_price_max',
        width: 100,
        search: false,
    },
    // Price level2
    {
        title: 'Price level2',
        dataIndex: 'sales_price_type2',
        width: 120,
        search: false,
    },
    // FBA US Fulfillment Fee
    {
        title: 'FBA US Fulfillment Fee',
        dataIndex: 'fba_us_fulfillment_fee',
        width: 180,
        search: false,
    },
    // FBA CAN Fulfillment Fee
    {
        title: 'FBA CAN Fulfillment Fee',
        dataIndex: 'fba_can_fulfillment_fee',
        width: 180,
        search: false,
    },
    // FBA AU Fulfillment Fee
    {
        title: 'FBA AU Fulfillment Fee',
        dataIndex: 'fba_au_fulfillment_fee',
        width: 180,
        search: false,
    },
    // AMAZON CA PRICE
    {
        title: 'Amazon CA Price',
        dataIndex: 'amazon_ca_price',
        width: 130,
        search: false,
    },
    // AMAZON AU PRICE
    {
        title: 'Amazon AU Price',
        dataIndex: 'amazon_au_price',
        width: 135,
        search: false,
    },
    // STORE APPROVED TO SELL
    {
        title: 'Store Approved to Sell',
        dataIndex: 'store_id',
        width: 170,
        search: false,
    },
    // CI Brand
    {
        title: 'CI Brand',
        dataIndex: 'brand',
        width: 130,
        ellipsis: true,
        search: false,
    },
    // TAX SCHEDULE
    {
        title: 'Tax Schedule',
        dataIndex: 'tax_schedule',
        width: 120,
        search: false,
    },
    // INCLUDE CHILDREN
    {
        title: 'Include Children',
        dataIndex: 'include_children',
        width: 140,
        search: false,
    },
    // SYNC TO CHANNELADVISOR
    {
        title: 'Sync to ChannelAdvisor',
        dataIndex: 'sync_to_channeladvisor',
        width: 180,
        search: false,
    },
    {
        title: 'Member1',
        dataIndex: 'member1',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.member1}
                api={modifyParam}
                otherParams={{ name: 'member1' }}
                refresh={() => action.reload()}
            />
        }
    },
    {
        title: 'Member2',
        dataIndex: 'member2',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.member2}
                api={modifyParam}
                otherParams={{ name: 'member2' }}
                refresh={() => action.reload()}
            />
        }
    },
    {
        title: 'Member3',
        dataIndex: 'member3',
        width: 100,
        search: false,
        render(_, entity, __, action) {
            return <SetValueComponent
                id={entity.id}
                editKey='value'
                value={entity.member3}
                api={modifyParam}
                otherParams={{ name: 'member3' }}
                refresh={() => action.reload()}
            />
        }
    },
];
export default () => {
    const actionRef = useRef<ActionType>();

    return (
        <ProTable<SecondaryInspectionProductItem>
            size='small'
            columns={columns}
            actionRef={actionRef}
            // headerTitle={`The Current Dollar Rate is ${USDRate}`}
            cardBordered
            request={async (params = {}, sort, filter) => {
                const tempParams = { ...params, ...filter, len: params.pageSize, page: params.current }
                const res = await listProduct(tempParams)
                const { data, code } = res
                return {
                    data: data.data,
                    success: !!code,
                    total: data.total,
                }
            }}
            editable={{
                type: 'multiple',
            }}
            scroll={{ y: document.body.clientHeight - 260, x: columns.reduce((total: any, item) => total + (item.width || 0), 0) }}
            rowKey="id"
            // search={{
            //     labelWidth: 'auto',
            // }}
            search={false}
            form={{
                // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
                syncToUrl: (values, type) => {
                    if (type === 'get') {
                        return {
                            ...values,
                            created_at: [values.startTime, values.endTime],
                        };
                    }
                    return values;
                },
            }}
            pagination={{
                pageSize: 30,
                showQuickJumper: true,
                pageSizeOptions: ['30', '50', '100', '200', '300', '500'],
                // onChange: (page) => console.log(page),
            }}
            revalidateOnFocus={false}
            dateFormatter="string"
        />
    );
};