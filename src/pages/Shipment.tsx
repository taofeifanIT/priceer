import { UnorderedListOutlined, BellOutlined, PlusOutlined, MinusCircleOutlined, InboxOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Tabs, Button, Modal, Steps, message, Form, Input, InputNumber, Space, Divider, Collapse, Typography, Select, Upload, Empty, Checkbox } from 'antd';
import type { UploadProps } from 'antd';
import { useRef, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { getSkuList, createShipmentPlan, createShipment, putTransportDetails, putCartonContents, printBarCode, getLabels } from '@/services/shipment'
import { ProTable } from '@ant-design/pro-components';
import { getToken } from '@/utils/token'
import { exportPDF, createDownload } from '@/utils/utils'
import { getGlobalParams } from '@/utils/globalParams'
import styles from '@/styles/modules/shipment.less';
const { Step } = Steps;

const { Panel } = Collapse;

const { Text } = Typography;

const { Option } = Select;

const { Dragger } = Upload;

type listItem = {
    asin: string,
    ts_sku: string,
    fnsku: string,
    quantity: number,
    title: string,
    conditionType: string,
    productType: string,
    itemName: string,
    store_id: number,
    store_name: string
}

const steps = [
    {
        title: 'CreateShipment',
        step: '1',
    },
    // {
    //     title: 'PutTransportDetails',
    //     step: '2',
    // },
    {
        title: 'PutCartonContents',
        step: '2',
    },
    {
        title: 'PrintpackingList',
        step: '3'
    },
    {
        title: 'UpdatePackageByFile',
        step: '4',
    },
    {
        title: 'GetLabels',
        step: '5',
    },
    {
        title: 'UpdateShipment',
        step: '6',
    },
];

const pageType = [
    'PackageLabel_Letter_2',
    'PackageLabel_Letter_4',
    'PackageLabel_Letter_6',
    'PackageLabel_Letter_6_CarrierLeft',
    'PackageLabel_A4_2',
    'PackageLabel_A4_4',
    'PackageLabel_Plain_Paper',
    'PackageLabel_Plain_Paper_CarrierBottom',
    'PackageLabel_Thermal',
    'PackageLabel_Thermal_Unified',
    'PackageLabel_Thermal_NonPCP',
    'PackageLabel_Thermal_No_Carrier_Rotation'
]

const labelType = [
    'BARCODE_2D',
    'UNIQUE',
    'PALLET'
]

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
};

const ListTable = () => {
    const actionRef: any = useRef<FormInstance>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<listItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createShipmentformRef] = Form.useForm();
    const [putTransportDetailsFormRef] = Form.useForm();
    const [printpackingListFormRef] = Form.useForm();
    const [getLablesFormRef] = Form.useForm();
    const [current, setCurrent] = useState(0);
    const [runLoading, setRunLoading] = useState(false);
    const [resMsg, setResMsg] = useState<string[]>(['', '', '', '', '', '']);
    const [shipmentId, setShipmentId] = useState('FBA15D7H2CH5');
    const [treeForm, setFreeForm] = useState<any>([]);
    const [barcodeObj, setBarcodeObj] = useState<any>({ src: '', fnSku: '', itemName: '' });
    const [labelUrl, setLabelUrl] = useState<string>("");
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const addCarton = () => {
        let lastItem = treeForm[treeForm.length - 1];
        if (lastItem && !lastItem.cartonId) {
            message.error('Please fill in the cartonId');
            return;
        }
        setFreeForm([...treeForm, { cartonId: '', products: [{ sku: '', quantityShipped: '', quantityInCase: '' }] }]);
    }
    const removeCarton = (index: number) => {
        treeForm.splice(index, 1);
        setFreeForm([...treeForm]);
    }
    const removeProduct = (index: number, index2: number) => {
        if (treeForm[index].products.length === 1) {
            message.error('At least one product');
            return;
        }
        treeForm[index].products.splice(index2, 1);
        setFreeForm([...treeForm]);
    }
    const addProduct = (index: number) => {
        let lastItem = treeForm[index].products[treeForm[index].products.length - 1];
        // 校验lastItem属性值是否都有值
        if (lastItem && (!lastItem.quantityShipped || !lastItem.quantityInCase || !lastItem.sku)) {
            message.error('Empty parameters are found. Please fill in the parameter values！');
            return
        }
        const newTreeForm = [...treeForm];
        newTreeForm[index].products.push({ sku: '', quantityShipped: '', quantityInCase: '' });
        setFreeForm(newTreeForm);
    }
    const changeCartionId = (index: number, value: any) => {
        const newTreeForm = [...treeForm];
        newTreeForm[index].cartonId = value;
        setFreeForm(newTreeForm);
    }
    const changeProductPop = (index: number, index2: number, value: any, key: string) => {
        const newTreeForm = [...treeForm];
        newTreeForm[index].products[index2][key] = value;
        setFreeForm(newTreeForm);
    }
    const checkTreeFormValues = () => {
        let flag = true;
        treeForm.forEach((item: any) => {
            if (!item.cartonId) {
                flag = false;
            }
            item.products.forEach((product: any) => {
                if (!product.quantityShipped || !product.quantityInCase || !product.sku) {
                    flag = false;
                }
            });
        });
        return flag;
    }
    const toCreateShipment = async (values: any) => {
        setRunLoading(true);
        let msg = '';
        try {
            const res = await createShipmentPlan(values);
            if (res.code != 0) {
                msg = JSON.stringify(res) + '\n';
                const { ShipmentId } = res.data[0];
                const subRes = await createShipment(ShipmentId);
                msg += JSON.stringify(subRes);
                if (subRes.code != 0) {
                    setShipmentId(ShipmentId);
                    setRunLoading(false);
                    message.success('CreateShipment success!');
                } else {
                    message.error(JSON.stringify(subRes));
                    setRunLoading(false);
                }
            } else {
                setRunLoading(false);
                message.error(JSON.stringify(res));
                msg = JSON.stringify(res);
            }
        } catch (error) {
            message.error(JSON.stringify(error));
            setRunLoading(false);
        }
        setStepResMsg(0, msg);
    }
    const toPutTransportDetails = async (values: any) => {
        setRunLoading(true);
        let msg = '';
        try {
            const res = await putTransportDetails(values);
            if (res.code != 0) {
                msg = JSON.stringify(res);
                setRunLoading(false);
                message.success('PutTransportDetails success!');
            } else {
                setRunLoading(false);
                message.error(JSON.stringify(res));
                msg = JSON.stringify(res);
            }
        } catch (error) {
            message.error(JSON.stringify(error));
            setRunLoading(false);
        }
        setStepResMsg(1, msg);
    }
    const toPutCartonContents = async () => {
        setRunLoading(true);
        let msg = '';
        try {
            const res = await putCartonContents({ shipment_id: shipmentId, items: treeForm });
            if (res.code != 0) {
                msg = JSON.stringify(res);
                setRunLoading(false);
                message.success('PutCartonContents success!');
            } else {
                setRunLoading(false);
                message.error(JSON.stringify(res));
                msg = JSON.stringify(res);
            }
        } catch (error) {
            message.error(JSON.stringify(error));
            setRunLoading(false);
        }
        setStepResMsg(2, msg);
    }
    const setStepResMsg = (index: number, msg: string) => {
        let newResMsg = [...resMsg];
        newResMsg[index] = msg;
        setResMsg(newResMsg);
    }
    const createBarCode = () => {
        setRunLoading(true);
        printpackingListFormRef.validateFields().then((values) => {
            console.log(values)
            const { fnSku, quantity } = values;
            printBarCode({ fnsku: fnSku }).then((res) => {
                if (res.code === 0) {
                    message.error(res.msg);
                    setRunLoading(false);
                    return;
                }
                const { data } = res;
                const { barcode, title } = data;
                setBarcodeObj({ src: barcode, fnSku, itemName: title });
                exportPDF(fnSku, quantity, 'viewBarCode');
                setStepResMsg(current, JSON.stringify(res));
                setRunLoading(false);
            });
        }).catch((errorInfo) => {
            message.error(JSON.stringify(errorInfo));
            setStepResMsg(current, JSON.stringify(errorInfo));
            setRunLoading(false);
        });
    }

    const next = () => {
        setCurrent(current + 1);
    }
    const deBugCurrentStepFun = () => {
        switch (current + 1) {
            case 1:
                createShipmentformRef.validateFields().then((values) => {
                    console.log(values)
                    toCreateShipment(values);
                }).catch((errorInfo) => {
                    console.log(errorInfo)
                });
                break;
            case 2:
                let flag = checkTreeFormValues();
                if (flag) {
                    console.log(treeForm)
                    toPutCartonContents();
                } else {
                    message.error('Empty parameters are found. Please fill in the parameter values！');
                }
                break;
            case 3:
                createBarCode();
                break;
            case 5:
                getLablesFormRef.validateFields().then((values) => {
                    setRunLoading(true);
                    let params = {
                        shipment_id: shipmentId,
                        ...values,
                        package_labels_to_print: values.package_labels_to_print.toString()
                    }
                    getLabels(params).then((res) => {
                        if (res.code === 0) {
                            message.error(JSON.stringify(res));
                            setRunLoading(false);
                            return;
                        }
                        const { data } = res;
                        const { DownloadURL } = data;
                        setLabelUrl(DownloadURL);
                        createDownload('lables', DownloadURL);
                        setStepResMsg(current, JSON.stringify(res));
                        setRunLoading(false);
                    });
                }).catch((errorInfo) => {
                    message.error(JSON.stringify(errorInfo));
                    setStepResMsg(current, JSON.stringify(errorInfo));
                    setRunLoading(false);
                });
                break;
            case 6:
                putTransportDetailsFormRef.validateFields().then((values) => {
                    const params = {
                        shipment_id: shipmentId,
                        ...values
                    }
                    console.log(params)
                    toPutTransportDetails(params);
                }).catch((errorInfo) => {
                    console.log(errorInfo)
                });
                break;
        }
    };

    const prev = () => {
        setCurrent(current - 1);
    };
    const createShipmentForm: any = (<>
        <Form {...layout} form={createShipmentformRef}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="addressLine1" label="AddressLine1" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="addressLine2" label="AddressLine2" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="districtOrCounty" label="DistrictOrCounty" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="stateOrProvinceCode" label="StateOrProvinceCode" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="countryCode" label="CountryCode" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="postalCode" label="PostalCode" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Divider />
            <Form.List name="goods">
                {(fields, { add, remove }) => (
                    <>
                        {selectedRowKeys.map((field, name) => (
                            <Space key={field.ts_sku + 'space'} style={{ 'width': '1550px' }} align='center' size={15}>
                                <Form.Item
                                    name={[name, 'sellerSKU']}
                                    label="Sku" rules={[{ required: true }]}
                                    initialValue={field.ts_sku}>
                                    <Input disabled style={{ 'width': '120px' }} />
                                </Form.Item>
                                <Form.Item
                                    name={[name, 'asin']}
                                    label="asin" rules={[{ required: true }]}
                                    initialValue={field.asin}>
                                    <Input disabled style={{ 'width': '120px' }} />
                                </Form.Item>
                                <Form.Item
                                    label={<span style={{ 'width': '100px' }}>quantity</span>}
                                    name={[name, 'quantity']}
                                    style={{ marginRight: -55 }}
                                    rules={[{ required: true }]}>
                                    <InputNumber placeholder='Quantity' />
                                </Form.Item>
                                <Form.Item
                                    label={<span style={{ 'width': '210px' }}>quantityInCase</span>}
                                    name={[name, 'quantityInCase']}
                                    rules={[{ required: true }]}>
                                    <InputNumber placeholder='QuantityInCase' />
                                </Form.Item>
                            </Space>
                        ))}
                    </>
                )}
            </Form.List>
        </Form>
    </>)
    const putTransportDetailsForm: any = (<>
        <Form {...layout} form={putTransportDetailsFormRef}>
            <Form.List name="packages">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map((field, name, ...restField) => {
                            return (<>
                                <Divider />
                                <Form.Item
                                    {...restField}
                                    label="Tracking id"
                                    name={[name, 'tracking_id']}
                                    rules={[{ required: true }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    label='Dimensions length'
                                    name={[name, 'dimensions_length']}
                                    rules={[{ required: true }]}>
                                    <InputNumber style={{ 'width': '100%' }} />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    label='Dimensions width'
                                    name={[name, 'dimensions_width']}
                                    rules={[{ required: true }]}>
                                    <InputNumber placeholder='width' style={{ 'width': '100%' }} />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    label='Dimensions height'
                                    name={[name, 'dimensions_height']}
                                    rules={[{ required: true }]}>
                                    <InputNumber placeholder='Height' style={{ 'width': '100%' }} />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    label='Dimensions unit'
                                    name={[name, 'dimensions_unit']}
                                    rules={[{ required: true }]}
                                    initialValue={'inches'}>
                                    <Select
                                        allowClear
                                    >
                                        <Option value="inches">inches</Option>
                                        <Option value="other">other</Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    label='Weight'
                                    name={[name, 'weight_value']}
                                    rules={[{ required: true }]}>
                                    <InputNumber placeholder='weight' style={{ 'width': '100%' }} />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    label='Weight unit'
                                    name={[name, 'weight_unit']}
                                    rules={[{ required: true }]}
                                    initialValue={'pounds'}>
                                    <Select
                                        allowClear
                                    >
                                        <Option value="pounds">pounds</Option>
                                        <Option value="other">other</Option>
                                    </Select>
                                </Form.Item>
                                <div style={{ 'textAlign': 'center', 'marginBottom': '20px' }}>
                                    <Button danger onClick={() => {
                                        remove(field.name)
                                    }}>Remove</Button>
                                </div>
                            </>)
                        })}
                        <Form.Item
                            label={' '} colon={false}>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add Transport Details
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        </Form>
    </>)
    const putCartonContentsForm: any = (<>
        {treeForm.map((item: any, index: number) => {
            return (<div style={{ 'marginTop': index > 0 ? 10 : 0, 'paddingLeft': '100px' }}>
                <Space>
                    <span>Carton ID ：</span>
                    <Input value={item.cartonId} onChange={(e) => {
                        const value = e.target.value
                        changeCartionId(index, value)
                    }} />
                    <Button icon={<PlusOutlined />} block onClick={() => addProduct(index)}>Add product</Button>
                    <MinusCircleOutlined onClick={() => {
                        removeCarton(index)
                    }} />
                </Space>
                <div style={{ 'marginTop': '20px' }}>
                    {item.products.map((product: any, productIndex: number) => {
                        return <Space style={{ 'marginTop': productIndex > 0 ? 10 : 0, width: '600px' }}>
                            <span style={{ 'marginLeft': '10px' }}>Sku ：</span>
                            <Select style={{ 'width': '120px' }} value={product.sku} onChange={(value) => {
                                changeProductPop(index, productIndex, value, 'sku')
                            }}>
                                {selectedRowKeys.map(({ ts_sku }) => {
                                    return <Option value={ts_sku}>{ts_sku}</Option>
                                })}
                            </Select>
                            <span>quantityShipped ：</span>
                            <InputNumber
                                style={{ 'width': '65px' }}
                                value={product.quantityShipped}
                                onChange={(value) => {
                                    changeProductPop(index, productIndex, value, 'quantityShipped')
                                }} />
                            <span>quantityInCase ：</span>
                            <InputNumber
                                style={{ 'width': '65px' }}
                                value={product.quantityInCase}
                                onChange={(value) => {
                                    changeProductPop(index, productIndex, value, 'quantityInCase')
                                }} />
                            <MinusCircleOutlined onClick={() => {
                                removeProduct(index, productIndex)
                            }} />
                        </Space>
                    })}
                </div>
            </div>)
        })}
        <div style={{ 'textAlign': 'center', 'marginTop': '10px' }}>
            <Button
                block
                icon={<PlusOutlined />}
                type='dashed'
                style={{ 'width': '740px', 'marginBottom': '10px' }}
                onClick={() => addCarton()}>
                add carton
            </Button>
        </div>
    </>)
    const updatePackageByFileForm: any = (<>
        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
                <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                band files
            </p>
        </Dragger>
    </>)
    const printpackingListForm: any = (<>
        <div style={{ 'marginLeft': '150px' }}>
            <Form layout='inline' form={printpackingListFormRef}>
                <Form.Item name='fnSku' label='Sku' rules={[{ required: true }]}>
                    <Select style={{ 'width': '140px' }}>
                        {selectedRowKeys.map(({ ts_sku, fnsku }) => {
                            return <Option value={fnsku}>{ts_sku}</Option>
                        })}
                    </Select>
                </Form.Item>
                <Form.Item name='quantity' label='printing quantity' rules={[{ required: true }]} initialValue={100}>
                    <InputNumber />
                </Form.Item>
            </Form>
        </div>
        {barcodeObj.src ? (<div style={{ 'textAlign': 'center', 'marginTop': '10px' }} id={'viewBarCode'}>
            <div>
                <img src={barcodeObj.src} />
            </div>
            <div style={{ 'fontSize': '30px', 'margin': '8px 0', 'fontWeight': '600' }}>
                {barcodeObj.fnSku}
            </div>
            <p style={{ 'fontSize': '26px', 'fontWeight': '700' }}>
                {barcodeObj.itemName}
            </p>
        </div>) : <Empty style={{ 'margin': '10px 10px' }} description='No bar code created' />}
    </>)
    const getLablesForm: any = (<>
        <Form {...layout} form={getLablesFormRef}>
            <Form.Item name='page_type' label='Page type' rules={[{ required: true }]} initialValue={'PackageLabel_A4_4'}>
                <Select style={{ 'width': '100%' }}>
                    {pageType.map((item: any) => {
                        return <Option value={item}>{item}</Option>
                    })}
                </Select>
            </Form.Item>
            <Form.Item name='label_type' label='Label type' rules={[{ required: true }]} initialValue={'UNIQUE'}>
                <Select style={{ 'width': '100%' }}>
                    {labelType.map((item: any) => {
                        return <Option value={item}>{item}</Option>
                    })}
                </Select>
            </Form.Item>
            <Form.Item name='package_labels_to_print' label='Package labels to print' rules={[{ required: true }]} initialValue={[...treeForm.map((item: any) => item.cartonId)]}>
                <Checkbox.Group>
                    {treeForm.map((item: any, index: number) => {
                        return <Checkbox key={index} value={item.cartonId}>{item.cartonId}</Checkbox>
                    })}
                </Checkbox.Group>
            </Form.Item>
        </Form>
    </>)
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        action: 'http://api-rp.itmars.net/shipment/updatePackageByFile',
        maxCount: 1,
        data: {
            shipment_id: shipmentId,
            store_id: getGlobalParams()['store_id'],
        },
        headers: {
            authorization: 'authorization-text',
            token: getToken()
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                setStepResMsg(current, JSON.stringify(info.file.response))
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };
    const columns: ProColumns<listItem>[] = [
        {
            title: 'Sku',
            search: false,
            dataIndex: 'ts_sku',
        },
        {
            title: 'Sku',
            dataIndex: 'vendor_sku',
            hideInTable: true,
        },
        {
            title: 'asin',
            dataIndex: 'asin',
        },
        {
            title: 'title',
            dataIndex: 'title',
        },
        {
            title: 'fn_sku',
            dataIndex: 'fnsku',
        },
        {
            title: 'store_name',
            dataIndex: 'store_name',
        }
    ]
    return (<>
        <ProTable<listItem>
            rowSelection={{
                onChange: (_, selectedRows) => {
                    console.log(selectedRows)
                    setSelectedRowKeys(selectedRows)
                }
            }}
            columns={columns}
            actionRef={actionRef}
            request={async (params = {}, sort, filter) => {
                const { data } = await getSkuList({
                    ...params,
                    page: params.current,
                    len: params.pageSize,
                });
                return {
                    data: data.data,
                    success: true,
                    total: data.total,
                };
            }}
            rowKey="ts_sku"
            search={{
                labelWidth: 'auto',
            }}
            pagination={{
                pageSize: 10,
            }}
            dateFormatter="string"
            headerTitle="List"
            toolBarRender={() => [
                <Button disabled={!selectedRowKeys.length} key="3" type="primary" onClick={showModal}>Create shipment</Button>
            ]}
        />
        <Modal
            title="Create shipment"
            visible={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width={800}
            footer={[
                <Button key="back" type='primary' onClick={deBugCurrentStepFun} icon={<CaretRightOutlined />} loading={runLoading} >Run</Button>,
                <Button type="primary" disabled={!(current > 0)} key={'Previous'} onClick={() => prev()}>Previous</Button>,
                <Button type="primary" disabled={!(current < steps.length - 1)} key={'Next'} onClick={() => next()}>Next</Button>,
                <Button type="primary" disabled={!(current === steps.length - 1)} key={'Done'} onClick={() => message.success('Processing complete!')}>Done</Button>
            ]}>
            <Steps current={current}>
                {steps.map(item => (
                    <Step key={item.title} title={<span style={{ 'fontSize': '12px' }}>{item.title}</span>} />
                ))}
            </Steps>
            <div className={styles['steps-content']}>
                {shipmentId ? <p><h3 style={{ 'marginBottom': '20px', 'textAlign': 'center' }}>ShipmentId: <span style={{ 'fontSize': '24px' }}>{shipmentId}</span></h3></p> : null}
                {steps[current].step === '1' && <div>{createShipmentForm}</div>}
                {/* {steps[current].step === '2' && <div>{putTransportDetailsForm}</div>} */}
                {steps[current].step === '2' && <div>{putCartonContentsForm}</div>}
                {steps[current].step === '3' && <div>{printpackingListForm}</div>}
                {steps[current].step === '4' && <div>{updatePackageByFileForm}</div>}
                {steps[current].step === '5' && <div>{getLablesForm}</div>}
                {steps[current].step === '6' && <div>6</div>}
            </div>
            <div className="steps-action">
                <Collapse
                    defaultActiveKey={["1"]}
                    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
                    <Panel header="Response message" key="1">
                        {resMsg[current] ? <Text code>{resMsg[current]}</Text> : <Text code>no response message</Text>}
                    </Panel>
                </Collapse>
            </div>
        </Modal>
    </>
    )
}





const App: React.FC = () => (
    <div style={{ 'background': '#fff', 'padding': '8px' }}>
        <Tabs style={{ 'paddingLeft': '12px' }}>
            <Tabs.TabPane tab={<span><UnorderedListOutlined />List</span>} key="1">
                <ListTable />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span><BellOutlined />Logs</span>} key="2">
                Logs
            </Tabs.TabPane>
        </Tabs>
    </div>
);

export default App;