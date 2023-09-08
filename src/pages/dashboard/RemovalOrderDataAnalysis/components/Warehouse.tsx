import { Select, Card, Row, Col, Spin, Statistic, Space, Button, message, Radio } from 'antd';
import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { removalOrderGetWarehouseInfo } from '@/services/dashboard/removalOrderDataAnalysis'
import InfoCircle from './InfoCircle'
import dayJs from 'dayjs'
export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        last_data: {
            boxes: 0,
            qty: 0,
            land_cost: 0
        },
        this_data: {
            boxes: 0,
            qty: 0,
            land_cost: 0
        },
    })
    const [store, setStore] = useState([])
    const [type, setType] = useState<1 | 2>(1)
    const { initialState } = useModel('@@initialState');
    const { configInfo = {} } = initialState;

    const init = (storeIds?: number[]) => {
        setLoading(true)
        removalOrderGetWarehouseInfo({ store_id: storeIds?.length ? storeIds : undefined, type }).then(res => {
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
    }, [type])
    return (<div style={{ padding: '0px 4px 10px 10px' }}>
        <Spin spinning={loading}>
            <h3>
                Warehouse Performance<InfoCircle title='Total Processed/Checked Romoval Orders for Last and This Week' />
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
                {/* <RangePicker value={date} onChange={(val) => {
                    if (val) {
                        setDate(val)
                    } else {
                        setDate([null, null])
                    }
                }} /> */}
                <Radio.Group
                    value={type}
                    onChange={(e) => setType(e.target.value)}>
                    <Radio.Button value={1}>
                        Weeks
                    </Radio.Button>
                    <Radio.Button value={2}>
                        Months
                    </Radio.Button>
                </Radio.Group>
                <Button type="primary" onClick={() => {
                    init(store)
                }}>Search</Button>
            </Space>
            <div style={{ marginTop: '10px' }}>
                <Row>
                    <Col span={6}>
                        <Card style={{ margin: '4px 4px 4px 0' }} size='small' title={`Last ${['Week', 'Month'][type - 1]}`}>
                            <Statistic title={<>Boxes<InfoCircle title='Total Tracking Numbers' /></>} value={data.last_data.boxes} />
                            <Statistic title={<>Unit<InfoCircle title='Total Product Quantities' /></>} value={data.last_data.qty} />
                            <Statistic title={<>Total Inventory Cost<InfoCircle title='Total Inventory Cost from NetSuite' /></>} prefix={"$"} value={data.last_data.land_cost} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card style={{ margin: 4 }} size='small' title={`This ${['Week', 'Month'][type - 1]}`}>
                            <Statistic title={<>Boxes<InfoCircle title='Total Tracking Numbers' /></>} value={data.this_data.boxes} />
                            <Statistic title={<>Unit<InfoCircle title='Total Product Quantities' /></>} value={data.this_data.qty} />
                            <Statistic title={<>Total Inventory Cost<InfoCircle title='Total Inventory Cost from NetSuite' /></>} prefix={"$"} value={data.this_data.land_cost} />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Spin>
    </div>)
}