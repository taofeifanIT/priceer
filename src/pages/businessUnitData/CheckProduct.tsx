import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { getCheckList, updateStatus } from '@/services/businessUnitData/checkProduct'
import type { NewProductsItem } from '@/services/businessUnitData/newProducts'
import { message, Space, Popconfirm, Button, Select, InputNumber } from 'antd';
import { getBrandForNew } from '@/services/businessUnitData/newProducts'
import InputMemoComponent from './components/InputMemoComponent';
import { statusConfig } from './config'
import axios from 'axios'

const options: any = {
    1: 'Approve',
    2: 'Reject'
}

const EditStatusComponent = (props: { id: number, value: any, type: number, refresh: () => void, targetValue: any }) => {
    const { id, value, type, refresh, targetValue } = props
    const [paramValue, setParamValue] = useState(value)
    const [visible, setVisible] = useState(false)
    const [spinning, setSpinning] = useState(false)
    const confirm = async () => {
        setSpinning(true)
        const { code, msg } = await updateStatus({ id, status: targetValue, type })
        setSpinning(false)
        setVisible(false)
        if (code) {
            message.success('Edit successfully')
            refresh()
        } else {
            message.error(msg)
        }
    };
    const showPopconfirm = () => {
        setVisible(true);
    };
    const cancel = () => {
        setVisible(false);
    }
    useEffect(() => {
        setParamValue(value)
    }, [value])
    return (<Popconfirm
        key={targetValue}
        title="Are you sure?"
        onConfirm={confirm}
        onCancel={cancel}
        okText="Yes"
        open={visible}
        cancelText="No"
        okButtonProps={{ loading: spinning }}
    >
        <Button onClick={showPopconfirm} size='small' type="primary" disabled={(paramValue == value && value == targetValue)}>{options[targetValue]}</Button>
    </Popconfirm>)
}

export default () => {
    const actionRef = useRef<ActionType>();
    const [brands, setBrands] = useState([])
    const [profitPoint, setProfitPoint] = useState(0.1);
    const [USDRate, setUSDRate] = useState(0);
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
    const getRate = async () => {
        // if (USDRate) return USDRate
        let rate = 7.25;
        const { data } = await axios('https://api.it120.cc/gooking/forex/rate?fromCode=CNY&toCode=USD')
        if (data.code === 0) {
            rate = data.data.rate
        } else {
            // 递归调用
            rate = await getRate()
        }
        return rate
    }
    const getTargetPurchasePrice = (record: NewProductsItem) => {
        const { sales_price = 0, platform_fee = 0, ship_fee = 0, us_import_tax = 0, exchange_rate } = record;
        const dividend = (sales_price * (1 - platform_fee) - ship_fee)
        const divisor = (1 + us_import_tax)
        // const ts = dividend / divisor * (1 - 0.1) * USDRate * 1.13
        const ts = dividend / divisor * (1 - profitPoint) * exchange_rate
        // 保留两位小数
        return ts.toFixed(2)
    }
    const columns: ProColumns<NewProductsItem>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            key: 'index',
            fixed: 'left',
            width: 48,
        },
        {
            title: 'ASIN',
            dataIndex: 'asin',
            key: 'asin',
            valueType: 'text',
            copyable: true,
            fixed: 'left',
            ellipsis: true,
            width: 130,
        },
        {
            // Owner Name
            title: 'Owner Name',
            dataIndex: 'username',
            key: 'username',
            valueType: 'text',
            width: 105,
            search: false,
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
            width: 140,
            ellipsis: true,
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
            title: 'BSR',
            dataIndex: 'bsr',
            key: 'bsr',
            valueType: 'text',
            width: 320,
            search: false,
            render: (_, record) => {
                // bsr 是字符串数组 
                return record.bsr.map((item) => {
                    return <div key={item}>{item}</div>
                })
            }
        },
        {
            title: 'Estd Sales Price',
            dataIndex: 'sales_price',
            key: 'sales_price',
            search: false,
            width: 125,
            render: (_, record) => [<span key='sales_price'>{record.sales_price && '$'}{record.sales_price}</span>],
        },
        {
            title: 'US Import Tax',
            dataIndex: 'us_tax_rate',
            key: 'us_tax_rate',
            search: false,
            width: 120,
            render: (_, record) => [<span key='us_tax_rate'>{(record.us_import_tax)}</span>],
        },
        {
            title: 'Ship Fee',
            dataIndex: 'ship_fee',
            key: 'ship_fee',
            search: false,
            width: 110,
            render: (_, record) => [<span key='ship_fee'>{record.ship_fee && '$'}{record.ship_fee}</span>],
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
            title: 'Target Purchase Price(CNY)',
            dataIndex: 'target_price',
            key: 'target_price',
            valueType: 'money',
            search: false,
            width: 205,
        },
        {
            title: 'Purchase Price(CNY)',
            dataIndex: 'purchase_price',
            key: 'purchase_price',
            search: false,
            width: 160,
        },
        {
            title: 'Unit Cost(USD)',
            dataIndex: 'unit_price',
            key: 'unit_price',
            valueType: 'money',
            search: false,
            width: 140,
            sorter: (a, b) => a.unit_price - b.unit_price,
            render: (_, record) => {
                if (record.unit_price) {
                    return <span key='purchase_price'>${record.unit_price}</span>
                }
                return null
            }
        },
        // comments
        {
            title: 'Comments',
            dataIndex: 'comments',
            key: 'comments',
            valueType: 'text',
            width: 120,
            search: false,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            valueType: 'select',
            width: 110,
            valueEnum: statusConfig,
        },
        // first_status: number; // pm审核的
        // first_memo: string;
        // second_status: number; // 运营审核的
        // second_memo: string;
        {
            title: 'PM Status',
            dataIndex: 'first_status',
            key: 'first_status',
            width: 180,
            search: false,
            render(_, record) {
                return <Space>
                    <EditStatusComponent id={record.id} value={record.first_status} type={1} refresh={() => { actionRef.current?.reload() }} targetValue={1} />
                    <EditStatusComponent id={record.id} value={record.first_status} type={1} refresh={() => { actionRef.current?.reload() }} targetValue={2} />
                </Space>
            }
        },
        {
            title: 'PM Memo',
            dataIndex: 'first_memo',
            key: 'first_memo',
            width: 160,
            search: false,
            render: (_, record) => {
                return <InputMemoComponent
                    id={record.id}
                    editKey='memo'
                    value={record.first_memo}
                    api={updateStatus}
                    refresh={() => { actionRef.current?.reload() }}
                    otherParams={{ type: 1, status: record.first_status }} />
            }
        },
        {
            title: 'Operation Status',
            dataIndex: 'second_status',
            key: 'second_status',
            width: 180,
            search: false,
            render(_, record) {
                return <Space>
                    <EditStatusComponent id={record.id} value={record.second_status} type={2} refresh={() => { actionRef.current?.reload() }} targetValue={1} />
                    <EditStatusComponent id={record.id} value={record.second_status} type={2} refresh={() => { actionRef.current?.reload() }} targetValue={2} />
                </Space>
            }
        },
        {
            title: 'Operation Memo',
            dataIndex: 'second_memo',
            key: 'second_memo',
            width: 160,
            search: false,
            render: (_, record) => {
                return <InputMemoComponent
                    id={record.id}
                    editKey='memo'
                    value={record.second_memo}
                    api={updateStatus}
                    refresh={() => { actionRef.current?.reload() }}
                    otherParams={{ type: 2, status: record.second_status }} />
            }
        },
        {
            title: 'Upload Time',
            dataIndex: 'created_at',
            key: 'created_at',
            align: 'center',
            width: 100,
            search: false,
        },
        {
            title: 'Margin Rate',
            dataIndex: 'margin_rate',
            width: 115,
            key: 'margin_rate',
            align: 'center',
            valueType: 'percent',
            sorter: (a, b) => a.margin_rate - b.margin_rate,
            fixed: 'right',
            render: (_, record) => [<span key='margin_rate'>{(record.margin_rate * 100).toFixed(0) + '%'}</span>],
        },
    ];
    return (
        <ProTable<NewProductsItem>
            size='small'
            columns={columns}
            actionRef={actionRef}
            headerTitle={`The Current Dollar Rate is ${USDRate}`}
            cardBordered
            request={async (params = {}, sort, filter) => {
                await getBrand()
                const tempParams = { ...params, ...filter, ...sort, margin_rate: params.margin_rate ? (params.margin_rate / 100) : undefined, len: params.pageSize, page: params.current }
                const res = await getCheckList(tempParams)
                const { data, code } = res
                const resultData = data.data.map((item: NewProductsItem) => {
                    // item.exchange_rate = USDRate
                    return {
                        ...item,
                        target_price: getTargetPurchasePrice(item)
                    }
                })
                const rate = resultData[0]?.exchange_rate || await getRate()
                setUSDRate(rate)
                return {
                    data: resultData,
                    success: !!code,
                    total: res.data.total,
                }
            }}
            editable={{
                type: 'multiple',
            }}
            scroll={{ y: document.body.clientHeight - 260, x: columns.reduce((total: any, item) => total + (item.width || 0), 0) }}
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
                pageSize: 30,
                showQuickJumper: true,
                pageSizeOptions: ['30', '50', '100', '200', '300', '500'],
                // onChange: (page) => console.log(page),
            }}
            revalidateOnFocus={false}
            dateFormatter="string"
            toolBarRender={() => [
                <Space key="profitPoint" >
                    <span>Profit Percentage:</span>
                    <InputNumber placeholder="Profit Percentage" size='small' step={0.01} value={profitPoint} style={{ width: '65px' }} onChange={(e) => {
                        setProfitPoint(e)
                    }} />
                    <Button type='primary' size='small' onClick={() => {
                        if (profitPoint) {
                            actionRef.current?.reload()
                        }
                    }}>
                        Calculate
                    </Button>
                </Space>
            ]}
        />
    );
};