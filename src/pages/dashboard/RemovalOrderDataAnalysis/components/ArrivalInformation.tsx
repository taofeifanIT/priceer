import { Select, Card, Row, Col, Spin, Statistic, Space, Button } from 'antd';
import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { removalOrderNextWeekPredict } from '@/services/dashboard/removalOrderDataAnalysis'


export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        boxes: 0,
        qty: 0,
        volume: 0
    })
    const [store, setStore] = useState([])
    const { initialState } = useModel('@@initialState');
    const { configInfo = {} } = initialState;

    const init = (storeIds?: number[]) => {
        setLoading(true)
        removalOrderNextWeekPredict({ store_id: storeIds }).then(res => {
            setLoading(false)
            setData(res.data)
        })
    }

    useEffect(() => {
        init()
    }, [])
    return (<div style={{ padding: '0px 4px 10px 10px' }}>
        <Spin spinning={loading}>
            <h3>
                Next week's arrival information
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
                    <Col span={6}>
                        <Card style={{ margin: '4px 4px 4px 0' }}>
                            <Statistic title="Unit" precision={3} value={data.qty} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4 }}>
                            <Statistic title="Volume" precision={3} value={data.volume} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4 }}>
                            <Statistic title="Boxes" precision={3} value={data.boxes} />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    </div>)
}