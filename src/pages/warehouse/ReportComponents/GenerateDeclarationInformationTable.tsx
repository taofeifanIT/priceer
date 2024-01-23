// import './css/generateDeclarationInformation.less'
import dayjs from 'dayjs'
import type { paramType, tInfoByNSItems } from '@/services/warehouse/generateDeclarationInformation'
import { template } from './reportConfig'
import TextEditor from './TextEditor'
import {
    chain,
    round,
    multiply,
    divide,
    subtract,
    add,
} from 'mathjs'
import { checkDecimal } from '@/utils/utils'
import { Button } from 'antd'
import React from 'react'

export default (props: {
    params: paramType,
    setParams: (param: paramType) => void
}) => {
    const { params, setParams } = props
    const getFixedNum = (num: number) => {
        const str = num + ''
        const index = str.indexOf('.')
        if (index === -1) {
            return num
        }
        return parseFloat(str.slice(0, index + 3))
    }
    const getWeightInIbsNum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.weight_in_lbs || "0")
        }, 0)
    }
    const getQtyNum = () => {
        return params.data.reduce((sum, item: any) => {
            return sum + parseInt(item.qty || "0")
        }, 0)
    }
    const getTotalAmountNum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.total_amount || "0")
        }, 0)
    }
    const getPremium = () => {
        return params.premium
    }
    const getFreightCost = () => {
        return parseFloat(params.shippingFee || "0")
    }
    const getTotalInvoiceValue = () => {
        const totalAmountAll = params.data.reduce((sum: number, item: any) => {
            return chain(Number(item.total_amount || "0")).add(sum).done()
        }, 0)
        return chain(Number(totalAmountAll)).add(Number(params.shippingFee)).round(2).done()
    }
    const reCaculate = () => {
        let tempData = params.data
        // 计算所有货品的总金额totalAmountAll
        const totalAmountAll = tempData.reduce((sum: number, item: tInfoByNSItems) => {
            return chain(Number(item.total_amount || "0")).add(sum).done()
        }, 0)
        // 计算所有货品的总保费premium
        const premium = tempData.reduce((sum, item) => {
            return chain(Number(item.total_amount || "0")).multiply(0.0005).add(sum).done()
        }, 0)
        // 计算商业发票中的Total Invoice Value（Total Amount 之和 + Shipping Fee + Premium）
        const totalInvoiceValue = chain(Number(totalAmountAll)).add(Number(params.shippingFee)).round(2).done()
        tempData = tempData.map((item: tInfoByNSItems) => {
            // 将运费和保费按照比例分配到每个货品中
            // declarationSum = total_amount + shipingFeeInItem + premiumInItem
            const shipingFeeInItem = round(multiply(divide(Number(item.total_amount), totalAmountAll), subtract(Number(params.shippingFee), premium)), 2)
            const premiumInItem = Number(item.total_amount) * 0.0005
            return {
                ...item,
                shipingFeeInItem,
                premiumInItem,
                declarationSum: round(add(add(shipingFeeInItem, Number(item.total_amount)), premiumInItem), 2),
            }
        })
        // 计算所有货品的总金额，使用均摊过的运费和保费的declarationSum计算，这里的数据将用在 ”报关单“ 总计
        let declarationTotal = tempData.reduce((sum: number, item: { declarationSum: any; }) => {
            return chain(sum).add(item.declarationSum).done()
        }, 0)
        // 计算商业发票的 "Total Invoice Value" 和报关单的 "总计" 是否相等，不相等则将差额加到最后一个货品的运费中,重新计算declarationSum和declarationTotal
        const different = subtract(totalInvoiceValue, declarationTotal)
        if (different !== 0) {
            const lastItem = tempData[tempData.length - 1]
            lastItem.shipingFeeInItem = add(lastItem.shipingFeeInItem, different)
            lastItem.declarationSum = round(add(add(lastItem.shipingFeeInItem, Number(lastItem.total_amount)), lastItem.premiumInItem), 2)
            tempData[tempData.length - 1] = lastItem
            declarationTotal = tempData.reduce((sum: number, item: { declarationSum: any; }) => {
                return chain(sum).add(item.declarationSum).done()
            }, 0)
        }
        setParams({
            ...params,
            premium,
            data: tempData,
            totalAmountAll,
            totalInvoiceValue,
            declarationTotal,
        })
    }
    // 校验qty总和是否等于baseQty
    const checkQty = (record: tInfoByNSItems) => {
        console.log(record.qty)
        const { item, baseQty } = record
        const newData = [...params.data]
        const qtyAll = newData.filter(obj => obj.item === item).reduce((sum, obj) => {
            return chain(sum).add(Number(obj.qty)).done()
        }, 0)
        if (qtyAll == baseQty) {
            return true
        }
        return false
    }
    const checkMultipleCoo = (record: tInfoByNSItems) => {
        // 如果是多国家，返回true
        const { coo } = record
        const multipleCoo = coo.split('/')
        if (multipleCoo.length > 1) {
            return true
        }
        return false
    }
    const copyRow = (record: tInfoByNSItems) => {
        const { coo } = record
        // 判断coo中是否含有/
        const multipleCoo = coo.split('/')
        // 如果含有/，则将coo拆分成多个coo
        if (multipleCoo.length > 1) {
            // 将coo拆分成多个coo,向上插入
            const newData = [...params.data]
            const index = newData.indexOf(record)
            // 当前行改为第一个coo，向上插入其他coo
            newData[index].coo = multipleCoo[0]
            newData[index].qty = 0
            newData[index].total_amount = '0'
            // 向上插入其他coo
            for (let i = 1; i < multipleCoo.length; i++) {
                newData.splice(index, 0, {
                    ...record,
                    qty: 0,
                    baseQty: 0,
                    total_amount: '0',
                    coo: multipleCoo[i]
                })
            }
            setParams({
                ...params,
                data: newData
            })
        }
    }
    const tableStyle: React.CSSProperties = {
        position: 'relative',
        backgroundColor: 'hwb(0 100% 0%)',
        border: '5px solid #badf94',
    }
    return (
        <table
            style={tableStyle}
            id='generateDeclarationInformationTable'
            border="1">
            <thead className='whole-node'>
                <tr>
                    <th
                        style={{ fontWeight: 'bold', color: '#70a09f', borderBottom: '3px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}
                        colSpan={7}>
                        COMMERCIAL INVOICE
                    </th>
                    <th
                        style={{ borderBottom: '3px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        Page No
                    </th>
                    <th style={{ width: 100, borderBottom: '1px solid #c8e7a7' }}>1_of 1_Pages</th>
                </tr>
                <tr>
                    <th style={{ width: 120, borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>AWB/BL#:</th>
                    <th style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} colSpan={6}>
                        <TextEditor
                            value={params.deliveryNumbers}
                            onChange={(e) => {
                                setParams({
                                    ...params,
                                    deliveryNumbers: e.value
                                })
                            }}
                            style={{
                                display: 'inline-block',
                            }}
                        />
                    </th>
                    <th style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Date:</th>
                    <th contentEditable style={{ borderBottom: '1px solid #c8e7a7' }}>
                        {dayjs().format('YYYY/MM/DD')}
                    </th>
                </tr>
                <tr>
                    <th colSpan={2} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>EXPORTER</th>
                    <th colSpan={3} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>CONSIGNEE</th>
                    <th colSpan={4} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7' }}>Importer of record</th>
                </tr>
                <tr>
                    <th rowSpan={2} colSpan={2} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].exporter[0]}
                    </th>
                    <th colSpan={3} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].consionee[0]}
                    </th>
                    <th colSpan={4} style={{ borderBottom: '1px solid #c8e7a7' }} contentEditable>
                        {template[params.templateNumber].importerOfRecord[0]}
                    </th>
                </tr>
                <tr>
                    <th colSpan={3} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].consionee[1]}
                    </th>
                    <th colSpan={4} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].importerOfRecord[1]}
                    </th>
                </tr>
                <tr>
                    <th rowSpan={3} colSpan={2} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].exporter[1]}
                    </th>
                    <th colSpan={3} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].consionee[2]}
                    </th>
                    <th colSpan={4} contentEditable style={{ borderBottom: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].importerOfRecord[2]}
                    </th>
                </tr>
                <tr>
                    <th colSpan={3} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].consionee[3]}
                    </th>
                    <th colSpan={4} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].importerOfRecord[3]}
                    </th>
                </tr>
                <tr>
                    <th colSpan={3} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        <a href={`mailto:${template[params.templateNumber].consionee[4]}`}>{template[params.templateNumber].consionee[4]}</a>
                    </th>
                    <th colSpan={4} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        <a href={`mailto:${template[params.templateNumber].importerOfRecord[4]}`}>{template[params.templateNumber].importerOfRecord[4]}</a>
                    </th>
                </tr>

                {(!template[params.templateNumber].headNum || (template[params.templateNumber].headNum === 6)) && (<tr>
                    <th colSpan={2} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        <a href={`mailto:${template[params.templateNumber].exporter[2]}`}>{template[params.templateNumber].exporter[2]}</a>
                    </th>
                    <th colSpan={3} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].consionee[5]}
                    </th>
                    <th colSpan={4} style={{ borderBottom: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].importerOfRecord[5]}
                    </th>
                </tr>)}
                {([6, 8, 15, 17].includes(params.templateNumber)) && <tr>
                    <th colSpan={2} style={{ fontWeight: 'normal', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        <a>
                            <a href={`mailto:${template[params.templateNumber].exporter[3]}`}>{template[params.templateNumber].exporter[3]}</a>
                        </a>
                    </th>
                    <th colSpan={3} contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].consionee[6]}
                    </th>
                    <th colSpan={4} style={{ fontWeight: 'normal', borderBottom: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].importerOfRecord[6]}
                    </th>
                </tr>}
                <tr>
                    <th style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Terns of Freight</th>
                    <th colSpan={3} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Country of Origin</th>
                    <th colSpan={2} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Carrier</th>
                    <th colSpan={3} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Invoice Number</th>
                </tr>
                <tr>
                    <th style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].termsFreight[0]}
                    </th>
                    <th colSpan={3} contentEditable style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {/* {template[params.templateNumber].countryOrigin[0]} */}
                        {params.countrtOfOrigin}
                    </th>
                    <th contentEditable style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].carrier[0]}
                    </th>
                    <th style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Air</th>
                    {/* Invoice Number */}
                    <th colSpan={3} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        <TextEditor
                            value={params.invoiceNumber}
                            onChange={(e) => {
                                setParams({
                                    ...params,
                                    invoiceNumber: e.value
                                })
                            }}
                        />
                    </th>
                </tr>
                <tr>
                    <th colSpan={1} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>NO. of PKGS</th>
                    <th colSpan={1} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Terms of Sale</th>
                    <th colSpan={1} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Ultimate Destination</th>
                    <th colSpan={2} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>SO Number</th>
                    <th colSpan={4} style={{ fontWeight: 'bold', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Notes</th>
                </tr>
                <tr>
                    {/* NO. of PKGS */}
                    <th colSpan={1} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>{
                        params.numberOfCases
                    }</th>
                    <th colSpan={1} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        <TextEditor
                            value={params.soldFor}
                            onChange={(e) => {
                                setParams({
                                    ...params,
                                    soldFor: e.value
                                })

                            }}
                        />
                    </th>
                    {/* Ultimate Destination */}
                    <th colSpan={1} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {/* {template[params.templateNumber].ultimateDestination[0]} */}
                        <TextEditor
                            value={params.ultimateDestination}
                            onChange={(e) => {
                                setParams({
                                    ...params,
                                    ultimateDestination: e.value
                                })

                            }}
                        />
                    </th>
                    {/* SO Number */}
                    <th colSpan={2} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {params.soNumber}
                    </th>
                    <th colSpan={4} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {template[params.templateNumber].notes[0]}
                    </th>
                </tr>
                <tr>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Item</th>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Item Type</th>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Description</th>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>COO</th>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', width: 100, borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>HTS</th>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', width: 70, borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Weight in LBS</th>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Qty</th>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', width: 70, borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Unit Price USD</th>
                    <th colSpan={1} style={{ backgroundColor: '#e2efd9', borderBottom: '1px solid #c8e7a7' }}>Total Amount</th>
                </tr>
            </thead>
            <tbody>
                {params.data.map((item, index: number) => {
                    return <tr key={`template-${1 + index}`} className='whole-node'>
                        <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                            {/* {item.item} */}
                            <TextEditor
                                value={item.item}
                                onChange={(e) => {
                                    const newData = [...params.data]
                                    newData[index].item = e.value
                                    setParams({
                                        ...params,
                                        data: newData
                                    })
                                }}
                            />
                        </td>
                        <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                            {/* {item.item_type} */}
                            <TextEditor
                                value={item.item_type}
                                onChange={(e) => {
                                    const newData = [...params.data]
                                    newData[index].item_type = e.value
                                    setParams({
                                        ...params,
                                        data: newData
                                    })
                                }}
                            />
                        </td>
                        <td
                            contentEditable
                            style={{
                                borderBottom: '1px solid #c8e7a7',
                                borderRight: '1px solid #c8e7a7',
                                maxWidth: 200,
                                minWidth: 166,
                                // 超过自动换行
                                wordBreak: 'break-all',
                                wordWrap: 'break-word',
                            }}>
                            {item.description}
                        </td>
                        <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                            <TextEditor
                                value={item.coo}
                                onChange={(e) => {
                                    const newData = [...params.data]
                                    newData[index].coo = e.value
                                    setParams({
                                        ...params,
                                        data: newData
                                    })
                                }}
                            />
                        </td>
                        <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                            {item.hts}
                        </td>
                        <td contentEditable style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                            {item.weight_in_lbs}
                        </td>
                        <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                            {/* {item.qty} */}
                            <TextEditor
                                value={item.qty}
                                onChange={(e) => {
                                    const newData: any = [...params.data]
                                    newData[index].qty = e.value
                                    newData[index].total_amount = getFixedNum(Number(e.value) * Number(newData[index].unit_price_usd))
                                    setParams({
                                        ...params,
                                        data: newData
                                    })
                                }}
                                onBlur={(e) => {
                                    // 判断 e.value 是否为数字,如果是数字判断开头是否为0，0的话去掉
                                    const reg = /^[0-9]*$/;
                                    if (reg.test(e.value)) {
                                        const newData: any = [...params.data]
                                        newData[index].qty = e.value.replace(/^0/, '')
                                        newData[index].total_amount = getFixedNum(Number(e.value) * Number(newData[index].unit_price_usd))
                                        setParams({
                                            ...params,
                                            data: newData
                                        })
                                    }
                                    reCaculate()
                                }}
                            />
                        </td>
                        <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                            <TextEditor
                                value={item.unit_price_usd}
                                onChange={(e) => {
                                    const newData: any = [...params.data]
                                    newData[index].unit_price_usd = e.value
                                    newData[index].total_amount = getFixedNum(Number(e.value) * Number(newData[index].qty))
                                    setParams({
                                        ...params,
                                        data: newData
                                    })
                                }}
                                onBlur={() => {
                                    reCaculate()
                                }}
                            />
                        </td>
                        <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                            <div style={{
                                position: 'relative',
                            }}>
                                $ {item.total_amount}
                                {(checkMultipleCoo(item) && !params.printAll) &&
                                    <div style={{ position: 'absolute', marginLeft: 10, right: -90, top: '50%', transform: 'translateY(-50%)' }}>
                                        <Button
                                            size='small'
                                            onClick={() => {
                                                copyRow(item)
                                            }}>
                                            Split Data
                                        </Button>
                                    </div>}
                                {(!checkMultipleCoo(item) && item.baseQty && !params.printAll) ?
                                    <span style={{
                                        position: 'absolute',
                                        right: -70,
                                        fontWeight: 'bold',
                                        color: checkQty(item) ? 'green' : 'red',
                                    }}>
                                        QTY: {item.baseQty}
                                    </span> : null}
                            </div>
                        </td>

                    </tr>
                })}
                <td className='whole-node' style={{ height: 30, borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                <td style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
            </tbody>
            <tfoot className='whole-node'>
                <tr>
                    <th colSpan={5} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}><span style={{ marginRight: 10 }}>Sub Totals</span></th>
                    <th colSpan={1} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {/* {data.weightInIbsNum.toFixed(2)} */}
                        {getWeightInIbsNum().toFixed(2)}
                    </th>
                    <th colSpan={1} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>
                        {/* {data.qtyNum} */}
                        {getQtyNum()}
                    </th>
                    <th style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                    {/* <th colSpan={1}>$  {data.totalAmountNum.toFixed(2)}</th> */}
                    <th colSpan={1} style={{ borderBottom: '1px solid #c8e7a7' }}>$  {getTotalAmountNum().toFixed(2)}</th>
                </tr>
                <tr>
                    <th rowSpan={3} colSpan={5} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                    <th colSpan={3} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Freight Cost</th>
                    {/* <th colSpan={1} id='premium'>$  {(data.freightCost - data.premium).toFixed(2)}
                        <span className='freightCost'> {data.freightCost.toFixed(2)}</span>
                    </th> */}
                    <th colSpan={1} id='premium' style={{ borderBottom: '1px solid #c8e7a7' }}>
                        $  {(getFreightCost() - getPremium()).toFixed(2)}
                        {/* <span className='freightCost'> {getFreightCost().toFixed(2)}</span> */}
                    </th>
                    <span className='freightCost'> {getFreightCost().toFixed(2)}</span>
                </tr>
                <tr>
                    <th colSpan={3} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Insurance Cost</th>
                    {/* <th colSpan={1}>$  {data.premium.toFixed(2)}</th> */}
                    <th colSpan={1} style={{ borderBottom: '1px solid #c8e7a7' }}>$  {getPremium().toFixed(2)}</th>
                </tr>
                <tr>
                    <th colSpan={3} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Total Invoice Value</th>
                    {/* <th colSpan={1}>$  {(data.freightCost + data.totalAmountNum).toFixed(2)}</th> */}
                    <th colSpan={1} style={{ borderBottom: '1px solid #c8e7a7' }}>$  {checkDecimal(getTotalInvoiceValue())}</th>
                </tr>
                <tr>
                    <th colSpan={9} style={{ borderBottom: '1px solid #c8e7a7' }}>I hereby certify this commercial invoice to be true and correct.</th>
                </tr>
                <tr>
                    <th colSpan={2} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Name</th>
                    <th colSpan={5} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Signature</th>
                    <th colSpan={2} style={{ borderBottom: '1px solid #c8e7a7' }}>Date</th>
                </tr>
                <tr>
                    <th rowSpan={2} colSpan={2} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}> </th>
                    <th rowSpan={2} colSpan={5} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}> </th>
                    <th contentEditable rowSpan={2} colSpan={2} style={{ borderBottom: '1px solid #c8e7a7' }}>{
                        dayjs().format('YYYY/MM/DD')
                    }</th>
                </tr>
                <tr />
                <tr>
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((item, index) => {
                            return <th key={`th-${index}`} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                        })
                    }
                </tr>
                <tr >
                    {
                        [1, 2, 3, 4, 5, 6, 7].map((item, index) => {
                            return <th key={`th-${index}`} style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }} />
                        })
                    }
                    <th style={{ borderBottom: '1px solid #c8e7a7', borderRight: '1px solid #c8e7a7' }}>Page No</th>
                    <th style={{ borderBottom: '1px solid #c8e7a7' }}>1_of 1_Pages</th>
                </tr>
            </tfoot>
        </table>
    )
}
