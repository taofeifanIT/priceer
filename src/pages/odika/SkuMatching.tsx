import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import type { SkuListItem } from '@/services/odika/skuMatching'
import { message, Space, Typography, Modal, Form, Select, Spin, Button } from 'antd';
import { list, edit, match_list, getListingByAmazon } from '@/services/odika/skuMatching'
const { Text } = Typography
const { Option } = Select

type matchItemType = {
    ns_sku: {
        internal_id: number,
        sku: string,
    }[];
    amazon_sku: {
        asin: string,
        ts_sku: string,
    }[]
}
const EditModal = forwardRef((props: { refresh: () => void }, ref) => {
    const { refresh } = props
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)
    const [matchList, setMatchList] = useState<matchItemType>({} as matchItemType)
    const [loading, setLoading] = useState(false)
    // 监听 form中的SKU变化
    const fromSku = Form.useWatch('sku', form);
    const handleCancel = () => {
        setVisible(false)
    }
    const handleOk = () => {
        form.validateFields().then((values: any) => {
            setConfirmLoading(true)
            const tempMatch = matchList.ns_sku?.find((item) => item.sku === fromSku) || { internal_id: '' }
            const params = {
                ...values,
                internal_id: tempMatch.internal_id,
            }
            edit(params).then((res) => {
                const { code, msg } = res
                if (code) {
                    message.success(msg)
                    setVisible(false)
                    refresh()
                } else {
                    throw msg
                }
            }).catch((err) => {
                message.error(err)
            }).finally(() => {
                setConfirmLoading(false)
            })
        })
    }

    const getMatchList = () => {
        setLoading(true)
        match_list().then((res) => {
            const { data, code, msg } = res
            if (code === 1) {
                setMatchList(data)
            } else {
                throw msg
            }
        }).catch((err) => {
            message.error(err)
        }).finally(() => {
            setLoading(false)
        })
    }

    useImperativeHandle(ref, () => ({
        showModal(record?: SkuListItem) {
            setVisible(true);
            if (record) {
                if (!matchList.ns_sku) {
                    getMatchList()
                }
                form.setFieldsValue(record);
            } else {
                form.resetFields();
            }
        }
    }));
    return (
        <Modal
            title="Edit"
            open={visible}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                >
                    <Form.Item
                        name="seller_sku"
                        label="Seller SKU"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the seller sku of collection!',
                            },
                        ]}
                    >
                        <Select
                            disabled
                            showSearch
                            placeholder="Select a seller sku"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {matchList.amazon_sku?.map((item) => {
                                return <Option key={item.ts_sku} value={item.ts_sku}>{item.ts_sku}</Option>
                            })}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="sku"
                        label="NS SKU"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the sku of collection!',
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a sku"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {matchList.ns_sku?.map((item) => {
                                return <Option key={item.sku} value={item.sku}>{item.sku}</Option>
                            })}
                        </Select>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>)
})


export default () => {
    const actionRef = useRef<ActionType>();
    const editModalRef = useRef<any>();
    const [resColumns, setResColumns] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const columns: ProColumns<SkuListItem>[] = [
        // asin
        {
            title: 'ASIN',
            dataIndex: 'asin',
            width: 150,
            hideInTable: true,
            valueType: 'text',
        },
        // seller_sku
        {
            title: 'Seller SKU',
            dataIndex: 'seller_sku',
            width: 150,
            hideInTable: true,
            valueType: 'text',
        },
        {
            // Info
            title: 'Amazon',
            dataIndex: 'Amazon',
            width: 150,
            search: false,
            render: (_, record) => {
                return (
                    <Space direction="vertical">
                        <div><Text type='secondary'>ASIN:</Text>{record.asin}</div>
                        <div><Text type='secondary'>Seller SKU:</Text>{record.seller_sku}</div>
                    </Space>
                )
            }
        },
        {
            // is_match
            title: 'Match',
            dataIndex: 'is_match',
            hideInTable: true,
            valueType: 'select',
            valueEnum: {
                1: { text: 'Unmatched' },
                2: { text: 'Matched' },
            },
        },
        {
            title: 'NS SKU',
            dataIndex: 'sku',
            width: 150,
            // hideInTable: true,
            valueType: 'text',
            render: (_, record) => {
                if (!record.sku) {
                    return <a onClick={() => editModalRef.current?.showModal(record)}>Match</a>
                }
                return record.sku
            }
        },
        ...resColumns,
    ];
    const autoMatchSku = () => {
        setLoading(true)
        getListingByAmazon().then((res) => {
            const { code, msg } = res
            if (code === 1) {
                message.success(msg)
                actionRef.current?.reload()
            } else {
                throw msg
            }
        }).catch((err) => {
            message.error(err)
        }).finally(() => {
            setLoading(false)
        })
    }
    return (<>
        <EditModal ref={editModalRef} refresh={() => actionRef.current?.reload()} />
        <ProTable<SkuListItem>
            size='small'
            columns={columns}
            actionRef={actionRef}
            cardBordered
            request={async (params = {}, sort, filter) => {
                const tempParams = { ...params, ...filter, len: params.pageSize, page: params.current }
                const res = await list(tempParams)
                const { data, code } = res
                const resultData = data.data.map((item: any) => {
                    const tempObj: any = {}
                    item.warehouse.forEach((warehouseItem: any) => {
                        tempObj[warehouseItem.name] = warehouseItem.pl_sku
                    })
                    return {
                        ...item,
                        ...tempObj
                    }
                })
                const tempColumns: any[] = data.column.map((item: string) => {
                    return {
                        title: item,
                        dataIndex: item,
                        width: 150,
                        valueType: 'text',
                        render: (_, record) => {
                            const tempWarehouse = record.warehouse.find((warehouseItem: any) => warehouseItem.name === item)
                            if (tempWarehouse) {
                                return (
                                    <Space direction="vertical">
                                        <div><Text type='secondary'>SKU:</Text>{tempWarehouse.pl_sku}</div>
                                        <div><Text type='secondary'>QTY:</Text>{tempWarehouse.quantity}</div>
                                    </Space>
                                )
                            }
                            return null
                        }
                    }
                })
                setResColumns(tempColumns)
                return {
                    data: resultData,
                    success: !!code,
                    total: res.data.total,
                }
            }}
            editable={{
                type: 'multiple',
            }}
            scroll={{ y: document.body.clientHeight - 260, x: columns.reduce((total: any, item) => total + (item.width || 0), 0) }}
            rowKey="id"
            search={{
                labelWidth: 'auto',
            }}
            pagination={{
                defaultPageSize: 30,
                showQuickJumper: true,
                pageSizeOptions: ['30', '50', '100', '200', '300', '500'],
                showSizeChanger: true
                // onChange: (page) => console.log(page),
            }}
            revalidateOnFocus={false}
            dateFormatter="string"
            toolBarRender={() => [
                <Button key="autoMatchSku" type="primary" onClick={autoMatchSku} loading={loading}>
                    Get Listing By Amazon
                </Button>,
            ]}
        />
    </>);
};