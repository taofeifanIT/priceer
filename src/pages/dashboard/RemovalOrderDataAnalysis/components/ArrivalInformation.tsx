import { Select, Card, Row, Col, Spin, Statistic, Space, Button, message } from 'antd';
import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import InfoCircle from './InfoCircle'
import { removalOrderNextWeekPredict } from '@/services/dashboard/removalOrderDataAnalysis'


export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        boxes: 0,
        qty: 0,
        title: '',
        volume: 0
    })
    const [store, setStore] = useState([])
    const { initialState } = useModel('@@initialState');
    const { configInfo = {} } = initialState;

    const init = (storeIds?: number[]) => {
        setLoading(true)
        removalOrderNextWeekPredict({ store_id: storeIds }).then(res => {
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
    return (<div style={{ padding: '0px 4px 10px 10px' }}>
        <Spin spinning={loading}>
            <h3>
                {data.title} Arrival Information <InfoCircle title={`The Incoming Products for ${data.title}`} />
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
                <Button type="primary" onClick={() => {
                    init(store)
                }}>Search</Button>
            </Space>
            <div style={{ marginTop: '10px' }}>
                <Row>
                    <Col span={6}>
                        <Card style={{ margin: '4px 4px 4px 0', cursor: 'pointer' }} onClick={() => {
                            window.open('/RemovalOrder/ShipmentList?state=2&delivery_time=current')
                        }}>
                            <Statistic title={<>Unit<InfoCircle title='Total Product Quantities' /></>} precision={0} value={data.qty} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4, cursor: 'pointer' }} onClick={() => {
                            window.open('/RemovalOrder/ShipmentList?state=2&delivery_time=current')
                        }}>
                            <Statistic title={<>Volume<InfoCircle title='The Total Volume Required for Storage' /></>} precision={0} suffix={'CBM'} value={data.volume} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4, cursor: 'pointer' }} onClick={() => {
                            window.open('/RemovalOrder/ShipmentList?state=2&delivery_time=current')
                        }}>
                            <Statistic title={<>Boxes<InfoCircle title='Total Tracking Numbers' /></>} precision={0} value={data.boxes} />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    </div>)
}