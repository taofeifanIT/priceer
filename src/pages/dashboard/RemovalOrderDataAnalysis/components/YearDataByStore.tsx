import { Spin, Space, message, Radio, Button, Card } from 'antd';
import { removalOrderNotReceived } from '@/services/dashboard/removalOrderDataAnalysis'
import InfoCircle from './InfoCircle'
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { exportTableExcel } from '@/utils/excelHelper'
import './yearDataByStore.less'


export default () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<
        { table: any[]; tableColumn: any[], total: any }>
        ({ table: [], tableColumn: [], total: {} })
    const [type, setType] = useState<1 | 2 | 3>(2)
    const { initialState } = useModel('@@initialState');
    const { configInfo = {} } = initialState;

    const init = (typeNumber: 1 | 2 | 3) => {
        setLoading(true)
        removalOrderNotReceived({ type: typeNumber }).then(res => {
            if (!res.code) {
                throw res.msg
            }
            const columnsData: any = []
            res.data.forEach((item: any) => {
                item.content.forEach((subItem: any) => {
                    columnsData.push(subItem.current_date)
                })
            })
            const columns = [...new Set(columnsData)]
            const tableData = res.data
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
                            tableTotal[columnsItem + '_boxes'] += parseInt(subSubItem.boxes)
                            tableTotal[columnsItem + '_qty'] += parseInt(subSubItem.qty)
                        }
                    })
                    tempObj.storeId = configInfo?.store?.find((storeItem: any) => storeItem.id === item.store_id)?.nick_name
                })
                if (Object.keys(tempObj).length > 0) {
                    tempTableData.push(tempObj)
                }
            })
            // tempTableData.push(tableTotal)
            setData({
                ...data,
                table: tempTableData,
                tableColumn: columns,
                total: tableTotal
            } as any)
        }).catch(err => {
            message.error(JSON.stringify(err))
        }).finally(() => {
            setLoading(false)
        })
    }
    useEffect(() => {
        init(type)
    }, [type])
    return (<div>
        <Spin spinning={loading}>
            <Card
                title='The Not Processed Removal Orders'
                size='small'
                extra={<Space>
                    <Radio.Group
                        value={type}
                        size='small'
                        onChange={(e) => setType(e.target.value)}>
                        <Radio.Button value={1}>
                            Days
                        </Radio.Button>
                        <Radio.Button value={2}>
                            Weeks
                        </Radio.Button>
                        <Radio.Button value={3}>
                            Months
                        </Radio.Button>
                    </Radio.Group>
                    {/* download button */}
                    <Button size='small' type='primary' onClick={() => {
                        exportTableExcel(document.getElementById('yearDataTable'), 'NotReceived.xlsx')
                    }}>Download</Button>
                </Space>}>
                <div className='yearDataBystore'>
                    <table id='yearDataTable' style={{ width: '100%', border: '1px solid #efefef' }} border="1">
                        <thead style={{ background: '#fafafa' }}>
                            <tr>
                                <th rowSpan={2} style={{ height: 40, width: 80 }}>Store</th>
                                {data.tableColumn.map((item: any) => {
                                    return <th colSpan={2} key={item} style={{ height: 40 }}>{item}</th>
                                })}
                            </tr>
                            <tr>
                                {
                                    data.tableColumn.map((item: any, index: number) => {
                                        return <>
                                            <th key={item + '_boxes'}>Boxes {index === 0 ? <InfoCircle title='Total Tracking Numbers which not processed on this date' /> : null}</th>
                                            <th key={item + '_qty'}>Qty {index === 0 ? <InfoCircle title='Total Tracking Numbers which not processed on this date' /> : null}</th>
                                        </>
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.table.map((item: any) => {
                                    return <tr key={item.storeId}>
                                        <td style={{ paddingLeft: 10, width: 80 }}>{item.storeId}</td>
                                        {
                                            data.tableColumn.map((subItem: any) => {
                                                return <>
                                                    <td align='center'>{item[subItem + '_boxes']}</td>
                                                    <td align='center'>{item[subItem + '_qty']}</td>
                                                </>
                                            })
                                        }
                                    </tr>
                                })
                            }
                        </tbody>
                        <tfoot>
                            <tr>
                                {
                                    //遍历 data.total
                                    Object.keys(data.total).map((item: any) => {
                                        if (item === 'storeId') {
                                            return <td key={item} style={{ paddingLeft: 10, width: 80 }}>{data.total[item]}</td>
                                        }
                                        return <td align='center' key={item}>{data.total[item]}</td>
                                    })
                                }
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>


            {/* <Divider style={{ margin: '8px 0 12px 0' }} /> */}
        </Spin>
    </div>)
}