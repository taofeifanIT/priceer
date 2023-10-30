import { Row, Col } from 'antd';
import './css/generateDeclarationInformation.less'
import type { paramType } from '@/services/warehouse/generateDeclarationInformation'
import GenerateDeclarationInformationTable from './GenerateDeclarationInformationTable'

export default (props: {
    params: paramType,
    setParams: (param: paramType) => void
}) => {
    const { params, setParams } = props
    return (
        <Row style={{ height: '100%' }} id='merchandiseInvoiceBox'>
            <Col span={4} />
            <Col span={16}>
                <div className='tableContrain' style={{ width: '100%', 'textAlign': 'center' }}>
                    <div style={{ width: '876px' }}>
                        <GenerateDeclarationInformationTable params={params} setParams={setParams} />
                    </div>
                </div>
            </Col>
            <Col span={4} />
            <div id='can' />
        </Row>
    )
}
