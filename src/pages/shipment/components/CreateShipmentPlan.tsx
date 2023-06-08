import { getInfo as storeAddress } from '@/services/basePop'
import { MinusCircleOutlined, PrinterOutlined, PlusCircleOutlined, CaretRightOutlined, EyeTwoTone, LoadingOutlined } from '@ant-design/icons';
import { Button, Divider, Form, Input, InputNumber, message, Select, Space, Tag, Spin, Popconfirm, Tooltip, Modal } from 'antd';
import { useRef, useState, useEffect } from 'react';
import { LabelPrepPreference, PrepInstruction, PrepOwner, shipToCountryCode } from '../enumeration';
import type { AddressItem, ListItem } from '@/services/shipment';
import PrintBarCodeModal from './PrintBarCodeModal';
import { createShipment, createShipmentPlan, getPrepInstructions, getItemEligibilityPreview } from '@/services/shipment';
const { Option } = Select;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 8 },
};


const ItemEligibilityPreview = (props: { asin: string }) => {
    const { asin } = props;
    const [loading, setLoading] = useState(false);
    const showConfirm = () => {
        setLoading(true);
        getItemEligibilityPreview({ asin }).then((res) => {
            if (res.code !== 1) {
                throw res.msg;
            }
            const { data } = res;
            let viewStr = 'isEligibleForProgram:' + data.isEligibleForProgram;
            if (!data.isEligibleForProgram) {
                viewStr += '\nineligibilityReasonList:' + data.ineligibilityReasonList.join(',');
            }
            Modal.confirm({
                title: 'Item Eligibility Preview',
                icon: <EyeTwoTone />,
                content: viewStr,
            });
        }).catch((err) => {
            message.error(JSON.stringify(err), 10);
        }).finally(() => {
            setLoading(false);
        });
    };
    return <>
        <Tooltip title="Item Eligibility Preview">
            {loading ? <LoadingOutlined /> : <EyeTwoTone onClick={showConfirm} />}
        </Tooltip>
    </>
};

const CreateShipmentPlan = (props: { selectedRowKeys: ListItem[], addressInfo: AddressItem, setShipmentId: (shipment_id: string) => void, setStepResMsg: (current: number, msg: string) => void, isEdit?: boolean }) => {
    const { selectedRowKeys, addressInfo, setShipmentId, setStepResMsg, isEdit = false } = props;
    const [getAddressLoading, setAddressLoading] = useState(false);
    const [createShipmentformRef] = Form.useForm();
    const [address, setAddress] = useState<AddressItem[]>([addressInfo].filter(a => a));
    const [itemDetail, setItemDetail] = useState<ListItem[]>([...selectedRowKeys]);
    const printBarcodeModal: any = useRef();
    const setFisrstAddress = (address: AddressItem[]) => {
        createShipmentformRef.setFieldsValue({
            name: address[0].name,
            addressLine1: address[0].address_line1,
            addressLine2: address[0].address_line2,
            districtOrCounty: address[0].district_or_county,
            city: address[0].city,
            stateOrProvinceCode: address[0].state_or_province_code,
            countryCode: address[0].country_code,
            postalCode: address[0].postal_code,
        });
    }
    const getStoreAddress = () => {
        setAddressLoading(true);
        storeAddress().then((res) => {
            if (res.code === 0) {
                message.error(JSON.stringify(res));
                return;
            }
            const { data } = res;
            setAddress(data);
            if (data.length > 0) {
                setFisrstAddress(data);
            }
        }).finally(() => {
            setAddressLoading(false);
        });
    }
    const addPrepDetails = (index: number) => {
        const temp: any = [...itemDetail];
        let prepDetailsList = temp[index].prepDetailsList
        if (!prepDetailsList) {
            prepDetailsList = []
        }
        prepDetailsList.push({
            prepInstruction: 'Labeling',
            prepOwner: 'SELLER',
        });

        temp[index].prepDetailsList = prepDetailsList
        setItemDetail(temp);
    }
    const removePrepDetails = (index: number, index2: number) => {
        const temp: any = [...itemDetail];
        temp[index].prepDetailsList.splice(index2, 1);
        setItemDetail(temp);
    }
    const printBarcodeFn = () => {
        if (itemDetail.filter(item => !item.quantityForm).length > 0) {
            message.error('Please input quantity!');
            return
        }
        printBarcodeModal.current?.showModal(itemDetail);
    }
    const toCreateShipment = async (values: any) => {
        setAddressLoading(true);
        let msg = '';
        try {
            const res = await createShipmentPlan(values);
            if (res.code != 0) {
                msg = JSON.stringify(res) + '\n';
                const shipmentIds = res.data.map((item: any) => {
                    return item.ShipmentId
                }).join(",")
                const subRes = await createShipment(shipmentIds);
                msg += JSON.stringify(subRes);
                if (subRes.code != 0) {
                    setShipmentId(shipmentIds);
                    setAddressLoading(false);
                    message.success('CreateShipment success!');
                } else {
                    message.error(JSON.stringify(subRes));
                    setAddressLoading(false);
                }
            } else {
                setAddressLoading(false);
                message.error(JSON.stringify(res));
                msg = JSON.stringify(res);
            }
        } catch (error) {
            message.error(JSON.stringify(error));
            setAddressLoading(false);
        }
        setStepResMsg(0, msg);
    };
    const createPlan = () => {
        createShipmentformRef
            .validateFields()
            .then((values) => {
                const tempValues = {
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
    }
    const getPrepInstructionsData = () => {
        setAddressLoading(true);
        getPrepInstructions({
            sku: itemDetail.map(item => item.ts_sku).join(",")
        }).then(res => {
            if (res.code === 0) {
                message.error(JSON.stringify(res));
                setStepResMsg(0, JSON.stringify(res));
                return;
            }
            const { SKUPrepInstructionsList } = res.data;
            const temp: any = [...itemDetail];
            temp.forEach((item: any) => {
                const SKUPrepInstructions = SKUPrepInstructionsList.find((subItem: any) => subItem.SellerSKU === item.ts_sku)
                if (SKUPrepInstructions) {
                    item.prepDetailsList = SKUPrepInstructions.PrepInstructionList.map((prepItem: string) => {
                        return {
                            prepInstruction: prepItem,
                            prepOwner: 'SELLER',
                        }
                    })
                }
            })
            setItemDetail(temp);
            setStepResMsg(0, JSON.stringify(res));
        }).catch(error => {
            message.error(JSON.stringify(error));
            setStepResMsg(0, JSON.stringify(error));
        }).finally(() => {
            setAddressLoading(false);
        })
    }
    useEffect(() => {
        if (address.length) {
            setFisrstAddress(address);
        } else {
            getStoreAddress();
        }
    }, []);
    return (<>
        <PrintBarCodeModal ref={printBarcodeModal} />
        <Spin spinning={getAddressLoading}>
            <Form {...layout} form={createShipmentformRef}>
                <Form.Item name='shipToCountryCode' label="ShipToCountryCode" rules={[{ required: false }]} initialValue={""}>
                    <Select>
                        <Option value="">Default</Option>
                        {shipToCountryCode.map((item) => {
                            return (
                                <Select.OptGroup key={item.title} label={item.title}>
                                    {item.value.map((subItem) => {
                                        return (
                                            <Option key={subItem} value={subItem}>
                                                {subItem}
                                            </Option>
                                        );
                                    })}
                                </Select.OptGroup>
                            );
                        })}
                    </Select>
                </Form.Item>
                <Divider style={{ 'height': '10px', 'background': '#fff', 'borderTop': '.75px solid #e7dfdf', 'borderBottom': '.75px solid #e7dfdf' }} />
                {address.length > 0 && (<Form.Item name='address_id' label="Address list" initialValue={address[0].id}>
                    <Select allowClear onChange={(val) => {
                        if (!val) {
                            return;
                        }
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
                                <Select.Option key={item.id} value={item.id}>
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
                                <Option key={item} value={item}>
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
                <Button onClick={getPrepInstructionsData} style={{ 'float': 'right', 'marginBottom': '10px', 'marginTop': '-10px', 'marginRight': '10px' }} type='primary' size='small'>Get prepInstructions</Button>
                <Form.List name="goods">
                    {(fields) => {
                        return (
                            <>
                                {itemDetail.map((field, name) => (<>
                                    <Space
                                        key={field.ts_sku}
                                        style={{ width: '1550px', 'marginBottom': '-14px' }}
                                        align="center"
                                        size={15}
                                    >
                                        <span style={{ 'marginLeft': '125px' }}>Sku:</span><Input disabled style={{ 'width': '100px' }} value={field.ts_sku} />
                                        <span>Asin:</span><Input disabled value={field.asin} style={{ 'width': '100px' }} />
                                        <span>Quantity:</span><InputNumber value={field.quantityForm} onChange={(val) => {
                                            const newDetail: any = [...itemDetail];
                                            newDetail[name].quantityForm = val;
                                            setItemDetail(newDetail);
                                        }} />
                                        <Tooltip placement="top" title={'Add PrepDetails'}>
                                            <PlusCircleOutlined onClick={() => addPrepDetails(name)} />
                                        </Tooltip>
                                        <ItemEligibilityPreview asin={field.asin} />
                                    </Space>
                                    <div>
                                        {field.prepDetailsList?.map((item, index) => {
                                            return <div key={`div${index + 1}`} style={{ 'marginTop': '20px' }}>
                                                <Space >
                                                    {index === 0 && <span style={{ 'marginLeft': '125px' }}>PrepDetails:</span>}
                                                    <Select style={{ 'width': '170px', 'marginLeft': index > 0 ? '206px' : 0 }} value={item.prepInstruction} onChange={(val) => {
                                                        const newDetail: any = [...itemDetail];
                                                        newDetail[name].prepDetailsList[index].prepInstruction = val;
                                                        setItemDetail(newDetail);
                                                    }}>
                                                        {PrepInstruction.map((subItem) => {
                                                            return <Option key={subItem} value={subItem}>{subItem}</Option>
                                                        })}
                                                    </Select>
                                                    <Select value={item.prepOwner} onChange={(val) => {
                                                        const newDetail: any = [...itemDetail];
                                                        newDetail[name].prepDetailsList[index].prepOwner = val;
                                                        setItemDetail(newDetail);
                                                    }}>
                                                        {PrepOwner.map((subItem) => {
                                                            return <Option key={subItem} value={subItem}>{subItem}</Option>
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
            {!isEdit && <div style={{ 'textAlign': 'center', 'margin': '20px 0 20px 0' }}>
                <Button
                    key="back"
                    type="primary"
                    onClick={createPlan}
                    icon={<CaretRightOutlined />}
                >
                    Run
                </Button>
            </div>}
        </Spin></>)
}
export default CreateShipmentPlan;