import { Select, Card, Row, Col, Spin, Statistic, Space, Button } from 'antd';
import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { removalOrderGetClaimInfo } from '@/services/dashboard/removalOrderDataAnalysis'
import { Pie } from '@ant-design/charts'


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
    const [store, setStore] = useState([])
    const { initialState } = useModel('@@initialState');
    const { configInfo = {} } = initialState;

    const init = (storeIds?: number[]) => {
        setLoading(true)
        removalOrderGetClaimInfo({ store_id: storeIds }).then(res => {
            setLoading(false)
            setData(res.data)
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
                            options={configInfo.store.map((item: any) => ({ label: item.name, value: item.id }))}
                            onChange={(value: any) => {
                                setStore(value)
                            }}
                        />
                        <Button type="primary" onClick={() => {
                            init(store)
                        }}>Search</Button>
                    </Space>
                    <div style={{ marginTop: '10px' }}>
                        <Row>
                            <Col span={12}>
                                <Card style={{ margin: '4px 4px 4px 0' }}>
                                    <div style={{ height: '170px' }}>
                                        <Statistic title="Total Claim" value={data.number} />
                                        <Statistic title="Sku Quantity" value={data.skus} />
                                        <Statistic title="Unit Count" value={data.qty} />
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card style={{ margin: 4 }}>
                                    <div style={{ height: '170px' }}>
                                        <Statistic title="Amount Of Successful Claim" value={data.success_amount} />
                                        <Statistic title="Number Of successful Claims" value={data.success_number} />
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Card style={{ margin: '4px 4px 4px 0' }}>
                                    <div style={{ height: '110px' }}>
                                        <Statistic title="Claim Failure Cost" value={data.fail_amount} />
                                        <Statistic title="Number Of Failed Claims" value={data.fail_number} />
                                    </div>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card style={{ margin: '4px 4px 4px 0' }}>
                                    <div style={{ height: '110px' }}>
                                        <Statistic title="Average Claim Period" value={data.avg_days} />
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