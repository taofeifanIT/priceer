import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { getResaleList, updatePurchasePrice } from '@/services/businessUnitData/productReactivationEvaluation';
import type { ResaleListItem } from '@/services/businessUnitData/productReactivationEvaluation';
import { message, Spin, Typography, Select, Button } from 'antd';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import { exportExcel } from '@/utils/excelHelper'
import axions from 'axios';


const SetValueComponent = (props: { id: number, editKey: string, value: string | number, api: any, refresh: () => void }) => {
    const { id, editKey, value, api, refresh } = props
    const [paramValue, setParamValue] = useState(value)
    const [spinning, setSpinning] = useState(false)
    return (<>
        <Spin spinning={spinning}>
            {/* reimburse_money */}
            {(editKey === 'reimburse_money' && value) && '$'}
            <Typography.Text editable={{
                onChange(val) {
                    // 判断是否为空 如果为空则不提交 判断值是否相同 如果相同则不提交
                    if (!val || val === paramValue) {
                        return
                    }
                    setSpinning(true)
                    api({ id, [editKey]: val }).then((res: any) => {
                        if (res.code) {
                            message.success(`${editKey} set successfully`)
                            setParamValue(val)
                            refresh()
                        } else {
                            throw res.msg
                        }
                    }).catch((err: any) => {
                        message.error('Claim number set failed ' + err)
                    }).finally(() => {
                        setSpinning(false)
                    })
                }
            }} >
                {paramValue}
            </Typography.Text>
        </Spin>

    </>)
}


let exportData: never[] = []

export default () => {
    const actionRef = useRef<ActionType>();
    const [USDRate, setUSDRate] = useState(0);
    const [brands, setBrands] = useState<{
        label: string;
        value: string;
    }[]>()
    const getRate = async () => {
        // if (USDRate) return USDRate
        let rate = 7.25;
        const { data } = await axions('https://api.it120.cc/gooking/forex/rate?fromCode=CNY&toCode=USD')
        if (data.code === 0) {
            rate = data.data.rate
        } else {
            // 递归调用
            rate = await getRate()
        }
        return rate
    }

    const getPurchasePrice = (record: ResaleListItem, rate: number) => {
        const { last_purchase_price = 0, us_tax_rate = 0, purchase_price = 0 } = record;
        const price = purchase_price || last_purchase_price
        const purchasePrice = (price / 1.13 / rate) * (1 + us_tax_rate)
        return purchasePrice.toFixed(2)
    }

    const getTargetPurchasePrice = (record: ResaleListItem) => {
        console.log(record)
        const { sales_price = 0, platform_fee = 0, ship_fee = 0, us_tax_rate = 0 } = record;
        const dividend = (sales_price * (1 - platform_fee) - ship_fee)
        const divisor = (1 + us_tax_rate)
        // const ts = dividend / divisor * (1 - 0.1) * USDRate * 1.13
        const ts = dividend / divisor * (1 - 0.1) * USDRate
        // 保留两位小数
        return ts.toFixed(2)
    }

    const columns: ProColumns<ResaleListItem>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            key: 'index',
            width: 48,
        },
        {
            title: 'ASIN',
            dataIndex: 'asin',
            key: 'asin',
            valueType: 'text',
            copyable: true,
            width: 125,
        },
        // sku
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            valueType: 'text',
            copyable: true,
            width: 150,
        },
        // brand
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
            valueType: 'select',
            width: 120,
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
                            options={brands}
                        />
                    );
                }
                return defaultRender(_);
            }
        },
        {
            // us_sales_target
            title: 'US Sales Target',
            dataIndex: 'us_sales_target',
            key: 'us_sales_target',
            search: false,
            width: 120,
        },
        {
            title: 'Estd Sales Price',
            dataIndex: 'sales_price',
            key: 'sales_price',
            search: false,
            width: 120,
            render: (_, record) => [<span key='sales_price'>${record.sales_price}</span>],
        },
        {
            title: 'US Import Tax',
            dataIndex: 'us_tax_rate',
            key: 'us_tax_rate',
            search: false,
            width: 120,
            render: (_, record) => [<span key='us_tax_rate'>{(record.us_tax_rate * 100).toFixed(2)}%</span>],
        },
        {
            title: 'Ship Fee',
            dataIndex: 'ship_fee',
            key: 'ship_fee',
            search: false,
            width: 110,
            render: (_, record) => [<span key='ship_fee'>${record.ship_fee}</span>],
        },
        // {
        //     title: 'Ship Rate',
        //     dataIndex: 'ship_rate',
        //     search: false,
        //     render: (_, record) => [<span key='ship_rate'>{(record.ship_rate * 100).toFixed(2)}%</span>],
        // },
        // {
        //     title: 'Margin Rate',
        //     dataIndex: 'margin_rate',
        //     search: false,
        //     render: (_, record) => [<span key='margin_rate'>{(record.margin_rate * 100).toFixed(2)}%</span>],
        // },
        {
            title: 'Platform Fee Percentage',
            dataIndex: 'platform_fee',
            key: 'platform_fee',
            search: false,
            width: 120,
            // 保留两位小数
            render: (_, record) => [<span key='platform_fee'>{(record.platform_fee * 100).toFixed(2)}%</span>],
        },
        {
            title: 'Target Purchase Price',
            dataIndex: 'target_price',
            key: 'target_price',
            valueType: 'money',
            search: false,
            width: 160,
        },
        {
            title: 'Last Purchase Price',
            dataIndex: 'last_purchase_price',
            key: 'last_purchase_price',
            search: false,
            valueType: 'money',
            width: 150,
            render: (_, record) => [<a key='last_purchase_price' href={`/businessUnitData/PurchasingSalesHistory?sku=${record.sku}`} target='blank'>￥{record.last_purchase_price}</a>],
        },
        {
            // purchase price
            title: 'Purchase Price',
            dataIndex: 'purchase_price',
            key: 'purchase_price',
            search: false,
            width: 120,
            render: (_, record) => [<SetValueComponent key='purchase_price' id={record.id} editKey='purchase_price' value={record.purchase_price} api={updatePurchasePrice} refresh={() => actionRef.current?.reload()} />],
        },
        {
            title: 'Operator',
            dataIndex: 'username',
            key: 'username',
            copyable: true,
            width: 80,
        },
        {
            title: 'Unit Cost(USD)',
            dataIndex: 'unitCost',
            key: 'unitCost',
            valueType: 'money',
            search: false,
            width: 120,
            sorter: (a, b) => a.unitCost - b.unitCost,
            render: (_, record) => [<span key='purchase_price'>${record.unitCost}</span>],
        },
        {
            title: 'Margin Rate',
            dataIndex: 'margin_rate',
            width: 95,
            key: 'margin_rate',
            valueType: 'percent',
            sorter: (a, b) => a.margin_rate - b.margin_rate,
            fixed: 'right',
            render: (_, record) => [<span key='margin_rate'>{(record.margin_rate * 100).toFixed(2) + '%'}</span>],
        },
    ];
    return (
        <ProTable<ResaleListItem>
            size='small'
            columns={columns}
            actionRef={actionRef}
            cardBordered
            headerTitle={`The current dollar rate is ${USDRate}`}
            request={async (params = {}, sort, filter) => {
                // console.log(sort, filter);
                const rate = await getRate()
                setUSDRate(rate)
                const response = await getResaleList({
                    ...params,
                    margin_rate: params.margin_rate ? params.margin_rate / 100 : undefined,
                    len: params.pageSize,
                    page: params.current
                })
                const { data, total } = response.data.content
                const brandData = response.data.brand.map((item: { brand: string }) => ({ label: item.brand, value: item.brand }))
                const resultData = data.map((item: ResaleListItem) => {
                    return {
                        ...item,
                        target_price: getTargetPurchasePrice(item),
                        unitCost: getPurchasePrice(item, rate)
                    }
                })
                setBrands(brandData)
                exportData = resultData
                return {
                    data: resultData,
                    success: true,
                    total: total,
                }
            }}
            editable={{
                type: 'multiple',
            }}
            columnsState={{
                persistenceKey: 'pro-table-singe-demos',
                persistenceType: 'localStorage',
                onChange(value) {
                    console.log('value: ', value);
                },
            }}
            scroll={{ y: document.body.clientHeight - 360, x: columns.reduce((total: any, item) => total + (item.width || 0), 0) }}
            rowKey="id"
            search={{
                labelWidth: 'auto',
            }}
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
                pageSize: 15,
                showQuickJumper: true,
                pageSizeOptions: ['15', '30', '50', '100', '200', '300', '500'],
                onChange: (page) => console.log(page),
            }}
            revalidateOnFocus={false}
            dateFormatter="string"
            toolBarRender={() => [
                <Button key="button" size='small' icon={<VerticalAlignBottomOutlined />} onClick={() => {
                    exportExcel(columns, exportData, 'ProductReactivationEvaluation.xlsx')
                }}>Download</Button>
            ]}
        />
    );
};