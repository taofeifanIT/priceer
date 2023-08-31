import { Table, Spin, Col, Row, Divider, Select } from 'antd';
import { removalOrderDashboard } from '@/services/dashboard/removalOrderDataAnalysis'
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
const { Column, ColumnGroup } = Table;


let returnRateData: any = []

const options = [
    {
        label: 'Amazon Canada',
        value: 'Amazon Canada',
    },
    {
        label: 'Amazon Mexico',
        value: 'Amazon Mexico',
    },
    {
        label: 'Amazon US',
        value: 'Amazon US',
    },
]

export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<
        { table: any[]; avg_days: any[]; return_rate: any[]; tableColumn: any[] }>
        ({ table: [], avg_days: [], return_rate: [], tableColumn: [] })
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
            setLoading(false)
            const columnsData: any = []
            res.data.table.forEach((item: any) => {
                item.content.forEach((subItem: any) => {
                    columnsData.push(subItem.current_date)
                })
            })
            const columns = [...new Set(columnsData)]
            const tableData = res.data.table
            const tempTableData: any = []
            const tableTotal: any = { storeId: 'Total' }
            columns.forEach((item: any) => {
                tableTotal[item + "_boxes"] = 0
                tableTotal[item + "_qty"] = 0
            })
            tableData.forEach((item: any) => {
                const tempObj: any = {}
                item.content.forEach((subSubItem: any) => {
                    columns.forEach((columnsItem: any) => {
                        if (subSubItem.current_date === columnsItem) {
                            tempObj[columnsItem + '_boxes'] = subSubItem.boxes
                            tempObj[columnsItem + '_qty'] = subSubItem.qty
                            tableTotal[columnsItem + '_boxes'] += subSubItem.boxes
                            tableTotal[columnsItem + '_qty'] += subSubItem.qty
                        }
                    })
                    tempObj.storeId = configInfo.store?.find((storeItem: any) => storeItem.id === item.store_id)?.nick_name
                })
                if (Object.keys(tempObj).length > 0) {
                    tempTableData.push(tempObj)
                }
            })
            tempTableData.push(tableTotal)
            const avgDayTotal: any = { storeId: 'Total', last_week: 0, this_week: 0 }
            const avgDaysData = res.data.avg_days.map((item: any) => {
                avgDayTotal.last_week += item.content.last_week
                avgDayTotal.this_week += item.content.this_week
                return {
                    storeId: configInfo.store?.find((storeItem: any) => storeItem.id === item.store_id)?.nick_name,
                    last_week: item.content.last_week,
                    this_week: item.content.this_week,
                }
            })
            avgDaysData.push(avgDayTotal)
            returnRateData = res.data.return_rate
            setData({
                ...data,
                table: tempTableData,
                tableColumn: columns,
                avg_days: avgDaysData,
                return_rate: res.data.return_rate
            } as any)
        })
    }
    useEffect(() => {
        init()
    }, [])
    return (<div>
        <Spin spinning={loading}>
            <Table
                dataSource={data.table}
                size='small'
                bordered
                pagination={false}
                scroll={{ y: 300 }}>
                <Column title="Store" dataIndex={'storeId'} />
                {
                    data.tableColumn.map((item: any) => {
                        return <ColumnGroup key={item} title={item}>
                            <Column title="Boxes" dataIndex={item + '_boxes'} key={item + '_boxes'} align='center' />
                            <Column title="Qty" dataIndex={item + '_qty'} key={item + '_qty'} align='center' />
                        </ColumnGroup>
                    })
                }

            </Table>
            <Divider style={{ margin: '14px 0' }} />
            <Row>
                <Col span={10}>
                    <h3 style={{ marginLeft: 9 }}>AVG Days in WH</h3>
                    <div style={{ padding: '0px 4px 10px 10px' }}>
                        <table style={{ width: '100%', border: '1px solid #ebebeb' }} border="1" >
                            <thead>
                                <tr style={{ background: '#fafafa' }}>
                                    <th align='left' style={{ paddingLeft: '5%' }}>Store</th>
                                    <th align='center'>Last Week</th>
                                    <th align='center'>This Week</th>
                                </tr>
                            </thead>
                            <tbody style={{ overflowY: 'scroll', height: 200 }}>
                                {data.avg_days.map((item: any) => {
                                    if (item.storeId === 'Total') {
                                        return <tr key={item.storeId} style={{ background: '#9bbaf4' }}>
                                            <td style={{ paddingLeft: '5%' }}>{item.storeId}</td>
                                            <td align='center'>{item.last_week}</td>
                                            <td align='center'>{item.this_week}</td>
                                        </tr>
                                    }
                                    return <tr key={item.storeId}>
                                        <td style={{ paddingLeft: '5%' }}>{item.storeId}</td>
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
                        <Divider type='vertical' style={{ height: 300 }} />
                    </div>
                </Col>
                <Col span={13}>
                    <div style={{ padding: '0px 10px 10px 4px' }}>
                        <h3 style={{ marginLeft: 4, display: 'inline-block', width: '50%' }}>Current Return Rates  Est.</h3>
                        <p style={{ display: 'inline-block' }}>
                            <span style={{ position: 'absolute', right: 10, top: -5 }}>
                                Store：
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
                            scroll={{ y: 367 }}>
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