import { Select, Space, Table, Button, message, Card } from 'antd';
import { useState, useEffect } from 'react';
import { getInventoryAge } from '@/services/reportView';
import { ExportOutlined } from '@ant-design/icons';
import { exportTableExcel } from '@/utils/excelHelper'


const { Option } = Select;

const reportConfig: any = {
    inventory_age: {
        reportName: 'US Inventory Age Report',
        needSorterColumns: [],
        needSelectColumns: {
            "Inventory Location": {
                value: '',
                options: [],
            },
        },
        boldCol: [
            "Qty Aged 60 ~ 90 Days",
            "Qty Aged 90 ~ 180 Days",
            "Qty Aged 180 ~ 365 Days",
        ]
    }
}

let allData: any = [];
export default () => {
    const [configInfo, setConfigInfo] = useState<any>(reportConfig);
    const [reportData, setReportData] = useState({
        columns: [],
        dataSource: [],
        alreadyInit: false,
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        total: 0,
        pageSizeOptions: ['50', '100', '200', '500', '1000'],
    });
    const [loading, setLoading] = useState(false);
    const [reportTemplate, setReportTemplate] = useState('inventory_age');
    const initData = (params: {
        type: string;
        page: number;
        len: number;
    }) => {
        setLoading(true);
        getInventoryAge(params).then((res: any) => {
            const { data, code, msg } = res;
            if (!code) {
                throw msg
            };
            const tempColumns: any = Object.keys(data.content[0]).map((item) => {
                // 判断是否是需要select的列
                if (Object.keys(configInfo[reportTemplate].needSelectColumns).includes(item)) {
                    // 获取需要select的列的值
                    const selectValues = data.content.map((columnItem: any) => {
                        return columnItem[item]
                    });
                    // 去重
                    const uniqueSelectValues = Array.from(new Set(selectValues));
                    // 设置select的值
                    const tempConfigInfo = { ...configInfo };
                    tempConfigInfo[reportTemplate].needSelectColumns[item].options = uniqueSelectValues;
                    setConfigInfo(tempConfigInfo);
                }
                // 判断值得类型，数字的话需要大小排序，字符串的话A-Z排序
                let sorter: any = false;
                let columnType = 'string';
                if (!isNaN(data.content[0][item])) {
                    columnType = 'number';
                    sorter = (a: any, b: any) => a[item] - b[item]
                } else {
                    sorter = (a: any, b: any) => a[item].localeCompare(b[item])
                }
                return {
                    title: item,
                    dataIndex: item,
                    key: item,
                    // sorter: configInfo[reportTemplate].needSorterColumns.includes(item) ? (a: any, b: any) => a[item] - b[item] : false,
                    sorter: (item !== 'Location Average Cost' && item !== 'Currency') ? sorter : false,
                    render: (text: any) => {
                        if (text === null) {
                            return ''
                        }
                        let valueStr: any = text
                        if (!isNaN(valueStr) && columnType === 'number' && configInfo[reportTemplate].boldCol.includes(item)) {
                            if (text?.toString().indexOf('.') !== -1) {
                                valueStr = parseFloat(parseFloat(valueStr).toFixed(3))
                            }
                            if (valueStr > 0) {
                                valueStr = <b>{valueStr}</b>
                            }
                        }
                        return valueStr

                    }
                };
            });
            allData = data.content;
            setReportData({
                columns: tempColumns,
                dataSource: data.content,
                alreadyInit: true,
            });
            setPagination({
                ...pagination,
                current: params.page,
                pageSize: params.len,
                total: data.length,
            });
        }).catch((err) => {
            console.log(err);
            message.error(JSON.stringify(err));
        }).finally(() => {
            setLoading(false);
        });
    }
    const exportData = () => {
        exportTableExcel(document.getElementById('hideTableSelfDefineReport'), reportTemplate + '.xlsx')
    }
    const getSelectComponent = () => {
        const selectData = Object.keys(configInfo[reportTemplate].needSelectColumns).map((item) => {
            const targetValue = configInfo[reportTemplate].needSelectColumns[item]
            return <span key={item}>
                <span>{item}：</span>
                <Select allowClear style={{ width: 220 }} value={targetValue.value} onChange={(val) => {
                    const tempConfigInfo = { ...configInfo };
                    tempConfigInfo[reportTemplate].needSelectColumns[item].value = val || '';
                    setConfigInfo(tempConfigInfo);
                }}>
                    {
                        targetValue.options.map((selectItem: any) => {
                            return <Option key={selectItem} value={selectItem}>{selectItem}</Option>
                        })
                    }
                </Select>
            </span>
        })
        return selectData
    }
    const caculateData = () => {
        // 判断是否需要filter
        const filterColumns = Object.keys(configInfo[reportTemplate].needSelectColumns).filter((item) => {
            return configInfo[reportTemplate].needSelectColumns[item].value
        })
        if (filterColumns.length) {
            const filterData = allData.filter((item: any) => {
                let flag = true;
                filterColumns.forEach((filterItem) => {
                    if (item[filterItem] !== configInfo[reportTemplate].needSelectColumns[filterItem].value) {
                        flag = false;
                    }
                })
                return flag
            })
            setReportData({
                ...reportData,
                dataSource: filterData,
            })
            // 设置分页
            setPagination({
                ...pagination,
                current: 1,
                total: filterData.length,
            })
        } else {
            setReportData({
                ...reportData,
                dataSource: allData,
            })
            // 设置分页
            setPagination({
                ...pagination,
                current: 1,
                total: allData.length,
            })
        }
    }
    useEffect(() => {
        if (!reportData.alreadyInit) {
            initData({
                type: reportTemplate,
                page: 1,
                len: 50,
            });
        }
    }, []);
    useEffect(() => {
        if (reportData.alreadyInit) {
            caculateData()
        }
    }, [JSON.stringify(configInfo)]);
    return (
        <div style={{ background: '#fff', padding: 8 }}>
            <Card
                size='small'
                extra={<Button
                    type='primary'
                    icon={<ExportOutlined />}
                    onClick={exportData}>
                    Export
                </Button>}
                title={<Space>
                    <span>Template Name：</span>
                    <Select style={{ width: 220 }} value={reportTemplate} onChange={(val) => {
                        setReportTemplate(val);
                    }}>
                        {
                            Object.keys(configInfo).map((item) => {
                                return <Option key={item} value={item}>{configInfo[item].reportName}</Option>
                            })
                        }
                    </Select>
                    {getSelectComponent()}
                    <Button type="primary" loading={loading} onClick={() => {
                        initData({
                            type: reportTemplate,
                            page: pagination.current,
                            len: pagination.pageSize,
                        })
                    }}>Generate</Button>
                </Space>}
            >
                <Table
                    bordered
                    columns={reportData.columns}
                    dataSource={reportData.dataSource}
                    pagination={pagination}
                    loading={loading}
                    size='small'
                    onChange={(page: any) => {
                        setPagination(page);
                    }}
                />
            </Card>
            <table id='hideTableSelfDefineReport' style={{ display: 'none' }}>
                <thead>
                    <tr>
                        {reportData.columns.map((item: any) => {
                            return <th key={item.dataIndex}>{item.title}</th>
                        })};
                    </tr>
                </thead>
                <tbody>
                    {reportData.dataSource.map((item: any) => {
                        return <tr key={item.sku}>
                            {reportData.columns.map((col: any) => {
                                return <td key={col.dataIndex}>{item[col.dataIndex]}</td>
                            })}
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    )
}