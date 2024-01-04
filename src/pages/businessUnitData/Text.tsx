import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import { getNewProduct, editMemoForNew, updatePurchasePriceForNew, addProduct, addProductByFile, updateTaxForNew, getBrandForNew, pmSelfCheck, updateSalesPriceForNew } from '@/services/businessUnitData/newProducts'
import type { NewProductsItem } from '@/services/businessUnitData/newProducts'
import { Input, message, Space, Modal, Button, InputNumber, Form, Select, Popconfirm, Table } from 'antd';
import { PlusOutlined, MinusCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import SetValueComponent from '@/components/SetValueComponent';
import InputMemoComponent from './components/InputMemoComponent';
import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { getToken } from '@/utils/token';
import { exportExcel } from '@/utils/excelHelper';
import { statusConfig } from './config';
// import TestComputer from './components/TestComputer';


const DownloadTemplate = () => {
    const downloadTemplateLocal = () => {
        const header = [
            { title: 'ASIN', key: 'ASIN', dataIndex: 'ASIN' }
        ]
        const data: any = [{ asin: '' }]
        exportExcel(header, data, 'Upload_Asin_Template.xlsx')
    }
    return <a key="template" onClick={() => {
        downloadTemplateLocal()
    }}>Download Template</a>
}

const BatchUploadAsinByExcel = (props: { reload: () => void }) => {
    const [loading, setLoading] = useState(false)
    const uploadFile = (file: any) => {
        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)
        axios.post(addProductByFile(), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Token': getToken()
            }
        }).then((res: any) => {
            const { code, msg } = res.data
            if (code) {
                message.success(msg)
                props.reload()
            } else {
                message.error(msg)
            }
        }).catch((err: any) => {
            console.log(err)
        }).finally(() => {
            setLoading(false)
        })
    }
    const openFile = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.xlsx'
        input.onchange = (e) => {
            const file = (e.target as any).files[0]
            uploadFile(file)
        }
        input.click()
    }
    return (<Button icon={<FileExcelOutlined />} size='small' loading={loading} onClick={openFile}>
        Batch Upload Asin By Excel
    </Button>)
}

const AddProduct = (props: { reload: () => void }) => {
    const [visible, setVisible] = useState(false)
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false)
    const cancel = () => {
        setVisible(false)
    }
    const onOk = () => {
        form.validateFields().then((values) => {
            setLoading(true)
            const { asins } = values
            const asinList = asins.map((item: any) => item.asin).join(',')
            if (asinList.length) {
                addProduct({ asin: asinList }).then((res: any) => {
                    if (res.code) {
                        message.success('Create New Product Successfully')
                        setVisible(false)
                        form.resetFields()
                        props.reload()
                    } else {
                        throw res.msg
                    }
                }).catch((err: any) => {
                    message.error('Create New Product Failed ' + err)
                }).finally(() => {
                    setLoading(false)
                })
            }
        })
    }
    return (<>
        <Modal title="Create New Product" confirmLoading={loading} open={visible} onOk={onOk} onCancel={cancel}>
            <Form
                form={form}
                name="dynamic_form_complex"
                autoComplete="off"
                initialValues={{
                    asins: [{ asin: '' }],
                }}
            >
                <Form.List name="asins">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => (
                                <Space key={field.key} align='baseline'>
                                    <Form.Item
                                        {...field}
                                        label="Asin"
                                        name={[field.name, 'asin']}
                                        rules={[{ required: true, message: 'Missing asin' }]}
                                    >
                                        <Input style={{ width: 400 }} />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                                </Space>
                            ))}

                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Asin
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
        <Button
            key="AddProduct"
            size='small'
            icon={<PlusOutlined />}
            onClick={() => {
                setVisible(true)
            }}
            type="primary"
        >
            Create New Product
        </Button>
    </>
    )
}

const PmSelfCheck = (props: { id: number, status: number, reload: () => void, recordValue: any, text: string, buttonType?: string }) => {
    const { id, status, reload, recordValue, text, buttonType = 'primary' } = props
    const [loading, setLoading] = useState(false)
    const handleOk = () => {
        setLoading(true)
        pmSelfCheck({ id, status: recordValue }).then((res: any) => {
            if (res.code) {
                message.success('Set successfully')
                reload()
            } else {
                throw res.msg
            }
        }).catch((err: any) => {
            message.error('Set failed ' + err)
        }).finally(() => {
            setLoading(false)
        })
    }
    return <Popconfirm
        title="Are you sure to set?"
        onConfirm={handleOk}
        okText="Yes"
        cancelText="No"
        disabled={status === recordValue}
        okButtonProps={{ loading }}>
        <Button disabled={status === recordValue} type={buttonType} size='small' loading={loading}>{text}</Button>
    </Popconfirm>
}

export default () => {
    const actionRef = useRef<ActionType>();
    const [USDRate, setUSDRate] = useState(0);
    const [profitPoint, setProfitPoint] = useState(0.1);
    const [brands, setBrands] = useState([])
    // const [selectedRows, setSelectedRows] = useState<NewProductsItem[]>([]); // 选中的行
    const getTargetPurchasePrice = (record: NewProductsItem) => {
        const { sales_price = 0, platform_fee = 0, ship_fee = 0, us_import_tax = 0, exchange_rate } = record;
        const dividend = (sales_price * (1 - platform_fee) - ship_fee)
        const divisor = (1 + us_import_tax)
        // const ts = dividend / divisor * (1 - 0.1) * USDRate * 1.13
        const ts = dividend / divisor * (1 - profitPoint) * exchange_rate
        // 保留两位小数
        // console.log(sales_price, platform_fee, ship_fee, us_import_tax, exchange_rate)
        return ts.toFixed(2)
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

    // const getRate = async () => {
    //     // if (USDRate) return USDRate
    //     let rate = 7.25;
    //     const { data } = await axios('https://api.it120.cc/gooking/forex/rate?fromCode=CNY&toCode=USD')
    //     if (data.code === 0) {
    //         rate = data.data.rate
    //     } else {
    //         // 递归调用
    //         rate = await getRate()
    //     }
    //     return rate
    // }
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
                { type, defaultRender },
                form,
            ) => {
                if (type === 'form') {
                    return null;
                }
                const status = form.getFieldValue('brand');
                if (status !== 'open') {
                    return (
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
        // BSR
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
        // status
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            valueType: 'select',
            width: 145,
            valueEnum: statusConfig,
        },
        {
            title: 'Estd Sales Price',
            dataIndex: 'sales_price',
            key: 'sales_price',
            search: false,
            width: 125,
            render: (_, record) => [<SetValueComponent key={'sales_price'} id={record.id} editKey='sales_price' value={record.sales_price} api={updateSalesPriceForNew} refresh={() => actionRef.current?.reload()} type='number' prefix='$' />],
        },
        {
            title: 'US Import Tax',
            dataIndex: 'us_tax_rate',
            key: 'us_tax_rate',
            search: false,
            width: 120,
            render: (_, record) => {
                return <SetValueComponent
                    key={'us_tax_rate'}
                    id={record.id}
                    editKey='tax'
                    value={record.us_import_tax}
                    api={updateTaxForNew}
                    refresh={() => actionRef.current?.reload()}
                    type='number'
                    numberStep={0.01}
                />
            },
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
            title: 'Target Purchase Price(CNY)',
            dataIndex: 'target_price',
            key: 'target_price',
            valueType: 'money',
            search: false,
            width: 205,
        },
        {
            // purchase price
            title: 'Purchase Price(CNY)',
            dataIndex: 'purchase_price',
            key: 'purchase_price',
            search: false,
            align: 'center',
            width: 175,
            tooltip: 'untaxed price',
            render: (_, record) => [<SetValueComponent key={'purchase_price'} id={record.id} editKey='purchase_price' value={record.purchase_price} api={updatePurchasePriceForNew} refresh={() => actionRef.current?.reload()} type='number' />],
        },
        {
            title: 'Unit Cost(USD)',
            dataIndex: 'unit_price',
            key: 'unit_price',
            valueType: 'money',
            search: false,
            width: 140,
            align: 'center',
            sorter: (a, b) => a.unit_price - b.unit_price,
            render: (_, record) => [<span key='purchase_price'>${record.unit_price}</span>],
        },
        {
            // comments
            title: 'Comments',
            dataIndex: 'comments',
            key: 'comments',
            search: false,
            width: 150,
            render: (_, record) => [
                <InputMemoComponent
                    key='memo'
                    id={record.id}
                    editKey='memo'
                    value={record.comments}
                    api={editMemoForNew}
                    refresh={() => actionRef.current?.reload()}
                />
            ],
        },
        // first_memo
        {
            title: 'PM Memo',
            dataIndex: 'first_memo',
            key: 'first_memo',
            search: false,
            width: 200,
            ellipsis: true,
        },
        // second_memo
        {
            title: 'Operation Memo',
            dataIndex: 'second_memo',
            key: 'second_memo',
            search: false,
            width: 200,
        },
        // created_at
        {
            title: 'Upload Time',
            dataIndex: 'created_at',
            key: 'created_at',
            align: 'center',
            width: 100,
            search: false,
            render: (_, record) => [
                <span key='created_at'>
                    {dayjs(record.created_at).format('YYYY-MM-DD')}
                </span>
            ],
        },
        // 
        {
            title: 'Action',
            key: 'option',
            valueType: 'option',
            width: 160,
            align: 'center',
            render: (_, record) => {
                return <Space>
                    <PmSelfCheck id={record.id} status={record.status} recordValue={3} reload={() => actionRef.current?.reload()} text='Denied' buttonType='default' />
                    <PmSelfCheck id={record.id} status={record.status} recordValue={4} reload={() => actionRef.current?.reload()} text='Submit' />
                </Space>
            }
        },
        {
            title: 'Margin Rate',
            dataIndex: 'margin_rate',
            width: 115,
            align: 'center',
            key: 'margin_rate',
            valueType: 'percent',
            sorter: (a, b) => a.margin_rate - b.margin_rate,
            fixed: 'right',
            render: (_, record) => [<span key='margin_rate'>{(record.margin_rate * 100).toFixed(0) + '%'}</span>],
        },
        // (REACT_APP_ENV === 'stag') ? {
        //     title: 'TestComputer',
        //     dataIndex: 'TestComputer',
        //     key: 'TestComputer',
        //     valueType: 'option',
        //     width: 110,
        //     search: false,
        //     align: 'center',
        //     fixed: 'right',
        //     render: (_, record) => {
        //         return <TestComputer key='TestComputer' sales_price={record.sales_price} person_sales_price={record.sales_price} us_tax_rate={record.us_import_tax} tax_rate={record.us_import_tax} ship_fee={record.ship_fee} platform_fee={record.platform_fee} last_purchase_price={record.purchase_price} purchase_price={record.purchase_price} exchange_rate={record.exchange_rate} profitPoint={profitPoint} />
        //     }
        // } : {},
    ];
    return (
        <ProTable<NewProductsItem>
            size='small'
            columns={columns}
            actionRef={actionRef}
            rowSelection={{
                // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
                // 注释该行则默认不显示下拉选项
                selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT]
            }}
            tableAlertRender={({
                selectedRowKeys,
                selectedRows,
                onCleanSelected,
            }) => {
                console.log(selectedRowKeys, selectedRows);
                return (
                    <Space size={24}>
                        <span>
                            已选 {selectedRowKeys.length} 项
                            <a style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                                取消选择
                            </a>
                        </span>
                        {/* <span>{`容器数量: ${selectedRows.reduce(
                            (pre, item) => pre + 1,
                            0,
                        )} 个`}</span> */}
                    </Space>
                );
            }}
            tableAlertOptionRender={() => {
                return (
                    <Space size={16}>
                        <a>导出数据</a>
                    </Space>
                );
            }}
            headerTitle={`The Current Dollar Rate is ${USDRate}`}
            cardBordered
            request={async (params = {}, sort, filter) => {
                await getBrand()
                const tempParams = { ...params, ...filter, ...sort, len: params.pageSize, page: params.current, margin_rate: params.margin_rate ? params.margin_rate / 100 : undefined }
                const res = await getNewProduct(tempParams)
                const { data, code, exchange_rate } = res
                let tempData = data.data
                if (code) {
                    const rate = exchange_rate
                    setUSDRate(rate)
                    tempData = tempData.map((item: NewProductsItem) => {
                        // item.exchange_rate = rate
                        return {
                            ...item,
                            target_price: getTargetPurchasePrice(item)
                        }
                    })
                }
                return {
                    data: tempData,
                    success: !!code,
                    total: res.data.total,
                }
            }}
            editable={{
                type: 'multiple',
            }}
            scroll={{ y: document.body.clientHeight - 400, x: columns.reduce((total: any, item) => total + (item.width || 0), 0) }}
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
                //    设置利润点
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
                </Space>,
                <AddProduct key='addproduct' reload={() => {
                    actionRef.current?.reload()
                }} />,
                <BatchUploadAsinByExcel key='BatchUploadAsinByExcel' reload={() => {
                    actionRef.current?.reload()
                }} />,
                <DownloadTemplate key='DownloadTemplate' />,
            ]}
        />
    );
};