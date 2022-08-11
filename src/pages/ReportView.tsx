/*
 * @Author: taofeifanIT 3553447302@qq.com
 * @Date: 2022-08-05 16:09:03
 * @LastEditors: taofeifanIT 3553447302@qq.com
 * @LastEditTime: 2022-08-10 17:47:42
 * @FilePath: \priceer\src\pages\ReportView.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { PageContainer } from '@ant-design/pro-components';
import type { DatePickerProps } from 'antd'
import { Alert, Card, Button, DatePicker, message, Timeline, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import { downloadFile, index } from '@/services/reportView'
import { createDownload } from '@/utils/utils'
import moment from 'moment'
import { useIntl } from 'umi';
import { VerticalAlignBottomOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons';



type QuestItem = {
    year?: number,
    data: Array<{
        week: string,
        date: string,
        data: Array<string>,
    }>
}

type UseItem = {
    week: string,
    date: string,
    data: Array<string>,
    year: number,
    loading: boolean,
}

const TimelineItem = (props: UseItem) => {
    const [loading, setLoading] = useState(false)
    const { year, week, data, date } = props
    const downloadReport = (year: number, week: number) => {
        setLoading(true)
        downloadFile({ year, week }).then(res => {
            let url = window.URL.createObjectURL(new Blob([res]))
            createDownload(`${year}-${week}.csv`, url)
        }).finally(() => {
            setLoading(false)
        })
    }
    return <Timeline.Item>A total of {data.length} reports from <h3 style={{ 'display': 'inline-block' }}>{date.replace("～", " to ")}</h3> are created
        {loading ? <LoadingOutlined style={{ 'marginLeft': '5px' }} spin /> : (
            <a
                onClick={() => {
                    downloadReport(year, parseInt(week))
                }}><VerticalAlignBottomOutlined style={{ 'marginLeft': '5px' }} />
            </a>
        )}
        <p>
            {data.map(reportName => {
                return <Tag style={{ 'marginBottom': '8px' }}>{reportName}</Tag>
            })}
        </p>
    </Timeline.Item>
}


const ReportView: React.FC = () => {
    const intl = useIntl();
    const [time, setTime] = useState({
        year: moment().get('year'),
        week: moment().get('week')
    })
    const [data, setData] = useState<UseItem[]>([])
    const [loading, setLoading] = useState(false)
    const [listLoading, setListLoading] = useState(false)
    const onChange: DatePickerProps['onChange'] = (date) => {
        // console.log(date, dateString);
        let year: any = moment(date).get('year')
        let week: any = moment(date).get('week')
        if (!date) {
            year = moment().get('year')
            week = moment().get('week')
        }
        setTime({ year, week })
    };
    const getList = () => {
        setListLoading(true)
        index().then((res: any) => {
            if (res.code) {
                const resData: QuestItem[] = res.data
                let tempData: any[] = []
                resData.forEach(item => {
                    item.data.forEach(subItem => {
                        tempData.push({
                            ...subItem,
                            year: item.year,
                            loading: false
                        })
                    })
                })
                setData(tempData)
            } else {
                throw res.msg
            }
        }).catch(e => {
            message.error(e)
        }).finally(() => {
            setListLoading(false)
        })
    }
    useEffect(() => {
        getList()
    }, [])
    return (
        <PageContainer waterMarkProps={{ content: '' }}>
            <Card>
                <Alert
                    message={intl.formatMessage({
                        id: 'pages.welcome.alertMessage',
                        defaultMessage: 'report view.',
                    })}
                    type="success"
                    showIcon
                    banner
                    style={{
                        margin: -12,
                        marginBottom: 24,
                    }}
                    action={
                        <a><SyncOutlined key='alertLoading' spin={listLoading} onClick={getList} /></a>
                    }
                />
                <DatePicker onChange={onChange} picker="week" allowClear />
                <Button loading={loading} style={{ 'marginLeft': '8px' }} type='primary' icon={<VerticalAlignBottomOutlined />} onClick={() => {
                    setLoading(true)
                    downloadFile(time).then(res => {
                        console.log(res)
                        if (res.msg) {
                            throw res.msg
                        }
                        let url = window.URL.createObjectURL(new Blob([res]))
                        createDownload(`${time.year}-${time.week}.csv`, url)
                    }).catch(e => {
                        message.error(e)
                    }).finally(() => {
                        setLoading(false)
                    })
                }}>Download</Button>
            </Card>
            <Card loading={listLoading}>
                <Timeline>
                    {
                        data.map(item => {
                            return <TimelineItem {...item} />
                        })
                    }
                </Timeline>
            </Card>
        </PageContainer>
    );
};

export default ReportView;
