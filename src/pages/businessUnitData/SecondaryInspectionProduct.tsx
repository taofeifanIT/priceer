import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { listProduct, modifyParam, getCategoryAndRisk, reject } from '@/services/businessUnitData/secondaryInspectionProduct'
import type { SecondaryInspectionProductItem } from '@/services/businessUnitData/secondaryInspectionProduct'
import SetValueComponent from '@/components/SetValueComponent';
import { Space, Select, message, Popconfirm, Tooltip } from 'antd';
import { exportExcelFile } from '@/utils/excelHelper';
import { useModel } from 'umi';
import { getBrandForNew } from '@/services/businessUnitData/newProducts'
import { CheckOutlined } from '@ant-design/icons';
import { round, evaluate } from 'mathjs'

export default () => {
    const { initialState } = useModel('@@initialState');
    const { configInfo, currentUser } = initialState || {}
    const isProductDevelopment = (currentUser?.authGroup.title === 'product development' || currentUser?.authGroup.title === 'Super Admin')
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
    const [brands, setBrands] = useState([])
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
    const getBrand = async () => {
        if (brands.length) return
        let brandData: any = []
        const { data, code } = await getBrandForNew()
        if (code) {
            brandData = data.map((item: any) => {
                return {
                    label: item,
                    value: item
                }
            })
        }
        setBrands(brandData)
    }
    const columns: ProColumns<SecondaryInspectionProductItem>[] = [
        // purchase quantity
        {
            title: 'Purchase Quantity',
            dataIndex: 'purchase_quantity',
            key: 'purchase_quantity',
            width: 140,
            search: false,
            render(_, entity, __, action) {
                if (!entity.purchase_quantity) {
                    return <SetValueComponent
                        id={entity.id}
                        editKey='value'
                        type='number'
                        style={{ width: '100%' }}
                        value={entity.purchase_quantity}
                        api={modifyParam}
                        otherParams={{ name: 'purchase_quantity' }}
                        refresh={() => action?.reload()}
                    />
                }
                return <span>{entity.purchase_quantity}</span>
            }
        },
        // Company
        {
            title: 'Company',
            dataIndex: 'ekko',
            key: 'ekko',
            width: 90,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    type='select'
                    options={[{ label: '随意', value: '随意' }, { label: '巢威', value: '巢威' }, { label: '晓篪', value: '晓篪' }]}
                    style={{ width: '100%' }}
                    value={entity.ekko}
                    api={modifyParam}
                    otherParams={{ name: 'ekko' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // purchase_price
        {
            title: '含税采购价',
            dataIndex: 'purchase_price',
            key: 'purchase_price',
            width: 160,
            search: false,
            render(_, entity) {
                return <Tooltip title={`${entity.basePurchasePrice} * 1.13`}>
                    <span>{entity.purchase_price}</span>
                </Tooltip>
            }
        },
        // lead_time
        {
            title: 'Lead Time',
            dataIndex: 'lead_time',
            key: 'lead_time',
            width: 100,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    type='text'
                    style={{ width: '100%' }}
                    value={entity.lead_time}
                    api={modifyParam}
                    otherParams={{ name: 'lead_time' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        {
            title: 'ITEM NAME/NUMBER',
            dataIndex: 'sku',
            key: 'sku',
            width: 165,
            fixed: 'left',
            ellipsis: true,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    style={{ width: '90%', marginLeft: '5px' }}
                    value={entity.sku}
                    api={modifyParam}
                    otherParams={{ name: 'sku' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        {
            title: 'Display Name',
            dataIndex: 'sku',
            width: 160,
            search: false,
        },
        {
            // is_consistent
            title: 'Consistent',
            dataIndex: 'is_consistent',
            key: 'is_consistent',
            valueType: 'select',
            valueEnum: {
                1: { text: '一致', status: 'Success' },
                0: { text: '不一致', status: 'Error' },
            },
            width: 100,
            search: false,
        },
        // invoice_item_name
        {
            title: 'INVOICE ITEM NAME',
            dataIndex: 'invoice_item_name',
            key: 'invoice_item_name',
            width: 160,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    style={{ width: '100%' }}
                    value={entity.invoice_item_name}
                    api={modifyParam}
                    otherParams={{ name: 'invoice_item_name' }}
                    refresh={() => action?.reload()}
                />
            },
        },
        // SERIALIZED (CUSTOMIZED)
        {
            title: 'SERIALIZED (CUSTOMIZED)',
            dataIndex: 'serialized',
            key: 'serialized',
            width: 210,
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
        {
            // chinese_customs_clearance_name
            title: 'CHINESE CUSTOMS CLEARANCE NAME',
            dataIndex: 'chinese_customs_clearance_name',
            key: 'chinese_customs_clearance_name',
            width: 320,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    style={{ width: '100%' }}
                    editKey='value'
                    value={entity.chinese_customs_clearance_name}
                    api={modifyParam}
                    otherParams={{ name: 'chinese_customs_clearance_name' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // UPC CODE
        {
            title: 'UPC CODE',
            dataIndex: 'upc_us',
            key: 'upc_us',
            width: 160,
            ellipsis: true,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    style={{ marginLeft: '5px' }}
                    editKey='value'
                    value={entity.upc_us}
                    api={modifyParam}
                    otherParams={{ name: 'upc_us' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // ASIN US
        {
            title: 'ASIN US',
            dataIndex: 'asin_us',
            key: 'asin_us',
            width: 130,
            copyable: true,
        },
        // ASIN CA
        {
            title: 'ASIN CA',
            dataIndex: 'asin_ca',
            key: 'asin_ca',
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
            },
            renderFormItem: (
                _,
                { type, defaultRender, formItemProps, fieldProps, ...rest },
                form,
            ) => {
                if (type === 'form') {
                    return null;
                }
                const status = form.getFieldValue('brand');
                if (status !== 'open') {
                    return (
                        // value 和 onchange 会通过 form 自动注入。
                        <Select
                            allowClear
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={kindOfItemAndShipingRisk.pm.map((item: any) => ({ label: item.username, value: item.username }))}
                        />
                    );
                }
                return defaultRender(_);
            }
        },
        // status
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            hideInTable: true,
            valueType: 'select',
            valueEnum: {
                // 2 已上传  1未上传
                2: { text: 'Uploaded', status: 'Success' },
                1: { text: 'Not Upload', status: 'Error' },
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
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    type='select'
                    style={{ width: '120px' }}
                    options={brands}
                    value={entity.brand}
                    api={modifyParam}
                    otherParams={{ name: 'brand' }}
                    refresh={() => action?.reload()}
                />
            },
            renderFormItem: (
                _,
                { type, defaultRender, formItemProps, fieldProps },
                form,
            ) => {
                if (type === 'form') {
                    return null;
                }
                const status = form.getFieldValue('brand');
                if (status !== 'open') {
                    return (
                        // value 和 onchange 会通过 form 自动注入。
                        <Select
                            allowClear
                            showSearch
                            mode='multiple'
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={brands}
                        />
                    );
                }
                return defaultRender(_);
            }
        },
        // Cn HS code
        {
            title: 'Cn HS Code',
            dataIndex: 'cn_hs_code',
            key: 'cn_hs_code',
            width: 130,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    style={{ width: '100%' }}
                    editKey='value'
                    value={entity.cn_hs_code}
                    api={modifyParam}
                    otherParams={{ name: 'cn_hs_code' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // CNTax rebate rate
        {
            title: 'CNTax rebate rate',
            dataIndex: 'cn_tax_rebate_rate',
            key: 'cn_tax_rebate_rate',
            width: 170,
            search: false,
        },
        // US HS Code
        {
            title: 'US HS Code',
            dataIndex: 'us_hs_code',
            key: 'us_hs_code',
            width: 200,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    style={{ width: '100%' }}
                    value={entity.us_hs_code}
                    api={modifyParam}
                    otherParams={{ name: 'us_hs_code' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // CANADA HTS CODE
        {
            title: 'CANADA HTS CODE',
            dataIndex: 'canada_hts_code',
            key: 'canada_hts_code',
            width: 150,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    style={{ width: '100%' }}
                    editKey='value'
                    value={entity.canada_hts_code}
                    api={modifyParam}
                    otherParams={{ name: 'canada_hts_code' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // COO
        {
            title: 'COO',
            dataIndex: 'coo',
            key: 'coo',
            width: 100,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    value={entity.coo}
                    style={{ width: '100%' }}
                    api={modifyParam}
                    otherParams={{ name: 'coo' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // US import tax rate
        {
            title: 'US import tax rate',
            dataIndex: 'us_import_tax_rate',
            key: 'us_import_tax_rate',
            width: 150,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    style={{ width: '100%' }}
                    value={entity.us_import_tax_rate}
                    api={modifyParam}
                    otherParams={{ name: 'us_import_tax_rate' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        // CANADA import tax rate
        {
            title: 'CANADA import tax rate',
            dataIndex: 'canada_import_tax_rate',
            key: 'canada_import_tax_rate',
            width: 180,
            search: false
        },
        // Kind of item
        {
            title: 'Kind of item',
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
                    refresh={() => action?.reload()}
                />
            }
        },
        // AMAZON US Referral Fee
        {
            title: 'AMAZON US Referral Fee',
            dataIndex: 'amazon_us_referral_fee',
            key: 'amazon_us_referral_fee',
            width: 185,
            search: false,
        },
        // AMAZON CAN Referral Fee
        {
            title: 'AMAZON CAN Referral Fee',
            dataIndex: 'amazon_can_referral_fee',
            key: 'amazon_can_referral_fee',
            width: 195,
            search: false,
        },
        // AMAZON AU Referral Fee
        {
            title: 'AMAZON AU Referral Fee',
            dataIndex: 'amazon_au_referral_fee',
            key: 'amazon_au_referral_fee',
            width: 185,
            search: false,
        },
        // SHIPPING RISK
        {
            title: 'SHIPPING RISK',
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
            title: 'Currency1',
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
            title: 'AMAZON CA PRICE',
            dataIndex: 'amazon_ca_price',
            key: 'amazon_ca_price',
            width: 145,
            search: false,
        },
        // AMAZON AU PRICE
        {
            title: 'AMAZON AU PRICE',
            dataIndex: 'amazon_au_price',
            key: 'amazon_au_price',
            width: 145,
            search: false,
        },
        // STORE APPROVED TO SELL
        {
            title: 'STORE APPROVED TO SELL',
            dataIndex: 'nick_name',
            key: 'nick_name',
            width: 210,
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
            title: 'TAX SCHEDULE',
            dataIndex: 'tax_schedule',
            key: 'tax_schedule',
            width: 130,
            search: false,
        },
        // INCLUDE CHILDREN
        {
            title: 'INCLUDE CHILDREN',
            dataIndex: 'include_children',
            key: 'include_children',
            width: 155,
            search: false,
        },
        // SYNC TO CHANNELADVISOR
        {
            title: 'SYNC TO CHANNELADVISOR',
            dataIndex: 'sync_to_channeladvisor',
            key: 'sync_to_channeladvisor',
            width: 210,
            search: false,
        },
        {
            title: 'Member1',
            dataIndex: 'member1',
            key: 'member1',
            width: 100,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    style={{ width: '100px' }}
                    value={entity.member1}
                    api={modifyParam}
                    otherParams={{ name: 'member1' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        {
            title: 'Member2',
            dataIndex: 'member2',
            key: 'member2',
            width: 100,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    style={{ width: '100px' }}
                    value={entity.member2}
                    api={modifyParam}
                    otherParams={{ name: 'member2' }}
                    refresh={() => action?.reload()}
                />
            }
        },
        {
            title: 'Member3',
            dataIndex: 'member3',
            key: 'member3',
            width: 100,
            search: false,
            render(_, entity, __, action) {
                return <SetValueComponent
                    id={entity.id}
                    editKey='value'
                    style={{ width: '100px' }}
                    value={entity.member3}
                    api={modifyParam}
                    otherParams={{ name: 'member3' }}
                    refresh={() => action?.reload()}
                />
            }
        },
    ];
    if (isProductDevelopment) {
        columns.push({
            title: 'Action',
            dataIndex: 'option',
            valueType: 'option',
            fixed: 'right',
            align: 'center',
            width: 100,
            render: (_, entity, __, action) => {
                return (
                    <Space>
                        {entity.status !== 1 && <Popconfirm
                            title="Are you sure to reject?"
                            onConfirm={async () => {
                                const res = await reject({
                                    id: entity.id
                                })
                                if (res.code === 1) {
                                    action?.reload()
                                } else {
                                    message.error(res.msg)
                                }
                            }}
                            okText="Yes"
                            cancelText="No"
                        >
                            <a>Reject</a>
                        </Popconfirm>}
                    </Space>
                )
            }
        })
    }
    const downloadData = () => {
        const tempData = selectedRows.map(item => {
            return {
                "Purchase Quantity": item.purchase_quantity,
                "Company": item.ekko,
                "含税采购价": item.purchase_price,
                "Lead Time": item.lead_time,
                "ITEM NAME/NUMBER": item.sku,
                "Display Name": item.sku,
                "INVOICE ITEM NAME": item.invoice_item_name,
                "SERIALIZED (CUSTOMIZED)": item.serialized,
                "CHINESE CUSTOMS CLEARANCE NAME": item.chinese_customs_clearance_name,
                "UPC CODE": item.upc_us,
                "ASIN US": item.asin_us,
                "ASIN CA": item.asin_ca,
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
                "Currency1": item.currency1,
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
                "STORE APPROVED TO SELL": item.nick_name,
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
            rowSelection={{
                selectedRowKeys: selectedRows.map(item => item.id),
                onSelect: (record, selected) => {
                    if (selected) {
                        setSelectedRows([...selectedRows, record])
                    } else {
                        setSelectedRows(selectedRows.filter(item => item.id !== record.id))
                    }
                },
                onSelectAll: (selected, rows, changeRows) => {
                    // if (selected) {
                    //     setSelectedRows([...selectedRows, ...changeRows])
                    // } else {
                    //     setSelectedRows(selectedRows.filter(item => !changeRows.includes(item)))
                    // }
                    // 不要有status为1的数据
                    if (selected) {
                        setSelectedRows([...selectedRows, ...changeRows.filter(item => item.status !== 2)])
                    } else {
                        setSelectedRows(selectedRows.filter(item => !changeRows.includes(item)))
                    }
                },
                renderCell: (_, record, __, originNode) => {
                    if (record.status === 2) {
                        return <Tooltip title='Uploaded'><CheckOutlined style={{ color: 'green' }} /></Tooltip>
                    } else {
                        return originNode
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
                await getBrand()
                const tempParams = { ...params, ...filter, len: params.pageSize, page: params.current }
                const res = await listProduct(tempParams)
                const { data, code } = res
                const tempData = data.data.map((item: SecondaryInspectionProductItem) => {
                    return {
                        ...item,
                        cn_tax_rebate_rate: 0.13,
                        // purchase_price: item.purchase_price ? item.purchase_price * 1.13 : 0,  四舍五入取整
                        basePurchasePrice: item.purchase_price,
                        purchase_price: item.purchase_price ? round(evaluate(`${item.purchase_price} * 1.13`), 0) : 0,
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
            pagination={{
                pageSize: 30,
                showQuickJumper: true,
                pageSizeOptions: ['30', '50', '100', '200', '300', '500'],
                showSizeChanger: true
            }}
            options={{
                density: false,
                fullScreen: false,
                reload: true,
                setting: false,
            }}
            // revalidateOnFocus={false}
            dateFormatter="string"
        />
    );
};