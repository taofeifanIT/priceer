import { Table, Spin, Col, Row, Divider, Select, message } from 'antd';
import { removalOrderDashboard } from '@/services/dashboard/removalOrderDataAnalysis'
import InfoCircle from './InfoCircle'
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import './avgDaysInWareHouseAndCurrentReturnRates.less'
const { Column } = Table;


let returnRateData: any = []

const options = [
    {
        label: 'Amazon Canada',
        value: 'Amazon Canada',
    },
    {
        label: 'Amazon US',
        value: 'Amazon US',
    },
]

export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<
        { avg_days: any[]; return_rate: any[] }>
        ({ avg_days: [], return_rate: [] })
    const { initialState } = useModel('@@initialState');
    const { configInfo = {} } = initialState;

    const getColorByNumber = (number: number, key: string) => {
        const startColor = "rgb(99, 190, 123)";
        const endColor = "rgb(248, 105, 107)";
        const steps = data.avg_days.length;
        const parseColor = (color: any) => color.match(/\d+/g).map(Number);
        const start = parseColor(startColor);
        const end = parseColor(endColor);
        const stepSizes = start.map((value: number, index: string | number) => (end[index] - value) / (steps - 1));
        const transitionColors = [];
        for (let i = 0; i < steps; i++) {
            const currentColor = start.map((value: number, index: string | number) => Math.round(value + stepSizes[index] * i));
            transitionColors.push(`rgb(${currentColor.join(",")})`);
        }
        const tempData = data.avg_days.map((item: any) => item[key])
        tempData.sort((a: number, b: number) => a - b)
        const index = tempData.indexOf(number)
        return transitionColors[index];
    }

    const init = () => {
        setLoading(true)
        removalOrderDashboard().then(res => {
            if (!res.code) {
                throw res.msg
            }
            const avgDaysData = res.data.avg_days.map((item: any) => {
                return {
                    storeName: configInfo.dash_store?.find((storeItem: any) => storeItem.id === item.store_id)?.name,
                    storeId: item.store_id,
                    last_week: item.content.last_week,
                    this_week: item.content.this_week,
                }
            })
            // avgDaysData.push(avgDayTotal)
            returnRateData = res.data.return_rate
            setData({
                ...data,
                avg_days: avgDaysData,
                return_rate: res.data.return_rate
            } as any)
        }).catch(err => {
            console.log(err)
            message.error(JSON.stringify(err))
        }).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        init()
    }, [])
    return (<div>
        <Spin spinning={loading}>
            <Row style={{ marginTop: 14 }}>
                <Col span={10}>
                    <h3 style={{ marginLeft: 9 }}>AVG Days in WH <InfoCircle title='Average Days of Not Processed Removal Orders Since Shipment Date' /></h3>
                    <div style={{ padding: '0px 4px 10px 10px' }} id='AvgDaysInWareHouseAndCurrentReturnRates'>
                        <table style={{ width: '100%', border: '1px solid #ebebeb' }} border="1" >
                            <thead>
                                <tr style={{ background: '#fafafa' }}>
                                    <th align='left' style={{ paddingLeft: '5%' }}>Store</th>
                                    <th align='center'>Last Week <InfoCircle title='Average Days for Not Processed ROs at Last Saturday' /></th>
                                    <th align='center'>This Week <InfoCircle title="Average Days for Not Processed ROs for Real Time" /></th>
                                </tr>
                            </thead>
                            <tbody style={{ overflowY: 'scroll', height: 200 }}>
                                {data.avg_days.map((item: any) => {
                                    return <tr key={item.storeId} onClick={() => {
                                        window.open(`/RemovalOrder/ShipmentList?state=2&store_id=${item.storeId}`)
                                    }}>
                                        <td style={{ paddingLeft: '5%' }}>{item.storeName}</td>
                                        <td style={{ background: getColorByNumber(item.last_week, 'last_week') }} align='center'>{item.last_week}</td>
                                        <td style={{ background: getColorByNumber(item.this_week, 'this_week') }} align='center'>{item.this_week}</td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                </Col>
                <Col span={1}>
                    <div style={{ textAlign: 'center' }}>
                        <Divider type='vertical' style={{ height: 410 }} />
                    </div>
                </Col>
                <Col span={13}>
                    <div style={{ padding: '0px 10px 10px 4px' }}>
                        <h3 style={{ marginLeft: 4, display: 'inline-block', width: '50%' }}>Current Return Rates  Est. </h3>
                        <p style={{ display: 'inline-block' }}>
                            <span style={{ position: 'absolute', right: 10, top: -5 }}>
                                Platform：
                                <Select
                                    allowClear
                                    style={{ width: '168px' }}
                                    placeholder="Please select"
                                    onChange={(value: any) => {
                                        if (value) {
                                            const tempData = returnRateData.filter((item: any) => item.platform === value)
                                            setData({
                                                ...data,
                                                return_rate: tempData
                                            } as any)
                                        } else {
                                            setData({
                                                ...data,
                                                return_rate: returnRateData
                                            } as any)
                                        }
                                    }}
                                    options={options}
                                />
                            </span>
                        </p>
                        <Table
                            dataSource={data.return_rate}
                            size='small'
                            pagination={false}
                            style={{ width: '100%' }}
                            scroll={{ y: 337 }}>
                            <Column title="Date" dataIndex={'current_date'} />
                            <Column title="Platform" dataIndex={'platform'} ellipsis />
                            <Column title="Sales" dataIndex={'sales'} />
                            <Column title="Return Qty" dataIndex={'return_quantity'} />
                            <Column title="Return Rate" dataIndex={'return_rate'} />
                        </Table>
                    </div>
                </Col>
            </Row>
        </Spin>
    </div>)
}