import { Select, Card, Row, Col, Spin, Statistic, Space, Button, message, DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { removalOrderGetClaimInfo } from '@/services/dashboard/removalOrderDataAnalysis'
import InfoCircle from './InfoCircle'
import { Pie } from '@ant-design/charts'
import dayJs from 'dayjs'
const { RangePicker } = DatePicker;

const DemoPie = (props: { successes: number, failures: number }) => {
    const data = [
        {
            type: 'Successes',
            value: props.successes,
        },
        {
            type: 'Failures',
            value: props.failures,
        },
    ];
    const config = {
        appendPadding: 10,
        data,
        angleField: 'value',
        colorField: 'type',
        radius: 0.75,
        label: {
            type: 'spider',
            labelHeight: 28,
            content: '{name}\n{percentage}',
        },
        interactions: [
            {
                type: 'element-selected',
            },
            {
                type: 'element-active',
            },
        ],
    };
    return <Pie {...config} />;
};

export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        skus: 0,
        qty: 0,
        number: 0,
        success_number: 0,
        success_amount: 0,
        fail_amount: 0,
        fail_number: 0,
        avg_days: 0
    })
    const [date, setDate] = useState(null as any)
    const [store, setStore] = useState([])
    const { initialState } = useModel('@@initialState');
    const { configInfo = {} } = initialState;

    const init = (storeIds?: number[]) => {
        setLoading(true)
        let paramTime = undefined
        if (date !== null && date !== undefined && date.length > 0 && date[0] !== null) {
            paramTime = date.map((item: string | number | Date | dayJs.Dayjs | null | undefined) => dayJs(item).format('YYYY-MM-DD'))
            paramTime = {
                start_date: paramTime[0],
                end_date: paramTime[1]
            }
        }
        removalOrderGetClaimInfo({ store_id: storeIds, ...paramTime }).then(res => {
            if (!res.code) {
                throw res.msg
            }
            setData(res.data)
        }).catch(err => {
            message.error(JSON.stringify(err))
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(() => {
        init()
    }, [])
    return (<Row>
        <Col span={12}>
            <div style={{ padding: '0px 4px 10px 10px' }}>
                <Spin spinning={loading}>
                    <h3>
                        Claim
                    </h3>
                    <Space>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: '300px' }}
                            placeholder="Please select"
                            maxTagCount={'responsive'}
                            options={configInfo.dash_store.map((item: any) => ({ label: item.name, value: item.id }))}
                            onChange={(value: any) => {
                                setStore(value)
                            }}
                        />
                        <RangePicker value={date} onChange={(val) => {
                            if (val) {
                                setDate(val)
                            } else {
                                setDate([null, null])
                            }
                        }} />
                        <Button type="primary" onClick={() => {
                            init(store)
                        }}>Search</Button>
                    </Space>
                    <div style={{ marginTop: '10px' }}>
                        <Row>
                            <Col span={12}>
                                <Card style={{ margin: '4px 4px 4px 0' }}>
                                    <div style={{ height: '170px' }}>
                                        <Statistic title={<>Total Claims<InfoCircle title='Total Claims Number' /></>} value={data.number} />
                                        <Statistic title={<>Sku Quantity<InfoCircle title='Total SKU Number' /></>} value={data.skus} />
                                        <Statistic title={<>Unit<InfoCircle title='Total Product Quantity' /></>} value={data.qty} />
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card style={{ margin: 4 }}>
                                    <div style={{ height: '170px' }}>
                                        <Statistic title={<>Average Claim Period<InfoCircle title='Average Time Period to Process Claims' /></>} value={data.avg_days} />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Card style={{ margin: 4 }}>
                                    <div style={{ height: '110px' }}>
                                        <Statistic title={<>Amount Of Successful Claims<InfoCircle title='Total Amount of Successful Claims' /></>} prefix={'$'} value={data.success_amount} />
                                        <Statistic title={<>Number Of successful Claims<InfoCircle title='Total Number of Successful Claims' /></>} value={data.success_number} />
                                    </div>
                                </Card>

                            </Col>
                            <Col span={12}>
                                <Card style={{ margin: '4px 4px 4px 0' }}>
                                    <div style={{ height: '110px' }}>
                                        <Statistic title={<>Inventory Cost for Failed Claims<InfoCircle title='Total Inventory Cost of Failed Claims' /></>} prefix={'$'} value={data.fail_amount} />
                                        <Statistic title={<>Number Of Failed Claims<InfoCircle title='Total Number of Failed Claims' /></>} value={data.fail_number} />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Spin>
            </div>
        </Col>
        <Col span={12}>
            <DemoPie successes={data.success_number} failures={data.fail_number} />
        </Col>
    </Row>)
}