import { Row, Col, Button, Select, message, Spin, Input } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import './css/generateDeclarationInformation.less'
import { createImage } from '@/utils/utils'
import dayjs from 'dayjs'
import { getInfoByNS } from '@/services/warehouse/generateDeclarationInformation'
import type { tInfoByNSItems } from '@/services/warehouse/generateDeclarationInformation'

const template = [
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD ',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            'zhangzijia@networkprovide.com'
        ],
        consionee: [
            'SHANGHAI COLLIDE NETWORK TECHNOLOGY CO., LTD',
            '13 Emporium Avenue',
            'Kemps Creek, NSW 2178',
            'AU',
            '',
            ''
        ],
        importerOfRecord: [
            'SHANGHAI COLLIDE NETWORK TECHNOLOGY CO., LTD',
            '13 Emporium Avenue',
            'Kemps Creek, NSW 2178',
            'AU',
            'zhangzijia@networkprovide.com',
            'ABN: 66341922900'
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'CN'
        ],
        carrier: [
            'DHL'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'Australia'
        ],
        notes: [
            'Bill Duties and Taxes to ABN 66341922900'
        ]
    },
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD ',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            'zhangzijia@networkprovide.com'
        ],
        consionee: [
            'SHANGHAI COLLIDE NETWORK TECHNOLOGY CO., LTD',
            'Plot 1, Lyons Park,Lyons Dr',
            'Coventry, West Midlands CV5 9PF',
            'GB'
        ],
        importerOfRecord: [
            'SHANGHAI COLLIDE NETWORK TECHNOLOGY CO., LTD',
            '77,HINTON ROAD NORTHAMPTON',
            'NORTHAMPTONSHIRE',
            'UK',
            'zhangzijia@networkprovide.com',
            'EORI Number：GB291192203'
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'CN'
        ],
        carrier: [
            'DHL'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'UK'
        ],
        notes: [
            'EORI Number：GB291192203'
        ]
    },
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD ',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            'zhangzijia@networkprovide.com'
        ],
        consionee: [
            'Epic Fan Inc.',
            '8050 Heritage Road',
            'Brampton, ON L6Y 0C9',
            'CA'
        ],
        importerOfRecord: [
            'Epic Fan Inc.',
            '1982 Esplanade Ave',
            'Orleans, Ontario K4A 3B3',
            "'Importer Number:'773624739RM0001",
            "Cathryn@ccb.ab.ca"
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'Multiple'
        ],
        carrier: [
            'DHL'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'CA'
        ],
        notes: [
            'Non-resident Importer.  Calgary Customs Broker Account #20200638D.  Broker has all docs'
        ]
    },
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD .',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            'zhangzijia@networkprovide.com'
        ],
        consionee: [
            'TELSTRAIGHT INTERNATIONAL INC',
            '2751 Plaza del Amo Ste 306',
            'TORRANCE, CA, 90503',
            '',
            'info@telstraight.com',
            'Tax ID: 46-3791646'
        ],
        importerOfRecord: [
            'TELSTRAIGHT INTERNATIONAL INC',
            '2751 Plaza del Amo Ste 306',
            'TORRANCE, CA, 90503',
            '',
            'info@telstraight.com',
            'Tax ID: 46-3791646'
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'CN'
        ],
        carrier: [
            'DHL'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'US'
        ],
        notes: [
            'Bill Duties and Tax to Tax ID 46-3791646'
        ]
    },
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD .',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            'zhangzijia@networkprovide.com'
        ],
        consionee: [
            'TELSTRAIGHT INTERNATIONAL INC',
            '2751 Plaza del Amo Ste 306',
            'TORRANCE, CA, 90503',
            '',
            'info@telstraight.com',
            'Tax ID: 46-3791646'
        ],
        importerOfRecord: [
            'MBC Brokers Inc.',
            '13823 Judah Ave',
            'Hawthorne, CA 90250',
            'T：(310) 727-0705',
            'John Hanson ',
            'info@mbcustoms.com'
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'CN'
        ],
        carrier: [
            'Fedex'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'US'
        ],
        notes: [
            'Bill Duties and Tax to Tax ID 46-3791646'
        ]
    },
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD ',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            'zhangzijia@networkprovide.com'
        ],
        consionee: [
            'Shanghai Jiela Trading Co Ltd',
            '450 Derwent PL',
            'Delta, BC V3M 5Y9',
            'CA ',
            '',
            '',
        ],
        importerOfRecord: [
            'Shanghai Jiela Trading Co Ltd',
            '361 Xinzhan Road, Xinqiao Town,',
            'Songjiang District, Shanghai',
            'CN ',
            "'Importer Number:'742921943RM0001",
            'Cathryn@ccb.ab.ca',
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'Multiple'
        ],
        carrier: [
            'DHL'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'CA'
        ],
        notes: [
            'Non-resident Importer.  Calgary Customs Broker Account #20200638F.  Broker has all docs'
        ]
    },
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD ',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            '',
            'zhangzijia@networkprovide.com'
        ],
        consionee: [
            'SHANGHAI JINGZHAN NETWORK TECHNOLOGY',
            '8050 Heritage Road',
            'Brampton, ON L6Y 0C9',
            'CA',
            '',
            '',
        ],
        importerOfRecord: [
            'SHANGHAI JINGZHAN NETWORK TECHNOLOGY',
            'Songjiang Sijing Town Dujiabang ',
            'Road No 89 23 Building 27',
            'Shanghai China 201601',
            'TEL:15800960591',
            'Import Account:704522275RM0001',
            "Cathryn@ccb.ab.ca"
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'Multiple'
        ],
        carrier: [
            'DHL'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'CA'
        ],
        notes: [
            'Non-resident Importer.  Calgary Customs Broker Account #20200638B.  Broker has all docs'
        ]
    },
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD ',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            'zhangzijia@networkprovide.com',
        ],
        consionee: [
            ' MovingIT, Co. Ltd',
            '450 Derwent PL',
            'Delta, BC V3M 5Y9',
            'CA',
            '',
            '',
        ],
        importerOfRecord: [
            'Moving IT Ltd',
            'Regus, Office 513,The Quays Digital World Centre',
            '1 Lowry Plaza,Salford, Manchester,M50 3UB',
            'TEL:+0161 216 4101',
            'Cathryn@ccb.ab.ca',
            "'Importer Number:' 706850278RM0001",
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'Multiple'
        ],
        carrier: [
            'DHL'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'CA'
        ],
        notes: [
            'Non-resident Importer.  Calgary Customs Broker Account #20200638A.  Broker has all docs'
        ]
    },
    {
        exporter: [
            'SHANGHAI WEI YU NETWORK TECHNOLOGY CO., LTD ',
            'Building C5, Weiheng Creative Park, No. 16 Shenbei 1st Road, Songjiang District, Shanghai，201612，China',
            '',
            'zhangzijia@networkprovide.com'
        ],
        consionee: [
            ' Shanghai Xiaochi Information Technology CO., LTD.',
            '8050 Heritage Road',
            'Brampton, ON L6Y 0C9',
            'CA',
            '',
            '',
        ],
        importerOfRecord: [
            ' Shanghai Xiaochi Information Technology CO., LTD.',
            'Songjiang Sijing Town Dujiabang ',
            'Road No 89 23 Building 27',
            'Shanghai China 201601',
            'TEL:15800960591',
            'Import Account:723130894RM0001',
            'Cathryn@ccb.ab.ca'
        ],
        termsFreight: [
            'Prepaid'
        ],
        countryOrigin: [
            'CN'
        ],
        carrier: [
            'DHL'
        ],
        termSale: [
            'DAP'
        ],
        ultimateDestination: [
            'CA'
        ],
        notes: [
            'Non-resident Importer.  Calgary Customs Broker Account #20200638C.  Broker has all docs'
        ]
    }
]


export default () => {
    const [data, setData] = useState<{
        data: tInfoByNSItems[],
        weightInIbsNum: number,
        qtyNum: number,
        totalAmountNum: number,
        premium: number,
        freightCost: number
    }>(
        {
            data: [],
            weightInIbsNum: 0,
            qtyNum: 0,
            totalAmountNum: 0,
            premium: 0,
            freightCost: 0
        }
    )
    const [templateIndex, setTemplateIndex] = useState<number>(0)
    const [soNumber, setSoNumber] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const genarateData = (so: string) => {
        setLoading(true)
        getInfoByNS({
            tranid: so
        }).then((res) => {
            if (res.code) {
                const tempData = res.data.filter((item: tInfoByNSItems) => item.item !== 'Shipping fee')
                const weightInIbsNum = tempData.reduce((pre: number, cur: tInfoByNSItems) => {
                    return pre + parseFloat(cur.weight_in_lbs)
                }, 0)
                const qtyNum = tempData.reduce((pre: number, cur: tInfoByNSItems) => {
                    return pre + cur.qty
                }, 0)
                const totalAmountNum = tempData.reduce((pre: number, cur: tInfoByNSItems) => {
                    return pre + parseFloat(cur.total_amount)
                }, 0)
                // const premium = totalAmountNum * 0.0005 保留两位小数 保持number类型
                const premium = totalAmountNum * 0.0005
                // 获取res.data最后一行的值
                const freightCost = parseFloat(res.data[res.data.length - 1].total_amount)
                setData({
                    data: tempData,
                    weightInIbsNum,
                    qtyNum,
                    totalAmountNum,
                    premium,
                    freightCost
                })
            } else {
                throw res.msg
            }
        }).catch((err) => {
            message.error(err)
        }).finally(() => {
            setLoading(false)
        })
    }
    return (
        <Row style={{ height: '100%' }} >
            <Col span={4} />
            <Col span={16}>
                <Spin spinning={loading}>
                    <div className='tableContrain' style={{ width: '100%', 'textAlign': 'center' }}>
                        <div style={{ width: '876px' }}>
                            <div>
                                <span>Template：</span>
                                <Select defaultValue={0} style={{ width: 200 }} onChange={(e) => {
                                    setTemplateIndex(e)
                                    console.log(template[e])
                                }}>
                                    {template.map((item, index) => {
                                        return <Select.Option value={index} key={index}>Template {index + 1}</Select.Option>
                                    })}
                                </Select>
                                &nbsp;&nbsp;
                                <span>
                                    SO Number：
                                </span>
                                <Input style={{ width: 120 }} onChange={(e) => {
                                    setSoNumber(e.target.value)
                                }} />
                                &nbsp;&nbsp;
                                <Button type="primary" onClick={() => {
                                    const reg = /(SO|TO)-S\d{4,}/
                                    if (!reg.test(soNumber)) {
                                        message.error('SO Number format error')
                                        return
                                    }

                                    genarateData(soNumber)
                                }}>
                                    Genarate
                                </Button>
                                &nbsp;&nbsp;
                                <Button type="primary" icon={<DownloadOutlined />} onClick={() => {
                                    createImage('generateDeclarationInformationTable')
                                }}>DownLoad</Button>
                            </div>
                            <table id='generateDeclarationInformationTable' border="1">
                                <thead>
                                    <tr>
                                        <th colSpan={7}>COMMERCIAL INVOICE</th>
                                        <th>Page No</th>
                                        <th style={{ width: 100 }}>1_of 1_Pages</th>
                                    </tr>
                                    <tr>
                                        <th style={{ width: 120 }}>AWB/BL#:</th>
                                        <th colSpan={6} contentEditable />
                                        <th>Date:</th>
                                        <th contentEditable>
                                            {dayjs().format('YYYY/MM/DD')}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan={2} >EXPORTER</th>
                                        <th colSpan={3}>CONSIGNEE</th>
                                        <th colSpan={4}>Importer of record</th>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2} colSpan={2}>{template[templateIndex].exporter[0]}</th>
                                        <th colSpan={3} contentEditable>
                                            {template[templateIndex].consionee[0]}
                                        </th>
                                        <th colSpan={4}>
                                            {template[templateIndex].importerOfRecord[0]}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan={3} contentEditable>
                                            {template[templateIndex].consionee[1]}
                                        </th>
                                        <th colSpan={4}>
                                            {template[templateIndex].importerOfRecord[1]}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th rowSpan={3} colSpan={2}>
                                            {template[templateIndex].exporter[1]}
                                        </th>
                                        <th colSpan={3} contentEditable>
                                            {template[templateIndex].consionee[2]}
                                        </th>
                                        <th colSpan={4}>
                                            {template[templateIndex].importerOfRecord[2]}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan={3} contentEditable>
                                            {template[templateIndex].consionee[3]}
                                        </th>
                                        <th colSpan={4}>
                                            {template[templateIndex].importerOfRecord[3]}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan={3} contentEditable>
                                            <a href={`mailto:${template[templateIndex].consionee[4]}`}>{template[templateIndex].consionee[4]}</a>
                                        </th>
                                        <th colSpan={4}>
                                            <a href={`mailto:${template[templateIndex].importerOfRecord[4]}`}>{template[templateIndex].importerOfRecord[4]}</a>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan={2}>
                                            <a>
                                                <a href={`mailto:${template[templateIndex].exporter[2]}`}>{template[templateIndex].exporter[2]}</a>
                                            </a>
                                        </th>
                                        <th colSpan={3} contentEditable>
                                            {template[templateIndex].consionee[5]}
                                        </th>
                                        <th colSpan={4}>
                                            {template[templateIndex].importerOfRecord[5]}
                                        </th>
                                    </tr>
                                    {(templateIndex === 6 || templateIndex === 8) && <tr>
                                        <th colSpan={2} style={{ fontWeight: 'normal' }}>
                                            <a>
                                                <a href={`mailto:${template[templateIndex].exporter[3]}`}>{template[templateIndex].exporter[3]}</a>
                                            </a>
                                        </th>
                                        <th colSpan={3} contentEditable>
                                            {template[templateIndex].consionee[6]}
                                        </th>
                                        <th colSpan={4} style={{ fontWeight: 'normal' }}>
                                            {template[templateIndex].importerOfRecord[6]}
                                        </th>


                                    </tr>}
                                    <tr>
                                        <th style={{ fontWeight: 'bold' }}>Terns of Freight</th>
                                        <th colSpan={3} style={{ fontWeight: 'bold' }}>Country of Origin</th>
                                        <th colSpan={2} style={{ fontWeight: 'bold' }}>Carrier</th>
                                        <th colSpan={3} style={{ fontWeight: 'bold' }}>Invoice Number</th>
                                    </tr>
                                    <tr>
                                        <th>
                                            {template[templateIndex].termsFreight[0]}
                                        </th>
                                        <th colSpan={3} contentEditable>
                                            {template[templateIndex].countryOrigin[0]}
                                        </th>
                                        <th contentEditable>
                                            {template[templateIndex].carrier[0]}
                                        </th>
                                        <th>Air</th>
                                        {/* Invoice Number */}
                                        <th colSpan={3} contentEditable />
                                    </tr>
                                    <tr>
                                        <th colSpan={1} style={{ fontWeight: 'bold' }}>NO. of PKGS</th>
                                        <th colSpan={1} style={{ fontWeight: 'bold' }}>Terms of Sale</th>
                                        <th colSpan={1} style={{ fontWeight: 'bold' }}>Ultimate Destination</th>
                                        <th colSpan={2} style={{ fontWeight: 'bold' }}>SO Number</th>
                                        <th colSpan={4} style={{ fontWeight: 'bold' }}>Notes</th>
                                    </tr>
                                    <tr>
                                        {/* NO. of PKGS */}
                                        <th colSpan={1} contentEditable />
                                        <th colSpan={1} contentEditable>
                                            {template[templateIndex].termSale[0]}
                                        </th>
                                        {/* Ultimate Destination */}
                                        <th colSpan={1} contentEditable>
                                            {template[templateIndex].ultimateDestination[0]}
                                        </th>
                                        {/* SO Number */}
                                        <th colSpan={2}>
                                            {soNumber}
                                        </th>
                                        <th colSpan={4}>
                                            {template[templateIndex].notes[0]}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan={1}>Item</th>
                                        <th colSpan={1}>Item Type</th>
                                        <th colSpan={1}>Description</th>
                                        <th colSpan={1}>COO</th>
                                        <th colSpan={1} style={{ width: 100 }}>HTS</th>
                                        <th colSpan={1} style={{ width: 70 }}>Weight in LBS</th>
                                        <th colSpan={1}>Qty</th>
                                        <th colSpan={1} style={{ width: 70 }}>Unit Price USD</th>
                                        <th colSpan={1}>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map((item, index: number) => {
                                        return <tr key={index} style={{ height: 168 }}>
                                            <td>
                                                {item.item}
                                            </td>
                                            <td>
                                                {item.item_type}
                                            </td>
                                            <td>
                                                {item.description}
                                            </td>
                                            <td contentEditable>
                                                {item.coo}
                                            </td>
                                            <td>
                                                {item.hts}
                                            </td>
                                            <td>
                                                {item.weight_in_lbs}
                                            </td>
                                            <td>
                                                {item.qty}
                                            </td>
                                            <td contentEditable>
                                                {item.unit_price_usd}
                                            </td>
                                            <td contentEditable>
                                                $ {item.total_amount}
                                            </td>
                                        </tr>
                                    })}
                                    <td style={{ height: 30 }} /> <td /> <td /> <td /> <td /> <td /> <td /><td /><td />
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th colSpan={5}><span style={{ marginRight: 10 }}>Sub Totals</span></th>
                                        <th colSpan={1}>
                                            {data.weightInIbsNum.toFixed(2)}
                                        </th>
                                        <th colSpan={1}>
                                            {data.qtyNum}
                                        </th>
                                        <th />
                                        <th colSpan={1}>$  {data.totalAmountNum.toFixed(2)}</th>
                                    </tr>
                                    <tr>
                                        <th rowSpan={3} colSpan={5} />
                                        <th colSpan={3}>Freight Cost</th>
                                        <th colSpan={1} id='premium'>$  {(data.freightCost - data.premium).toFixed(2)}
                                            <span className='freightCost'> {data.freightCost.toFixed(2)}</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>Insurance Cost</th>
                                        <th colSpan={1}>$  {data.premium.toFixed(2)}</th>
                                    </tr>
                                    <tr>
                                        <th colSpan={3}>Total Invoice Value</th>
                                        <th colSpan={1}>$  {(data.freightCost + data.totalAmountNum).toFixed(2)}</th>
                                    </tr>
                                    <tr>
                                        <th colSpan={9}>I hereby certify this commercial invoice to be true and correct.</th>
                                    </tr>
                                    <tr>
                                        <th colSpan={2}>Name</th>
                                        <th colSpan={5}>Signature</th>
                                        <th colSpan={2}>Date</th>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2} colSpan={2}> </th>
                                        <th rowSpan={2} colSpan={5}> </th>
                                        <th rowSpan={2} colSpan={2}>{
                                            dayjs().format('YYYY/MM/DD')
                                        }</th>
                                    </tr>
                                    <tr />
                                    <tr>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                    </tr>
                                    <tr>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th> </th>
                                        <th>Page No</th>
                                        <th>1_of 1_Pages</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </Spin>
            </Col>
            <Col span={4} />
        </Row>
    )
}
