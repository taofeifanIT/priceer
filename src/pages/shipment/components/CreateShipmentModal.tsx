import {
    createShipment,
    createShipmentPlan,
    getLabels,
    printBarCode,
    downloadTemplate,
    updateShipment,
    putTransportDetails,
    putCartonContents,
    updatePackage,
    saveInRealTime,
    getTrackingdetail,
    confirmTransport,
    estimateTransport
} from '@/services/shipment';
import { getInfo as storeAddress } from '@/services/basePop'
import styles from '@/styles/modules/shipment.less';
import { getGlobalParams } from '@/utils/globalParams';
import { getToken } from '@/utils/token';
import { createDownload, exportPDF } from '@/utils/utils';
import {
    CaretRightOutlined,
    InboxOutlined,
    MinusCircleOutlined,
    PlusOutlined,
    PrinterOutlined,
    ClearOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
    Button,
    Collapse,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Select,
    Space,
    Steps,
    Tabs,
    Typography,
    Upload,
    Tag,
    Spin,
    Checkbox,
    Popconfirm,
    Tooltip,
} from 'antd';
import 'antd/dist/antd.css';
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { getCountry } from '@/utils/globalParams';
const { Step } = Steps;

const { Panel } = Collapse;

const { Text } = Typography;

const { Option } = Select;

const { Dragger } = Upload;

const { TabPane } = Tabs;

type listItem = {
    asin: string;
    ts_sku: string;
    fnsku: string;
    quantity: number;
    title: string;
    conditionType: string;
    productType: string;
    itemName: string;
    store_id: number;
    store_name: string;
    quantityForm?: number;
    quantityInCaseForm?: number;
    printQuantity?: number;
    prepDetailsList?: { prepInstruction: string, prepOwner: string }[];
};

type addressItem = {
    id: number;
    name: string;
    address_line1: string;
    address_line2: string;
    district_or_county: string;
    city: string;
    state_or_province_code: string;
    postal_code: string;
    country_code: string;
}

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
};

const barCodeSizeGroup = [
    { title: '30 UP Labels 1" X 2-5/8" on US Letter', width: '66.675', height: '25.4' },
    { title: '21-up labels 63.5mm x 38.1mm on A4', width: '63.5', height: '38.1' },
    { title: '24-up labels 63.5mm x 33.9mm on A4', width: '63.5', height: '33.9' },
    { title: '24-up labels 64.6mm x 33.8mm on A4', width: '64.6', height: '33.8' },
    { title: '24-up labels 66mm x 33.9mm on A4', width: '66', height: '33.9' },
    { title: '24-up labels 66mm x 35mm on A4', width: '66', height: '35' },
    { title: '24-up labels 70mm x 36mm on A4', width: '70', height: '36' },
    { title: '24-up labels 70mm x 37mm on A4', width: '70', height: '37' },
    { title: '24-up labels 70mm x 40mm on A4', width: '70', height: '40' },
    { title: '27-up labels 63.5mm x 29.6mm on A4', width: '63.5', height: '29.6' },
    { title: '40-up labels 52.5mm x 29.7mm on A4', width: '52.5', height: '29.7' },
    { title: '44-up labels 48.5mm x 25.4mm on A4', width: '48.5', height: '25.4' },
]

const carrierNameGroup = [
    'DHL_EXPRESS_USA_INC',
    'FEDERAL_EXPRESS_CORP',
    'UNITED_STATES_POSTAL_SERVICE',
    'UNITED_PARCEL_SERVICE_INC',
    'Amazon partnered',
    'other',
]

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
    'PackageLabel_Thermal_No_Carrier_Rotation',
];

const labelType = ['BARCODE_2D', 'UNIQUE', 'PALLET'];

const steps = [
    {
        title: 'CreateShipment',
        step: '1',
    },
    {
        title: 'PutCartonContents',
        step: '2',
    }
];

const LabelPrepPreference = [
    "SELLER_LABEL",
    "AMAZON_LABEL_ONLY",
    "AMAZON_LABEL_PREFERRED"
]

const PrepInstruction = [
    "Polybagging",
    "BubbleWrapping",
    "Taping",
    "BlackShrinkWrapping",
    "Labeling",
    "HangGarment"
]

const PrepOwner = [
    "AMAZON",
    "SELLER"
]

const FnBtn = (props: { title: string; api: any; params: any, callback: (msg: string) => void, ghost?: boolean }) => {
    const { title, api, params, callback, ghost } = props;
    const [loading, setLoading] = useState(false);
    const checkProductQuantityShipped = () => {
        const { treeForm, itemDetail } = params;
        let skuObj = {};
        let msg = '';
        itemDetail.forEach((item: any) => {
            if (!skuObj[item.ts_sku]) {
                skuObj[item.ts_sku] = 0;
            }
            skuObj[item.ts_sku] += item.quantityForm;
        });
        let treeFormSkuObj = {};
        treeForm.forEach((item: any) => {
            item.products.forEach((subItem: any) => {
                if (!treeFormSkuObj[subItem.sku]) {
                    treeFormSkuObj[subItem.sku] = 0;
                }
                treeFormSkuObj[subItem.sku] += subItem.quantityShipped;
            })
        });
        //  判断数量是否相等
        let isSame = true;
        for (let key in skuObj) {
            if (skuObj[key] !== treeFormSkuObj[key]) {
                isSame = false;
                msg = `SKU: ${key} quantity is not equal!`;
                break;
            }
        }
        return {
            isSame,
            msg,
        }
    }
    const checkSubmitTransport = () => {
        const { treeForm, carrierName } = params;
        let msg = '';
        // 判断treeForm的属性值是否为空
        let isSame = true;
        treeForm.forEach((item: any) => {
            if (!item.trackingId || !item.weight_value || !item.weight_unit || !item.dimensions_length || !item.dimensions_width || !item.dimensions_height || !item.dimensions_unit) {
                isSame = false;
                msg = 'Please fill in the required information!';
                return;
            }
        });
        // 判断carrierName是否为空
        if (!carrierName) {
            isSame = false;
            msg = 'Please choose a carrier!';
        }
        return {
            isSame,
            msg,
        }
    }
    const processeParams = () => {
        let tempParams: any = {};
        const { shipmentId, carrierName, treeForm } = params;
        switch (title) {
            case 'Put transportDetails':
                tempParams = {
                    shipment_id: shipmentId,
                    carrierName: carrierName,
                    packages: treeForm.map((_, index: number) => {
                        return {
                            tracking_id: "deFault0000" + index + 0,
                            weight_value: 10,
                            weight_unit: "pounds",
                            dimensions_length: 10,
                            dimensions_width: 10,
                            dimensions_height: 10,
                            dimensions_unit: "inches"
                        }
                    }),
                }
                break;
            case 'Put cartonContent':
                tempParams = {
                    shipment_id: shipmentId,
                    items: treeForm.map((item: any) => {
                        return {
                            cartonId: item.cartonId,
                            products: item.products
                        }
                    }),
                }
                break;
            case 'Submit transport':
                tempParams = {
                    shipment_id: shipmentId,
                    carrierName: carrierName,
                    packages: treeForm.map((item: any) => {
                        return {
                            tracking_id: item.trackingId,
                            weight_value: item.weight_value,
                            weight_unit: item.weight_unit,
                            dimensions_length: item.dimensions_length,
                            dimensions_width: item.dimensions_width,
                            dimensions_height: item.dimensions_height,
                            dimensions_unit: item.dimensions_unit
                        }
                    }),
                }
                break;
            case 'Submit Excel':
                tempParams = {
                    shipment_id: shipmentId,
                    items: treeForm.map((item: any) => {
                        return {
                            weight_value: item.weight_value,
                            weight_unit: item.weight_unit,
                            dimensions_length: item.dimensions_length,
                            dimensions_width: item.dimensions_width,
                            dimensions_height: item.dimensions_height,
                            dimensions_unit: item.dimensions_unit
                        }
                    }),
                }
                break;
            case 'Update shipment':
                tempParams = {
                    shipment_id: shipmentId
                }
                break;
            case 'Get transportDetails':
                tempParams = {
                    shipment_id: shipmentId
                }
                break;
            default:
                tempParams = {
                    shipment_id: shipmentId
                }
                break;
        }
        return tempParams;
    };
    const resquestApi = () => {
        if (title === 'Put cartonContent') {
            let result = checkProductQuantityShipped();
            if (!result.isSame) {
                message.error(JSON.stringify(result.msg));
                callback(JSON.stringify(result.msg));
                return;
            }
        }
        if (title === 'Submit transport') {
            let result = checkSubmitTransport();
            if (!result.isSame) {
                message.error(JSON.stringify(result.msg));
                callback(JSON.stringify(result.msg));
                return;
            }
        }
        // return
        let params = processeParams()
        setLoading(true);
        api(params).then((res: any) => {
            setLoading(false);
            if (res.code !== 0) {
                message.success(res.msg);
            } else {
                message.error(res.msg);
            }
            callback(JSON.stringify(res));
        })
    }
    return (
        <Button size='small' style={{ 'marginLeft': '5px', 'marginTop': '5px' }} ghost={ghost} type={ghost ? 'primary' : 'default'} loading={loading} onClick={resquestApi}>{title}</Button>
    )
}

const PrintBarCodeModal = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [barcodeObj, setBarcodeObj] = useState<any>([]);
    const [barCodeSize, setBarCodeSize] = useState<any>(barCodeSizeGroup[8]);
    const [details, setDetails] = useState<listItem[]>([]);
    const [printSkus, setPrintSkus] = useState<string[]>([]);
    useImperativeHandle(ref, () => ({
        showModal: (selectedRowKeys: listItem[]) => {
            setVisible(true);
            setDetails(selectedRowKeys);
            setPrintSkus(selectedRowKeys.map((item: listItem) => item.ts_sku));
        }
    }));
    const createBarCode = () => {
        setLoading(true);
        const { width, height } = barCodeSize
        let promises = printSkus.map((sku) => {
            return printBarCode({ sku: sku });
        });
        Promise.all(promises).then((res: any) => {
            let flag = true;
            res.forEach((item: any) => {
                if (item.code != 1) {
                    flag = false;
                }
            });
            if (flag) {
                let tempData = res.map((item: any, index: number) => {
                    return { fnSku: item.data.fnSku, barCode: item.data.barcode, title: item.data.title, printQuantity: details[index].quantityForm, conditionType: details[index].conditionType };
                });
                setBarcodeObj(tempData);
                exportPDF('viewBarCode', tempData, { width, height });
                message.success('PrintBarCode success!');
            } else {
                message.error('PrintBarCode fail!');
            }
        }).finally(() => {
            setLoading(false);
        });
    };
    const changeSize = (value: any) => {
        const target = barCodeSizeGroup.find((item) => item.title === value);
        setBarCodeSize(target);
    }
    return (<>
        <Modal open={visible} onCancel={() => setVisible(false)} width={640} title='Bar code'>
            <Spin spinning={loading}>
                <Space>
                    <span style={{ 'width': '40px', 'display': 'inline-block' }}>Size:</span>
                    <Select style={{ 'width': '430px' }} defaultValue={'24-up labels 70mm x 40mm on A4'} onChange={changeSize}>
                        {barCodeSizeGroup.map((item) => {
                            return <Option value={item.title}>{item.title}</Option>
                        })}
                    </Select>
                    <Button type='primary' onClick={createBarCode}>Download PDF</Button>
                </Space>
                <Space style={{ 'marginTop': '10px' }}>
                    <span style={{ 'width': '40px', 'display': 'inline-block' }}>Skus:</span>
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: '430px' }}
                        placeholder="Please select"
                        defaultValue={printSkus}
                        onChange={(skus) => {
                            setPrintSkus(skus);
                        }}
                        options={details.map((item) => {
                            return { label: item.ts_sku, value: item.ts_sku }
                        })}
                    />
                </Space>
                <div id={'viewBarCode'}>
                    {barcodeObj.map((item: any) => {
                        return (<><Divider />
                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                <div>
                                    <img src={item.barCode} style={barCodeSize.height < 30 ? { 'height': '100px', 'width': '100%' } : undefined} />
                                </div>
                                <div style={{ fontSize: '30px', margin: '8px 0', fontWeight: '600' }}>
                                    {item.fnSku}
                                </div>
                                <p style={{ fontSize: '26px', fontWeight: '700' }}><Text ellipsis>{item.conditionType + '—' + item.title}</Text></p>
                            </div>
                        </>)
                    })}
                </div>
            </Spin>
        </Modal>
    </>)
});

const PrintLablesModal = forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);
    const [getLablesFormRef] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [shipmentId, setShipmentId] = useState('');
    const [cartonIds, setCartonIds] = useState<string[]>([]);
    useImperativeHandle(ref, () => ({
        showModal: (cartonIdArray: string[], spid: string) => {
            setVisible(true);
            setShipmentId(spid);
            setCartonIds(cartonIdArray);
        }
    }));
    const getLables = () => {
        getLablesFormRef
            .validateFields()
            .then((values) => {
                let params = {
                    shipment_id: shipmentId,
                    ...values,
                    package_labels_to_print: values.package_labels_to_print.toString(),
                };
                setLoading(true);
                getLabels(params).then((res) => {
                    if (res.code === 0) {
                        message.error(JSON.stringify(res), 10);
                        return;
                    }
                    const { data } = res;
                    const { DownloadURL } = data;
                    createDownload('lables', DownloadURL);
                }).finally(() => {
                    setLoading(false);
                });
            })
            .catch((errorInfo) => {
                message.error(JSON.stringify(errorInfo));
            });
    }
    return (<>
        <Modal
            open={visible}
            okText={'GetLables'}
            confirmLoading={loading}
            onOk={getLables}
            onCancel={() => setVisible(false)}
            width={640}
            title='Get lables'>
            <Form {...layout} form={getLablesFormRef}>
                <Form.Item
                    name="page_type"
                    label="Page type"
                    rules={[{ required: true }]}
                    initialValue={'PackageLabel_A4_4'}
                >
                    <Select style={{ width: '100%' }}>
                        {pageType.map((item: any) => {
                            return <Option value={item}>{item}</Option>;
                        })}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="label_type"
                    label="Label type"
                    rules={[{ required: true }]}
                    initialValue={'UNIQUE'}
                >
                    <Select style={{ width: '100%' }}>
                        {labelType.map((item: any) => {
                            return <Option value={item}>{item}</Option>;
                        })}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="package_labels_to_print"
                    label="Package labels to print"
                    rules={[{ required: true }]}
                    initialValue={cartonIds.map((cartonId) => cartonId)}
                >
                    <Checkbox.Group>
                        {cartonIds.map((cartonId: string, index: number) => {
                            return (
                                <Checkbox key={index} value={cartonId}>
                                    {cartonId}
                                </Checkbox>
                            );
                        })}
                    </Checkbox.Group>
                </Form.Item>
            </Form>
        </Modal>
    </>)
});

const CreateShipmentModal = forwardRef((props: { selectedRowKeys: listItem[], shipment_id?: string, addressInfo?: any, formData?: any }, ref) => {
    const { selectedRowKeys, shipment_id, addressInfo = undefined } = props;
    const printBarcodeModal: any = useRef();
    const printLablesModal: any = useRef();
    const [itemDetail, setItemDetail] = useState<listItem[]>(selectedRowKeys.map((item) => {
        return {
            ...item,
            prepDetailsList: [
                {
                    prepInstruction: "Labeling",
                    prepOwner: "SELLER"
                }
            ]
        }
    }));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createShipmentformRef] = Form.useForm();
    const [current, setCurrent] = useState(0);
    const [runLoading, setRunLoading] = useState(false);
    const [resMsg, setResMsg] = useState<string[]>(['', '', '']);
    const [shipmentId, setShipmentId] = useState(shipment_id); // FBA15D7Y6JQT
    const [treeForm, setFreeForm] = useState<any>([]);
    const [tabKey, setTabKey] = useState('1');
    const [address, setAddress] = useState<addressItem[]>([]);
    const [carrierName, setCarrierName] = useState('other');
    const [getAddressLoading, setGetAddressLoading] = useState(false);
    const [carton_number, setCarton_number] = useState<number>(1);
    const [isEdit, setIsEdit] = useState(false);
    const [shipToAddress, setShipToAddress] = useState<any>({});
    const [amount, setAmount] = useState<{
        CurrencyCode: string,
        Value: number
    }>({ CurrencyCode: '', Value: 0 });
    const timerRef: any = useRef(-1)
    useImperativeHandle(ref, () => ({
        showModal: (params?: any) => {
            if (params) {
                const { formData, selectedRowKeys, shipment_id, ship_to_address } = params
                const { carrierName, packages } = formData
                setShipmentId(shipment_id)
                setFreeForm(packages || [])
                setCarrierName(carrierName)
                setCarton_number(packages?.length)
                setItemDetail(selectedRowKeys)
                setIsEdit(true)
                setShipToAddress(ship_to_address)
                setCurrent(1)
            }
            setIsModalOpen(true);
        }
    }));
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        setShipToAddress({})
    };
    const addCarton = () => {
        let lastItem = treeForm[treeForm.length - 1];
        let cartonId = 'U000001'
        if (lastItem) {
            cartonId = 'U' + String(Number(lastItem.cartonId.slice(1)) + 1).padStart(6, '0');
        }
        const country = getCountry()
        setFreeForm([
            ...treeForm,
            {
                trackingId: '',
                weight_value: '',
                weight_unit: country === 'US' ? 'pounds' : 'kilograms',
                dimensions_length: '',
                dimensions_width: '',
                dimensions_height: '',
                dimensions_unit: country === 'US' ? 'inches' : 'centimeters',
                cartonId: cartonId,
                products: [
                    { sku: '', quantityShipped: '', quantityInCase: 1, fnSku: '' }
                ]
            },
        ]);
    };
    const removeCarton = (index: number) => {
        treeForm.splice(index, 1);
        setFreeForm([...treeForm]);
    };
    const removeProduct = (index: number, index2: number) => {
        if (treeForm[index].products.length === 1) {
            message.error('At least one product');
            return;
        }
        treeForm[index].products.splice(index2, 1);
        setFreeForm([...treeForm]);
    };
    const addProduct = (index: number) => {
        let lastItem = treeForm[index].products[treeForm[index].products.length - 1];
        // 校验lastItem属性值是否都有值
        if (lastItem && (!lastItem.quantityShipped || !lastItem.sku)) {
            message.error('Empty parameters are found. Please fill in the parameter values！');
            return;
        }
        const newTreeForm = [...treeForm];
        newTreeForm[index].products.push({ sku: '', quantityShipped: '', quantityInCase: 1, fnSku: '' });
        setFreeForm(newTreeForm);
    };
    const changeFreeFormPop = (index: number, key: string, value: any) => {
        const newTreeForm = [...treeForm];
        newTreeForm[index][key] = value;
        setFreeForm(newTreeForm);
    };
    const changeProductPop = (index: number, index2: number, value: any, key: string) => {
        const newTreeForm = [...treeForm];
        newTreeForm[index].products[index2][key] = value;
        if (key === 'sku') {
            const item = itemDetail.find((item) => item.ts_sku === value)
            if (item) {
                newTreeForm[index].products[index2].fnSku = item.fnsku
            }
        }
        setFreeForm(newTreeForm);
    };
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
        setStepResMsg(current, msg);
    };
    const setStepResMsg = (index: number, msg: string) => {
        let newResMsg = [...resMsg];
        newResMsg[index] += msg;
        setResMsg(newResMsg);
    };
    const next = () => {
        setCurrent(current + 1);
    };
    const saveParams = () => {
        let tempValues = {
            shipment_id: shipmentId,
            carrierName: carrierName,
            items: treeForm
        }
        setRunLoading(true);
        saveInRealTime(tempValues).then(res => {
            if (res.code == 0) {
                message.error(JSON.stringify(res));
            }
        }).finally(() => {
            setRunLoading(false);
        });
    }
    const deBugCurrentStepFun = () => {
        switch (current + 1) {
            case 1:
                createShipmentformRef
                    .validateFields()
                    .then((values) => {
                        let tempValues = {
                            ...values,
                            goods: itemDetail.map(item => {
                                return {
                                    sellerSKU: item.ts_sku,
                                    asin: item.asin,
                                    quantity: item.quantityForm,
                                    quantityInCase: 1,
                                    prepDetailsList: item.prepDetailsList
                                }
                            })
                        }
                        toCreateShipment(tempValues);
                    })
                    .catch((errorInfo) => {
                        console.log(errorInfo);
                    });
                break;
            case 2:
                saveParams();
                break;
        }
    };
    const fileProps: UploadProps = {
        name: 'file',
        multiple: false,
        action: 'http://api-rp.itmars.net/shipment/submitDataByFile',
        maxCount: 1,
        data: {
            shipment_id: shipmentId,
            store_id: getGlobalParams()['store_id'],
        },
        headers: {
            authorization: 'authorization-text',
            token: getToken() as any,
        },
        onChange(info) {
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                const res = info.file.response;
                if (res.code === 0) {
                    message.error(JSON.stringify(res));
                } else {
                    message.success(`${info.file.name} file uploaded successfully`);
                    const { data, CarrierName } = info.file.response.data;
                    setCarrierName(CarrierName);
                    setFreeForm(data);
                }
                setStepResMsg(current, JSON.stringify(info.file.response));
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };
    const getStoreAddress = () => {
        setGetAddressLoading(true);
        storeAddress().then((res) => {
            if (res.code === 0) {
                message.error(JSON.stringify(res));
                return;
            }
            const { data } = res;
            setAddress(data);
            if (data.length > 0) {
                createShipmentformRef.setFieldsValue({
                    name: data[0].name,
                    addressLine1: data[0].address_line1,
                    addressLine2: data[0].address_line2,
                    districtOrCounty: data[0].district_or_county,
                    city: data[0].city,
                    stateOrProvinceCode: data[0].state_or_province_code,
                    countryCode: data[0].country_code,
                    postalCode: data[0].postal_code,
                });
            }
        }).finally(() => {
            setGetAddressLoading(false);
        });
    }
    const prev = () => {
        setCurrent(current - 1);
    };
    const printBarcodeFn = () => {
        if (itemDetail.filter(item => !item.quantityForm).length > 0) {
            message.error('Please input quantity!');
            return
        }
        printBarcodeModal.current?.showModal(itemDetail);
    }
    const downLoadTemplateFn = () => {
        downloadTemplate({ shipment_id: shipmentId, carton_number: carton_number }).then((res) => {
            if (res.code) {
                const { data } = res;
                createDownload('template.xlsx', data);
            } else {
                message.error(res.msg);
            }
        });
    }
    const clearStepResMsg = (index: number) => {
        let newResMsg = [...resMsg];
        newResMsg[index] = '';
        setResMsg(newResMsg);
    }
    const genExtra = () => (
        <ClearOutlined
            onClick={event => {
                event.stopPropagation();
                clearStepResMsg(current);
            }}
        />
    );
    const addPrepDetails = (index: number) => {
        let temp: any = [...itemDetail];
        temp[index].prepDetailsList.push({
            prepInstruction: 'Labeling',
            prepOwner: 'SELLER',
        });
        setItemDetail(temp);
    }
    const removePrepDetails = (index: number, index2: number) => {
        let temp: any = [...itemDetail];
        temp[index].prepDetailsList.splice(index2, 1);
        setItemDetail(temp);
    }
    const createShipmentForm: any = (
        <Spin spinning={getAddressLoading}>
            <Form {...layout} form={createShipmentformRef}>
                {address.length > 0 && (<Form.Item name='address_id' label="Address list" initialValue={address[0].id}>
                    <Select onChange={(val) => {
                        const tempAddress = address.filter(item => item.id === val)[0];
                        createShipmentformRef.setFieldsValue({
                            name: tempAddress.name,
                            addressLine1: tempAddress.address_line1,
                            addressLine2: tempAddress.address_line2,
                            districtOrCounty: tempAddress.district_or_county,
                            city: tempAddress.city,
                            stateOrProvinceCode: tempAddress.state_or_province_code,
                            countryCode: tempAddress.country_code,
                            postalCode: tempAddress.postal_code,
                        });
                    }}>
                        {address.map((item) => {
                            return (
                                <Select.Option value={item.id}>
                                    {item.name + '\n' + item.address_line1}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>)}
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="addressLine1" label="AddressLine1" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="addressLine2" label="AddressLine2" rules={[{ required: false }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="districtOrCounty" label="DistrictOrCounty" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="city" label="City" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    name="stateOrProvinceCode"
                    label="StateOrProvinceCode"
                    rules={[{ required: true }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="countryCode" label="CountryCode" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="postalCode" label="PostalCode" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="labelPrepPreference" label="LabelPrepPreference" rules={[{ required: true }]} initialValue={'SELLER_LABEL'}>
                    <Select>
                        {LabelPrepPreference.map((item) => {
                            return (
                                <Option value={item}>
                                    {item}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
                <Form.Item name="memo" label="Memo" rules={[{ required: false }]}>
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Divider />
                <Form.List name="goods">
                    {(fields, { add, remove }) => {
                        return (
                            <>
                                {itemDetail.map((field, name) => (<>
                                    <Space
                                        key={field.ts_sku + name}
                                        style={{ width: '1550px', 'marginBottom': '-14px' }}
                                        align="center"
                                        size={15}
                                    >
                                        <span style={{ 'marginLeft': '125px' }}>Sku:</span><Input disabled style={{ 'width': '100px' }} value={field.ts_sku} />
                                        <span>Asin:</span><Input disabled value={field.asin} style={{ 'width': '100px' }} />
                                        <span>Quantity:</span><InputNumber value={field.quantityForm} onChange={(val) => {
                                            let newDetail: any = [...itemDetail];
                                            newDetail[name].quantityForm = val;
                                            setItemDetail(newDetail);
                                        }} />
                                        <Tooltip placement="top" title={'Add PrepDetails'}>
                                            <PlusCircleOutlined onClick={() => addPrepDetails(name)} />
                                        </Tooltip>
                                    </Space>
                                    <div>
                                        {field.prepDetailsList?.map((item, index) => {
                                            return <div style={{ 'marginTop': '20px' }}>
                                                <Space >
                                                    {index === 0 && <span style={{ 'marginLeft': '125px' }}>PrepDetails:</span>}
                                                    <Select style={{ 'width': '170px', 'marginLeft': index > 0 ? '206px' : 0 }} value={item.prepInstruction} onChange={(val) => {
                                                        let newDetail: any = [...itemDetail];
                                                        newDetail[name].prepDetailsList[index].prepInstruction = val;
                                                        setItemDetail(newDetail);
                                                    }}>
                                                        {PrepInstruction.map((subItem) => {
                                                            return <Option value={subItem}>{subItem}</Option>
                                                        })}
                                                    </Select>
                                                    <Select value={item.prepOwner} onChange={(val) => {
                                                        let newDetail: any = [...itemDetail];
                                                        newDetail[name].prepDetailsList[index].prepOwner = val;
                                                        setItemDetail(newDetail);
                                                    }}>
                                                        {PrepOwner.map((subItem) => {
                                                            return <Option value={subItem}>{subItem}</Option>
                                                        })}
                                                    </Select>
                                                    <Popconfirm title="Are you sure delete this prepDetails?" onConfirm={() => removePrepDetails(name, index)}>
                                                        <MinusCircleOutlined />
                                                    </Popconfirm>
                                                </Space>
                                            </div>
                                        })}
                                    </div>
                                    <div style={{ 'padding': '0 16px 0 16px', 'marginBottom': '10px', marginTop: '15px' }}>
                                        {field.fnsku && (<Tag color="#2db7f5">{field.fnsku}</Tag>)}
                                        {field.conditionType && (<Tag color="#87d068">{field.conditionType}</Tag>)}
                                        {field.productType && (<Tag color="#108ee9">{field.productType}</Tag>)}
                                        {field.itemName && (<span title={field.itemName} style={{ 'background': '#f9f0ff', 'color': '#991dbe', 'border': '.5px solid #d3adf7' }}>{field.itemName}</span>)}
                                    </div>
                                </>))}
                            </>
                        )
                    }}
                </Form.List>
            </Form>
            <div style={{ 'textAlign': 'center', 'margin': '20px 0 20px 0' }}>
                <Button
                    style={{ 'background': '#a1a0a0', 'color': '#fff' }}
                    icon={<PrinterOutlined />}
                    onClick={() => {
                        printBarcodeFn();
                    }}>
                    Print bar code
                </Button>
            </div>
        </Spin>
    );

    const btnGroup = (<div style={{ 'marginBottom': '10px' }}>
        <FnBtn title='Put transportDetails' api={putTransportDetails} params={{ shipmentId, carrierName, treeForm }} callback={(msg) => {
            setStepResMsg(current, resMsg[current] + msg);
        }} />
        <FnBtn title='Put cartonContent' api={putCartonContents} params={{ shipmentId, carrierName, treeForm, itemDetail }} callback={(msg) => {
            setStepResMsg(current, resMsg[current] + msg);
        }} />
        <Button
            size='small'
            style={{ 'background': '#a1a0a0', 'color': '#fff', 'marginLeft': '5px', 'marginTop': '5px' }}
            icon={<PrinterOutlined />}
            onClick={() => {
                printLablesModal.current?.showModal(treeForm.map((item: any) => item.cartonId), shipmentId);
            }}>
            Print labels
        </Button>
        <FnBtn title='Submit transport' api={putTransportDetails} params={{ shipmentId, carrierName, treeForm }} callback={(msg) => {
            setStepResMsg(current, resMsg[current] + msg);
        }} />
        {carrierName === 'Amazon partnered' && (<>
            <FnBtn title='Estimate transport' api={estimateTransport} params={{ shipmentId }} ghost callback={(msg) => {
                setStepResMsg(current, resMsg[current] + msg);
            }} />
            <FnBtn title='Confirm transport' api={confirmTransport} params={{ shipmentId }} ghost callback={(msg) => {
                setStepResMsg(current, resMsg[current] + msg);
            }} />
            <FnBtn title='Get trackingdetail' api={getTrackingdetail} params={{ shipmentId }} ghost callback={(msg) => {
                const { data } = JSON.parse(msg);
                try {
                    setAmount(data.TransportContent.TransportDetails.PartneredSmallParcelData.PartneredEstimate.Amount);
                } catch (error) {
                    setStepResMsg(current, resMsg[current] + JSON.stringify(error));
                }
                setStepResMsg(current, resMsg[current] + msg);
            }} />
        </>)}
        <FnBtn title='Submit Excel' api={updatePackage} params={{ shipmentId, carrierName, treeForm }} callback={(msg) => {
            setStepResMsg(current, resMsg[current] + msg);
        }} />
        <FnBtn title='Update shipment' api={updateShipment} params={{ shipmentId, carrierName, treeForm }} callback={(msg) => {
            setStepResMsg(current, resMsg[current] + msg);
        }} />
        <FnBtn title='Get transportDetails' api={getTrackingdetail} params={{ shipmentId }} callback={(msg) => {
            const { data } = JSON.parse(msg);
            try {
                setAmount(data.TransportContent.TransportDetails.PartneredSmallParcelData.PartneredEstimate.Amount);
            } catch (error) {
                setStepResMsg(current, resMsg[current] + JSON.stringify(error));
            }
            setStepResMsg(current, resMsg[current] + msg);
        }} />
    </div>)

    const shipToAddressTable = (<div style={{ 'marginBottom': '10px', 'textAlign': 'center' }}>
        {/* <table style={{ 'display': 'inline-block' }} border="1">
            {Object.keys(shipToAddress).map((key) => {
                return <th>{key}</th>
            })}
            <tbody>
                <tr>
                    {Object.values(shipToAddress).map((value: any) => {
                        return <td align='left'>{value}</td>
                    })}
                </tr>
            </tbody>
        </table> */}
        <h3>{['AddressLine1', 'AddressLine1', 'City', 'StateOrProvinceCode', 'PostalCode', 'CountryCode'].map(item => {
            let fh = ' ';
            if (shipToAddress[item]) {
                if (item === 'City' || item === 'CountryCode' || item === 'StateOrProvinceCode') {
                    fh = ','
                }
                return fh + shipToAddress[item]
            }
        })}</h3>
        <Divider />
    </div>)

    const putCartonContentsForm: any = (
        <>
            <Tabs defaultActiveKey={tabKey} onChange={(key) => {
                setTabKey(key);
            }}>
                <TabPane tab={<span style={{ 'marginLeft': '30px' }}>Form</span>} key="1">
                    <>
                        {(shipToAddress !== '{}' && JSON.stringify(shipToAddress) !== '{}') && shipToAddressTable}
                        <Space style={{ 'marginBottom': '10px', 'paddingLeft': '138px' }}>
                            <span>Carrier name ：</span>
                            <Select style={{ 'width': '273px' }} value={carrierName} onChange={setCarrierName}>
                                {carrierNameGroup.map((item) => {
                                    return (
                                        <Select.Option value={item}>
                                            {item}
                                        </Select.Option>
                                    );
                                })}
                            </Select>
                        </Space>
                        <Divider />
                        {treeForm.map((item: any, index: number) => {
                            return (<>
                                {index !== 0 && <Divider />}
                                <span style={{ 'position': 'absolute', 'left': '10px', 'color': '#bdb5b5', 'fontSize': '26px' }}>{item.cartonId}</span>
                                <div style={{ marginTop: index > 0 ? 10 : 0, paddingLeft: '100px' }}>
                                    <Space>
                                        <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Tracking ID ：</span>
                                        <Input
                                            value={item.trackingId}
                                            style={{ 'width': '273px' }}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                changeFreeFormPop(index, 'trackingId', value);
                                            }}
                                        />
                                        <Popconfirm title="Are you sure delete this carton?" onConfirm={() => removeCarton(index)}>
                                            <MinusCircleOutlined />
                                        </Popconfirm>
                                    </Space>
                                    <Space style={{ 'marginTop': '10px' }}>
                                        <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Weight ：</span>
                                        <InputNumber value={item.weight_value} onChange={(val) => changeFreeFormPop(index, 'weight_value', val)} />
                                    </Space>
                                    <Space style={{ 'marginTop': '10px' }}>
                                        <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Weight unit ：</span>
                                        <Select value={item.weight_unit} allowClear style={{ 'width': '88px' }} defaultValue={'pounds'} onChange={(val) => changeFreeFormPop(index, 'weight_unit', val)}>
                                            <Option value="pounds">pounds</Option>
                                            <Option value="other">kilograms</Option>
                                        </Select>
                                    </Space>
                                    <Space style={{ 'marginTop': '10px' }}>
                                        <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Dimensions length ：</span>
                                        <InputNumber value={item.dimensions_length} onChange={(val) => changeFreeFormPop(index, 'dimensions_length', val)} />
                                    </Space>
                                    <Space style={{ 'marginTop': '10px' }}>
                                        <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Dimensions width ：</span>
                                        <InputNumber value={item.dimensions_width} onChange={(val) => changeFreeFormPop(index, 'dimensions_width', val)} />
                                    </Space>
                                    <Space style={{ 'marginTop': '10px' }}>
                                        <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Dimensions height ：</span>
                                        <InputNumber value={item.dimensions_height} onChange={(val) => changeFreeFormPop(index, 'dimensions_height', val)} />
                                    </Space>
                                    <Space style={{ 'marginTop': '10px' }}>
                                        <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right' }}>Dimensions unit ：</span>
                                        <Select value={item.dimensions_unit} allowClear style={{ 'width': '88px' }} defaultValue={'inches'} onChange={(val) => changeFreeFormPop(index, 'dimensions_unit', val)}>
                                            <Option value="inches">inches</Option>
                                            <Option value="other">centimeters</Option>
                                        </Select>
                                    </Space>
                                    <div style={{ marginTop: '20px' }}>
                                        {item.products.map((product: any, productIndex: number) => {
                                            return (<>
                                                <Space style={{ marginTop: productIndex > 0 ? 10 : 0, width: '600px' }}>
                                                    <span style={{ marginLeft: '10px' }}>Sku ：</span>
                                                    <Select
                                                        style={{ width: '120px' }}
                                                        value={product.sku}
                                                        onChange={(value) => {
                                                            changeProductPop(index, productIndex, value, 'sku');
                                                        }}
                                                    >
                                                        {selectedRowKeys.map(({ ts_sku }) => {
                                                            return <Option value={ts_sku}>{ts_sku}</Option>;
                                                        })}
                                                    </Select>
                                                    <span>quantityShipped ：</span>
                                                    <InputNumber
                                                        style={{ width: '65px' }}
                                                        value={product.quantityShipped}
                                                        onChange={(value) => {
                                                            changeProductPop(index, productIndex, value, 'quantityShipped');
                                                        }}
                                                    />
                                                    {productIndex === 0 && (<PlusCircleOutlined onClick={() => addProduct(index)} />)}
                                                    <Popconfirm title="Are you sure delete this product?" onConfirm={() => removeProduct(index, productIndex)}>
                                                        <MinusCircleOutlined />
                                                    </Popconfirm>
                                                    {product.fnSku && <Tag style={{ 'marginLeft': productIndex > 0 ? '22px' : '0' }}>{product.fnSku}</Tag>}
                                                </Space>
                                            </>);
                                        })}
                                    </div>
                                </div>
                            </>);
                        })}
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <Button
                                block
                                icon={<PlusOutlined />}
                                type="dashed"
                                style={{ width: '740px', marginBottom: '10px' }}
                                onClick={() => addCarton()}
                            >
                                add carton
                            </Button>
                        </div>
                        {btnGroup}
                        <PrintLablesModal ref={printLablesModal} />
                    </>
                </TabPane>
                <TabPane tab="Excel" key="2">
                    <>
                        {(shipToAddress !== '{}' && JSON.stringify(shipToAddress) !== '{}') && shipToAddressTable}
                        <Space style={{ 'marginBottom': '10px' }}>
                            <span style={{ 'display': 'inline-block', 'width': '135px', 'textAlign': 'right', marginLeft: '140px' }}>Carton numbers</span>
                            <Input.Group compact>
                                <InputNumber style={{ 'width': '140px' }} value={carton_number} onChange={(val) => setCarton_number(val)} />
                                <Button type="primary" onClick={downLoadTemplateFn}>Download</Button>
                            </Input.Group>
                        </Space>
                        {btnGroup}
                        <Dragger {...fileProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for a single or bulk upload. Strictly prohibit from uploading company data or
                                other band files
                            </p>
                        </Dragger></>
                </TabPane>
            </Tabs>
        </>
    );

    useEffect(() => {
        if (isModalOpen && address.length === 0 && !addressInfo) {
            getStoreAddress();
        }
        if (isModalOpen && addressInfo) {
            createShipmentformRef.setFieldsValue({
                name: addressInfo.name,
                addressLine1: addressInfo.address_line1,
                addressLine2: addressInfo.address_line2,
                districtOrCounty: addressInfo.district_or_county,
                city: addressInfo.city,
                stateOrProvinceCode: addressInfo.state_or_province_code,
                countryCode: addressInfo.country_code,
                postalCode: addressInfo.postal_code,
            });
        }
    }, [isModalOpen])
    useEffect(() => {
        if (isModalOpen && treeForm.length > 0 && shipmentId && current === 1) {
            timerRef.current = setInterval(() => {
                // 打印当前时间
                console.log(new Date().toLocaleTimeString());
                saveParams();
            }, 1000 * 10)
        } else {
            clearInterval(timerRef.current);
        }
        return () => {
            clearInterval(timerRef.current);
        }
    }, [treeForm, isModalOpen])
    return (
        <>
            <Modal
                title="Create shipment"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={800}
                destroyOnClose
                footer={[
                    <Button
                        key="back"
                        type="primary"
                        onClick={deBugCurrentStepFun}
                        icon={<CaretRightOutlined />}
                        disabled={current === 0 && isEdit}
                        loading={runLoading}
                    >
                        {current > 0 ? 'Save' : 'Run'}
                    </Button>,
                    <Button type="primary" disabled={!(current > 0)} key={'Previous'} onClick={() => prev()}>
                        Previous
                    </Button>,
                    <Button
                        type="primary"
                        disabled={!(current < steps.length - 1)}
                        key={'Next'}
                        onClick={() => next()}
                    >
                        Next
                    </Button>,
                ]}
            >
                <Steps current={current}>
                    {steps?.map((item) => (
                        <Step key={item.title} title={<span style={{ fontSize: '12px' }}>{item.title}</span>} />
                    ))}
                </Steps>
                <div className={styles['steps-content']}>
                    {shipmentId ? (
                        <p>
                            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
                                ShipmentId: <span style={{ fontSize: '24px' }}>{shipmentId}</span>
                            </h3>
                        </p>
                    ) : null}
                    {(current + 1) === 1 ? <div>{createShipmentForm}</div> : null}
                    {(current + 1) === 2 ? <div>{putCartonContentsForm}</div> : null}
                </div>
                {(current === 1 && carrierName === 'Amazon partnered' && amount.CurrencyCode) && (<>
                    <div style={{ 'textAlign': 'center', 'margin': '12 5' }}>
                        <h2>{amount.CurrencyCode + ' ' + amount.Value}</h2>
                    </div>
                </>)}
                <div className="steps-action">
                    <Collapse
                        defaultActiveKey={['1']}
                        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                    >
                        <Panel header="Response message" key="1" extra={genExtra()}>
                            {resMsg[current] ? (
                                <Text code>{resMsg[current]}</Text>
                            ) : (
                                <Text code>no response message</Text>
                            )}
                        </Panel>
                    </Collapse>
                </div>
                <PrintBarCodeModal ref={printBarcodeModal} />
            </Modal>
        </>
    )
});


export default CreateShipmentModal;
