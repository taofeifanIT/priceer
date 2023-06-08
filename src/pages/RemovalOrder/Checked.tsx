import { getQueryVariable } from '@/utils/utils'
import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import type { ShipmentDetailsItem } from '@/services/removalOrder'
import { getShipmentDetails, checkShipment } from '@/services/removalOrder'
import { Radio, message, Upload, Modal, Form, Button, Divider, Table, Image, Select, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusCircleFilled, UploadOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { getToken } from '@/utils/token'
import { barCodeSizeGroup } from '@/pages/shipment/enumeration';
import { newExportPDF } from '@/utils/utils';

const claimProps = [
    { label: 'Missing Parts', value: 'Missing Parts' },
    { label: 'Wrong Product', value: 'Wrong Product' },
    { label: 'Empty Box', value: 'Empty Box' }
]

const conditionProps = [
    { label: 'New', value: 'New' },
    { label: 'Open Box', value: 'Open Box' },
    { label: 'Used', value: 'Used' },
    { label: 'Doa', value: 'Doa' }
]

const matchProps = [
    { label: 'Yes', value: '1' },
    { label: 'No', value: '-1' },
]

// const imageUploadProps = [
//     { name: 'image1', title: 'Shiping lable' },
//     { name: 'image2', title: 'Packing slip' },
//     { name: 'image3', title: 'LPN stick' },
//     { name: 'image4', title: 'Actual product image' },
//     { name: 'image5', title: 'Actual product model lable' },
//     { name: 'image6', title: 'Damaged photo' },
// ]


const UploadImageModel = forwardRef((props: { callback: (value: any, record: ShipmentDetailsItem) => void }, ref) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [targetItem, setTargetItem] = useState<ShipmentDetailsItem>({} as ShipmentDetailsItem)
    const [form] = Form.useForm();
    // 定义函数用于根据选中的值更新状态
    const handleUploadChange = (info: { fileList: string | any[]; }) => {
        if (info.fileList.length > 50) {  // 限制上传图片数量为 6 张
            message.error('You can only upload up to 6 images!')
            return;
        }
    };
    const handleOk = () => {
        form.validateFields().then(async (values: any) => {
            const fileList = values.images.fileList.map(({ response }: any) => {
                return {
                    file_name: response.data.file_name,
                    thumb_name: response.data.thumb_name,
                }
            })
            setIsModalVisible(false);
            form.resetFields()
            props.callback(fileList, targetItem)
        }).catch((e) => {
            console.log(e)
        })
    };

    useImperativeHandle(ref, () => ({
        showModal: (record: ShipmentDetailsItem) => {
            setIsModalVisible(true)
            setTargetItem(record)
            console.log(record)
        }
    }));
    return (
        <>
            <Modal
                width={515}
                title={'check'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => { setIsModalVisible(false) }}
            >
                <Form
                    layout={"horizontal"}
                    form={form}
                >
                    <Form.Item colon={false} name={'images'} rules={[{ required: true }]}>
                        <Upload
                            accept=".jpg, .jpeg, .png"
                            action="http://api-rp.itmars.net/removalOrder/uploadImage"
                            headers={{ authorization: 'authorization-text', token: getToken() }}
                            data={{ id: targetItem.uuid }}
                            listType="picture"
                            multiple={true}
                            onChange={handleUploadChange}
                            maxCount={100}
                        >
                            <Button icon={<UploadOutlined />} style={{ width: "470px" }}>Upload</Button>
                        </Upload>
                    </Form.Item>
                    {/* {imageUploadProps.map(imgItem => {
                        return (<>
                            <Form.Item key={imgItem.name} label="" name={imgItem.name} rules={[{ required: true }]}>
                                <Upload
                                    accept=".jpg, .jpeg, .png"
                                    action="http://api-rp.itmars.net/removalOrder/uploadImage"
                                    headers={{ authorization: 'authorization-text', token: getToken() }}
                                    listType="picture"
                                    onChange={handleUploadChange}
                                    maxCount={1}
                                >
                                    <Button icon={<UploadOutlined />} style={{ width: "470px" }}>{imgItem.title}</Button>
                                </Upload>
                            </Form.Item>
                            <Divider />
                        </>)
                    })} */}
                </Form>
            </Modal >
        </>
    );
});


const PrintBarCodeModal = forwardRef((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [items, setItems] = useState<any>([]);
    useImperativeHandle(ref, () => ({
        showModal: (ShipmentDetailsItem: string[]) => {
            setVisible(true);
            // 加上printQuantity
            const tempData = ShipmentDetailsItem.map((item: any) => {
                return {
                    ...item,
                    printQuantity: 1,
                }
            })
            setItems(tempData);
        }
    }));
    const createBarCode = async () => {
        const { width, height } = barCodeSizeGroup[0]
        const fileName = items.map((item: any) => item.msku).join('_')
        newExportPDF('viewBarCode', items, { width: parseFloat(width), height: parseFloat(height) }, fileName);
    };
    return (<>
        <Modal open={visible} onCancel={() => setVisible(false)} width={640} title='Bar code' onOk={createBarCode} okText='Print'>
            <div id={'viewBarCode'}>
                {items.map((item: any) => {
                    return (<>
                        <Divider />
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            {/* <div>
                                <img src={item.bar_code} style={parseInt(barCodeSizeGroup[0].height) < 30 ? { 'height': '100px', 'width': '100%' } : undefined} />
                            </div> */}
                            <div style={{ fontSize: '50px', margin: '8px 0', fontWeight: '600' }}>
                                {item.msku}
                            </div>
                        </div>
                    </>)
                })}
            </div>
        </Modal>
    </>)
});


const GetTitle = (props: { title: string, data: ShipmentDetailsItem[], callBack: (data: ShipmentDetailsItem[]) => void }) => {
    const { title, data, callBack } = props
    const [titleObj] = useState<any>({ pops: title === 'Match' ? matchProps : title === 'Claim' ? claimProps : conditionProps })
    const changeAllPop = (value: string) => {
        const tempData = data.map(item => {
            return {
                ...item,
                [title.toLocaleLowerCase()]: value,
            }
        })
        callBack(tempData)
    }
    return <>
        <div style={{ 'paddingLeft': '2%' }}>{title}</div><div>
            <Select size='small' style={{ 'width': '120px' }} onChange={(val) => {
                changeAllPop(val)
            }}>
                {titleObj.pops.map((item: any) => {
                    return <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                })}
            </Select>
        </div>
    </>
}

export default () => {
    // 读取链接中的参数
    const [trackingNumber] = useState<string>(getQueryVariable('tracking_number'))
    const [data, setData] = useState<ShipmentDetailsItem[]>([])
    const [dataLoading, setDataLoading] = useState<boolean>(false)
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const uploadImageModelRef: any = useRef<any>();
    const printBarcodeModal: any = useRef();
    const changePop = (value: string, key: string, record: ShipmentDetailsItem) => {
        const tempData = data.map(item => {
            if (item.uuid === record.uuid) {
                return {
                    ...item,
                    [key]: value,
                }
            }
            return item
        })
        setData(tempData)
    }

    const handleOk = () => {
        const tempData = {
            content: [...data.map(item => {
                return {
                    id: item.id,
                    uuid: item.uuid,
                    match: item.match,
                    claim: item.claim,
                    condition: item.condition,
                    images: item.images?.map((imgItem: any) => {
                        return imgItem.file_name
                    })
                }
            })]
        }
        setSaveLoading(true)
        checkShipment(tempData).then(res => {
            if (res.code) {
                message.success('Checked successfully')
            } else {
                throw res.msg
            }
        }).catch((e) => {
            message.error(e)
        }).finally(() => {
            setSaveLoading(false)
        })
    };

    const downloadAllSKu = () => {
        return <>Action <a onClick={() => {
            printBarcodeModal.current.showModal(data)
        }}><VerticalAlignBottomOutlined /></a></>
    }

    const columns: ColumnsType<ShipmentDetailsItem> = [
        {
            title: 'Image',
            dataIndex: 'sku_icon',
            key: 'sku_icon',
            width: 100,
            render: (text, record) => {
                return (
                    <Image
                        width={50}
                        src={record.sku_icon}
                        preview={{
                            src: record.sku_image,
                        }}
                    />
                );
            },
        },
        { title: 'SKU', dataIndex: 'msku', key: 'msku', width: 150 },
        { title: 'FNSKU', dataIndex: 'fnsku', key: 'fnsku', width: 150 },
        {
            title: 'Quantity',
            dataIndex: 'shipped_quantity',
            key: 'quantity',
            width: 80
        },
        {
            title: <GetTitle title={'Match'} data={data} callBack={setData} />,
            dataIndex: 'atch',
            key: 'match',
            width: 200,
            render: (_, record) => {
                return (<>
                    <Radio.Group value={record.match} onChange={(e) => {
                        changePop(e.target.value, 'match', record)
                    }}>
                        <Radio value={'1'}>Yes</Radio>
                        <Radio value={'-1'}>No</Radio>
                    </Radio.Group>
                </>)
            }
        },
        {
            title: <GetTitle title={'Condition'} data={data} callBack={setData} />,
            dataIndex: 'condition',
            key: 'condition',
            width: 300,
            render: (_, record) => {
                return (<>
                    <Select style={{ 'width': '140px' }} disabled={record.match !== '1'} value={record.condition} onChange={(val) => {
                        changePop(val, 'condition', record)
                    }}>
                        {conditionProps.map(item => {
                            return <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                        })}
                    </Select>
                </>)
            }
        },
        {
            title: <GetTitle title={'Claim'} data={data} callBack={setData} />,
            dataIndex: 'claim',
            key: 'claim',
            width: 225,
            render: (_, record) => {
                return (<>
                    <Select style={{ 'width': '140px' }} disabled={record.match !== '-1'} value={record.claim} onChange={(val) => {
                        changePop(val, 'claim', record)
                    }}>
                        {claimProps.map(item => {
                            return <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
                        })}
                    </Select>
                </>)
            }
        },
        {
            title: 'Images',
            dataIndex: 'images',
            key: 'images',
            width: 300,
            render: (_, record) => {
                return (<>
                    {record.images?.length > 0 ? (
                        <>
                            <div style={{ overflowX: 'auto', width: '300px', WebkitOverflowScrolling: 'touch' }}>
                                <div style={{ width: record.images.length * 104 }}>
                                    <Image.PreviewGroup>
                                        {record.images.map((image, index: number) => (
                                            <span
                                                key={image.thumb_name}
                                                style={{ 'marginRight': index !== record.images.length ? 4 : 0 }}>
                                                <Image
                                                    width={100}
                                                    style={{ 'width': '100px', 'height': '90px' }}
                                                    preview={{ src: `http://api-rp.itmars.net/storage/${image.file_name}` }}
                                                    src={`http://api-rp.itmars.net/storage/${image.thumb_name}`} />
                                            </span>
                                        ))}
                                    </Image.PreviewGroup>
                                </div>
                            </div>
                        </>
                    ) : <Button style={{ 'width': '200px' }} disabled={record.match !== '-1'} icon={<PlusCircleFilled />} onClick={() => {
                        uploadImageModelRef.current.showModal(record)
                    }}>upload pictures</Button>}

                </>)
            }
        },
        {
            title: downloadAllSKu(),
            dataIndex: 'action',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => {
                return (<>
                    <a onClick={() => {
                        printBarcodeModal.current.showModal([record])
                    }}>DownLoad BarCode</a>
                </>)
            }
        }
    ];

    const initData = () => {
        setDataLoading(true)
        getShipmentDetails({ tracking_number: trackingNumber }).then(res => {
            if (res.code) {
                const tempData = res.data.map((item: ShipmentDetailsItem) => {
                    return {
                        ...item,
                        key: item.uuid,
                        claimData: [{ claim: '', image: [] }],
                        conditionData: [{ condition: '' }],
                    }
                })
                setData(tempData)
            } else {
                throw res.msg
            }
        }).catch((e) => {
            message.error(e)
        }).finally(() => {
            setDataLoading(false)
        })
    }

    useEffect(() => {
        if (trackingNumber) {
            initData()
        }
    }, [])
    return (<> <Table
        loading={dataLoading}
        columns={columns}
        id='uuid'
        size='small'
        pagination={{ position: ['bottomCenter'], pageSize: data.length }}
        expandable={{
            // 默认展开所有行
            expandedRowKeys: data.map(item => item.uuid),
            expandIcon: () => null
        }}
        scroll={{ x: columns.reduce((total, item) => total + Number(item.width || 0), 0) }}
        dataSource={data}
    />
        <div style={{ 'textAlign': 'right' }}>
            <Button type="primary" loading={saveLoading} onClick={handleOk}>Save</Button>
        </div>
        <UploadImageModel callback={(value, record) => {
            changePop(value, 'images', record)
        }} ref={uploadImageModelRef} />
        <PrintBarCodeModal ref={printBarcodeModal} />
    </>)
}