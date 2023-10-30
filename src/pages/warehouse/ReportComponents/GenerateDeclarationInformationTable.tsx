import './css/generateDeclarationInformation.less'
import dayjs from 'dayjs'
import type { paramType } from '@/services/warehouse/generateDeclarationInformation'
import { template } from './reportConfig'
import TextEditor from './TextEditor'


export default (props: {
    params: paramType,
    setParams: (param: paramType) => void
}) => {
    const { params, setParams } = props
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
        return params.premium?.toFixed(2)
    }
    const getFreightCost = () => {
        return parseFloat(params.shippingFee || "0")
    }
    return (
        <table id='generateDeclarationInformationTable' border="1">
            <thead className='whole-node'>
                <tr>
                    <th colSpan={7}>COMMERCIAL INVOICE</th>
                    <th>Page No</th>
                    <th style={{ width: 100 }}>1_of 1_Pages</th>
                </tr>
                <tr>
                    <th style={{ width: 120 }}>AWB/BL#:</th>
                    <th colSpan={6}>
                        <input style={{ border: 'none', width: '100%', textAlign: 'center' }} value={params.deliveryNumbers} onChange={(e) => {
                            setParams({
                                ...params,
                                deliveryNumbers: e.target.value
                            })
                        }} />
                    </th>
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
                    <th rowSpan={2} colSpan={2} contentEditable>{template[params.templateNumber].exporter[0]}</th>
                    <th colSpan={3} contentEditable>
                        {template[params.templateNumber].consionee[0]}
                    </th>
                    <th colSpan={4}>
                        {template[params.templateNumber].importerOfRecord[0]}
                    </th>
                </tr>
                <tr>
                    <th colSpan={3} contentEditable>
                        {template[params.templateNumber].consionee[1]}
                    </th>
                    <th colSpan={4} contentEditable>
                        {template[params.templateNumber].importerOfRecord[1]}
                    </th>
                </tr>
                <tr>
                    <th rowSpan={3} colSpan={2} contentEditable>
                        {template[params.templateNumber].exporter[1]}
                    </th>
                    <th colSpan={3} contentEditable>
                        {template[params.templateNumber].consionee[2]}
                    </th>
                    <th colSpan={4} contentEditable>
                        {template[params.templateNumber].importerOfRecord[2]}
                    </th>
                </tr>
                <tr>
                    <th colSpan={3} contentEditable>
                        {template[params.templateNumber].consionee[3]}
                    </th>
                    <th colSpan={4} contentEditable>
                        {template[params.templateNumber].importerOfRecord[3]}
                    </th>
                </tr>
                <tr>
                    <th colSpan={3} contentEditable>
                        <a href={`mailto:${template[params.templateNumber].consionee[4]}`}>{template[params.templateNumber].consionee[4]}</a>
                    </th>
                    <th colSpan={4} contentEditable>
                        <a href={`mailto:${template[params.templateNumber].importerOfRecord[4]}`}>{template[params.templateNumber].importerOfRecord[4]}</a>
                    </th>
                </tr>
                <tr>
                    <th colSpan={2} contentEditable>
                        <a>
                            <a href={`mailto:${template[params.templateNumber].exporter[2]}`}>{template[params.templateNumber].exporter[2]}</a>
                        </a>
                    </th>
                    <th colSpan={3} contentEditable>
                        {template[params.templateNumber].consionee[5]}
                    </th>
                    <th colSpan={4}>
                        {template[params.templateNumber].importerOfRecord[5]}
                    </th>
                </tr>
                {([6, 8, 15, 17].includes(params.templateNumber)) && <tr>
                    <th colSpan={2} style={{ fontWeight: 'normal' }}>
                        <a>
                            <a href={`mailto:${template[params.templateNumber].exporter[3]}`}>{template[params.templateNumber].exporter[3]}</a>
                        </a>
                    </th>
                    <th colSpan={3} contentEditable>
                        {template[params.templateNumber].consionee[6]}
                    </th>
                    <th colSpan={4} style={{ fontWeight: 'normal' }}>
                        {template[params.templateNumber].importerOfRecord[6]}
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
                        {template[params.templateNumber].termsFreight[0]}
                    </th>
                    <th colSpan={3} contentEditable>
                        {/* {template[params.templateNumber].countryOrigin[0]} */}
                        {params.countrtOfOrigin}
                    </th>
                    <th contentEditable>
                        {template[params.templateNumber].carrier[0]}
                    </th>
                    <th>Air</th>
                    {/* Invoice Number */}
                    <th colSpan={3}>
                        <input value={params.invoiceNumber} style={{ textAlign: 'center', border: 'none', width: '100%' }} onChange={e => {
                            // setInvoiceNumber(e.target.value)
                            setParams({
                                ...params,
                                invoiceNumber: e.target.value
                            })
                        }} />
                    </th>
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
                    <th colSpan={1} >{
                        params.numberOfCases
                    }</th>
                    <th colSpan={1}>
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
                    <th colSpan={1}>
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
                    <th colSpan={2}>
                        {params.soNumber}
                    </th>
                    <th colSpan={4}>
                        {template[params.templateNumber].notes[0]}
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
                {params.data.map((item, index: number) => {
                    return <tr key={`template-${1 + index}`} className='whole-node'>
                        <td >
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
                        <td >
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
                        <td contentEditable>
                            {item.description}
                        </td>
                        <td>
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
                        <td contentEditable>
                            {item.hts}
                        </td>
                        <td contentEditable>
                            {item.weight_in_lbs}
                        </td>
                        <td>
                            {/* {item.qty} */}
                            <TextEditor
                                value={item.qty}
                                onChange={(e) => {
                                    const newData = [...params.data]
                                    newData[index].qty = e.value
                                    setParams({
                                        ...params,
                                        data: newData
                                    })
                                }}
                            />
                        </td>
                        <td contentEditable>
                            {item.unit_price_usd}
                        </td>
                        <td contentEditable>
                            $ {item.total_amount}
                        </td>
                    </tr>
                })}
                <td className='whole-node' style={{ height: 30 }} /> <td /> <td /> <td /> <td /> <td /> <td /><td /><td />
            </tbody>
            <tfoot className='whole-node'>
                <tr>
                    <th colSpan={5}><span style={{ marginRight: 10 }}>Sub Totals</span></th>
                    <th colSpan={1}>
                        {/* {data.weightInIbsNum.toFixed(2)} */}
                        {getWeightInIbsNum().toFixed(2)}
                    </th>
                    <th colSpan={1}>
                        {/* {data.qtyNum} */}
                        {getQtyNum()}
                    </th>
                    <th />
                    {/* <th colSpan={1}>$  {data.totalAmountNum.toFixed(2)}</th> */}
                    <th colSpan={1}>$  {getTotalAmountNum().toFixed(2)}</th>
                </tr>
                <tr>
                    <th rowSpan={3} colSpan={5} />
                    <th colSpan={3}>Freight Cost</th>
                    {/* <th colSpan={1} id='premium'>$  {(data.freightCost - data.premium).toFixed(2)}
                        <span className='freightCost'> {data.freightCost.toFixed(2)}</span>
                    </th> */}
                    <th colSpan={1} id='premium'>$  {(getFreightCost() - getPremium()).toFixed(2)}
                        <span className='freightCost'> {getFreightCost().toFixed(2)}</span>
                    </th>
                </tr>
                <tr>
                    <th colSpan={3}>Insurance Cost</th>
                    {/* <th colSpan={1}>$  {data.premium.toFixed(2)}</th> */}
                    <th colSpan={1}>$  {getPremium()}</th>
                </tr>
                <tr>
                    <th colSpan={3}>Total Invoice Value</th>
                    {/* <th colSpan={1}>$  {(data.freightCost + data.totalAmountNum).toFixed(2)}</th> */}
                    <th colSpan={1}>$  {(getFreightCost() + getTotalAmountNum()).toFixed(2)}</th>
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
                <tr >
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
    )
}
