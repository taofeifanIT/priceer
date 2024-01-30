import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { getResaleList, updatePurchasePrice, editMemo, batchEdit, updateSalesPrice, updateSalesTarget, updateState, updateTax } from '@/services/businessUnitData/productReactivationEvaluation';
import type { ResaleListItem } from '@/services/businessUnitData/productReactivationEvaluation';
import { message, Select, Button, Space, InputNumber, Table, Typography, Dropdown, Modal, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { VerticalAlignBottomOutlined, FileExcelOutlined } from '@ant-design/icons';
import { exportExcel } from '@/utils/excelHelper'
import { getToken } from '@/utils/token';
import axions from 'axios';
import SetValueComponent from '@/components/SetValueComponent';
import InputMemoComponent from './components/InputMemoComponent';

import './index.less'
// import TestComputer from './components/TestComputer';


let exportData: never[] = []

const StatusButton = (props: { id: number, status: number, refresh: () => void }) => {
    const { id, status, refresh } = props
    const [spinning, setSpinning] = useState(false)
    const [statusValue, setStatusValue] = useState(status)
    const items = [
        {
            key: 1,
            label: 'Inactive',
        },
        {
            key: 2,
            label: 'Active',
        },
    ];
    const saveValue = (val: any) => {
        setSpinning(true)
        updateState({ id, status: val }).then((res: any) => {
            if (res.code) {
                message.success(`Status set successfully`)
                refresh()
            } else {
                throw res.msg
            }
        }).catch((err: any) => {
            message.error('Status set failed ' + err)
        }).finally(() => {
            setSpinning(false)
        })
    }
    const onMenuClick: MenuProps['onClick'] = (e: any) => {
        const form = items.find(item => item.key === statusValue)?.label
        const to = items.find(item => item.key == e.key)?.label
        Modal.confirm({
            title: 'Are you sure you want to change the status?',
            content: `${form} -> ${to}`,
            onOk: () => {
                saveValue(e.key)
            }
        })
    };
    useEffect(() => {
        setStatusValue(status)
    }, [status])
    return <>
        <Dropdown.Button
            size='small'
            trigger={['click']}
            loading={spinning}
            menu={{ items: items.filter(item => item.key !== statusValue), onClick: onMenuClick }}>
            {items.find(item => item.key === statusValue)?.label}
        </Dropdown.Button>
    </>
}

export default () => {
    const actionRef = useRef<ActionType>();
    const [USDRate, setUSDRate] = useState(0);
    const [brands, setBrands] = useState<{
        label: string;
        value: string;
    }[]>()
    const [profitPoint, setProfitPoint] = useState(0.1);
    const [selectedRows, setSelectedRows] = useState<ResaleListItem[]>([]); // 选中的行
    // const getRate = async () => {
    //     // if (USDRate) return USDRate
    //     let rate = 7.25;
    //     const { data } = await axions('https://api.it120.cc/gooking/forex/rate?fromCode=CNY&toCode=USD')
    //     if (data.code === 0) {
    //         rate = data.data.rate
    //     } else {
    //         // 递归调用
    //         rate = await getRate()
    //     }
    //     return rate
    // }

    // const getPurchasePrice = (record: ResaleListItem, rate: number) => {
    //     const { last_purchase_price = 0, us_tax_rate = 0, purchase_price = 0 } = record;
    //     const price = purchase_price || last_purchase_price
    //     const purchasePrice = (price / 1.13 / rate) * (1 + us_tax_rate)
    //     return purchasePrice.toFixed(2)
    // }

    const getTargetPurchasePrice = (record: ResaleListItem) => {
        // const { sales_price = 0, platform_fee = 0, ship_fee = 0, us_tax_rate = 0, exchange_rate, person_sales_price = 0, tax_rate = 0 } = record;
        const tempRecord = {
            sales_price: parseFloat(record.sales_price),
            platform_fee: parseFloat(record.platform_fee),
            ship_fee: parseFloat(record.ship_fee),
            us_tax_rate: parseFloat(record.us_tax_rate),
            exchange_rate: record.exchange_rate,
            person_sales_price: parseFloat(record.person_sales_price),
            tax_rate: parseFloat(record.tax_rate),
        }
        const { sales_price, platform_fee, ship_fee, us_tax_rate, exchange_rate, person_sales_price, tax_rate } = tempRecord

        const targetSalesPrice = person_sales_price > 0 ? person_sales_price : sales_price
        const targetTaxRate = tax_rate > 0 ? tax_rate : us_tax_rate
        const dividend = (targetSalesPrice * (1 - platform_fee) - ship_fee)
        const divisor = (1 + targetTaxRate)
        // const ts = dividend / divisor * (1 - 0.1) * USDRate * 1.13
        const ts = dividend / divisor * (1 - profitPoint) * exchange_rate
        // console.table({ targetSalesPrice, targetTaxRate, platform_fee, exchange_rate, ship_fee, dividend, divisor, profitPoint })
        // 保留两位小数
        return ts.toFixed(2)
    }

    const downloadTemplateLocal = () => {
        const header = [
            { title: 'ASIN', key: 'ASIN', dataIndex: 'ASIN' },
            { title: 'SKU', key: 'SKU', dataIndex: 'SKU' },
            { title: 'Purchase Price', key: 'purchase_price', dataIndex: 'purchase_price' },
            { title: 'Memo', key: 'Memo', dataIndex: 'Memo' }
        ]
        let data = selectedRows.map(item => {
            return {
                ASIN: item.asin,
                SKU: item.sku,
                Memo: item.memo || ''
            }
        })
        if (!data.length) {
            data = [
                {
                    ASIN: 'example asin',
                    SKU: 'example sku',
                    Memo: 'memo'
                }
            ]

        }
        exportExcel(header, data, 'Template.xlsx')
    }

    const BatchEditComponent = () => {
        // 上传文件
        const uploadFile = (file: any) => {
            const formData = new FormData()
            formData.append('file', file)
            axions.post(batchEdit(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Token': getToken()
                }
            }).then((res: any) => {
                const { code, msg } = res.data
                if (code) {
                    message.success(msg)
                    actionRef.current?.reload()
                } else {
                    message.error(msg)
                }
            }).catch((err: any) => {
                console.log(err)
            })
        }
        return (<>
            <Button key="BatchEdit" size='small' icon={<FileExcelOutlined />} type='dashed' onClick={() => {
                // 打开上传文件
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.xlsx'
                input.onchange = (e) => {
                    const file = (e.target as any).files[0]
                    uploadFile(file)
                }
                input.click()
            }}>Batch Edit</Button>
        </>)
    }

    const columns: ProColumns<ResaleListItem>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            key: 'index',
            fixed: 'left',
            width: 48,
        },
        // status  1： 未确认 2：已确认  英文展示
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            valueType: 'select',
            width: 100,
            hideInTable: true,
            valueEnum: {
                1: { text: 'Inactive', status: 'Default' },
                2: { text: 'Active', status: 'Success' },
            }
        },
        {
            title: 'ASIN',
            dataIndex: 'asin',
            key: 'asin',
            valueType: 'text',
            fixed: 'left',
            ellipsis: true,
            width: 130,
            render: (_, record) => {
                return <Typography.Text
                    copyable={{
                        text: record.asin,
                    }}
                >
                    <Tooltip title={record.is_timeout === 2 ? 'The sales target became negative for more than 6 months' : ''}>
                        <a href={`https://www.amazon.com/dp/${record.asin}`} style={{ color: record.is_timeout === 2 ? 'red' : '' }} target='blank'>{record.asin}</a>
                    </Tooltip>
                </Typography.Text>
            }
        },
        // Sales Target Negative Time
        {
            title: 'ST Period',
            dataIndex: 'is_timeout',
            key: 'is_timeout',
            hideInTable: true,
            valueType: 'select',
            tooltip: 'Whether Sales Target became negative is more than six months or not',
            valueEnum: {
                1: { text: '< 6 months', status: 'Default' },
                2: { text: '> 6 months', status: 'Error' },
            }
        },
        // sku
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            valueType: 'text',
            copyable: true,
            ellipsis: true,
            width: 160,
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
        {
            // us_sales_target
            title: 'US Sales Target',
            dataIndex: 'us_sales_target',
            key: 'us_sales_target',
            search: false,
            width: 121,
        },
        // sales_target
        {
            title: 'New Sales Target',
            dataIndex: 'sales_target',
            key: 'sales_target',
            search: false,
            width: 135,
            render: (_, record) => {
                return <SetValueComponent
                    id={record.id}
                    editKey='sales_target'
                    value={record.sales_target}
                    prefix={record.sales_target === null ? "NA" : ""}
                    api={updateSalesTarget}
                    refresh={() => actionRef.current?.reload()}
                    type='number'
                    disabled={record.status === 2}
                />
            }
        },
        {
            title: 'Estd Sales Price',
            dataIndex: 'sales_price',
            key: 'sales_price',
            search: false,
            width: 124,
            render: (_, record) => [<span key='sales_price'>${record.sales_price}</span>],
        },
        // person_sales_price
        {
            title: 'Mannual Sales Price(USD)',
            dataIndex: 'person_sales_price',
            key: 'person_sales_price',
            search: false,
            width: 192,
            render: (_, record) => {
                return <SetValueComponent
                    id={record.id}
                    editKey='sales_price'
                    prefix={record.person_sales_price === null ? "NA" : ""}
                    value={record.person_sales_price}
                    api={updateSalesPrice}
                    refresh={() => actionRef.current?.reload()}
                    type='number'
                    disabled={record.status === 2}
                />
            },
        },
        {
            title: 'US Import Tax',
            dataIndex: 'us_tax_rate',
            key: 'us_tax_rate',
            search: false,
            width: 120,
            render: (_, record) => [<span key='us_tax_rate'>{record.us_tax_rate}</span>],
        },
        // 人工填写的关税
        {
            title: 'Mannual Import Tax',
            dataIndex: 'tax_rate',
            key: 'tax_rate',
            search: false,
            width: 150,
            render: (_, record) => {
                return <>
                    <SetValueComponent
                        id={record.id}
                        editKey='tax'
                        prefix={record.tax_rate === null ? "NA" : ""}
                        value={record.tax_rate}
                        api={updateTax}
                        refresh={() => actionRef.current?.reload()}
                        type='number'
                        disabled={record.status === 2}
                        numberStep={0.01}
                    />
                </>
            }
        },
        {
            title: 'Ship Fee',
            dataIndex: 'ship_fee',
            key: 'ship_fee',
            search: false,
            width: 80,
            render: (_, record) => [<span key='ship_fee'>${record.ship_fee}</span>],
        },
        {
            title: 'Platform Fee Percentage',
            dataIndex: 'platform_fee',
            key: 'platform_fee',
            search: false,
            width: 180,
            // 保留两位小数
            render: (_, record) => [<span key='platform_fee'>{(record.platform_fee * 100).toFixed(2)}%</span>],
        },
        {
            title: 'Target Purchase Price',
            dataIndex: 'target_price',
            key: 'target_price',
            valueType: 'money',
            search: false,
            width: 162,
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
            title: 'Purchase Price(CNY)',
            dataIndex: 'purchase_price',
            key: 'purchase_price',
            search: false,
            width: 172,
            tooltip: 'untaxed price',
            render: (_, record) => [
                <SetValueComponent
                    key={'purchase_price'}
                    id={record.id}
                    editKey='purchase_price'
                    value={record.purchase_price}
                    api={updatePurchasePrice}
                    prefix={record.purchase_price === null ? "NA" : ""}
                    refresh={() => actionRef.current?.reload()}
                    type='number'
                    disabled={record.status === 2} />],
        },
        {
            title: 'Operator',
            dataIndex: 'username',
            key: 'username',
            ellipsis: true,
            copyable: true,
            width: 90,
        },
        {
            // comments
            title: 'Comments',
            dataIndex: 'memo',
            key: 'memo',
            search: false,
            width: 150,
            render: (_, record) => [<InputMemoComponent key='memo' id={record.id} editKey='memo' value={record.memo} api={editMemo} refresh={() => actionRef.current?.reload()} />],
        },
        {
            title: 'Unit Cost(USD)',
            dataIndex: 'unit_price',
            key: 'unit_price',
            valueType: 'money',
            search: false,
            width: 135,
            sorter: (a, b) => a.unit_price - b.unit_price,
            render: (_, record) => {
                return !record.unit_price ? "NA" : <span key='purchase_price'>${record.unit_price}</span>
            },
        },
        // updated_at
        {
            title: 'Update Time',
            dataIndex: 'updated_at',
            key: 'updated_at',
            valueType: 'text',
            width: 100,
            search: false,
        },
        {
            title: 'Margin Rate',
            dataIndex: 'margin_rate',
            width: 111,
            key: 'margin_rate',
            valueType: 'percent',
            align: 'center',
            sorter: (a, b) => a.margin_rate - b.margin_rate,
            fixed: 'right',
            render: (_, record) => {
                // if (!record.unit_price) return null
                if (!record.margin_rate) return <span style={{ color: 'red' }}>{record.reason}</span>
                return <span key='margin_rate'>{(record.margin_rate * 100).toFixed(0) + '%'}</span>
            },
        },
        // action
        {
            title: 'Status',
            dataIndex: 'option',
            valueType: 'option',
            width: 110,
            fixed: 'right',
            render: (_, record) => {
                return <Space>
                    <StatusButton key='status' id={record.id} status={record.status} refresh={() => actionRef.current?.reload()} />
                    {/* <TestComputer key='TestComputer' sales_price={record.sales_price} person_sales_price={record.person_sales_price} us_tax_rate={record.us_tax_rate} tax_rate={record.tax_rate} ship_fee={record.ship_fee} platform_fee={record.platform_fee} last_purchase_price={record.last_purchase_price} purchase_price={record.purchase_price} exchange_rate={record.exchange_rate} profitPoint={profitPoint} /> */}
                </Space>
            },
        }
    ];
    return (
        <ProTable<ResaleListItem>
            size='small'
            columns={columns}
            rowSelection={{
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // defaultSelectedRowKeys: [1],
                selectedRowKeys: selectedRows.map(item => item.id),
                // onChange: (RowKeys, rows) => {
                //     if (!rows.length) {
                //         setSelectedRows([])
                //         return
                //     }
                //     setSelectedRows(selectedRows.concat(rows.filter(item => !selectedRows.includes(item))));
                // },
                onSelect: (record, selected) => {
                    if (selected) {
                        setSelectedRows([...selectedRows, record])
                    } else {
                        setSelectedRows(selectedRows.filter(item => item.id !== record.id))
                    }
                },
                onSelectAll: (selected, toChangeRow, changeRows) => {
                    if (selected) {
                        setSelectedRows([...selectedRows, ...changeRows])
                    } else {
                        if (toChangeRow.length === 0) {
                            setSelectedRows([])
                        } else {
                            setSelectedRows(selectedRows.filter(item => !changeRows.includes(item)))
                        }
                    }
                }
            }}
            id='id'
            actionRef={actionRef}
            cardBordered
            headerTitle={`The Current Dollar Rate is ${USDRate}`}
            request={async (params = {}, sort) => {
                const response = await getResaleList({
                    ...params,
                    margin_rate: params.margin_rate ? params.margin_rate / 100 : undefined,
                    start_date: params.us_sales_target_modify_time ? params.us_sales_target_modify_time[0] : undefined,
                    end_date: params.us_sales_target_modify_time ? params.us_sales_target_modify_time[1] : undefined,
                    len: params.pageSize,
                    page: params.current
                })
                const { data, total } = response.data.content
                const brandData = response.data.brand.map((item: { brand: string }) => ({ label: item.brand, value: item.brand }))
                const resultData = data.map((item: ResaleListItem) => {
                    return {
                        ...item,
                        target_price: getTargetPurchasePrice(item),
                    }
                })
                const rate = response.exchange_rate
                setUSDRate(rate)
                setBrands(brandData)
                exportData = resultData
                if (sort?.margin_rate) {
                    exportData.sort((a: any, b: any) => {
                        if (sort.margin_rate === 'ascend') {
                            return a.margin_rate - b.margin_rate
                        } else {
                            return b.margin_rate - a.margin_rate
                        }
                    })
                }
                return {
                    data: resultData,
                    success: true,
                    total: total,
                }
            }}
            editable={{
                type: 'multiple',
            }}
            scroll={{ y: document.body.clientHeight - 360, x: columns.reduce((total: any, item) => total + (item.width || 0), 0) }}
            rowKey="id"
            search={{
                labelWidth: 'auto',
            }}
            pagination={{
                pageSize: 15,
                showQuickJumper: true,
                pageSizeOptions: ['15', '30', '50', '100', '200', '300', '500'],
                showSizeChanger: true
            }}
            revalidateOnFocus={false}
            dateFormatter="string"
            toolBarRender={() => [
                //    设置利润点
                <Space key="profitPoint" >
                    <span>Profit Percentage:</span>
                    <InputNumber size='small' placeholder="Profit Percentage" step={0.01} value={profitPoint} style={{ width: '100px' }} onChange={(e) => {
                        setProfitPoint(e)
                    }} />
                    <Button type='primary' size='small' onClick={() => {
                        if (profitPoint) {
                            actionRef.current?.reload()
                        }
                    }}>
                        Calculate
                    </Button>
                </Space>,
                <Button key="button" size='small' icon={<VerticalAlignBottomOutlined />} onClick={() => {
                    // excelColumns index不需要
                    const excelColumns = columns.filter(item => item.dataIndex !== 'index')
                    exportExcel(excelColumns, selectedRows.length ? selectedRows : exportData, 'ProductReactivationEvaluation.xlsx')
                }}>Download</Button>,
                <BatchEditComponent key='BatchEditComponent' />,
                // <a key="template" href={downloadTemplate()} target='blank' >Download template</a>,
                <a key="template" onClick={() => {
                    downloadTemplateLocal()
                }}>Download Template</a>
            ]}
        />
    );
};