// import { Row } from 'antd';
import type { paramType } from '@/services/warehouse/generateDeclarationInformation'
import './css/customsDeclaration.less'
import CustomsDeclarationTable from './CustomsDeclarationTable'

export default (props: {
    params: paramType,
    setParams: (params: paramType) => void,
    width?: number,
}) => {
    const { params, setParams, width = 1600 } = props;
    return (
        <div >
            <div style={{ overflowX: 'scroll' }}>
                <CustomsDeclarationTable params={params} setParams={setParams} width={width} />
            </div>
        </div>
    )
}

