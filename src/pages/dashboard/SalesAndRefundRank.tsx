import { Row, Col, Card, Table, Spin, message, Tag, DatePicker, Form, Button, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import { getSalesAndRefundRank } from '@/services/dashboard/salesAndRefundRank';
import { useModel } from 'umi';
const { RangePicker } = DatePicker;

// "seller_sku": "40B00135CN-Open Box",
// 				"quantity_num": 76

const cirlceStyle: React.CSSProperties = {
    width: 25,
    height: 25,
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: 5,
    paddingTop: 2,
    color: '#fff',
    textAlign: 'center',
    background: '#314659'
}

// const tagColor = [
//     '#55acee',
//     '#cd201f',
//     '#3b5999',
//     //  鲜明的颜色
//     '#ff6600',
//     '#ff9900',
//     '#ffcc00',
//     '#ffff00',
// ]

const tagColor: any = {
    'UNWANTED_ITEM': '#55acee',
    'DEFECTIVE': '#cd201f',
    'MISSING_PARTS': '#3b5999',
    'FOUND_BETTER_PRICE': '#ff6600',
    'DAMAGED_BY_FC': '#ff9900',
    'ORDERED_WRONG_ITEM': '#ffcc00',
    'MISSED_ESTIMATED_DELIVERY': '#04b6d3',
    'CR-UNWANTED_ITEM': '#55acee',
    'UNDELIVERABLE_UNKNOWN': '#ff6600',
    'DAMAGED_BY_CARRIER': '#ff9900',
    'SWITCHEROO': '#09d305',
    'NO_REASON_GIVEN': '#6672f7',
    'NOT_AS_DESCRIBED': '#b0c778',
    'UNDELIVERABLE_REFUSED': '#c138be',
}



const salesAndRefundRankColumns = [
    {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 80,
        align: 'center',
        render: (_: any, __: any, index: any) => {
            return <div style={index <= 2 ? cirlceStyle : {
                ...cirlceStyle,
                background: '#979797',
            }}>
                {index + 1}
            </div>
        }
    },
    {
        title: 'SKU',
        dataIndex: 'sku',
    },
    {
        title: 'Quantity',
        dataIndex: 'quantity',
        sorter: (a: any, b: any) => a.quantity - b.quantity,
    },
    {
        // return quantity
        title: 'Return Quantity',
        dataIndex: 'return_quantity',
        sorter: (a: any, b: any) => a.return_quantity - b.return_quantity,
    },
    {
        title: 'Return Rate',
        dataIndex: 'return_rate',
        sorter: (a: any, b: any) => a.return_rate - b.return_rate,
    },
    {
        title: 'Reasons',
        dataIndex: 'content',
        render: (_: any, record: any) => {
            return <div>
                {record.reason.map((item: any) => {
                    const color = Object.keys(tagColor).find(key => item.reason.includes(key)) || ''
                    return <Tag key={item.reason} style={{ marginBottom: '5px' }} color={color ? tagColor[color] : '#55acee'}>{item.reason + ' ' + item.num}</Tag>

                })}
            </div>
        }
    },
]

export default () => {
    const [salesAndRefundRank, setSalesAndRefundRank] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [form] = Form.useForm();
    const { initialState } = useModel('@@initialState');
    const { configInfo } = initialState || {};
    const getStores = () => {
        const storeObj: any = {}
        configInfo?.dash_store.forEach((item: any) => {
            storeObj[item.id] = {
                text: item.name
            }
        })
        return storeObj
    }

    const initData = (params: any) => {
        setLoading(true)
        getSalesAndRefundRank(params).then(res => {
            if (!res.code) {
                throw res.msg
            }
            setSalesAndRefundRank(res.data)
        }).catch(err => {
            message.error(err)
        }).finally(() => {
            setLoading(false)
        })
    }

    const onFinish = (values: any) => {
        const { date } = values
        const formParams = {
            store_id: values.store_id,
            start_date: date ? date[0].format('YYYY-MM-DD') : undefined,
            end_date: date ? date[1].format('YYYY-MM-DD') : undefined,
        }
        initData(formParams)
    };
    useEffect(() => {
        initData({
            store_id: form.getFieldValue('store_id'),
        })
    }, [])
    return (<div style={{ background: '#fff' }}>
        <Spin spinning={loading}>
            <Row gutter={24}>
                <Col span={24}>
                    <Card title={<Form
                        layout={'inline'}
                        form={form}
                        onFinish={onFinish}
                        initialValues={{
                            store_id: "2",
                        }}
                    >
                        <Form.Item
                            label="Store Name"
                            name="store_id"
                        >
                            <Select
                                allowClear
                                style={{ width: 120 }}
                                options={Object.keys(getStores()).map(key => ({ label: getStores()[key].text, value: key }))}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Date"
                            name="date"
                        >
                            <RangePicker />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Query</Button>
                        </Form.Item>
                    </Form>} bordered={false}>
                        <Table
                            size='small'
                            bordered
                            columns={salesAndRefundRankColumns}
                            dataSource={salesAndRefundRank}
                            pagination={false}
                            rowKey={(record: any) => record.sku}
                        />
                    </Card>
                </Col>
            </Row>
        </Spin>
    </div>)
}