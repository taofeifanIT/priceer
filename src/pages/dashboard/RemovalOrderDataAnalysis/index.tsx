import { Col, Row } from 'antd';
import YearDataByStore from './components/YearDataByStore';
import ArrivalInformation from './components/ArrivalInformation';
import RoInformation from './components/RoInformation';
import Warehouse from './components/Warehouse';
import Claim from './components/Claim';
import AvgDaysInWareHouseAndCurrentReturnRates from './components/AvgDaysInWareHouseAndCurrentReturnRates';
export default () => {
    return (
        <div style={{ background: '#FFF', padding: 8 }}>
            <Row>
                <Col span={24}>
                    <YearDataByStore />
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <AvgDaysInWareHouseAndCurrentReturnRates />
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <ArrivalInformation />
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <RoInformation />
                    <Warehouse />
                </Col>
            </Row>
            <Claim />
        </div>
    );
}