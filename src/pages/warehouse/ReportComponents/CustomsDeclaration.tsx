// import { Row } from 'antd';
import type { paramType, tInfoByNSItems } from '@/services/warehouse/generateDeclarationInformation'
import { template } from './reportConfig'
import './css/customsDeclaration.less'
import dayjs from 'dayjs'

export default (props: {
    params: paramType,
    setParams: (params: paramType) => void,
    width?: number,
}) => {
    const { params, width = 1600 } = props;
    const getTotalAmountNum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.total_amount)
        }, 0).toFixed(2)
    }
    return (
        <div >
            <div style={{ overflowX: 'scroll' }}>
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
                            <th colSpan={2} contentEditable>境内发货人</th>
                            <th colSpan={5} contentEditable>出境关别</th>
                            <th colSpan={4}>出口日期</th>
                            <th contentEditable>申报日期</th>
                            <th colSpan={2} contentEditable>备案号</th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>
                                {/* 上海威昱网络科技有限公司 */}
                            </th>
                            <th colSpan={5} contentEditable>
                                {/* 2244 */}
                            </th>
                            <th colSpan={4} style={{ textAlign: 'center' }} contentEditable>
                                {/* 2023/8/29 */}
                                {dayjs().format('YYYY/MM/DD')}
                            </th>
                            <th contentEditable />
                            <th colSpan={2} contentEditable>联系电话：</th>
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
                            <th colSpan={2} contentEditable>生产销售单位</th>
                            <th colSpan={5}>监管方式</th>
                            <th colSpan={4}>征免性质</th>
                            <th colSpan={3} contentEditable>许可证号</th>
                        </tr>
                        <tr>
                            <th colSpan={2} contentEditable>
                                {/* 上海威昱网络科技有限公司 */}
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
                            <th colSpan={5} contentEditable>美国</th>
                            <th colSpan={4} contentEditable>美国</th>
                            <th colSpan={1} contentEditable>Los Angeles</th>
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
                            <th colSpan={4}>{params.gwWeightSum.toFixed(0)}</th>
                            <th colSpan={3}>{params.nwWeightSum.toFixed(2)}</th>
                            <th colSpan={1}>
                                {params.soldFor}
                            </th>
                            <th colSpan={1} >$ {params.shippingFee}</th>
                            <th colSpan={1}>$ {params.premium.toFixed(2)}</th>
                            <th colSpan={1} contentEditable />
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
                                    <td>{item.cn_hs_code.replace(/\./g, "")}<span contentEditable>999</span></td>
                                    <td>{item.chinese_customs_clearance_name}</td>
                                    <td>{item.qty}</td>
                                    <td contentEditable>个</td>
                                    <td />
                                    <td>{item.n_w_weight}</td>
                                    <td style={{ textAlign: 'center' }}>{item.unit_price_usd}</td>
                                    <td style={{ textAlign: 'center' }}>{item.total_amount}</td>
                                    <td contentEditable>USD</td>
                                    <td contentEditable />
                                    <td contentEditable />
                                    <td contentEditable />
                                    <td>照章征免</td>
                                </tr>
                            })
                        }
                        <tr>
                            {Array.from({ length: 14 }).map((_, index) => {
                                return <td key={`customsDeclaration-${index}`} />
                            })}
                        </tr>
                        <tr>
                            <td />
                            <td />
                            <td />
                            <td />
                            <td />
                            <td />
                            <td />
                            <td style={{ textAlign: 'center' }}>总计</td>
                            <td style={{ textAlign: 'center' }}>{getTotalAmountNum()}</td>
                            <td />
                            <td />
                            <td />
                            <td />
                            <td />
                        </tr>
                        <tr>
                            {Array.from({ length: 14 }).map((_, index) => {
                                return <td key={`customsDeclaration-${index}`} />
                            })}
                        </tr>
                    </tbody>
                    <tfoot className='whole-node'>
                        <tr>
                            <th colSpan={1} contentEditable>
                                报关人员<br />
                                申报单位
                            </th>
                            <th colSpan={2} contentEditable>保管人员证号</th>
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
        </div>
    )
}

