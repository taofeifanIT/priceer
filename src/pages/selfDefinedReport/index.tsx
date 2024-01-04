import { Select, Space, Table, Button, message, Card } from 'antd';
import { useState, useEffect } from 'react';
import { getInventoryAge } from '@/services/reportView';
import { ExportOutlined } from '@ant-design/icons';
import { exportTableExcel } from '@/utils/excelHelper'
import { useModel } from 'umi';

const { Option } = Select;

const reportConfig: any = {
    inventory_age: {
        reportName: 'US Inventory Age Report',
        needSorterColumns: [],
        needSelectColumns: {
            "Inventory Location": {
                value: '',   // select的值
                options: [], // select的options
                filterName: 'Inventory Location_map', // 隐射搜索的字段
                lable: 'Store', // 展示的lable名称
                // 需要转换的map
                map: {
                    "AMAZON AU CHAOWEI": "CW AU",
                    "AMAZON CANADA EPIC": "EpicFan CA",
                    "AMAZON CANADA MHH": "MHH CA",
                    "AMAZON CANADA MIT": "MIT CA",
                    "AMAZON US CGG": "CGG US",
                    "AMAZON US CHASTE": "Chaste US",
                    "AMAZON US DSS": "DSS US",
                    "AMAZON US EPIC": "EpicFan US",
                    "AMAZON US ESC": "ESC US",
                    "AMAZON US GREAT FOURTEEN": "GF US",
                    "AMAZON US HH": "HHH US",
                    "AMAZON US HJR": "HJR US",
                    "AMAZON US JGJC": "TTM US",
                    "AMAZON US JL": "JL US",
                    "AMAZON US MHH": "MHH US",
                    "AMAZON US MIT": "MIT US",
                    "AMAZON.US CHAOWEI": "CW US",
                    "DOA US": "DOA US",
                    "OPEN BOX US": "Open Box US",
                    "USED US": "Used US",
                    "CLEAN US": "Clean US",
                    "WALMART US TEL": "Walmart US",
                    "PARCEL JET": "Parcel Jet",
                    "WYD - ATLANTA": "WYD - Atlanta",
                    "WYD - LA": "WYD - LA",
                }
            },
            "Brand": {
                value: '',
                options: [],
                lable: 'Brand',
            }
        },
        boldCol: [
            "Qty Aged 60 ~ 90 Days",
            "Qty Aged 90 ~ 180 Days",
            "Qty Aged 180 ~ 365 Days",
        ]
    }
}

const userDataPermission: any = {
    18: ["WYD - ATLANTA"],
    19: ["WYD - LA"],
    31: ["PARCEL JET"],
    42: ["AMAZON US MHH"],
    16: ["AMAZON CANADA MHH"],
    // 7: ["AMAZON US MHH"],
};

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
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState;

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
            let content = data.content;
            if (userDataPermission[currentUser.id]) {
                content = data.content.filter((item: any) => {
                    return userDataPermission[currentUser.id].includes(item['Inventory Location'].toUpperCase())
                })
            }

            const tempColumns: any = Object.keys(content[0]).map((item) => {
                // 判断是否是需要select的列
                const needSelectColumns = Object.keys(configInfo[reportTemplate].needSelectColumns).includes(item)
                const tempConfigInfo = { ...configInfo };
                const itemMap = tempConfigInfo[reportTemplate].needSelectColumns[item]?.map;
                if (needSelectColumns) {
                    // 获取需要select的列的值
                    const selectValues = content.map((columnItem: any) => {
                        return columnItem[item]
                    });
                    // 设置select的值 去重
                    let uniqueSelectValues = Array.from(new Set(selectValues)).filter((record: any) => {
                        if (itemMap) {
                            return Object.keys(itemMap).includes(record.toUpperCase())
                        }
                        return record
                    })
                    if (itemMap) {
                        uniqueSelectValues = uniqueSelectValues.map((record: any) => {
                            const innerData = itemMap[record]
                            if (!innerData) {
                                return itemMap[record.toUpperCase()]
                            }
                            return innerData
                        })
                    }
                    tempConfigInfo[reportTemplate].needSelectColumns[item].options = uniqueSelectValues;
                    setConfigInfo(tempConfigInfo);
                }
                // 判断值得类型，数字的话需要大小排序，字符串的话A-Z排序
                let sorter: any = false;
                let columnType = 'string';
                if (!isNaN(content[0][item])) {
                    columnType = 'number';
                    sorter = (a: any, b: any) => a[item] - b[item]
                } else {
                    sorter = (a: any, b: any) => a[item].localeCompare(b[item])
                }
                return {
                    title: item,
                    dataIndex: item,
                    key: item,
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

            allData = content.map((item: any) => {
                //    判断是否需要转换
                const tempItem = { ...item }
                Object.keys(configInfo[reportTemplate].needSelectColumns).forEach((selectItem) => {
                    const itemMap = configInfo[reportTemplate].needSelectColumns[selectItem].map;
                    if (itemMap) {
                        tempItem[selectItem + "_map"] = itemMap[item[selectItem].toUpperCase()] || item[selectItem]
                    }
                })
                return tempItem
            });
            setReportData({
                columns: tempColumns,
                dataSource: allData,
                alreadyInit: true,
            });
            setPagination({
                ...pagination,
                current: params.page,
                pageSize: params.len,
                total: content.length,
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
                <span>{targetValue.lable || item}：</span>
                <Select
                    showSearch
                    allowClear
                    style={{ width: 220 }}
                    value={targetValue.value} onChange={(val) => {
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
                // 如果有map的话，需要转换
                filterColumns.forEach((filterItem) => {
                    const needSelectColumns = configInfo[reportTemplate].needSelectColumns
                    if (needSelectColumns[filterItem].map) {
                        if (item[filterItem + '_map'] !== needSelectColumns[filterItem].value) {
                            flag = false;
                        }
                    } else {
                        if (item[filterItem] !== needSelectColumns[filterItem].value) {
                            flag = false;
                        }
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
                    {/* <Button type="primary" loading={loading} onClick={() => {
                        initData({
                            type: reportTemplate,
                            page: pagination.current,
                            len: pagination.pageSize,
                        })
                    }}>Generate</Button>
                    <span>Template Name：</span>
                    <Select style={{ width: 220 }} value={reportTemplate} onChange={(val) => {
                        setReportTemplate(val);
                    }}>
                        {
                            Object.keys(configInfo).map((item) => {
                                return <Option key={item} value={item}>{configInfo[item].reportName}</Option>
                            })
                        }
                    </Select> */}
                    {getSelectComponent()}
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