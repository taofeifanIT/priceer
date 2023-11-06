import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { listProduct, modifyParam, getCategoryAndRisk } from '@/services/businessUnitData/secondaryInspectionProduct'
import type { SecondaryInspectionProductItem } from '@/services/businessUnitData/secondaryInspectionProduct'
import SetValueComponent from '@/components/SetValueComponent';
import { Table, Space } from 'antd';
import { exportExcelFile } from '@/utils/excelHelper';
import { useModel } from 'umi';

export default () => {
    const { initialState } = useModel('@@initialState');
    const { configInfo } = initialState || {}
    const actionRef = useRef<ActionType>();
    const [kindOfItemAndShipingRisk, setKindOfItemAndShipingRisk] = useState<{
        kindOfItem: string[],
        shipingRish: string[],
        pm: {
            id: number,
            username: string
        }[]

    }>({
        kindOfItem: [],
        shipingRish: [],
        pm: []
    })
    const [selectedRows, setSelectedRows] = useState<SecondaryInspectionProductItem[]>([]); // 选中的行
    const getKindOfItemAndShipingRisk = async () => {
        if (kindOfItemAndShipingRisk.kindOfItem.length) return
        const res = await getCategoryAndRisk()
        const { data, code } = res
        if (code) {
            setKindOfItemAndShipingRisk({
                kindOfItem: data.category,
                shipingRish: data.risk,
                pm: data.pm
            })
        }
    }
    const columns: ProColumns<SecondaryInspectionProductItem>[] = [
        {
            title: 'ITEM NAME/NUMBER',
            dataIndex: 'sku',
            key: 'sku',
            width: 160,
            fixed: 'left',
            ellipsis: true,
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
            key: 'invoice_item_name',
            width: 160,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    value={entity.invoice_item_name}
                    api={modifyParam}
                    otherParams={{ name: 'invoice_item_name' }}
                    refresh={() => action?.reload()}
                />
            },
        },
        // SERIALIZED (CUSTOMIZED)
        {
            title: 'Serialized',
            dataIndex: 'serialized',
            key: 'serialized',
            width: 100,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    style={{ width: '70px' }}
                    type='select'
                    id={entity.id}
                    editKey='value'
                    value={entity.serialized}
                    options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]}
                    api={modifyParam}
                    otherParams={{ name: 'serialized' }}
                    refresh={() => action?.reload()}
                />
            },
        },
        // UPC CODE
        {
            title: 'UPC',
            dataIndex: 'upc_us',
            key: 'upc_us',
            width: 130,
            ellipsis: true,
            search: false,
        },
        // ASIN US
        {
            title: 'ASIN US',
            dataIndex: 'asin_us',
            key: 'asin_us',
            width: 120,
            search: false,
        },
        // ASIN AU
        {
            title: 'ASIN AU',
            dataIndex: 'asin_au',
            key: 'asin_au',
            width: 120,
            search: false,
        },
        // Item PM
        {
            title: 'Item PM',
            dataIndex: 'username',
            key: 'username',
            width: 130,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    type='select'
                    style={{ width: '100px' }}
                    options={kindOfItemAndShipingRisk.pm.map((item: any) => ({ label: item.username, value: item.id }))}
                    value={entity.add_id}
                    api={modifyParam}
                    otherParams={{ name: 'add_id' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // Purchase Description
        {
            title: 'Purchase Description',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
            search: false,
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            width: 130,
            ellipsis: true,
            search: false,
        },
        // Cn HS code
        {
            title: 'CN HS Code',
            dataIndex: 'cn_hs_code',
            key: 'cn_hs_code',
            width: 100,
            search: false
        },
        // CNTax rebate rate
        {
            title: 'CN Tax Rebate Rate',
            dataIndex: 'cn_tax_rebate_rate',
            key: 'cn_tax_rebate_rate',
            width: 150,
            search: false
        },
        // US HS Code{
        {
            title: 'US HS Code',
            dataIndex: 'us_hs_code',
            key: 'us_hs_code',
            width: 100,
            search: false
        },
        // CANADA HTS CODE
        {
            title: 'Canada HTS Code',
            dataIndex: 'canada_hts_code',
            key: 'canada_hts_code',
            width: 140,
            search: false
        },
        // COO
        {
            title: 'COO',
            dataIndex: 'coo',
            key: 'coo',
            width: 100,
            search: false
        },
        // US import tax rate
        {
            title: 'US Import Tax Rate',
            dataIndex: 'us_import_tax_rate',
            key: 'us_import_tax_rate',
            width: 150,
            search: false
        },
        // CANADA import tax rate
        {
            title: 'Canada Import Tax Rate',
            dataIndex: 'canada_import_tax_rate',
            key: 'canada_import_tax_rate',
            width: 175,
            search: false
        },
        // Kind of item
        {
            title: 'Kind of Item',
            dataIndex: 'king_of_item',
            key: 'king_of_item',
            width: 180,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    style={{ width: '150px' }}
                    type='select'
                    options={kindOfItemAndShipingRisk.kindOfItem.map((item: any) => ({ label: item, value: item }))}
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
            key: 'amazon_us_referral_fee',
            width: 180,
            search: false,
        },
        // AMAZON CAN Referral Fee
        {
            title: 'Amazon CAN Referral Fee',
            dataIndex: 'amazon_can_referral_fee',
            key: 'amazon_can_referral_fee',
            width: 190,
            search: false,
        },
        // AMAZON AU Referral Fee
        {
            title: 'Amazon AU Referral Fee',
            dataIndex: 'amazon_au_referral_fee',
            key: 'amazon_au_referral_fee',
            width: 180,
            search: false,
        },
        // SHIPPING RISK
        {
            title: 'Shipping Risk',
            dataIndex: 'shipping_risk',
            key: 'shipping_risk',
            width: 180,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    type='select'
                    style={{ width: '150px' }}
                    options={kindOfItemAndShipingRisk.shipingRish.map((item: any) => ({ label: item, value: item }))}
                    value={entity.shipping_risk}
                    api={modifyParam}
                    otherParams={{ name: 'shipping_risk' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // UPC - CA
        {
            title: 'UPC - CA',
            dataIndex: 'upc_ca',
            key: 'upc_ca',
            width: 100,
            search: false
        },
        // Title
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
            search: false,
        },
        // Description -CA
        {
            title: 'Description - CA',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
            search: false,
        },
        // Height
        {
            title: 'Height',
            dataIndex: 'height',
            key: 'height',
            width: 100,
            search: false,
        },
        {
            title: 'Width',
            dataIndex: 'width',
            key: 'width',
            width: 100,
            search: false,
        },
        {
            title: 'Length',
            dataIndex: 'length',
            key: 'length',
            width: 100,
            search: false,
        },
        {
            title: 'Currency',
            dataIndex: 'currency1',
            key: 'currency1',
            width: 100,
            search: false,
        },
        // Price1
        {
            title: 'Price1',
            dataIndex: 'sales_price_min',
            key: 'sales_price_min',
            width: 100,
            search: false,
        },
        // Price level 1
        {
            title: 'Price level 1',
            dataIndex: 'sales_price_type1',
            key: 'sales_price_type1',
            width: 120,
            search: false,
        },
        // Currency2
        {
            title: 'Currency2',
            dataIndex: 'currency2',
            key: 'currency2',
            width: 100,
            search: false,
        },
        // Price2
        {
            title: 'Price2',
            dataIndex: 'sales_price_max',
            key: 'sales_price_max',
            width: 100,
            search: false,
        },
        // Price level2
        {
            title: 'Price level2',
            dataIndex: 'sales_price_type2',
            key: 'sales_price_type2',
            width: 120,
            search: false,
        },
        // FBA US Fulfillment Fee
        {
            title: 'FBA US Fulfillment Fee',
            dataIndex: 'fba_us_fulfillment_fee',
            key: 'fba_us_fulfillment_fee',
            width: 180,
            search: false,
        },
        // FBA CAN Fulfillment Fee
        {
            title: 'FBA CAN Fulfillment Fee',
            dataIndex: 'fba_can_fulfillment_fee',
            key: 'fba_can_fulfillment_fee',
            width: 180,
            search: false,
        },
        // FBA AU Fulfillment Fee
        {
            title: 'FBA AU Fulfillment Fee',
            dataIndex: 'fba_au_fulfillment_fee',
            key: 'fba_au_fulfillment_fee',
            width: 180,
            search: false,
        },
        // AMAZON CA PRICE
        {
            title: 'Amazon CA Price',
            dataIndex: 'amazon_ca_price',
            key: 'amazon_ca_price',
            width: 130,
            search: false,
        },
        // AMAZON AU PRICE
        {
            title: 'Amazon AU Price',
            dataIndex: 'amazon_au_price',
            key: 'amazon_au_price',
            width: 135,
            search: false,
        },
        // STORE APPROVED TO SELL
        {
            title: 'Store Approved to Sell',
            dataIndex: 'storeName',
            key: 'storeName',
            width: 170,
            search: false,
        },
        // CI Brand
        {
            title: 'CI Brand',
            dataIndex: 'brand',
            key: 'brand',
            width: 130,
            ellipsis: true,
            search: false,
        },
        // TAX SCHEDULE
        {
            title: 'Tax Schedule',
            dataIndex: 'tax_schedule',
            key: 'tax_schedule',
            width: 120,
            search: false,
        },
        // INCLUDE CHILDREN
        {
            title: 'Include Children',
            dataIndex: 'include_children',
            key: 'include_children',
            width: 140,
            search: false,
        },
        // SYNC TO CHANNELADVISOR
        {
            title: 'Sync to ChannelAdvisor',
            dataIndex: 'sync_to_channeladvisor',
            key: 'sync_to_channeladvisor',
            width: 180,
            search: false,
        },
        {
            title: 'Member1',
            dataIndex: 'member1',
            key: 'member1',
            width: 100,
            search: false,
        },
        {
            title: 'Member2',
            dataIndex: 'member2',
            key: 'member2',
            width: 100,
            search: false,
        },
        {
            title: 'Member3',
            dataIndex: 'member3',
            key: 'member3',
            width: 100,
            search: false,
        },
    ];
    const downloadData = () => {
        const tempData = selectedRows.map(item => {
            return {
                "ITEM NAME/NUMBER": item.sku,
                "Display Name": item.sku,
                "Invoice Item Name": item.invoice_item_name,
                "Serialized": item.serialized,
                "UPC CODE": item.upc_us,
                "ASIN US": item.asin_us,
                "ASIN AU": item.asin_au,
                "Item PM": item.username,
                "Purchase Description": item.title,
                "Brand": item.brand,
                "Cn HS code": item.cn_hs_code,
                "CNTax rebate rate": item.cn_tax_rebate_rate,
                "US HS Code": item.us_hs_code,
                "CANADA HTS CODE": item.canada_hts_code,
                "COO": item.coo,
                "US import tax rate": item.us_import_tax_rate,
                "CANADA import tax rate": item.canada_import_tax_rate,
                "Kind of item": item.king_of_item,
                "AMAZON US Referral Fee": item.amazon_us_referral_fee,
                "AMAZON CAN Referral Fee": item.amazon_can_referral_fee,
                "AMAZON AU Referral Fee": item.amazon_au_referral_fee,
                "SHIPPING RISK": item.shipping_risk,
                "UPC - CA": item.upc_ca,
                "Title": item.title,
                "Description -CA": item.title,
                "Height": item.height,
                "Width": item.width,
                "Length": item.length,
                "Currency": item.currency1,
                "Price1": item.sales_price_min,
                "Price level 1": item.sales_price_type1,
                "Currency2": item.currency2,
                "Price2": item.sales_price_max,
                "Price level2": item.sales_price_type2,
                "FBA US Fulfillment Fee": item.fba_us_fulfillment_fee,
                "FBA CAN Fulfillment Fee": item.fba_can_fulfillment_fee,
                "FBA AU Fulfillment Fee": item.fba_au_fulfillment_fee,
                "AMAZON CA PRICE": item.amazon_ca_price,
                "AMAZON AU PRICE": item.amazon_au_price,
                "STORE APPROVED TO SELL": item.storeName,
                "CI Brand": item.brand,
                "TAX SCHEDULE": item.tax_schedule,
                "INCLUDE CHILDREN": item.include_children,
                "SYNC TO CHANNELADVISOR": item.sync_to_channeladvisor,
                "Member1": item.member1,
                "Member2": item.member2,
                "Member3": item.member3,
            }
        })
        exportExcelFile(columns, tempData, 'SecondaryInspectionProduct.xlsx')
    }


    return (
        <ProTable<SecondaryInspectionProductItem>
            size='small'
            columns={columns}
            actionRef={actionRef}
            // headerTitle={`The Current Dollar Rate is ${USDRate}`}
            rowSelection={{
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                selectedRowKeys: selectedRows.map(item => item.id),
                onSelect: (record, selected) => {
                    if (selected) {
                        setSelectedRows([...selectedRows, record])
                    } else {
                        setSelectedRows(selectedRows.filter(item => item.id !== record.id))
                    }
                },
                onSelectAll: (selected, rows, changeRows) => {
                    if (selected) {
                        setSelectedRows([...selectedRows, ...changeRows])
                    } else {
                        setSelectedRows(selectedRows.filter(item => !changeRows.includes(item)))
                    }
                }
            }}
            tableAlertOptionRender={() => {
                return (
                    <Space size={16}>
                        <a onClick={downloadData}>
                            Export Data
                        </a>
                    </Space>
                );
            }}
            cardBordered
            request={async (params = {}, sort, filter) => {
                await getKindOfItemAndShipingRisk()
                const tempParams = { ...params, ...filter, len: params.pageSize, page: params.current }
                const res = await listProduct(tempParams)
                const { data, code } = res
                const tempData = data.data.map((item: SecondaryInspectionProductItem) => {
                    return {
                        ...item,
                        storeName: configInfo.store.find((store: any) => store.id === item.store_id)?.name
                    }
                })
                return {
                    data: tempData,
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
            }}
            revalidateOnFocus={false}
            dateFormatter="string"
        />
    );
};