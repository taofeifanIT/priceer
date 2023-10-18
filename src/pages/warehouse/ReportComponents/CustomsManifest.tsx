import { Row } from 'antd';
import type { paramType } from '@/services/warehouse/generateDeclarationInformation'
import { template } from './reportConfig'
import dayjs from 'dayjs'
import './css/customsManifest.less'


export default (props: {
    params: paramType,
    setParams: (params: paramType) => void,
    width?: number,
}) => {
    const { params, setParams, width = 1100 } = props;
    const getQuantitySum = () => {
        return params.data.reduce((sum, item) => {
            return sum + item.qty
        }, 0)
    }
    const getGwWeightSum = () => {
        return params.gwWeightSum.toFixed(3)
    }
    const getNwWeightSum = () => {
        return params.nwWeightSum.toFixed(3)
    }
    const getActualVolumeCbmSum = () => {
        return params.data.reduce((sum, item) => {
            return sum + parseFloat(item.actual_volume_cbm)
        }, 0).toFixed(3)
    }
    return (
        <Row style={{ height: '100%' }} >
            <div className='tableContrain' style={{ width: '100%', 'textAlign': 'center' }}>
                <div style={{ width }}>
                    <table border="1" style={{ width }} id='customsManifestTable'>
                        <thead className='whole-node'>
                            <tr>
                                <th colSpan={8} style={{ fontSize: '23px' }}>
                                    {template[params.templateNumber].exporter[0]}
                                </th>
                            </tr>
                            <tr>
                                <th colSpan={8} style={{ borderTop: '1px solid #fff0' }}>
                                    {template[params.templateNumber].exporter[1]}
                                </th>
                            </tr>
                            <tr>
                                <th /><th /><th /><th /><th /><th /><th /><th />
                            </tr>
                            <tr>
                                <th>
                                    SHIPPING MARK:
                                </th>
                                <th contentEditable />
                                <th colSpan={4} rowSpan={3} style={{ fontSize: '22px', textDecoration: 'underline' }}>Packing List</th>
                                <th style={{ textAlign: 'right' }}>INVOICE NO.:</th>
                                <th style={{ fontWeight: 'inherit' }}>{params.invoiceNumber}</th>
                            </tr>
                            <tr>
                                <th>
                                    AS PER INV.NO.:
                                </th>
                                <th contentEditable />
                                <th />
                                <th style={{ borderTop: '1px dashed rgb(195, 203, 221)' }} />
                            </tr>
                            <tr>
                                <th />
                                <th>{params.invoiceNumber}</th>
                                <th style={{ textAlign: 'right' }}>
                                    DATE:
                                </th>
                                <th style={{ fontWeight: 'inherit', borderTop: '1px dashed rgb(195, 203, 221)', borderBottom: '1px dashed rgb(195, 203, 221)' }}>
                                    {/* Aug 29 2023 */}
                                    {dayjs().format('MMM.DD,YYYY')}
                                </th>
                            </tr>
                            <tr>
                                <th /><th /><th /><th /><th /><th /><th /><th />
                            </tr>
                            <tr>
                                <th colSpan={4} rowSpan={2}>
                                    DESCRIPTION OF GOODS
                                </th>
                                <th colSpan={1} rowSpan={2}>
                                    QUANTITY
                                </th>
                                <th colSpan={2}>
                                    WEIGHT (KGS.)
                                </th>
                                <th colSpan={1} rowSpan={2}>
                                    MEAS.(CBM)
                                </th>
                            </tr>
                            <tr>
                                <th>G.W.</th>
                                <th>N.W.</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td /> <td /> <td /> <td /> <td /> <td /> <td /> <td />
                            </tr>
                            {params.data.map((item, index) => {
                                return <tr key={item.item} className='whole-node'>
                                    <td />
                                    <td>{item.item}</td>
                                    <td>{item.item_type}</td>
                                    <td>
                                        {/* {item.chinese_customs_clearance_name} */}
                                        <input style={{ height: 24, textAlign: 'center', border: 'none' }} value={item.chinese_customs_clearance_name} onChange={(e) => {
                                            const data = [...params.data];
                                            data[index].chinese_customs_clearance_name = e.target.value;
                                            setParams({
                                                ...params,
                                                data
                                            })
                                        }} />
                                    </td>
                                    <td>{item.qty}PCS</td>
                                    <td>
                                        {/* {parseFloat(item.g_w_weight)} */}
                                        <input style={{ height: 24, textAlign: 'center', border: 'none' }} value={item.g_w_weight} onChange={(e) => {
                                            const data = [...params.data];
                                            data[index].g_w_weight = e.target.value;
                                            setParams({
                                                ...params,
                                                data
                                            })
                                        }} />
                                    </td>
                                    <td>
                                        {/* {parseFloat(item.n_w_weight)} */}
                                        <input style={{ height: 24, textAlign: 'center', border: 'none' }} value={item.n_w_weight} onChange={(e) => {
                                            const data = [...params.data];
                                            data[index].n_w_weight = e.target.value;
                                            setParams({
                                                ...params,
                                                data
                                            })
                                        }} />
                                    </td>
                                    <td>
                                        {/* {item.needEdit ? <InputNumber
                                            bordered={false}
                                            step={0.001}
                                            min='0.0000000'
                                            style={{ width: '100%', color: item.actual_volume_cbm == '0.0000000' ? 'red' : 'inherit' }}
                                            value={item.actual_volume_cbm} onChange={val => {
                                                const data = [...params.data];
                                                data[index].actual_volume_cbm = val;
                                                setParams({
                                                    ...params,
                                                    data
                                                })
                                            }} /> : item.actual_volume_cbm} */}
                                        {/* {item.actual_volume_cbm} */}
                                        <input style={{ height: 24, textAlign: 'center', border: 'none' }} value={item.actual_volume_cbm} onChange={(e) => {
                                            const data = [...params.data];
                                            data[index].actual_volume_cbm = e.target.value;
                                            setParams({
                                                ...params,
                                                data
                                            })
                                        }} />
                                    </td>
                                </tr>
                            })}
                            {new Array(6).fill(0).map((item) => {
                                return (
                                    <tr key={item}>
                                        <td /><td /><td /><td /><td /><td /><td /><td />
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot>
                            <tr />
                            <tr className='whole-node'>
                                <td>TOTAL:</td>
                                <td colSpan={3}>
                                    <input style={{ border: 'none', width: '100%', textAlign: 'center' }} value={params.numberOfCases} onChange={(e) => {
                                        setParams({
                                            ...params,
                                            numberOfCases: e.target.value,
                                        })
                                    }} />
                                </td>
                                <td>{getQuantitySum()}PCS</td>
                                <td>{getGwWeightSum()}KGS</td>
                                <td>{getNwWeightSum()}KGS</td>
                                <td>{getActualVolumeCbmSum()}CBM</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </Row>
    )
}

