import { getQueryVariable } from '@/utils/utils'
import { useState, useEffect, useMemo, useRef } from 'react'
import type { ShipmentDetailsItem } from '@/services/removalOrder'
import { getShipmentDetails, checkShipment, saveCheck } from '@/services/removalOrder'
import { Radio, message, Upload, Modal, Button, Table, Image, Select, Space, Spin } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import { VerticalAlignBottomOutlined, PlusOutlined } from '@ant-design/icons';
import { getToken } from '@/utils/token'
import { exportPDFWithFont } from '@/utils/utils';
import type { SelectProps } from 'antd/es/select';
import debounce from 'lodash/debounce';


export interface DebounceSelectProps<ValueType = any>
    extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
    fetchOptions: (search: string) => Promise<ValueType[]>;
    debounceTimeout?: number;
}


function DebounceSelect<
    ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
>({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps<ValueType>) {
    const [fetching, setFetching] = useState(false);
    const [options, setOptions] = useState<ValueType[]>([]);
    const fetchRef = useRef(0);

    const debounceFetcher = useMemo(() => {
        const loadOptions = (value: string) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);

            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }

                setOptions(newOptions);
                setFetching(false);
            });
        };

        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            {...props}
            options={options}
        />
    );
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

const getImageUrl = (baseUrl: string) => {
    return 'http://api-rp.itmars.net/storage/' + baseUrl
}

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
        const fileName = item.file_name.split('/').pop();
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
        }
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
                action="http://api-rp.itmars.net/removalOrder/uploadImage"
                headers={{ authorization: 'authorization-text', token: getToken() }}
                data={{ id: record?.uuid }}
                fileList={fileList}
                listType="picture-card"
                multiple={true}
                disabled={isView}
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


const GetTitle = (props: { title: string, data: ShipmentDetailsItem[], callBack?: (data: ShipmentDetailsItem[]) => void, width: number, titleValue?: any }) => {
    const { title, data, callBack, width = 120, titleValue } = props
    const [titleObj] = useState<any>({ pops: title === 'Match' ? matchProps : title === 'Claim' ? claimProps : conditionProps })
    const [value, setValue] = useState<string>(titleValue)
    const changeAllPop = (value: string) => {
        const tempData = data.map(item => {
            return {
                ...item,
                [title.toLocaleLowerCase()]: value,
            }
        })
        callBack(tempData)
    }
    useEffect(() => {
        setValue(titleValue)
        changeAllPop(titleValue)
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
    // view
    const [view] = useState<boolean>(getQueryVariable('view') === 'true')
    const [claim] = useState<boolean>(getQueryVariable('claim') === 'true')
    const [data, setData] = useState<ShipmentDetailsItem[]>([])
    const [dataLoading, setDataLoading] = useState<boolean>(false)
    const [saveLoading, setSaveLoading] = useState<boolean>(false)
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
                return item.msku
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
        { title: 'MSKU(Amazon)', dataIndex: 'msku', key: 'msku', width: 180, ellipsis: true },
        { title: 'SKU(NetSuite)', dataIndex: 'sku', key: 'sku', width: 180, ellipsis: true },
        { title: 'FNSKU', dataIndex: 'fnsku', key: 'fnsku', width: 150 },
        {
            title: 'Quantity',
            dataIndex: 'shipped_quantity',
            key: 'quantity',
            width: 80
        },
        {
            title: view ? 'Match' : <GetTitle title={'Match'} data={data} callBack={setData} width={70} titleValue={claim ? '-1' : ''} />,
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
            title: view ? 'Condition' : <GetTitle title={'Condition'} data={data} callBack={setData} width={110} />,
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
            title: view ? 'Claim' : <GetTitle title={'Claim'} data={data} callBack={setData} width={120} titleValue={claim ? 'Invalid Tracking' : ''} />,
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
                    <a onClick={() => {
                        exportPDFWithFont([record.msku], { width: 66.675, height: 25.4 });
                    }}>Print Barcode</a>
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
                        match: claim ? '-1' : item.match,
                        claim: claim ? 'Invalid Tracking' : item.claim,
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
    return (<>
        <Spin spinning={saveLoading}>
            <Table
                loading={dataLoading}
                columns={columns}
                id='uuid'
                size='small'
                pagination={false}
                bordered
                expandable={{
                    // 默认展开所有行
                    expandedRowKeys: data.map(item => item.uuid),
                    expandIcon: () => null
                }}
                scroll={{ x: columns.reduce((total, item) => total + Number(item.width || 0), 0) }}
                dataSource={data}
            />
            <div style={{ 'textAlign': 'right', 'marginTop': '10px' }}>
                {!view && (<Space >
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