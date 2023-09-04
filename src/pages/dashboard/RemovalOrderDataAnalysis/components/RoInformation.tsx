import { Select, Card, Row, Col, Spin, Statistic, Space, Button, DatePicker, message } from 'antd';
import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { removalOrderGetROInfo } from '@/services/dashboard/removalOrderDataAnalysis'
import InfoCircle from './InfoCircle'
import dayJs from 'dayjs'
const { RangePicker } = DatePicker;
export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        doa: {
            quantity: 0,
            land_cost: 0
        },
        open_box: {
            quantity: 0,
            land_cost: 0
        },
        new: {
            quantity: 0,
            land_cost: 0
        },
        used: {
            quantity: 0,
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
        removalOrderGetROInfo({ store_id: storeIds?.length ? storeIds : undefined, ...paramTime }).then(res => {
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
                RO Information
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
                        <Card style={{ margin: '4px 4px 4px 0' }}>
                            <Statistic title={<>DOA Quantity<InfoCircle title='Total Number Of DOA Products' /></>} value={data.doa.quantity} />
                            <Statistic title={<>NS Land Price<InfoCircle title='Data From NS, Total Cost Of Such Goods' /></>} prefix={'$'} value={data.doa.land_cost} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4 }}>
                            <Statistic title={<>Used Quantity<InfoCircle title='Total Number Of Used Products' /></>} value={data.used.quantity} />
                            <Statistic title={<>NS Land Price<InfoCircle title='Data From NS, Total Cost Of Such Goods' /></>} prefix={'$'} value={data.used.land_cost} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4 }}>
                            <Statistic title={<>New Quantity<InfoCircle title='Total Number Of New Products' /></>} value={data.new.quantity} />
                            <Statistic title={<>NS Land Price<InfoCircle title='Data From NS, Total Cost Of Such Goods' /></>} prefix={'$'} value={data.new.land_cost} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4 }}>
                            <Statistic title={<>OpenBox Quantity<InfoCircle title='Total Number Of OpenBox Products' /></>} value={data.open_box.quantity} />
                            <Statistic title={<>NS Land Price<InfoCircle title='Data From NS, Total Cost Of Such Goods' /></>} prefix={'$'} value={data.open_box.land_cost} />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    </div>)
}