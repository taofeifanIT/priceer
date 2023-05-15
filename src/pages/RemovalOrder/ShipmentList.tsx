import React, { useRef, useState, useImperativeHandle } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { Radio, message, Upload, Modal, Form, Input } from 'antd';
import { getShipmentList, checkShipment, checkItems } from '@/services/removalOrder'
import { PlusOutlined } from '@ant-design/icons';
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
    shipment_status: string,
    memo: string,
    images: string,
    checked_at: number,
    store_name: string,
}

type actionItems = {
    callback: () => void;
}

const ActionModel = React.forwardRef((props: actionItems, ref) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false)
    const [editRecordId, setEditRecordId] = useState<number>()
    const [form] = Form.useForm();
    // 定义函数用于根据选中的值更新状态
    const [shipmentStatus, setShipmentStatus] = useState("")
    const [shippedQuantity, setshippedQuantity] = useState<number>()
    const handleShipmentStatusChange = (value?: '') => {
        setShipmentStatus(value);
    }
    const handleUploadChange = (info) => {
        if (info.fileList.length > 6) {  // 限制上传图片数量为 6 张
            message.error('You can only upload up to 6 images!')
            return;
        }
    };

    const handleOk = () => {
        form.validateFields().then(async (values: checkItems) => {
            setLoading(true)
            const api = checkShipment
            let params = JSON.parse(JSON.stringify(values))
            if (editRecordId) {
                params = {
                    id: editRecordId,
                    ...params
                }
            }
            api(params).then(res => {
                if (res.code) {
                    message.success("Operation successful!")
                    // setLoading(false)
                    setIsModalVisible(false);
                    setTimeout(() => {
                        props.callback()
                        form.resetFields()
                    }, 1000)
                } else {
                    throw res.msg
                }
            }).catch((e) => {
                // setLoading(false)
                message.error(e)
            }).finally(() => {
                setLoading(false)
            })
        })
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setShipmentStatus('')
        form.resetFields()
    };

    useImperativeHandle(ref, () => ({
        showModal: (record: TableListItem) => {
            setIsModalVisible(true)
            setEditRecordId(record?.id)
            setshippedQuantity(record?.shipped_quantity)
        }
    }));

    return (
        <>
            <Modal title={'check'} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} confirmLoading={loading}>
                <Form
                    layout={"horizontal"}
                    form={form}
                >
                    <Form.Item label="Shipment Status" name="shipment_status" rules={[{ required: true }]}>
                        <Radio.Group onChange={(e) => handleShipmentStatusChange(e.target.value)}>
                            <Radio value="consistent" >consistent</Radio>
                            <Radio value="inconsistent">inconsistent</Radio>
                        </Radio.Group>
                    </Form.Item>
                    {shipmentStatus === "consistent" ? (
                        <Form.Item label="Memo" name="memo" rules={[{ required: true }]}>
                            {Array.from({ length: shippedQuantity }).map((_, index) => (
                                <Input placeholder={`input placeholder ${index + 1}`} key={index} name="memo" />
                                // 将 name 属性移除，placeholder 显示每个输入框的编号
                            ))}
                            {/* <Input placeholder="input placeholder" /> */}
                        </Form.Item>
                    ) : shipmentStatus === "inconsistent" ? (
                        <Form.Item label="Images" name="images" rules={[{ required: true }]}>
                            <Upload
                                accept=".jpg, .jpeg, .png"
                                action="http://api-rp.itmars.net/removalOrder/uploadImage"
                                headers={{ authorization: 'authorization-text', token: getToken() }}
                                listType="picture-card"
                                onChange={handleUploadChange}
                            // maxCount={6}  // 限制图片数量为 6 张
                            >
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                            请上传6张照片。
                        </Form.Item>
                    ) : null}
                </Form>
            </Modal>
        </>
    );
});


export default () => {
    const actionRef: any = useRef<FormInstance>();
    const actionModelRef: any = useRef<any>();
    const columns: ProColumns<TableListItem>[] = [
        {
            title: 'Store Name',
            dataIndex: 'store_name',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            align: 'center',
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
            valueType: 'text',
        },
        {
            title: 'FNSKU',
            dataIndex: 'fnsku',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'Shipment Date',
            dataIndex: 'shipment_date',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'Removal Type',
            dataIndex: 'removal_order_type',
            align: 'center',
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
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Carrier',
            dataIndex: 'carrier',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'Tracking Number',
            dataIndex: 'tracking_number',
            align: 'center',
            search: false,
            valueType: 'text',
        },
        {
            title: 'Tracking Process',
            dataIndex: 'tracking_last_status',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'action',
            width: 180,
            key: 'option',
            valueType: 'option',
            render: (_, record) => [
                record.shipment_status === null ? (<a key="checked" onClick={() => {
                    actionModelRef.current.showModal(record)
                }}>Checked</a>) : null
            ],
        },
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
                    getShipmentList(tempParams).then((res) => {
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
            size="small"
            bordered
            dateFormatter="string"
            headerTitle="Removal Order List"
            toolBarRender={() => []}
        />
        <ActionModel ref={actionModelRef} callback={() => {
            actionRef.current.reload();
        }} />
    </>);
};

// export default connect(({ globalparams }: any) => ({ globalparams }))(ListedProduct); 