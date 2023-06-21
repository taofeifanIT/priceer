import { Button, Card, Table, Input, Space, message, Image, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { getListForCheck } from '@/services/odika/requirementList';
import type { RequirementListItem } from '@/services/odika/requirementList';
const { Text } = Typography;
const { Search } = Input;


const getImageUrl = (baseUrl: string) => {
    return 'http://api-rp.itmars.net/storage/' + baseUrl
}

const getInfoComponent = (record: RequirementListItem) => {
    let imgUrl: any = { url: 'http://api-rp.itmars.net/example/default.png', thunmb_url: 'http://api-rp.itmars.net/example/default.png' };
    if (record.mainPicture?.whiteBackgroundAndProps?.url) {
        imgUrl = {
            url: getImageUrl(record.mainPicture?.whiteBackgroundAndProps?.url[0]),
            thunmb_url: getImageUrl(record.mainPicture?.whiteBackgroundAndProps?.url[0])
        }
    } else if (record.mainPicture?.sizeAndNaterial?.url) {
        imgUrl = {
            url: getImageUrl(record.mainPicture?.sizeAndNaterial?.url[0]),
            thunmb_url: getImageUrl(record.mainPicture?.sizeAndNaterial?.url[0])
        }
    }
    return <>
        <Space>
            <div style={{ display: 'inline-block', 'width': 50 }}>
                <Image
                    width={50}
                    height={50}
                    src={imgUrl.thunmb_url}
                    preview={{
                        src: imgUrl.url,
                    }} />
            </div>
            <div style={{ display: 'inline-block', width: 300 }}>
                <Text>{record.sku}</Text>
                <Text style={{ maxWidth: '300px' }} ellipsis={{ tooltip: record.memo }} type="secondary">{record.memo}</Text>
            </div>
        </Space>
    </>
}

const columns: ColumnsType<RequirementListItem> = [
    {
        title: '信息',
        dataIndex: 'info',
        key: 'info',
        width: 385,
        render: (text: any, record: any) => getInfoComponent(record)
    },
    {
        title: '创建信息',
        dataIndex: 'creator',
        key: 'creator',
        width: 260,
        render: (text: any, record: any) => {
            return <div style={{ 'width': '260px' }}>
                <div><Text type="secondary">创建人：</Text>{record.creator}</div>
                <div><Text type="secondary">创建时间：</Text>{record.createTime}</div>
            </div>
        }
    },
    {
        // priority
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
    },
    {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        render: (text: any, record) => {
            return <>
                <Button type="link" onClick={() => {
                    window.open(`/odika/ViewDesign?id=${record.id}&check=true`)
                }}>Check</Button>
            </>
        }
    }
]


const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const onSearch = (value: string) => {
        setKeyword(value)
    };
    const initData = () => {
        setLoading(true);
        getListForCheck({ keyword: keyword || undefined }).then(res => {
            if (res.code) {
                const sourceData = res.data.data
                // 数据拆分priority大于0的升序，等于0的跟在后面
                const tempData1 = sourceData.filter((item: any) => item.priority > 0).sort((a: any, b: any) => a.priority - b.priority)
                const tempData2 = sourceData.filter((item: any) => item.priority === 0)
                const newData = tempData1.concat(tempData2).map((item: any, index: number) => {
                    return {
                        ...item,
                        priority: index + 1
                    }
                })
                setDataSource(newData)
            } else {
                throw res.msg
            }
        }).finally(() => {
            setLoading(false);
        }).catch(err => {
            message.error(err)
        })
    }
    useEffect(() => {
        initData()
    }, [keyword])
    return (
        <Card
            size='small'
            title={<Search placeholder="input search text" onSearch={onSearch} style={{ width: 200, marginLeft: '10px' }} />}
            extra={<Button type="primary" onClick={initData}>刷新</Button>}
        >
            <Table
                loading={loading}
                rowKey="id"
                columns={columns}
                dataSource={dataSource}
            />
        </Card>
    );
};

export default App;