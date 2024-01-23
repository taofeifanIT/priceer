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
import { round } from 'mathjs'
import { checkDecimal, cooMap } from '@/utils/utils'



export default (props: {
    params: paramType,
    setParams: (params: paramType) => void,
    width?: number,
}) => {
    const { params, setParams, width = 1600 } = props;
    const getGwWeightSum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.g_w_weight)
        }, 0).toFixed(2)
    }
    const getNwWeightSum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.n_w_weight)
        }, 0).toFixed(2)
    }
    const getInvoiceTitle = (title: string) => {
        const titles = ['威昱', '巢威']
        if (titles.some((item) => title.includes(item))) {
            return titles.find((item) => title.includes(item))
        }
        return ''
    }

    const getFreightCost = () => {
        return parseFloat(params.shippingFee || "0")
    }
    const getPremium = () => {
        return params.premium
    }
    const exportExcelFile = () => {
        const excelHeader = [
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
                total_amount: item.declarationSum,
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
                setParams({
                    ...params,
                    ultimateDestinationCn: res.data
                })
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
    }, [])
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
                            <th colSpan={14} contentEditable style={{ fontWeight: 600, fontSize: '18px' }}>
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
                            <th colSpan={2} contentEditable style={{ borderBottom: '1px solid white' }}>
                                境内发货人
                                <span style={{ marginLeft: '30px' }}>{template[params.templateNumber].overseasConsignor.phone}</span>
                                <br />
                                <span style={{ borderBottom: 'none' }}>{template[params.templateNumber].overseasConsignor.fax}</span>
                            </th>
                            <th colSpan={5} contentEditable style={{ borderBottom: '1px solid white' }}>出境关别</th>
                            <th colSpan={4} style={{ borderBottom: '1px solid white' }}>出口日期</th>
                            <th contentEditable style={{ borderBottom: '1px solid white' }}>申报日期</th>
                            <th colSpan={2} contentEditable style={{ borderBottom: '1px solid white' }}>备案号</th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>
                                {template[params.templateNumber].overseasConsignor.name}
                            </th>
                            <th colSpan={5} contentEditable />
                            <th colSpan={4} style={{ textAlign: 'center' }} contentEditable>
                                {/* 2023/8/29 */}
                                {dayjs().format('YYYY/MM/DD')}
                            </th>
                            <th contentEditable />
                            <th colSpan={2} contentEditable>联系电话：{template[params.templateNumber].customsDeclaration.phone}</th>
                        </tr>
                        <tr>
                            <th colSpan={2} style={{ borderBottom: '1px solid white' }}>境外收货人</th>
                            <th colSpan={5} style={{ borderBottom: '1px solid white' }}>运输方式</th>
                            <th colSpan={4} style={{ borderBottom: '1px solid white' }}>运输工具名称及航次号</th>
                            <th colSpan={3} style={{ borderBottom: '1px solid white' }}>提运单号</th>
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
                            <th colSpan={2} contentEditable style={{ borderBottom: '1px solid white' }}>
                                生产销售单位
                                <span style={{ marginLeft: '30px' }}>{template[params.templateNumber].overseasConsignor.phone}</span>
                                <br />
                                <span >{template[params.templateNumber].overseasConsignor.fax}</span>
                            </th>
                            <th colSpan={5} style={{ borderBottom: '1px solid white' }}>监管方式</th>
                            <th colSpan={4} style={{ borderBottom: '1px solid white' }}>征免性质</th>
                            <th colSpan={3} contentEditable style={{ borderBottom: '1px solid white' }}>许可证号</th>
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
                            <th colSpan={2} style={{ borderBottom: '1px solid white' }}>合同协议号</th>
                            <th colSpan={5} style={{ borderBottom: '1px solid white' }}>贸易国（地区）</th>
                            <th colSpan={4} style={{ borderBottom: '1px solid white' }}>运抵国（地区）</th>
                            <th colSpan={1} style={{ borderBottom: '1px solid white' }}>指运港</th>
                            <th colSpan={2} style={{ borderBottom: '1px solid white' }}>离境口岸</th>
                        </tr>
                        <tr>
                            <th colSpan={2}>{params.invoiceNumber}</th>
                            <th colSpan={5} contentEditable>
                                {params.ultimateDestinationCn}
                            </th>
                            <th colSpan={4} contentEditable>
                                {params.ultimateDestinationCn}
                            </th>
                            <th colSpan={1} contentEditable>
                                {params.ultimateDestinationCn}
                            </th>
                            <th colSpan={2} contentEditable>上海浦东机场</th>
                        </tr>
                        <tr>
                            <th colSpan={2} style={{ borderBottom: '1px solid white' }}>包装种类</th>
                            <th colSpan={1} style={{ borderBottom: '1px solid white' }}>件数</th>
                            <th colSpan={4} style={{ borderBottom: '1px solid white' }}>毛重（千克）</th>
                            <th colSpan={3} style={{ borderBottom: '1px solid white' }}>净重(千克)</th>
                            <th colSpan={1} style={{ borderBottom: '1px solid white' }}>成交方式</th>
                            <th colSpan={1} style={{ borderBottom: '1px solid white' }}>运费</th>
                            <th colSpan={1} style={{ borderBottom: '1px solid white' }}>保费</th>
                            <th colSpan={1} style={{ borderBottom: '1px solid white' }}>杂费</th>
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
                            {/* <th colSpan={1} >$ {(parseFloat(params.shippingFee) - params.premium).toFixed(2)}</th> */}
                            <th colSpan={1} >$ {(getFreightCost() - getPremium()).toFixed(2)}</th>
                            <th colSpan={1}>$ {params.premium.toFixed(2)}</th>
                            <th colSpan={1} >
                                $ <TextEditor
                                    value={params.miscellaneousFee}
                                    width={100}
                                    onChange={(e: { value: any; }) => {
                                        setParams({
                                            ...params,
                                            miscellaneousFee: e.value
                                        })
                                    }}
                                />
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
                                        />&nbsp;
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
                                        {item.unit}
                                    </td>
                                    <td contentEditable>
                                        {item.blankSpaceBehindUnit}
                                    </td>
                                    <td>{item.n_w_weight}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item.qty && (item.declarationSum / item.qty).toFixed(2)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {item.declarationSum}
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
                                        {params.ultimateDestinationCn}
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
                            <td contentEditable style={{ textAlign: 'center' }}>{checkDecimal(round(params.declarationTotal, 2))}</td>
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
                                报关人员
                                <br />
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

