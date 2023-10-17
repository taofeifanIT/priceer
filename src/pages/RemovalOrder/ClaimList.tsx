import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { Image, message, Form, Modal, Input, InputNumber, Upload, Button, Popconfirm } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import {
    getClaimListV2,
    addClaimNumber,
    addReimbursement,
    downloadInfo,
    addReimburseMoney,
    addReimburseNumber,
    editMemo,
    saveMemoImages,
    finishFail,
    editLpn,
    editShipmentId
}
    from '@/services/removalOrder'
import moment from 'moment';
import { getToken } from '@/utils/token'
import SetValueComponent from '@/components/SetValueComponent';

export type TableListItem = {
    id: number,
    store_id: number,
    ns_id: number,
    uuid: string,
    uuid_num: number,
    order_id: string,
    sku: string,
    msku: string,
    fnsku: string,
    dispostion: string
    shipment_date: string;
    shipped_quantity: number,
    carrier: string,
    tracking_number: string,
    removal_order_type: string,
    mid: string,
    seller_name: string,
    shipment_date_timestamp: number,
    overseas_removal_order_no: string,
    is_track: number,
    tracking_last_status: string,
    tracking_info: string,
    tracking_last_times: number,
    shipment_status: number,
    memo: string,
    image: string[],
    thumb: string[],
    checked_at: number,
    store_name: string,
    claim_number: string,
    reimburse_money: number,
    reimburse_number: string,
    memo_images: string[],
    memo_thumb: string[],
    shipment_id: string,
    lpn: string,
    claim_reason: string,
    claim_date: string,
}

const ShipmentStatusGroup = [
    { text: 'Pending', value: 1 },
    { text: 'Waiting', value: 2 },
    { text: 'Request more Details', value: 3 },
    { text: 'Win', value: 4 },
    { text: 'Failed', value: 5 },
]

const ActionModel = forwardRef((props: { callback: () => void }, ref) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [targetItem, setTargetItem] = useState<TableListItem>({} as TableListItem)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm();
    // 定义函数用于根据选中的值更新状态
    const handleOk = () => {
        setLoading(true)
        form.validateFields().then(async (values: any) => {
            addReimbursement({ id: targetItem.id, ...values }).then(res => {
                if (res.code) {
                    message.success('Reimburse number set successfully')
                    setIsModalVisible(false);
                    form.resetFields()
                    props.callback()
                } else {
                    throw res.msg
                }
            }).catch(err => {
                message.error(err)
            })
        }).catch((e) => {
            console.log(e)
        }).finally(() => {
            setLoading(false)
        })
    };

    useImperativeHandle(ref, () => ({
        showModal: (record: TableListItem) => {
            setIsModalVisible(true)
            setTargetItem(record)
            form.setFieldsValue({
                reimburse_number: record.reimburse_number,
                reimburse_money: record.reimburse_money
            })
        }
    }));
    return (
        <>
            <Modal
                width={515}
                title={'edit'}
                open={isModalVisible}
                onOk={handleOk}
                confirmLoading={loading}
                onCancel={() => { setIsModalVisible(false) }}
            >
                <Form
                    layout={"horizontal"}
                    form={form}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 14 }}
                >
                    <Form.Item name="reimburse_number" label="Reimburse number" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="reimburse_money" label="Reimburse money" rules={[{ required: true }]}>
                        <InputNumber style={{ 'width': '100%' }} />
                    </Form.Item>
                </Form>
            </Modal >
        </>
    );
});


const DownloadComponent = (props: { id: number, type?: number }) => {
    const { id, type } = props
    return (<>
        <Button type={type ? 'dashed' : 'primary'} icon={<DownloadOutlined />} size='small' style={{ marginBottom: '5px', width: 180 }} target='blank' href={downloadInfo(id, type)}>
            Download {type === 2 ? 'Extra Images' : 'Images'}
        </Button>
    </>)
}

const FailedComponent = (props: { id: number, shipment_status: number, refresh: () => void }) => {
    const { id, shipment_status, refresh } = props
    const [loading, setLoading] = useState(false)
    const onClick = () => {
        setLoading(true)
        finishFail({ id }).then((res: any) => {
            if (res.code) {
                message.success('Operation success')
                refresh()
            } else {
                throw res.msg
            }
        }).catch((err: any) => {
            message.error('Operation failed ' + err)
        }).finally(() => {
            setLoading(false)
        })
    }
    return (<>
        <Popconfirm
            title="Are you sure to fail?"
            description="This operation will fail the claim, please confirm whether to continue?"
            okText="Yes"
            cancelText="No"
            disabled={shipment_status === 5}
            onConfirm={onClick}
        >
            <Button danger size='small' style={{ width: 180 }} disabled={shipment_status === 5} loading={loading}>
                Failed
            </Button>
        </Popconfirm>

    </>)
}

const UploadCommonImage = (props: { record: TableListItem, refresh: () => void }) => {
    const { record, refresh } = props
    // memo_images
    const [fileList, setFileList] = useState<any[]>([...record.memo_images.map((item: string, index: number) => {
        // 获取文件名
        const fileName = item.split('/').pop()
        return {
            uid: index,
            name: fileName,
            status: 'done',
            url: `${API_URL}/storage/${item}`,
            response: {
                data: {
                    file_name: item
                }
            }
        }
    })])
    const onChange = (info: any) => {
        setFileList(info.fileList)
        const allImageStatus = info.fileList.every((item: any) => item.status === 'done')
        if (allImageStatus) {
            const { id } = record
            const images: string[] = info.fileList.map((item: any) => item.response.data.file_name)
            saveMemoImages({ id, images }).then((res: any) => {
                if (res.code) {
                    message.success('Upload success')
                    refresh()
                } else {
                    throw res.msg
                }
            }).catch((err: any) => {
                message.error('Upload failed ' + err)
                // 请求失败恢复原来的状态
                setFileList([...record.memo_images.map((item: string, index: number) => {
                    // 获取文件名
                    const fileName = item.split('/').pop()
                    return {
                        uid: index,
                        name: fileName,
                        status: 'done',
                        url: `${API_URL}/storage/${item}`,
                        response: {
                            data: {
                                file_name: item
                            }
                        }
                    }
                })])
            })
        }
    }
    return (<Upload
        accept=".jpg, .jpeg, .png"
        action={`${API_URL}/removalOrder/uploadImage`}
        headers={{ authorization: 'authorization-text', token: getToken() }}
        fileList={fileList}
        data={{ id: record.id }}
        listType="text"
        multiple={true}
        onChange={onChange}
        maxCount={50}
    >
        <Button icon={<UploadOutlined />} size='small' disabled={(record.shipment_status !== 3 && record.shipment_status !== 2) || !record.memo} style={{ width: "180px", marginBottom: '5px' }}>Upload Images</Button>
    </Upload>)

}

export default () => {
    const actionRef: any = useRef<FormInstance>();
    const actionModelRef: any = useRef<FormInstance>();
    const refresh = () => {
        actionRef.current.reload()
    }
    const columns: ProColumns<TableListItem>[] = [
        {
            title: 'Status',
            dataIndex: 'shipment_status',
            width: 100,
            valueType: 'select',
            valueEnum: {
                1: { text: 'Pending', status: 'Default' },
                2: { text: 'Waiting', status: 'Processing' },
                3: { text: 'Request more Details', status: 'Processing' },
                4: { text: 'Win', status: 'Success' },
                5: { text: 'Failed', status: 'Error' },
            },
            render: (_, record) => {
                return ShipmentStatusGroup.find((item) => item.value === record.shipment_status)?.text
            }
        },
        {
            // record.id
            title: 'Record Number',
            dataIndex: 'id',
            width: 120,
            search: false,
            align: 'center',
        },
        // claim_date
        {
            title: 'Claim Date',
            dataIndex: 'claim_date',
            width: 110,
            search: false,
        },
        {
            title: 'Store Name',
            dataIndex: 'store_name',
            valueType: 'text',
            width: 95,
            search: false,
        },
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            width: 120,
            ellipsis: true,
            valueType: 'text',
        },
        {
            title: 'Tracking Number',
            dataIndex: 'tracking_number',
            valueType: 'text',
            hideInTable: true
        },
        {
            title: 'MSKU',
            dataIndex: 'msku',
            width: 200,
            ellipsis: true,
            valueType: 'text',
        },
        {
            title: 'FNSKU',
            dataIndex: 'fnsku',
            width: 110,
            ellipsis: true,
            valueType: 'text',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            width: 200,
            ellipsis: true,
            valueType: 'text',
        },
        {
            title: 'Shipment Date',
            dataIndex: 'shipment_date',
            width: 120,
            valueType: 'text',
            search: false,
            render(_, record) {
                return (
                    <div>
                        {moment(record.shipment_date).format('YYYY-MM-DD')}
                    </div>
                );
            },
        },
        {
            title: 'QTY',
            dataIndex: 'shipped_quantity',
            width: 60,
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Carrier',
            dataIndex: 'carrier',
            width: 70,
            valueType: 'text',
            search: false,
        },
        {
            title: 'Tracking Number',
            dataIndex: 'tracking_number',
            width: 175,
            valueType: 'text',
            ellipsis: true,
            search: false,
        },
        {
            // Shipment ID
            title: 'Shipment ID',
            dataIndex: 'shipment_id',
            width: 150,
            search: false,
            render: (_, record) => {
                return <SetValueComponent id={record.id} editKey={'shipment_id'} value={record.shipment_id} api={editShipmentId} refresh={refresh} />
            }
        },
        {
            title: 'LPN',
            dataIndex: 'lpn',
            width: 150,
            search: false,
            render: (_, record) => {
                return <SetValueComponent id={record.id} editKey={'lpn'} value={record.lpn} api={editLpn} refresh={refresh} />
            }
        },
        {
            title: 'Images',
            dataIndex: 'images',
            width: 220,
            search: false,
            render: (_, record) => {
                return (
                    <div style={{ overflowX: 'auto', width: '200px', WebkitOverflowScrolling: 'touch' }}>
                        <div style={{ width: record.image.length * 54 }}>
                            <Image.PreviewGroup>
                                {record.thumb.map((image: string, index: number) => (
                                    <span key={image} style={{ 'marginRight': index !== record.image.length ? 4 : 0 }}><Image width={50} preview={{ src: `${API_URL}/storage/${record.image[index]}` }} key={image} src={`${API_URL}/storage/${image}`} /></span>
                                ))}
                            </Image.PreviewGroup>
                        </div>
                    </div>
                )
            }
        },
        {
            title: 'Claim Reason',
            dataIndex: 'claim_reason',
            width: 120,
            valueType: 'text',
            search: false,
        },
        {
            title: 'Claim ID',
            dataIndex: 'claim_number',
            width: 140,
            valueType: 'text',
            search: false,
            ellipsis: true,
            render: (_, record) => {
                return <SetValueComponent id={record.id} editKey={'claim_number'} value={record.claim_number} api={addClaimNumber} refresh={refresh} />
            }
        },
        {
            title: 'Reimbursement ID',
            dataIndex: 'reimburse_number',
            width: 140,
            valueType: 'text',
            search: false,
            ellipsis: true,
            render: (_, record) => {
                return <SetValueComponent id={record.id} editKey={'reimburse_number'} value={record.reimburse_number} api={addReimburseNumber} refresh={refresh} />
            }
        },
        {
            title: 'Reimbursement Amount(USD)',
            dataIndex: 'reimburse_money',
            width: 180,
            valueType: 'text',
            search: false,
            align: 'center',
            render: (_, record) => {
                return <SetValueComponent id={record.id} editKey={'reimburse_money'} value={record.reimburse_money} api={addReimburseMoney} refresh={refresh} />
            }
        },
        {
            // dataindex memo title Common
            title: 'Memo - Mellon',
            dataIndex: 'memo',
            width: 200,
            search: false,
            render: (_, record) => {
                // 如果 shipment_status 为 2 
                return <SetValueComponent id={record.id} editKey={'memo'} value={record.memo} api={editMemo} refresh={refresh} />
            }
        },
        {
            title: 'Additional Images',
            dataIndex: 'common',
            width: 200,
            search: false,
            render: (_, record) => {
                return (<>
                    <div style={{ overflowX: 'auto', width: '200px', WebkitOverflowScrolling: 'touch', marginBottom: '5px' }}>
                        <div style={{ width: record.memo_thumb.length * 54 }}>
                            <Image.PreviewGroup>
                                {record.memo_thumb.map((image: string, index: number) => (
                                    <span key={image} style={{ 'marginRight': index !== record.memo_thumb.length ? 4 : 0 }}><Image width={50} preview={{ src: `${API_URL}/storage/${record.memo_images[index]}` }} key={image} src={`${API_URL}/storage/${image}`} /></span>
                                ))}
                            </Image.PreviewGroup>
                        </div>
                    </div>
                    <UploadCommonImage record={record} refresh={refresh} />
                </>
                )
            }
        },
        {
            // action
            title: 'Operation',
            dataIndex: 'option',
            valueType: 'option',
            width: 200,
            fixed: 'right',
            render: (_, record) => (<>
                <DownloadComponent id={record.id} />
                <DownloadComponent id={record.id} type={2} />
                <FailedComponent id={record.id} shipment_status={record.shipment_status} refresh={refresh} />
            </>)
        }
    ];
    return (<>
        <ProTable<TableListItem>
            columns={columns}
            actionRef={actionRef}
            request={async (params) =>
                // 表单搜索项会从 params 传入，传递给后端接口。
                // console.log(params, sorter, filter);
                new Promise((resolve) => {
                    const tempParams: any = {
                        ...params,
                        len: params.pageSize,
                        page: params.current
                    }
                    getClaimListV2(tempParams).then((res) => {
                        resolve({
                            data: res.data.data,
                            // success 请返回 true，
                            // 不然 table 会停止解析数据，即使有数据
                            success: !!res.code,
                            // 不传会使用 data 的长度，如果是分页一定要传
                            total: res.data.total,
                        });
                    });
                })
            }
            rowKey="id"
            pagination={{
                showQuickJumper: true,
                pageSize: 10,
            }}
            search={{
                labelWidth: 'auto',
            }}
            scroll={{ x: columns.reduce((a, b) => a + Number(b.width), 0), y: document.body.clientHeight - 340 }}
            size="small"
            bordered
            dateFormatter="string"
            headerTitle="Removal Claim Detail"
            toolBarRender={() => []}
        />
        <ActionModel ref={actionModelRef} callback={() => { actionRef.current.reload() }} />
    </>);
};
