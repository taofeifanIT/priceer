/*
 * @Author: taofeifanIT 3553447302@qq.com
 * @Date: 2022-08-05 16:09:03
 * @LastEditors: taofeifanIT 3553447302@qq.com
 * @LastEditTime: 2022-08-15 16:55:38
 * @FilePath: \priceer\src\pages\ReportView.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { PageContainer } from '@ant-design/pro-components';
import type { DatePickerProps } from 'antd'
import { Alert, Card, Button, DatePicker, message, Timeline, Tag, Checkbox, Select } from 'antd';
import { useState, useEffect } from 'react';
import { createDownload } from '@/utils/utils'
import moment from 'moment'
import { VerticalAlignBottomOutlined, LoadingOutlined, SyncOutlined } from '@ant-design/icons';
import styles from '@/styles/modules/checkTag.less'

const { CheckableTag } = Tag;


type QuestItem = {
    type: any;
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
    type: any;
}

const ReportView = (props: {
    downloadFile: (params: { year: number, week: number, reportNames: string[] }) => Promise<any>,
    index: () => Promise<any>,
    title: string;
}
) => {
    const { downloadFile, index, title } = props
    const [time, setTime] = useState<any>({
        year: moment().get('year'),
        week: moment().get('week')
    })
    const [data, setData] = useState<UseItem[]>([])
    const [loading, setLoading] = useState(false)
    const [listLoading, setListLoading] = useState(false)
    const onChange: DatePickerProps['onChange'] = (date) => {
        let year: any = moment(date).get('year')
        let week: any = moment(date).get('week')
        if (!date) {
            year = moment().get('year')
            week = moment().get('week')
        }
        setTime({ year, week })
    };
    const TimelineItem = (props: UseItem) => {
        const [loading, setLoading] = useState(false)
        const { year, week, data, date, type } = props
        const [selectedTags, setSelectedTags] = useState<string[]>(data)
        const downloadReport = (year: number, week: number) => {
            setLoading(true)
            downloadFile({ year, week, reportNames: selectedTags }).then(res => {
                let url = window.URL.createObjectURL(new Blob([res]))
                message.success("Download Complete!")
                createDownload(`${year}-${week}.csv`, url)
            }).finally(() => {
                setLoading(false)
            })
        }
        const handleChange = (tag: string, checked: boolean) => {
            const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
            setSelectedTags(nextSelectedTags);
        };
        return <Timeline.Item>
            A total of {data.length} reports from <h3 style={{ 'display': 'inline-block' }}>{date.replace("～", " to ")}</h3> are created
            {loading ? <LoadingOutlined style={{ 'marginLeft': '5px' }} spin /> : (
                <a
                    onClick={() => {
                        downloadReport(year, parseInt(week))
                    }}><VerticalAlignBottomOutlined style={{ 'marginLeft': '5px' }} />
                </a>
            )}
            &nbsp;&nbsp;<Checkbox checked={selectedTags.length === data.length} onClick={() => {
                if (selectedTags.length === data.length) {
                    setSelectedTags([])
                } else {
                    setSelectedTags(data)
                }
            }}>Select All</Checkbox>
            &nbsp;&nbsp;
            <Select style={{ "width": "140px" }} size='small' defaultValue={'all'} onChange={(val) => {
                if (val === 'all') {
                    setSelectedTags(data)
                } else {
                    setSelectedTags(data.filter(item => item.includes(val)))
                }
            }}>
                <Select.Option value={'all'}>All</Select.Option>
                {Object.keys(type).map((item: any) => {
                    return <Select.Option value={type[item]}>{type[item]}</Select.Option>
                })}
            </Select>
            <p className={styles.tag}>
                {data.map(reportName => {
                    return <CheckableTag

                        style={{ 'marginBottom': '8px', 'border': '1px solid #c1bcbcd9' }}
                        key={reportName}
                        checked={selectedTags.indexOf(reportName) > -1}
                        onChange={checked => handleChange(reportName, checked)}
                    >
                        {reportName}
                    </CheckableTag>
                })}
            </p>
        </Timeline.Item>
    }

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
                            type: item.type,
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
                    message={title}
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
