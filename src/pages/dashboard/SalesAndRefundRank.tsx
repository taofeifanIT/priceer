import { Row, Col, Card, Table, Spin, message, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { getSalesAndRefundRank } from '@/services/dashboard/salesAndRefundRank';

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

const tagColor = {
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
}

const salesColumns = [
    {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 100,
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
        title: 'Seller SKU',
        dataIndex: 'seller_sku',
    },
    {
        title: 'Quantity',
        dataIndex: 'quantity_num',
        align: 'center',
    }
]

const refundColumns = [
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
        title: 'MSKU',
        dataIndex: 'msku',
        // ellipsis: true,
    },
    {
        title: 'Reason',
        dataIndex: 'content',
        render: (_: any, record: any) => {
            return <div>
                {record.content.map((item: any, index: number) => {
                    // return <Tag key={item.reason} style={{ marginBottom: '5px' }}>{item.reason + ' ' + item.num}</Tag>
                    // 判断item.reason是否在tagColor中，不用全等，包含就行
                    const color = Object.keys(tagColor).find(key => item.reason.includes(key)) || ''
                    return <Tag key={item.reason} style={{ marginBottom: '5px' }} color={color ? tagColor[color] : '#55acee'}>{item.reason + ' ' + item.num}</Tag>

                })}
            </div>
        }
    },
    {
        title: 'Quantity',
        dataIndex: 'quantity_num',
        align: 'center',
    },
]

export default () => {
    const [salesAndRefundRank, setSalesAndRefundRank] = useState<any>({})
    const [loading, setLoading] = useState<boolean>(false)
    const initData = () => {
        setLoading(true)
        getSalesAndRefundRank().then(res => {
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
    useEffect(() => {
        initData()
    }, [])
    return (<div style={{ background: '#fff' }}>
        <Spin spinning={loading}>
            <Row gutter={24}>
                <Col span={10}>
                    <Card title="Sales Rank" bordered={false}>
                        <Table
                            size='small'
                            bordered
                            columns={salesColumns}
                            dataSource={salesAndRefundRank.sales}
                            pagination={false}
                            rowKey={(record: any) => record.seller_sku}
                        />
                    </Card>
                </Col>
                <Col span={14}>
                    <Card title="Refund Rank" bordered={false}>
                        <Table
                            size='small'
                            bordered
                            columns={refundColumns}
                            dataSource={salesAndRefundRank.refund}
                            pagination={false}
                            rowKey={(record: any) => record.msku}
                        />
                    </Card>
                </Col>
            </Row>
        </Spin>
    </div>)
}