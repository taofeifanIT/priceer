import { Select, Card, Row, Col, Spin, Statistic, Space, Button, DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { removalOrderGetWarehouseInfo } from '@/services/dashboard/removalOrderDataAnalysis'
import dayJs from 'dayjs'
const { RangePicker } = DatePicker;
export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        total: {
            boxes: 0,
            qty: 0,
            land_cost: 0
        },
        process: {
            boxes: 0,
            qty: 0,
            land_cost: 0
        },
    })
    const [store, setStore] = useState([])
    const [date, setDate] = useState(null as any)
    const { initialState } = useModel('@@initialState');
    const { configInfo = {} } = initialState;

    const init = (storeIds?: number[], time?: any[]) => {
        // 判断time的类型是对象还是数组
        let paramTime = undefined
        if (time !== null && time !== undefined && time.length > 0 && time[0] !== null) {
            paramTime = time.map(item => dayJs(item).format('YYYY-MM-DD'))
            paramTime = {
                start_date: paramTime[0],
                end_date: paramTime[1]
            }
        }
        setLoading(true)
        removalOrderGetWarehouseInfo({ store_id: storeIds?.length ? storeIds : undefined, ...paramTime }).then(res => {
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
                Warehouse
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
                <RangePicker value={date} onChange={(val) => {
                    if (val) {
                        setDate(val)
                    } else {
                        setDate([null, null])
                    }
                }} />
                <Button type="primary" onClick={() => {
                    init(store, date)
                }}>Search</Button>
            </Space>
            <div style={{ marginTop: '10px' }}>
                <Row>
                    <Col span={6}>
                        <Card style={{ margin: '4px 4px 4px 0' }} size='small' title='Total'>
                            <Statistic title="Tracking Count" value={data.total.qty} />
                            <Statistic title="Unit Count" value={data.total.boxes} />
                            <Statistic title="Inventory Value Amount" prefix={"$"} value={data.total.land_cost} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4 }} size='small' title='Processing'>
                            <Statistic title="Tracking Count" value={data.process.qty} />
                            <Statistic title="Unit Count" value={data.process.boxes} />
                            <Statistic title="Inventory Value Amount" prefix={"$"} value={data.process.land_cost} />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    </div>)
}