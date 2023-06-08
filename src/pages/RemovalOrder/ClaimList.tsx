import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { Image, message, Typography, Form, Modal, Input, InputNumber, Spin, Upload, Button } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import {
    getClaimList,
    addClaimNumber,
    addReimbursement,
    downloadInfo,
    addReimburseMoney,
    addReimburseNumber,
    editMemo,
    saveMemoImages,
    finishFail
}
    from '@/services/removalOrder'
import moment from 'moment';
import { getToken } from '@/utils/token'

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
    images: string[],
    thumb: string[],
    checked_at: number,
    store_name: string,
    claim_number: string,
    reimburse_money: number,
    reimburse_number: string,
    memo_images: string[],
    memo_thumb: string[]
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

const SetValueComponent = (props: { id: number, editKey: string, value: string | number, api: any, refresh: () => void }) => {
    const { id, editKey, value, api, refresh } = props
    const [paramValue, setParamValue] = useState(value)
    const [spinning, setSpinning] = useState(false)
    return (<>
        <Spin spinning={spinning}>
            <Typography.Title editable={{
                onChange(val) {
                    // 判断是否为空 如果为空则不提交 判断值是否相同 如果相同则不提交
                    if (!val || val === paramValue) {
                        return
                    }
                    setSpinning(true)
                    api({ id, [editKey]: val }).then((res: any) => {
                        if (res.code) {
                            message.success(`${editKey} set successfully`)
                            setParamValue(val)
                            refresh()
                        } else {
                            throw res.msg
                        }
                    }).catch((err: any) => {
                        message.error('Claim number set failed ' + err)
                    }).finally(() => {
                        setSpinning(false)
                    })
                },
            }} level={4} >
                {paramValue}
            </Typography.Title>
        </Spin>

    </>)
}

const DownloadComponent = (props: { id: number }) => {
    const { id } = props
    return (<>
        <Button type='primary' icon={<DownloadOutlined />} style={{ marginBottom: '5px', width: 170 }} href={downloadInfo(id)}>
            Download images
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
        <Button danger style={{ width: 170 }} disabled={shipment_status === 5} loading={loading} onClick={onClick}>
            Failed
        </Button>
    </>)
}

const UploadCommonImage = (props: { record: TableListItem, refresh: () => void }) => {
    const { record, refresh } = props
    const onChange = (info: any) => {
        if (info.file.status === 'done') {
            const { id } = record
            const fileList = info.fileList
            const saveResult = fileList.filter((item: any) => item.status === 'done')
            if (saveResult.length === fileList.length) {
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
                })
            }
        }
    }
    return (<Upload
        accept=".jpg, .jpeg, .png"
        action="http://api-rp.itmars.net/removalOrder/uploadImage"
        headers={{ authorization: 'authorization-text', token: getToken() }}
        data={{ id: record.id }}
        listType="text"
        multiple={true}
        onChange={onChange}
        maxCount={50}
    >
        <Button icon={<UploadOutlined />} style={{ width: "170px", marginBottom: '5px' }}>Common images</Button>
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
            title: 'Store Name',
            dataIndex: 'store_name',
            align: 'center',
            valueType: 'text',
            width: 100,
            search: false,
        },
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            align: 'center',
            width: 100,
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
            align: 'center',
            width: 180,
            valueType: 'text',
        },
        {
            title: 'FNSKU',
            dataIndex: 'fnsku',
            align: 'center',
            width: 100,
            valueType: 'text',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            align: 'center',
            width: 100,
            valueType: 'text',
        },
        {
            title: 'Shipment Date',
            dataIndex: 'shipment_date',
            align: 'center',
            width: 120,
            valueType: 'text',
            render(_, record) {
                return (
                    <div>
                        {moment(record.shipment_date).format('YYYY-MM-DD')}
                    </div>
                );
            },
        },
        {
            title: 'Removal Type',
            dataIndex: 'removal_order_type',
            align: 'center',
            width: 110,
            valueType: 'select',
            valueEnum: {
                Return: { text: 'Return' },
                Disposal: { text: 'Disposal' },
                Liquidate: { text: 'Liquidations' },
            },
        },
        {
            title: 'Disposition',
            dataIndex: 'disposition',
            align: 'center',
            width: 100,
            valueType: 'text',
            valueEnum: {
                Sellable: { text: 'Sellable' },
                Unsellable: { text: 'Unsellable' }
            }
        },
        {
            title: 'Shipped Quantity',
            dataIndex: 'shipped_quantity',
            align: 'center',
            width: 150,
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Carrier',
            dataIndex: 'carrier',
            align: 'center',
            width: 70,
            valueType: 'text',
            search: false,
        },
        {
            title: 'Tracking Number',
            dataIndex: 'tracking_number',
            align: 'center',
            width: 200,
            valueType: 'text',
            search: false,
        },
        {
            title: 'Images',
            dataIndex: 'images',
            align: 'center',
            width: 220,
            search: false,
            render: (_, record) => {
                return (
                    <div style={{ overflowX: 'auto', width: '200px', WebkitOverflowScrolling: 'touch' }}>
                        <div style={{ width: record.images.length * 54 }}>
                            <Image.PreviewGroup>
                                {record.thumb.map((image: string, index: number) => (
                                    <span key={image} style={{ 'marginRight': index !== record.images.length ? 4 : 0 }}><Image width={50} preview={{ src: `http://api-rp.itmars.net/storage/${record.images[index]}` }} key={image} src={`http://api-rp.itmars.net/storage/${image}`} /></span>
                                ))}
                            </Image.PreviewGroup>
                        </div>
                    </div>
                )
            }
        },
        {
            title: 'Status',
            dataIndex: 'shipment_status',
            align: 'center',
            width: 100,
            render: (_, record) => {
                return ShipmentStatusGroup.find((item) => item.value === record.shipment_status)?.text
            }
        },
        {
            title: 'Claim Number',
            dataIndex: 'claim_number',
            align: 'center',
            width: 120,
            valueType: 'text',
            search: false,
            render: (_, record) => {
                return <SetValueComponent id={record.id} editKey={'claim_number'} value={record.claim_number} api={addClaimNumber} refresh={refresh} />
            }
        },
        {
            title: 'Reimburse Number',
            dataIndex: 'reimburse_number',
            align: 'center',
            width: 180,
            valueType: 'text',
            search: false,
            render: (_, record) => {
                return <SetValueComponent id={record.id} editKey={'reimburse_number'} value={record.reimburse_number} api={addReimburseNumber} refresh={refresh} />
            }
        },
        {
            title: 'Reimburse Money',
            dataIndex: 'reimburse_money',
            align: 'center',
            width: 180,
            valueType: 'text',
            search: false,
            render: (_, record) => {
                return <SetValueComponent id={record.id} editKey={'reimburse_money'} value={record.reimburse_money} api={addReimburseMoney} refresh={refresh} />
            }
        },
        {
            // dataindex memo title Common
            title: 'Memo',
            dataIndex: 'memo',
            width: 200,
            search: false,
            render: (_, record) => {
                // 如果 shipment_status 为 2 
                return record.shipment_status === 2 ? <SetValueComponent id={record.id} editKey={'memo'} value={record.memo} api={editMemo} refresh={refresh} /> : record.memo
            }
        },
        {
            // Common
            title: 'Common',
            dataIndex: 'common',
            width: 200,
            search: false,
            render: (_, record) => {
                return (
                    <div style={{ overflowX: 'auto', width: '200px', WebkitOverflowScrolling: 'touch' }}>
                        <div style={{ width: record.images.length * 54 }}>
                            <Image.PreviewGroup>
                                {record.memo_thumb.map((image: string, index: number) => (
                                    <span key={image} style={{ 'marginRight': index !== record.images.length ? 4 : 0 }}><Image width={50} preview={{ src: `http://api-rp.itmars.net/storage/${record.memo_images[index]}` }} key={image} src={`http://api-rp.itmars.net/storage/${image}`} /></span>
                                ))}
                            </Image.PreviewGroup>
                        </div>
                    </div>
                )
            }
        },
        {
            // action
            title: 'Operation',
            dataIndex: 'option',
            valueType: 'option',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (<>
                <DownloadComponent id={record.id} />
                <UploadCommonImage record={record} refresh={refresh} />
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
                    getClaimList(tempParams).then((res) => {
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
            }}
            search={{
                labelWidth: 'auto',
            }}
            scroll={{ x: columns.reduce((a, b) => a + Number(b.width), 0) }}
            size="small"
            bordered
            dateFormatter="string"
            headerTitle="Removal Claim Detail"
            toolBarRender={() => []}
        />
        <ActionModel ref={actionModelRef} callback={() => { actionRef.current.reload() }} />
    </>);
};
