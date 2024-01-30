import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import {
    getNewProduct,
    editMemoForNew,
    updatePurchasePriceForNew,
    addProduct,
    addProductByFile,
    updateTaxForNew,
    getBrandForNew,
    pmSelfCheck,
    updateSalesPriceForNew,
    editPurchaseQuantity,
    updateSkuForNew
} from '@/services/businessUnitData/newProducts'
import type { NewProductsItem } from '@/services/businessUnitData/newProducts'
import { Input, message, Space, Modal, Button, InputNumber, Form, Select, Popconfirm } from 'antd';
import { PlusOutlined, MinusCircleOutlined, FileExcelOutlined } from '@ant-design/icons';
import SetValueComponent from '@/components/SetValueComponent';
import InputMemoComponent from './components/InputMemoComponent';
import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { getToken } from '@/utils/token';
import { exportExcel, exportExcelFile } from '@/utils/excelHelper';
import { statusConfig } from './config';
import { getCategoryAndRisk } from '@/services/businessUnitData/secondaryInspectionProduct'
import { modifyConsistent, modifyParamForNew } from '@/services/businessUnitData/checkProduct'


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

const PmSelfCheck = (props: { id: number, status: number, reload: () => void, recordValue: any, text: string, buttonType?: string, purchase_price?: number }) => {
    const { id, status, reload, recordValue, text, buttonType = 'primary', purchase_price } = props
    const [loading, setLoading] = useState(false)
    const handleOk = () => {
        if (recordValue === 4 && !purchase_price) {
            message.error('Please enter the purchase price')
            return
        }
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
        <Button type={buttonType} size='small' disabled={status === recordValue} loading={loading}>{text}</Button>
    </Popconfirm>
}

// 写一个函数 传入一个数字 整数的话取整，有小数点的话保留两位小数
const getNumber = (num: number) => {
    if (num % 1 === 0) {
        return num
    } else {
        return num.toFixed(2)
    }
}

export default () => {
    const actionRef = useRef<ActionType>();
    const [USDRate, setUSDRate] = useState(0);
    const [profitPoint, setProfitPoint] = useState(0.1);
    const [brands, setBrands] = useState([])
    const [selectedRows, setSelectedRows] = useState<NewProductsItem[]>([]); // 选中的行
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
    const downloadData = () => {
        const header = [
            {
                title: 'ITEM NAME/NUMBER',
                key: 'sku',
                dataIndex: 'sku',
                width: 100,
            },
            {
                title: 'Display Name',
                key: 'sku',
                dataIndex: 'sku',
                width: 100,
            },
            {
                title: 'INVOICE ITEM NAME',
                key: 'invoice_item_name',
                dataIndex: 'invoice_item_name',
                width: 100,
            },
            {
                title: 'SERIALIZED (CUSTOMIZED)',
                key: 'serialized',
                dataIndex: 'serialized',
                width: 100,
            },
            {
                title: 'UPC CODE',
                key: 'upc',
                dataIndex: 'upc',
                width: 100,
            },
            {
                title: 'ASIN US',
                key: 'asin',
                dataIndex: 'asin',
                width: 100,
            },
            {
                title: 'ASIN CA',
                key: 'asin_ca',
                dataIndex: 'asin_ca',
                width: 100,
            },
            {
                title: 'ASIN AU',
                key: 'asin_au',
                dataIndex: 'asin_au',
                width: 100,
            },
            {
                title: 'Item PM',
                key: 'username',
                dataIndex: 'username',
                width: 100,
            },
            {
                title: 'Purchase Description',
                key: 'title',
                dataIndex: 'title',
                width: 300,
            },
            {
                title: 'Brand',
                key: 'brand',
                dataIndex: 'brand',
                width: 100,
            },
            {
                title: 'Cn HS code',
                key: 'cn_hs_code',
                dataIndex: 'cn_hs_code',
                width: 100,
            },
            {
                title: 'CNTax rebate rate',
                key: 'cn_tax_rebate_rate',
                dataIndex: 'cn_tax_rebate_rate',
                width: 100,
            },
            {
                title: 'US HS Code',
                key: 'us_hs_code',
                dataIndex: 'us_hs_code',
                width: 100,
            },
            {
                // CANADA HTS CODE
                title: 'CANADA HTS CODE',
                key: 'canada_hts_code',
                dataIndex: 'canada_hts_code',
                width: 100,
            },
            {
                //COO
                title: 'COO',
                key: 'coo',
                dataIndex: 'coo',
                width: 100,
            },
            {
                // US import tax rate
                title: 'US import tax rate',
                key: 'us_import_tax',
                dataIndex: 'us_import_tax',
                width: 100,
            },
            {
                // CANADA import tax rate
                title: 'CANADA import tax rate',
                key: 'canada_import_tax',
                dataIndex: 'canada_import_tax',
                width: 100,
            },
            {
                // Kind of item
                title: 'Kind of item',
                key: 'kind_of_item',
                dataIndex: 'kind_of_item',
                width: 100,
            },
            {
                // AMAZON US Referral Fee
                title: 'AMAZON US Referral Fee',
                key: 'platform_fee',
                dataIndex: 'platform_fee',
                width: 100,
            },
            {
                // AMAZON CAN Referral Fee
                title: 'AMAZON CAN Referral Fee',
                key: 'amazon_can_referral_fee',
                dataIndex: 'amazon_can_referral_fee',
                width: 100,
            },
            {
                // AMAZON AU Referral Fee
                title: 'AMAZON AU Referral Fee',
                key: 'amazon_au_referral_fee',
                dataIndex: 'amazon_au_referral_fee',
                width: 100,
            },
            {
                // SHIPPING RISK
                title: 'SHIPPING RISK',
                key: 'shipping_risk',
                dataIndex: 'shipping_risk',
                width: 100,
            },
            {
                // UPC - CA
                title: 'UPC - CA',
                key: 'upc_ca',
                dataIndex: 'upc_ca',
                width: 100,
            },
            {
                // Title
                title: 'Title',
                key: 'title',
                dataIndex: 'title',
                width: 300,
            },
            {
                // Description -CA
                title: 'Description -CA',
                key: 'title',
                dataIndex: 'title',
                width: 300,
            },
            {
                // Height
                title: 'Height',
                key: 'height',
                dataIndex: 'height',
                width: 100,
            },
            {
                // Width
                title: 'Width',
                key: 'width',
                dataIndex: 'width',
                width: 100,
            },
            {
                // Length
                title: 'Length',
                key: 'length',
                dataIndex: 'length',
                width: 100,
            },
            {
                // Currency1
                title: 'Currency1',
                key: 'currency1',
                dataIndex: 'currency1',
                width: 100,
            },
            {
                // Price1
                title: 'Price1',
                key: 'Price1',
                dataIndex: 'Price1',
                width: 100,
            },
            {
                // Price level 1
                title: 'Price level 1',
                key: 'price_level1',
                dataIndex: 'price_level1',
                width: 100,
            },
            {
                // Currency2
                title: 'Currency2',
                key: 'currency2',
                dataIndex: 'currency2',
                width: 100,
            },
            {
                // Price2
                title: 'Price2',
                key: 'price2',
                dataIndex: 'price2',
                width: 100,
            },
            {
                // Price level2
                title: 'Price level2',
                key: 'price_level2',
                dataIndex: 'price_level2',
                width: 100,
            },
            {
                // FBA US Fulfillment Fee
                title: 'FBA US Fulfillment Fee',
                key: 'fullfill_cost',
                dataIndex: 'fullfill_cost',
                width: 100,
            },
            {
                // FBA CAN Fulfillment Fee
                title: 'FBA CAN Fulfillment Fee',
                key: 'fullfill_cost_can',
                dataIndex: 'fullfill_cost_can',
                width: 100,
            },
            {
                // FBA AU Fulfillment Fee
                title: 'FBA AU Fulfillment Fee',
                key: 'fullfill_cost_au',
                dataIndex: 'fullfill_cost_au',
                width: 100,
            },
            {
                // AMAZON CA PRICE
                title: 'AMAZON CA PRICE',
                key: 'amazon_ca_price',
                dataIndex: 'amazon_ca_price',
                width: 100,
            },
            {
                // AMAZON AU PRICE
                title: 'AMAZON AU PRICE',
                key: 'amazon_au_price',
                dataIndex: 'amazon_au_price',
                width: 100,
            },
            {
                // STORE APPROVED TO SELL
                title: 'STORE APPROVED TO SELL',
                key: 'store_approved_to_sell',
                dataIndex: 'store_approved_to_sell',
                width: 100,
            },
            {
                // CI Brand
                title: 'CI Brand',
                key: 'brand',
                dataIndex: 'brand',
                width: 100,
            },
            {
                // TAX SCHEDULE
                title: 'TAX SCHEDULE',
                key: 'tax_schedule',
                dataIndex: 'tax_schedule',
                width: 100,
            },
            {
                // INCLUDE CHILDREN
                title: 'INCLUDE CHILDREN',
                key: 'include_children',
                dataIndex: 'include_children',
                width: 100,
            },
            {
                // SYNC TO CHANNELADVISOR
                title: 'SYNC TO CHANNELADVISOR',
                key: 'sync_to_channeladvisor',
                dataIndex: 'sync_to_channeladvisor',
                width: 100,
            },
            {
                // Member1
                title: 'Member1',
                key: 'member1',
                dataIndex: 'member1',
                width: 100,
            },
            {
                // Member2
                title: 'Member2',
                key: 'member2',
                dataIndex: 'member2',
                width: 100,
            },
            {
                // Member3
                title: 'Member3',
                key: 'member3',
                dataIndex: 'member3',
                width: 100,
            },
            // Purchase Quantity
            {
                title: 'Purchase Quantity',
                key: 'purchase_quantity',
                dataIndex: 'purchase_quantity',
                width: 100,
            },
            // PM Memo
            {
                title: 'PM Memo',
                key: 'first_memo',
                dataIndex: 'first_memo',
                width: 100,
            }
        ]
        const data: any = selectedRows.map((item: NewProductsItem) => {
            return {
                "ITEM NAME/NUMBER": item.sku,
                "Display Name": item.sku,
                "INVOICE ITEM NAME": "",
                "SERIALIZED (CUSTOMIZED)": '',
                "UPC CODE": item.upc,
                "ASIN US": item.asin,
                "ASIN CA": '',
                "ASIN AU": '',
                "Item PM": '',
                "Purchase Description": item.title,
                "Brand": item.brand,
                "Cn HS code": '',
                "CNTax rebate rate": 0.13,
                "US HS Code": '',
                "CANADA HTS CODE": '',
                "COO": '',
                "US import tax rate": "",
                "CANADA import tax rate": '',
                "Kind of item": '',
                "AMAZON US Referral Fee": item.platform_fee,
                "AMAZON CAN Referral Fee": '',
                "AMAZON AU Referral Fee": '',
                "SHIPPING RISK": '',
                "UPC - CA": '',
                "Title": item.title,
                "Description -CA": item.title,
                "Height": item.height,
                "Width": item.width,
                "Length": item.length,
                "Currency1": 'USD',
                "Price1": getNumber(item.sales_price * 0.95),
                "Price level 1": 'Itemminprice',
                "Currency2": 'USD',
                "Price2": getNumber(item.sales_price * 1.15),
                "Price level2": 'Itemmaxprice',
                "FBA US Fulfillment Fee": item.fullfill_cost,
                "FBA CAN Fulfillment Fee": '',
                "FBA AU Fulfillment Fee": '',
                "AMAZON CA PRICE": '',
                "AMAZON AU PRICE": '',
                "STORE APPROVED TO SELL": '',
                "CI Brand": item.brand,
                "TAX SCHEDULE": 'TAX SCHEDULE',
                "INCLUDE CHILDREN": 'Yes',
                "SYNC TO CHANNELADVISOR": 'Yes',
                "Member1": '',
                "Member2": '',
                "Member3": '',
                "Purchase Quantity": item.purchase_quantity,
                "PM Memo": item.first_memo
            }

        })
        exportExcelFile(header, data, 'New_Products.xlsx')
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
            // copyable: true,
            ellipsis: true,
            width: 160,
            render: (_, record) => {
                return <SetValueComponent
                    id={record.id}
                    editKey='sku'
                    style={{ width: '140px' }}
                    value={record.sku}
                    api={updateSkuForNew}
                    refresh={() => { actionRef.current?.reload() }}
                    type='text'
                />
            }
        },
        {
            title: 'Item PM',
            dataIndex: 'username',
            key: 'username',
            width: 130,
            hideInTable: true,
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
        {
            // is_consistent
            title: 'Consistent',
            dataIndex: 'is_consistent',
            key: 'is_consistent',
            valueType: 'select',
            width: 100,
            search: false,
            render: (_, record) => {
                return <SetValueComponent
                    style={{ width: '85px' }}
                    id={record.id}
                    type='select'
                    options={[{ label: '一致', value: 1 }, { label: '不一致', value: 0 }] as any}
                    editKey='is_consistent'
                    value={record.is_consistent}
                    api={modifyConsistent}
                    refresh={() => { actionRef.current?.reload() }} />
            }
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
            },
            render: (_, record) => {
                return <SetValueComponent
                    style={{ width: '120px' }}
                    id={record.id}
                    type='select'
                    options={brands}
                    editKey='value'
                    otherParams={{ name: 'brand' }}
                    value={record.brand}
                    api={modifyParamForNew}
                    refresh={() => { actionRef.current?.reload() }} />
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
            render: (_, record) => [<InputMemoComponent key='memo' id={record.id} editKey='memo' value={record.comments} api={editMemoForNew} refresh={() => actionRef.current?.reload()} />],
        },
        {
            // purchase_quantity
            title: 'Purchase Quantity',
            dataIndex: 'purchase_quantity',
            key: 'purchase_quantity',
            search: false,
            width: 140,
            render: (_, record) => [<SetValueComponent key={'purchase_quantity'} id={record.id} editKey='purchase_quantity' value={record.purchase_quantity} api={editPurchaseQuantity} refresh={() => actionRef.current?.reload()} type='number' />],
        },
        {
            title: 'PM Status',
            key: 'first_status',
            dataIndex: 'first_status',
            width: 100,
            valueType: 'select',
            search: false,
            valueEnum: {
                //  1 Approved 2 Rejected
                1: { text: 'Approved', status: 'Success' },
                2: { text: 'Rejected', status: 'Error' },
            },
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
        {
            title: 'Operation Status',
            dataIndex: 'second_status',
            key: 'second_status',
            width: 150,
            search: false,
            valueEnum: {
                //  1 Approved 2 Rejected
                1: { text: 'Approved', status: 'Success' },
                2: { text: 'Rejected', status: 'Error' },
            },
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
            render: (_, record) => [<span key='created_at'>{dayjs(record.created_at).format('YYYY-MM-DD')}</span>],
        },
        // 
        {
            title: 'Action',
            key: 'option',
            valueType: 'option',
            width: 140,
            ellipsis: true,
            align: 'center',
            render: (_, record) => {
                if ([1, 4, 6, 7, 8].includes(record.status)) {
                    return statusConfig[record.status].text
                }
                // is_consistent 
                if (record.is_consistent === null) {
                    // 请选择Consistent 用英文提示
                    return <span style={{ color: '#f5ab50' }}>Please select Consistent</span>
                }
                return <Space>
                    <PmSelfCheck id={record.id} status={record.status} recordValue={3} reload={() => actionRef.current?.reload()} text='Denied' buttonType='default' />
                    <PmSelfCheck id={record.id} status={record.status} recordValue={4} purchase_price={record.purchase_price} reload={() => actionRef.current?.reload()} text='Submit' />
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
                        // console.log([...selectedRows, ...changeRows])
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
            headerTitle={`The Current Dollar Rate is ${USDRate}`}
            cardBordered
            request={async (params = {}, sort, filter) => {
                await getKindOfItemAndShipingRisk()
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
            // form={{
            //     // 由于配置了 transform，提交的参与与定义的不同这里需要转化一下
            //     syncToUrl: (values, type) => {
            //         if (type === 'get') {
            //             return {
            //                 ...values,
            //                 created_at: [values.startTime, values.endTime],
            //             };
            //         }
            //         return values;
            //     },
            // }}
            pagination={{
                pageSize: 30,
                showQuickJumper: true,
                pageSizeOptions: ['30', '50', '100', '200', '300', '500'],
                showSizeChanger: true
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