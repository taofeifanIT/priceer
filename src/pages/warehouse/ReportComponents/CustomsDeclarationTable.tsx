// import { Row } from 'antd';
import type { paramType, tInfoByNSItems } from '@/services/warehouse/generateDeclarationInformation'
import { template } from './reportConfig'
import './css/customsDeclaration.less'
import dayjs from 'dayjs'
import { useState } from "react";
import axios from "axios";
import { useEffect } from 'react';
import { message, Button } from "antd";
import { DownloadOutlined } from '@ant-design/icons';
import TextEditor from './TextEditor'
import { exportExcel } from '@/utils/excelHelper'
import { P } from '@antv/g2plot';

const cooMap: any = {
    "TW (TAIWAN PROVINCE OF CHINA)": "台湾",
    "MX": "墨西哥",
    "CN": "中国",
    "TH": "泰国",
    "PL": "波兰",
    "JP": "日本",
    "SI": "斯洛文尼亚",
    "US": "美国",
    "CA": "加拿大",
    "KR": "韩国",
    "VN": "越南",
    "LK": "斯里兰卡",
    "DE": "德国",
    "MY": "马来西亚",
    "Mexico": "墨西哥",
    "IT": "意大利",
    "SG": "新加坡",
    "Lao": "老挝",
    "Laos": "老挝",
    "MAS": "马来西亚",
    "TW": "台湾",
    "UK": "英国",
    "EE": "爱沙尼亚",
    "BE": "比利时",
    "SE": "瑞典",
    "RO": "罗马尼亚",
    "IE": "爱尔兰",
    "POL": "波兰",
    "SWE": "瑞典",
    "PH": "菲律宾",
    "AU": "澳大利亚",
    "ID": "印度",
    "NL": "荷兰",
    "IN": "印度",
    "FI": "芬兰",
}

export default (props: {
    params: paramType,
    setParams: (params: paramType) => void,
    width?: number,
}) => {
    const { params, setParams, width = 1600 } = props;
    const [ultimateDestinationCn, setUltimateDestinationCn] = useState('')
    const getTotalAmountNum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.total_amount)
        }, 0)
    }
    const getGwWeightSum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.g_w_weight)
        }, 0).toFixed(0)
    }
    const getNwWeightSum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.n_w_weight)
        }, 0).toFixed(2)
    }
    const getCustomsDeclarationTotalAmount = (item: tInfoByNSItems) => {
        return parseFloat(item.total_amount) / getTotalAmountNum() * (parseFloat(params.shippingFee) - params.premium) + parseFloat(item.total_amount) + parseFloat(item.total_amount) * 0.0005
    }
    const getCustomsDeclarationTotalAmountSum = () => {
        return params.data.reduce((sum, item) => {
            return sum + getCustomsDeclarationTotalAmount(item)
        }, 0).toFixed(2)
    }

    const getInvoiceTitle = (title: string) => {
        const titles = ['威昱', '巢威']
        // 如果title中包含威昱或巢威，返回威昱或巢威
        if (titles.some((item) => title.includes(item))) {
            return titles.find((item) => title.includes(item))
        }
        return ''
    }

    const exportExcelFile = () => {
        const excelHeader = [
            // 发票号 品名 数量 单位报关金额 抬头 币种 Salse order
            {
                title: '发票号',
                dataIndex: 'invoiceNumber',
                key: 'invoiceNumber',
            },
            {
                title: '品名',
                dataIndex: 'chinese_customs_clearance_name',
                key: 'chinese_customs_clearance_name',
            },
            {
                title: '数量',
                dataIndex: 'qty',
                key: 'qty',
            },
            {
                title: '单位',
                dataIndex: 'unit',
                key: 'unit',
            },
            {
                title: '报关金额',
                dataIndex: 'total_amount',
                key: 'total_amount',
            },
            {
                title: '抬头',
                dataIndex: 'soldFor',
                key: 'soldFor',
            },
            {
                title: '币种',
                dataIndex: 'currency',
                key: 'currency',
            },
            {
                title: 'Sales order',
                dataIndex: 'salesOrder',
                key: 'salesOrder',
            }
        ]
        const tempData = params.data.map((item) => {
            return {
                invoiceNumber: params.invoiceNumber,
                chinese_customs_clearance_name: item.chinese_customs_clearance_name,
                qty: item.unit === '千克' ? item.n_w_weight : item.qty,
                unit: item.unit,
                total_amount: getCustomsDeclarationTotalAmount(item).toFixed(2),
                soldFor: getInvoiceTitle(template[params.templateNumber].overseasConsignor.name),
                currency: item.currency,
                salesOrder: params.soNumber
            }
        })
        exportExcel(excelHeader, tempData, `${params.invoiceNumber || 'empy'}.xlsx`)
    }

    const translate = () => {
        if (!params.ultimateDestination) {
            return
        }
        const chatGTPUrl = 'http://chat.itmars.net/api/stream'
        const data = {
            "messages": [
                {
                    "role": "user",
                    "content": `把 ${params.ultimateDestination} 翻译成中文, 比如CA翻译成中文， 你回： 加拿大 ,确保回复内容只有国家名`
                }
            ],
            "key": "",
            "temperature": 0.5
        }
        axios.post(chatGTPUrl, data).then((res) => {
            if (res.status === 200) {
                setUltimateDestinationCn(res.data)
            } else {
                message.error('翻译失败')
            }

        })
    }
    const getValueByUnit = (item: tInfoByNSItems) => {
        return item.unit === '千克' ? (<TextEditor
            value={item.n_w_weight}
            onChange={(e) => {
                const data = [...params.data];
                data[index].n_w_weight = e.value;
                setParams({
                    ...params,
                    data
                })
            }}
        />) : (<TextEditor
            value={item.qty}
            onChange={(e) => {
                const data = [...params.data];
                data[index].qty = e.value;
                setParams({
                    ...params,
                    data
                })
            }}
        />)
    }
    useEffect(() => {
        translate()
    }, [params.ultimateDestination])
    return (
        <>
            <Button
                type="primary"
                icon={<DownloadOutlined />}
                size={'small'}
                onClick={exportExcelFile}
                style={{
                    marginBottom: 10,
                }}>
                Download Excel
            </Button>
            <div id='customsDeclarationBox'>
                <table border="1" style={{ width }} id='customsDeclaration'>
                    <thead>
                        <tr>
                            <th colSpan={14} contentEditable>
                                中华人民共和国海关出口货物报关单
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={1}>
                                预录入编号：
                            </th>
                            <th colSpan={2} contentEditable />
                            <th colSpan={1}>
                                海关编号：
                            </th>
                            <th colSpan={5} contentEditable />
                            <th colSpan={5}>
                                页码/页数：1/1
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>
                                境内发货人
                                <span style={{ marginLeft: '30px' }}>{template[params.templateNumber].overseasConsignor.phone}</span>
                                <br />
                                <span >{template[params.templateNumber].overseasConsignor.fax}</span>
                            </th>
                            <th colSpan={5} contentEditable>出境关别</th>
                            <th colSpan={4}>出口日期</th>
                            <th contentEditable>申报日期</th>
                            <th colSpan={2} contentEditable>备案号</th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>
                                {template[params.templateNumber].overseasConsignor.name}
                            </th>
                            <th colSpan={5} contentEditable>
                                {/* 2244 */}
                            </th>
                            <th colSpan={4} style={{ textAlign: 'center' }} contentEditable>
                                {/* 2023/8/29 */}
                                {dayjs().format('YYYY/MM/DD')}
                            </th>
                            <th contentEditable />
                            <th colSpan={2} contentEditable>联系电话：{template[params.templateNumber].customsDeclaration.phone}</th>
                        </tr>
                        <tr>
                            <th colSpan={2}>境外收货人</th>
                            <th colSpan={5}>运输方式</th>
                            <th colSpan={4}>运输工具名称及航次号</th>
                            <th colSpan={3} >提运单号</th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>
                                {template[params.templateNumber].importerOfRecord[0]}
                            </th>
                            <th colSpan={5} contentEditable>航空运输</th>
                            <th colSpan={4} contentEditable />
                            <th colSpan={3}>
                                {params.deliveryNumbers}
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>
                                生产销售单位
                                <span style={{ marginLeft: '30px' }}>{template[params.templateNumber].overseasConsignor.phone}</span>
                                <br />
                                <span >{template[params.templateNumber].overseasConsignor.fax}</span>
                            </th>
                            <th colSpan={5}>监管方式</th>
                            <th colSpan={4}>征免性质</th>
                            <th colSpan={3} contentEditable>许可证号</th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>
                                {template[params.templateNumber].overseasConsignor.name}
                            </th>
                            <th colSpan={5} contentEditable>一般监管</th>
                            <th colSpan={4} contentEditable>一般征税</th>
                            <th colSpan={3} contentEditable />
                        </tr>
                        <tr>
                            <th colSpan={2} >合同协议号</th>
                            <th colSpan={5}>贸易国（地区）</th>
                            <th colSpan={4}>运抵国（地区）</th>
                            <th colSpan={1}>指运港</th>
                            <th colSpan={2}>离境口岸</th>
                        </tr>
                        <tr>
                            <th colSpan={2}>{params.invoiceNumber}</th>
                            <th colSpan={5} contentEditable>
                                {ultimateDestinationCn}
                            </th>
                            <th colSpan={4} contentEditable>
                                {ultimateDestinationCn}
                            </th>
                            <th colSpan={1} contentEditable>
                                {ultimateDestinationCn}
                            </th>
                            <th colSpan={2} contentEditable>上海浦东机场</th>
                        </tr>
                        <tr>
                            <th colSpan={2}>包装种类</th>
                            <th colSpan={1}>件数</th>
                            <th colSpan={4}>毛重（千克）</th>
                            <th colSpan={3}>净重(千克)</th>
                            <th colSpan={1}>成交方式</th>
                            <th colSpan={1}>运费</th>
                            <th colSpan={1}>保费</th>
                            <th colSpan={1}>杂费</th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>纸箱</th>
                            <th colSpan={1}>
                                {params.numberOfCases}
                            </th>
                            <th colSpan={4}>{getGwWeightSum()}</th>
                            <th colSpan={3}>{getNwWeightSum()}</th>
                            <th colSpan={1}>
                                {params.soldFor}
                            </th>
                            <th colSpan={1} >$ {(parseFloat(params.shippingFee) - params.premium).toFixed(2)}</th>
                            <th colSpan={1}>$ {params.premium.toFixed(2)}</th>
                            <th colSpan={1} >
                                $ <span style={{ width: '100%' }} contentEditable />
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={14} contentEditable>随附单证及编号</th>
                        </tr>
                        <tr style={{ height: 50 }}>
                            <th colSpan={14} contentEditable>标记唛码及备注</th>
                        </tr>
                        <tr style={{ height: 40 }}>
                            <th>项号<br />商品编号</th>
                            <th />
                            <th>商品名称及规格型号</th>
                            <th colSpan={2} style={{ textAlign: 'center' }}>数量及单位</th>
                            <th />
                            <th>净重（千克）</th>
                            <th colSpan={3} style={{ textAlign: 'center' }}>单价/总价/币制</th>
                            <th>原产国(地区)</th>
                            <th>最终目的国（地区）</th>
                            <th>境内货源地</th>
                            <th>征免</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            params.data.map((item: tInfoByNSItems, index) => {
                                return <tr key={`customsDeclaration-${index}`} className='whole-node'>
                                    <td>{index + 1}</td>
                                    <td>
                                        <TextEditor
                                            value={item.cn_hs_code}
                                            onChange={(e) => {
                                                const data = [...params.data];
                                                data[index].cn_hs_code = e.value;
                                                setParams({
                                                    ...params,
                                                    data
                                                })
                                            }}
                                            onBlur={(e) => {
                                                const newUnit = params.hsCode.find((hsItem) => hsItem.name === e.value)?.unit || '个'
                                                const data = [...params.data];
                                                data[index].unit = newUnit;
                                                // 如果是千克，就把数量改成净重
                                                if (newUnit === '千克') {
                                                    data[index].blankSpaceBehindUnit = item.qty + ''
                                                } else {
                                                    data[index].blankSpaceBehindUnit = ''
                                                }
                                                setParams({
                                                    ...params,
                                                    data
                                                })
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <TextEditor
                                            value={item.chinese_customs_clearance_name}
                                            onChange={(e) => {
                                                const data = [...params.data];
                                                data[index].chinese_customs_clearance_name = e.value;
                                                setParams({
                                                    ...params,
                                                    data
                                                })
                                            }}
                                        />
                                    </td>
                                    <td>
                                        {getValueByUnit(item)}
                                    </td>
                                    <td>
                                        <select
                                            style={{
                                                border: 'none',
                                            }}
                                            value={item.unit} onChange={(e) => {
                                                const data = [...params.data];
                                                data[index].unit = e.target.value;
                                                if (e.target.value === '千克') {
                                                    data[index].blankSpaceBehindUnit = item.qty + ''
                                                }
                                                setParams({
                                                    ...params,
                                                    data
                                                })
                                            }}>
                                            <option value="个">个</option>
                                            <option value="千克">千克</option>
                                            <option value="双">双</option>
                                            <option value="台">台</option>
                                            <option value="只">只</option>
                                        </select>
                                    </td>
                                    <td contentEditable>
                                        {item.blankSpaceBehindUnit}
                                    </td>
                                    <td>{item.n_w_weight}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {/* {item.unit_price_usd} */}
                                        {(getCustomsDeclarationTotalAmount(item) / item.qty).toFixed(2)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {/* {item.total_amount} */}
                                        {getCustomsDeclarationTotalAmount(item).toFixed(2)}
                                    </td>
                                    <td>
                                        <TextEditor
                                            value={item.currency}
                                            onChange={(e) => {
                                                const data = [...params.data];
                                                data[index].currency = e.value;
                                                setParams({
                                                    ...params,
                                                    data
                                                })
                                            }}
                                        />
                                    </td>
                                    <td contentEditable>
                                        {cooMap[item.coo]}
                                    </td>
                                    <td contentEditable>
                                        {ultimateDestinationCn}
                                    </td>
                                    <td contentEditable>松江</td>
                                    <td contentEditable>照章征免</td>
                                </tr>
                            })
                        }
                        <tr>
                            {Array.from({ length: 14 }).map((_, index) => {
                                return <td contentEditable key={`customsDeclaration-${index}`} />
                            })}
                        </tr>
                        <tr>
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable style={{ textAlign: 'center' }}>总计</td>
                            <td contentEditable style={{ textAlign: 'center' }}>{getCustomsDeclarationTotalAmountSum()}</td>
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable />
                            <td contentEditable />
                        </tr>
                        <tr>
                            {Array.from({ length: 14 }).map((_, index) => {
                                return <td contentEditable key={`customsDeclaration-${index}`} />
                            })}
                        </tr>
                    </tbody>
                    <tfoot className='whole-node'>
                        <tr>
                            <th colSpan={1} contentEditable>
                                报关人员<br />
                                申报单位
                            </th>
                            <th colSpan={2} contentEditable>报关人员证号</th>
                            <th colSpan={2} contentEditable>
                                电话
                            </th>
                            <th colSpan={6} contentEditable>
                                兹申明对以上内容承担如实申报、依法纳税之法律责任<br />申报单位（签章）
                            </th>
                            <th colSpan={3} contentEditable>海关批注及签章 </th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </>
    )
}

