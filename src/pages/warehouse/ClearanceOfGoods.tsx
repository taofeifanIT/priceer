import React, { useState } from 'react';
import { Tabs, Button, Modal, Select, Input, message, Spin } from 'antd';
import type { TabsProps } from 'antd';
import { GenerateDeclarationInformation, CustomsManifest, CustomsDeclaration } from './ReportComponents';
import type { paramType, tInfoByNSItems } from '@/services/warehouse/generateDeclarationInformation'
import { getInfoByNS } from '@/services/warehouse/generateDeclarationInformation'
import { downloadPdf } from '@/utils/utils'
import { template } from './ReportComponents/reportConfig'

// All.CustomsDeclaration

const App: React.FC = () => {
    const [tabIndex, setTabIndex] = useState('generateDeclarationInformationTable');
    const [generateDeclarationInformationParams, setGenerateDeclarationInformationParams] = useState<paramType>({
        invoiceNumber: '',
        templateNumber: 0,
        soNumber: '',
        deliveryNumbers: '',
        numberOfCases: '',
        data: [],
    });
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const items: TabsProps['items'] = [
        {
            key: 'generateDeclarationInformationTable',
            label: 'Merchandise invoice',
            children: <GenerateDeclarationInformation params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} />,
        },
        {
            key: 'customsManifestTable',
            label: 'Customs manifest',
            children: <CustomsManifest params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} />,
        },
        {
            key: 'customsDeclarationTable',
            label: 'Customs declaration',
            children: <CustomsDeclaration params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} />,
        }
    ];
    const onChange = (key: string) => {
        setTabIndex(key);
    };
    const genarateData = () => {
        setLoading(true)
        getInfoByNS({
            tranid: generateDeclarationInformationParams.soNumber,
        }).then((res) => {
            if (res.code) {
                // const tempData = res.data.filter((item: tInfoByNSItems) => item.item !== 'Shipping fee')
                const tempData = res.data.map((item: tInfoByNSItems) => {
                    return {
                        ...item,
                        needEdit: item.actual_volume_cbm == '0.0000000'
                    }
                })
                setGenerateDeclarationInformationParams({
                    ...generateDeclarationInformationParams,
                    data: tempData,
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
    return <div >
        <span>Template：</span>
        <Select defaultValue={0} style={{ width: 200 }} onChange={(e) => {
            setGenerateDeclarationInformationParams({
                ...generateDeclarationInformationParams,
                templateNumber: e,
            })
        }}>
            {template.map((_, index) => {
                return <Select.Option value={index} key={`template-${index + 1}`}>Template {index + 1}</Select.Option>
            })}
        </Select>
        &nbsp;&nbsp;
        <span>
            SO Number：
        </span>
        <Input style={{ width: 120 }} onChange={(e) => {
            setGenerateDeclarationInformationParams({
                ...generateDeclarationInformationParams,
                soNumber: e.target.value,
            })
        }} />
        &nbsp;&nbsp;
        <Button type="primary" disabled={!generateDeclarationInformationParams.soNumber} onClick={() => {
            // const reg = /(SO|TO)-S\d{4,}/
            // if (!reg.test(soNumber)) {
            //     message.error('SO Number format error')
            //     return
            // }
            genarateData()
        }}>
            Genarate
        </Button>
        &nbsp;&nbsp;
        <Button
            style={{ marginBottom: '10px' }}
            onClick={() => {
                const tempItem: any = items.find((item) => item.key === tabIndex)
                downloadPdf(tempItem.key, tempItem.label)
            }}>Print Current Report</Button>
        &nbsp;&nbsp;
        {/* <Button
            style={{ marginBottom: '10px' }}
            onClick={() => {
                setOpenModal(true)
            }}>Print All</Button> */}
        <Modal
            title='Print All'
            width={1150}
            open={openModal}
            onCancel={() => {
                setOpenModal(false)
            }}
            onOk={() => {
                // downloadPdf('printAllDom')
                // setOpenModal(false)
            }}>
            <div id='printAllDom'>
                <GenerateDeclarationInformation params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} />
                <CustomsManifest params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} width={876} />
            </div>
        </Modal>
        <Spin spinning={loading}>
            <Tabs
                centered
                activeKey={tabIndex}
                style={{
                    background: '#fff',
                    padding: '0px 8px',
                    minHeight: document.body.clientHeight - 94,
                }} items={items} onChange={onChange} />
        </Spin>
    </div>
}

export default App;