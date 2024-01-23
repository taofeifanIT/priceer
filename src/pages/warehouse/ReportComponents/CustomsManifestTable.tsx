import type { paramType } from '@/services/warehouse/generateDeclarationInformation'
import { template } from './reportConfig'
import dayjs from 'dayjs'
import {
    chain,
    add,
} from 'mathjs'
import TextEditor from './TextEditor'

export default (props: {
    params: paramType,
    setParams: (params: paramType) => void,
    width?: number,
    isShowOrtherPop?: boolean,
}) => {
    const { params, setParams, width = 1100 } = props;
    const getQuantitySum = () => {
        return params.data.reduce((sum, item) => {
            return add(sum, Number(item.qty))
        }, 0)
    }
    const getGwWeightSum = () => {
        const number = params.data.reduce((sum, item) => {
            return add(sum, Number(item.g_w_weight))
        }, 0)
        return chain(number)
            .round(2)
            .done()
    }
    const getNwWeightSum = () => {
        const number = params.data.reduce((sum, item) => {
            return add(sum, Number(item.n_w_weight))
        }, 0)
        return chain(number)
            .round(2)
            .done()
    }
    const getActualVolumeCbmSum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.actual_volume_cbm)
        }, 0).toFixed(3)
    }
    return (
        <table border="1" style={{ width }} id='customsManifestTable'>
            <thead className='whole-node'>
                <tr style={{ borderBottom: 'none' }}>
                    <th colSpan={8} style={{ fontSize: '23px', fontWeight: 'bold' }}>
                        {template[params.templateNumber].exporter[0]}
                    </th>
                </tr >
                <tr>
                    <th colSpan={8} style={{ borderTop: 'none', fontWeight: 'bold' }}>
                        {template[params.templateNumber].exporter[1]}
                    </th>
                </tr>
                <tr>
                    <th /><th /><th /><th /><th /><th /><th /><th />
                </tr>
                <tr>
                    <th style={{ fontWeight: 'bold' }}>
                        SHIPPING MARK:
                    </th>
                    <th contentEditable />
                    <th colSpan={4} rowSpan={3} style={{ fontSize: '22px', textDecoration: 'underline', fontWeight: 'bold' }}>Packing List</th>
                    <th style={{ textAlign: 'right', fontWeight: 'bold' }}>INVOICE NO.:</th>
                    <th style={{ fontWeight: 'inherit' }}>{params.invoiceNumber}</th>
                </tr>
                <tr>
                    <th style={{ fontWeight: 'bold' }}>
                        AS PER INV.NO.:
                    </th>
                    <th contentEditable />
                    <th />
                    <th style={{ borderTop: '1px dashed rgb(195, 203, 221)' }} />
                </tr>
                <tr>
                    <th />
                    <th>{params.invoiceNumber}</th>
                    <th style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        DATE:
                    </th>
                    <th style={{ fontWeight: 'inherit', borderTop: '1px dashed rgb(195, 203, 221)', borderBottom: '1px dashed rgb(195, 203, 221)' }}>
                        {/* Aug 29 2023 */}
                        {dayjs().format('MMM.DD,YYYY')}
                    </th>
                </tr>
                <tr>
                    {/* <th /><th /><th /><th /><th /><th /><th /><th /> */}
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
                            // eslint-disable-next-line react/no-array-index-key
                            return <th key={`th-${index}`} style={{ borderBottom: '3px solid black' }} />
                        })
                    }
                </tr>
                <tr>
                    <th colSpan={4} rowSpan={2} style={{ borderBottom: '3px solid black' }}>
                        DESCRIPTION OF GOODS
                    </th>
                    <th colSpan={1} rowSpan={2} style={{ borderBottom: '3px solid black' }}>
                        QUANTITY
                    </th>
                    <th colSpan={2} >
                        WEIGHT (KGS.)
                    </th>
                    <th colSpan={1} rowSpan={2} style={{ borderBottom: '3px solid black' }}>
                        MEAS.(CBM)
                    </th>
                </tr>
                <tr>
                    <th style={{ borderBottom: '3px solid black' }}>G.W.</th>
                    <th style={{ borderBottom: '3px solid black' }}>N.W.</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td /> <td /> <td /> <td /> <td /> <td /> <td /> <td />
                </tr>
                {params.data.map((item, index) => {
                    return <tr key={`template-${1 + index}`} className='whole-node'>
                        <td />
                        <td>
                            {/* {item.item} */}
                            {/* <input style={{ height: 24, textAlign: 'center', border: 'none' }} value={item.item} onChange={(e) => {
                                const data = [...params.data];
                                data[index].item = e.target.value;
                                setParams({
                                    ...params,
                                    data
                                })
                            }} /> */}
                            <div style={{ width: '200px' }}>
                                <TextEditor
                                    value={item.item}
                                    onChange={(e) => {
                                        const data = [...params.data];
                                        data[index].item = e.value;
                                        setParams({
                                            ...params,
                                            data
                                        })
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div style={{ width: '200px' }}>
                                <TextEditor
                                    value={item.item_type}
                                    onChange={(e) => {
                                        const data = [...params.data];
                                        data[index].item_type = e.value;
                                        setParams({
                                            ...params,
                                            data
                                        })
                                    }}
                                />
                            </div>
                        </td>
                        <td>
                            <div style={{ width: '200px' }}>
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
                            </div>

                        </td>
                        <td className='hasUnit'>
                            {/* {item.qty} */}
                            <TextEditor
                                style={{ display: 'inline-block' }}
                                value={item.qty}
                                width={30}
                                onChange={(e) => {
                                    const data = [...params.data];
                                    data[index].qty = e.value;
                                    setParams({
                                        ...params,
                                        data
                                    })
                                }}
                            />
                            <span >
                                PCS
                            </span>
                        </td>
                        <td>
                            <TextEditor
                                value={item.g_w_weight}
                                onChange={(e) => {
                                    const data = [...params.data];
                                    data[index].g_w_weight = e.value;
                                    setParams({
                                        ...params,
                                        data
                                    })
                                }}
                            />
                        </td>
                        <td>
                            <TextEditor
                                value={item.n_w_weight}
                                onChange={(e) => {
                                    const data = [...params.data];
                                    data[index].n_w_weight = e.value;
                                    setParams({
                                        ...params,
                                        data
                                    })
                                }}
                            />
                        </td>
                        <td>
                            {/* <input style={{ height: 24, textAlign: 'center', border: 'none' }} value={item.actual_volume_cbm} onChange={(e) => {
                                const data = [...params.data];
                                data[index].actual_volume_cbm = e.target.value;
                                setParams({
                                    ...params,
                                    data
                                })
                            }} /> */}
                            <TextEditor
                                value={item.actual_volume_cbm}
                                onChange={(e) => {
                                    const data = [...params.data];
                                    data[index].actual_volume_cbm = e.value;
                                    setParams({
                                        ...params,
                                        data
                                    })
                                }}
                            />
                        </td>
                        <span
                            style={{
                                position: 'absolute',
                                minWidth: '160px',
                                right: -260,
                            }}
                        >
                            {/* {item.brand}{item.cn_hs_code} */}
                            <span
                                title={item.brand}
                                style={{
                                    width: '120px',
                                    textAlign: 'left',
                                    display: 'inline-block',
                                    // 超出部分省略号
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    verticalAlign: 'bottom'
                                }}>
                                {item.brand}
                            </span>
                            <span style={{ width: '80px', textAlign: 'left', display: 'inline-block' }}>{item.cn_hs_code}</span>
                        </span>

                    </tr>
                })}
                {new Array(6).fill(0).map((item) => {
                    return (
                        <tr key={item} >
                            <td /><td /><td /><td /><td /><td /><td /><td />
                        </tr>
                    )
                })}
            </tbody>
            <tfoot>
                <tr style={{ height: 2 }} />
                <tr className='whole-node'>
                    <th style={{ borderBottom: '3px solid black' }}>TOTAL:</th>
                    <th colSpan={3} style={{ borderBottom: '3px solid black' }}>
                        <div style={{ width: '100%', height: 26 }}>
                            <TextEditor
                                value={params.numberOfCases}
                                onChange={(e) => {
                                    setParams({
                                        ...params,
                                        numberOfCases: e.value,
                                    })
                                }}
                            />
                        </div>
                    </th>
                    <th style={{ borderBottom: '3px solid black' }}>{getQuantitySum()}PCS</th>
                    <th style={{ borderBottom: '3px solid black' }}>{getGwWeightSum()}KGS</th>
                    <th style={{ borderBottom: '3px solid black' }}>{getNwWeightSum()}KGS</th>
                    <th style={{ borderBottom: '3px solid black' }}>{getActualVolumeCbmSum()}CBM</th>
                </tr>
                {/* <tr style={{ height: 0 }}>
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => {
                            return <th key={`th-${index}`} style={{ borderTop: '3px solid black', borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }} />
                        })
                    }
                </tr> */}
            </tfoot>
        </table>
    )
}

