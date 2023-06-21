import { MenuOutlined } from '@ant-design/icons';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Card, Table, Input, Space, message, Image, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { getListForSort, editSortNew } from '@/services/odika/requirementList';
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
        key: 'sort',
    },
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
                    window.open(`/odika/ViewDesign?id=${record.id}`)
                }}>View</Button>
            </>
        }
    }
]

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
}

const Row = ({ children, ...props }: RowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes}>
            {React.Children.map(children, (child) => {
                if ((child as React.ReactElement).key === 'sort') {
                    return React.cloneElement(child as React.ReactElement, {
                        children: (
                            <MenuOutlined
                                ref={setActivatorNodeRef}
                                style={{ touchAction: 'none', cursor: 'move' }}
                                {...listeners}
                            />
                        ),
                    });
                }
                return child;
            })}
        </tr>
    );
};

const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<any>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const onSearch = (value: string) => {
        setKeyword(value)
    };
    const editSortList = (params: { id: number, priority: number }[]) => {
        editSortNew(params).then(res => {
            if (!res.code) {
                message.error(res.msg);
            }
        }).finally(() => {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            initData()
        })
    }
    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            const data: any = (previous: any) => {
                const activeIndex = previous.findIndex((i: { id: UniqueIdentifier; }) => i.id === active.id);
                const overIndex = previous.findIndex((i: { id: UniqueIdentifier | undefined; }) => i.id === over?.id);
                const result = arrayMove(previous, activeIndex, overIndex);
                const params = result.map((item: any, index: number) => {
                    return {
                        id: item.id,
                        priority: index + 1
                    }
                })
                editSortList(params)
                return result;
            }
            setDataSource(data);
        }
    };
    const initData = () => {
        setLoading(true);
        getListForSort({ keyword: keyword || undefined }).then(res => {
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
            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                <SortableContext
                    // rowKey array
                    items={dataSource.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Table
                        components={{
                            body: {
                                row: Row,
                            },
                        }}
                        loading={loading}
                        rowKey="id"
                        columns={columns}
                        dataSource={dataSource}
                    />
                </SortableContext>
            </DndContext>
        </Card>
    );
};

export default App;