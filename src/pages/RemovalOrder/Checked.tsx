import { getQueryVariable } from '@/utils/utils'
import { useState, useEffect } from 'react'
import type { ShipmentDetailsItem } from '@/services/removalOrder'
import { getShipmentDetails, checkShipment, saveCheck, getMskuList } from '@/services/removalOrder'
import { Radio, message, Upload, Modal, Button, Table, Image, Select, Space, Spin, InputNumber, Popconfirm } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { VerticalAlignBottomOutlined, PlusOutlined } from '@ant-design/icons';
import { getToken } from '@/utils/token'
import { exportPDFWithFont } from '@/utils/utils';
import type { SelectProps } from 'antd/es/select';
import styles from './checked.less'
import { getImageUrl } from '@/utils/utils'




const SearchInput: React.FC<{ placeholder: string; style: React.CSSProperties, record: ShipmentDetailsItem, changePop: Function }> = (props) => {
    const [data, setData] = useState<SelectProps['options']>([]);
    const [value, setValue] = useState<string>(props.record.sku);
    const [fetching, setFetching] = useState<boolean>(false);
    let timeout: ReturnType<typeof setTimeout> | null;
    let currentValue: string = '';


    async function fetchMskuList(sku: string): Promise<mskuItem[]> {
        setFetching(true);
        const res = await getMskuList({ sku: sku, store_id: props.record.store_id })
        setFetching(false);
        if (res.code) {
            return res.data.map((item: mskuItem) => {
                return {
                    label: item.sku,
                    value: item.sku,
                    fnSkus: item.fnsku,
                }
            })
        }
        return []
    }

    const handleChange = (newValue: string) => {
        setValue(newValue);
        props.changePop({
            sku: newValue,
            fnsku: data.find(item => item.value === newValue)?.fnSkus
        }, props.record)
    };
    const fetch = (searchValue: string, callback: Function) => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        currentValue = searchValue;
        const fake = async () => {
            const list = await fetchMskuList(searchValue);
            if (currentValue === searchValue) {
                const result = list.map((item) => ({
                    value: item.value,
                    text: item.label,
                    fnSkus: item.fnSkus,
                }));
                callback(result);
            }

        };
        if (searchValue) {
            timeout = setTimeout(fake, 300);
        } else {
            callback([]);
        }
    };
    const handleSearch = (newValue: string) => {
        fetch(newValue, setData);
    };
    return (
        <Select
            showSearch
            value={value}
            placeholder={props.placeholder}
            style={props.style}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={handleSearch}
            onChange={handleChange}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            options={(data || []).map((d) => ({
                value: d.value,
                label: d.text,
            }))}
        />
    );
};

// Usage of DebounceSelect
interface mskuItem {
    fnSkus: any;
    value: any;
    label: any;
    sku: string;
    fnsku: string;
}


const claimProps = [
    { label: 'Wrong Brand', value: 'Worng Brand' },
    { label: 'Wrong Product', value: 'Wrong Product' },
    { label: 'Missing Parts', value: 'Missing Parts' },
    { label: 'Empty Box', value: 'Empty Box' },
    { label: 'Invalid Tracking', value: 'Invalid Tracking' },
    { label: 'Package returned to sender', value: 'Package returned to sender' },
    { label: 'Item damaged', value: 'Item damaged' },
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

const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const UploadImageModel = (props: { record: ShipmentDetailsItem, callback: (value: string, key: string, record: ShipmentDetailsItem) => void, isView: boolean }) => {
    const { record, callback, isView } = props
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<any>([...record.images.map((item: any, index: number) => {
        // 获取文件名
        const fileName = item.file_name?.split('/').pop() || 'img';
        return {
            uid: index,
            name: fileName,
            status: 'done',
            url: getImageUrl(item.file_name),
            // thumbUrl: getImageUrl(item.file_name),
            // thumb: getImageUrl(item.file_name),
            response: {
                data: {
                    file_name: item.file_name,
                    thumb_name: item.file_name,
                }
            }
        }
    })]);
    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        // 判断是否上传完成
        if (newFileList.length && newFileList.every((file: any) => file.status === 'done')) {
            const tempData = newFileList.map((item: any) => {
                return {
                    file_name: item.response.data.file_name,
                    thumb_name: item.response.data.file_name,
                }
            })
            callback(tempData, 'images', record)
            return
        }
        callback(newFileList, 'images', record)
    }
    const handleCancel = () => setPreviewOpen(false);
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };
    return (
        <>
            <Upload
                accept=".jpg, .jpeg, .png"
                action={`${API_URL}/removalOrder/uploadImage`}
                headers={{ authorization: 'authorization-text', token: getToken() }}
                data={{ id: record?.uuid }}
                fileList={fileList}
                listType="picture-card"
                multiple={true}
                disabled={isView || !record.id}
                onPreview={handlePreview}
                onChange={handleChange}
                maxCount={100}
            >
                <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                </div>
            </Upload>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};


const GetTitle = (props: { title: string, externalData: ShipmentDetailsItem[], callBack?: (data: ShipmentDetailsItem[]) => void, width: number, titleValue?: any }) => {
    const { title, externalData, callBack, width = 120, titleValue } = props
    const [titleObj] = useState<any>({ pops: title === 'Match' ? matchProps : title === 'Claim' ? claimProps : conditionProps })
    const [value, setValue] = useState<string>(titleValue)
    // const [data, setData] = useState<ShipmentDetailsItem[]>(externalData)
    const changeAllPop = (value: string) => {
        const tempData = externalData?.map(item => {
            // 如果key === match ,value === 1,清空claim
            if (title === 'Match' && value === '1') {
                return {
                    ...item,
                    [title.toLocaleLowerCase()]: value,
                    claim: '',
                }
            }
            // 如果key === match ,value === -1,清空condition
            if (title === 'Match' && value === '-1') {
                return {
                    ...item,
                    [title.toLocaleLowerCase()]: value,
                    condition: '',
                }
            }
            // 如果key === claim 清空condition
            if (title === 'Claim') {
                return {
                    ...item,
                    [title.toLocaleLowerCase()]: item.match === '-1' ? value : '',
                    condition: item.match === '-1' ? '' : item.condition,
                }
            }
            // 如果key === condition 清空claim
            if (title === 'Condition') {
                return {
                    ...item,
                    [title.toLocaleLowerCase()]: item.match === '1' ? value : '',
                    claim: item.match === '1' ? '' : item.claim,
                }
            }
            return {
                ...item,
                [title.toLocaleLowerCase()]: value,
            }
        })
        callBack(tempData)
    }
    useEffect(() => {
        setValue(titleValue)
    }, [titleValue])
    return <>
        <span style={{ 'paddingRight': '2%' }}>{title}</span>
        <Select allowClear size='small' style={{ 'width': width }} value={value} onChange={(val) => {
            setValue(val)
            changeAllPop(val)
        }}>
            {titleObj.pops.map((item: any) => {
                return <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>
            })}
        </Select>
    </>
}



export default () => {
    // 读取链接中的参数
    const [trackingNumber] = useState<string>(getQueryVariable('tracking_number'))
    // 修改history中State的值
    history.replaceState(null, '', `?tracking_number=${trackingNumber}&view=${getQueryVariable('view')}&claim=${getQueryVariable('claim')}`)

    // view
    const [view] = useState<boolean>(getQueryVariable('view') === 'true')
    const [claim] = useState<boolean>(getQueryVariable('claim') === 'true')
    const [data, setData] = useState<ShipmentDetailsItem[]>([])
    const [dataLoading, setDataLoading] = useState<boolean>(false)
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
    const changePop = (value: string, key: string, record: ShipmentDetailsItem) => {
        const tempData = data.map(item => {
            if (item.uuid === record.uuid) {
                // 如果key === match ,value === 1,清空claim
                if (key === 'match' && value === '1') {
                    return {
                        ...item,
                        [key]: value,
                        claim: '',
                    }
                }
                // 如果key === match ,value === -1,清空condition
                if (key === 'match' && value === '-1') {
                    return {
                        ...item,
                        [key]: value,
                        condition: '',
                    }
                }
                return {
                    ...item,
                    [key]: value,
                }
            }
            return item
        })
        setData(tempData)
    }
    const changePops = (params: any, record: ShipmentDetailsItem) => {
        const tempData = data.map(item => {
            if (item.uuid === record.uuid) {
                return {
                    ...item,
                    ...params,
                }
            }
            return item
        })
        setData(tempData)
    }
    const initData = () => {
        setDataLoading(true)
        getShipmentDetails({ tracking_number: trackingNumber }).then(res => {
            if (res.code) {
                const tempData = res.data.map((item: ShipmentDetailsItem) => {
                    return {
                        ...item,
                        key: item.uuid,
                        match: (claim && item.id) ? '-1' : item.match,
                        claim: (claim && item.id) ? 'Invalid Tracking' : item.claim,
                        claimData: [{ claim: '', image: [] }],
                        conditionData: [{ condition: '' }],
                        isNew: false
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
    const handleOk = (type: 'save' | 'submit') => {
        const api = type === 'save' ? saveCheck : checkShipment
        const tempData = {
            content: [...data.map(item => {
                return {
                    id: item.id,
                    uuid: item.uuid,
                    match: item.match,
                    claim: item.claim,
                    condition: item.condition,
                    quantity: item.shipped_quantity,
                    sku: item.sku,
                    fnsku: item.fnsku,
                    type: item.type,
                    images: item.images?.map((imgItem: any) => {
                        return imgItem.file_name
                    })
                }
            })]
        }
        setSaveLoading(true)
        api(tempData).then(res => {
            if (res.code) {
                message.success(res.msg)
                initData()
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
            const fonts = data.map((item) => {
                // return item.msku
                return item.sku ? item.sku : item.msku
            });
            exportPDFWithFont(fonts, { width: 66.675, height: 25.4 });
        }}><VerticalAlignBottomOutlined /></a></>
    }

    const columns: ColumnsType<ShipmentDetailsItem> = [
        {
            title: 'Image',
            dataIndex: 'sku_icon',
            key: 'sku_icon',
            width: 100,
            align: 'center',
            render: (text, record) => {
                if (record.type === 2) {
                    return <img style={{ width: '80px' }} src='/productNew.png' />
                }
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
        {
            title: 'MSKU(Amazon)',
            dataIndex: 'msku',
            key: 'msku',
            width: 180,
            ellipsis: true,
        },
        {
            title: 'SKU(NetSuite)',
            dataIndex: 'sku',
            key: 'sku',
            width: 180,
            ellipsis: true,
            render: (_, record) => {
                if (!record.id) {
                    return <SearchInput key={record.uuid} placeholder="Please input" style={{ width: '100%' }} record={record} changePop={changePops} />
                }
                return <>{record.sku}</>
            }
        },
        { title: 'FNSKU', dataIndex: 'fnsku', key: 'fnsku', width: 150 },
        {
            title: 'Quantity',
            dataIndex: 'shipped_quantity',
            key: 'quantity',
            width: 80,
            render: (_, record) => {
                if (!record.id) {
                    return <InputNumber style={{ width: 70 }} min={0} value={record.shipped_quantity} onChange={(val: any) => {
                        changePop(val, 'shipped_quantity', record)
                    }} />
                }
                return record.shipped_quantity
            }
        },
        {
            title: view ? 'Match' : <GetTitle title={'Match'} externalData={data} callBack={setData} width={70} titleValue={claim ? '-1' : ''} />,
            dataIndex: 'match',
            key: 'match',
            width: 135,
            render: (_, record) => {
                return (<>
                    <Radio.Group style={{ width: '135px' }} disabled={view} value={record.match} onChange={(e) => {
                        changePop(e.target.value, 'match', record)
                    }}>
                        <Radio value={'1'}>Yes</Radio>
                        <Radio value={'-1'}>No</Radio>
                    </Radio.Group>
                </>)
            }
        },
        {
            title: view ? 'Condition' : <GetTitle title={'Condition'} externalData={data} callBack={setData} width={110} />,
            dataIndex: 'condition',
            key: 'condition',
            width: 195,
            align: 'center',
            render: (_, record) => {
                return (<>
                    <Select style={{ 'width': '110px', 'textAlign': 'left' }} disabled={record.match !== '1'} value={record.condition} onChange={(val) => {
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
            title: view ? 'Claim' : <GetTitle title={'Claim'} externalData={data} callBack={setData} width={120} titleValue={claim ? 'Invalid Tracking' : ''} />,
            dataIndex: 'claim',
            key: 'claim',
            width: 185,
            align: 'center',
            render: (_, record) => {
                return (<>
                    <Select style={{ 'width': '140px', 'textAlign': 'left' }} disabled={record.match !== '-1'} value={record.claim} onChange={(val) => {
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
                return <UploadImageModel record={record} callback={changePop} isView={view} />
            }
        },
        {
            title: downloadAllSKu(),
            dataIndex: 'action',
            key: 'action',
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => {
                return (<>
                    {record.msku && <a onClick={() => {
                        exportPDFWithFont([record.sku ? record.sku : record.msku], { width: 66.675, height: 25.4 });
                    }}>Print Barcode</a>}
                    {
                        record.id === 0 && <Popconfirm
                            title="Delete the data"
                            description="Are you sure to delete this data?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => {
                                const tempData = data.filter(item => item.uuid !== record.uuid)
                                setData(tempData)
                            }}
                        >
                            <a style={{ color: 'red', display: 'block' }}>Delete</a>
                        </Popconfirm>
                    }
                </>)
            }
        }
    ];
    const handleAdd = () => {
        const tempData = [...data]
        tempData.push({
            uuid: Math.random().toString(36),
            match: '1',
            claim: '',
            claimData: [{ claim: '', image: [] }],
            conditionData: [{ condition: '' }],
            type: 2,
            id: 0,
            msku: '',
            fnsku: '',
            shipped_quantity: 1,
            sku_icon: '',
            sku_image: '',
            condition: '',
            images: [],
            bar_code: '',
            memo_images: '',
            sku: '',
            store_id: data[0].store_id,
        })
        setData(tempData)
    }

    useEffect(() => {
        if (trackingNumber) {
            initData()
        }
    }, [])
    return (<>
        <Spin spinning={saveLoading}>
            <Table
                loading={dataLoading}
                columns={columns}
                id='uuid'
                size='small'
                pagination={false}
                bordered
                rowClassName={(record) => {
                    if (record.type === 2) {
                        return styles.newProduct
                    }
                    return ''
                }}
                expandable={{
                    // 默认展开所有行
                    // expandedRowKeys: data.map(item => item.uuid),
                    // expandIcon: () => null
                }}
                scroll={{ x: columns.reduce((total, item) => total + Number(item.width || 0), 0) }}
                dataSource={data}
            />
            <div style={{ 'textAlign': 'right', 'marginTop': '10px' }}>
                {!view && (<Space >
                    <Button type='primary' icon={<PlusOutlined />} onClick={() => {
                        handleAdd()
                    }}>Add</Button>
                    <Button onClick={() => {
                        handleOk('save')
                    }}>Save</Button>
                    <Button type="primary" onClick={() => {
                        handleOk('submit')
                    }}>Submit</Button>
                </Space>)}
            </div>
        </Spin>
    </>)
}