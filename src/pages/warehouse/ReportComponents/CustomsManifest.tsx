import { Row } from 'antd';
import type { paramType } from '@/services/warehouse/generateDeclarationInformation'
import './css/customsManifest.less'
import CustomsManifestTable from './CustomsManifestTable'

export default (props: {
    params: paramType,
    setParams: (params: paramType) => void,
    width?: number,
}) => {
    const { params, setParams, width = 1100 } = props;
    return (
        <Row style={{ height: '100%' }} >
            <div >
                <div style={{ width, position: 'relative' }}>
                    <CustomsManifestTable params={params} setParams={setParams} width={width} isShowOrtherPop />
                </div>
            </div>
        </Row>
    )
}

