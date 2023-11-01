import React, { useState } from 'react';
import { Tabs, Button, Select, Input, message, Spin, Modal, Space, Checkbox, Dropdown } from 'antd';
import type { TabsProps, MenuProps } from 'antd';
import { GenerateDeclarationInformation, CustomsManifest, CustomsDeclaration, CustomsManifestTable, SettingComponent } from './ReportComponents';
import type { paramType, tInfoByNSItems } from '@/services/warehouse/generateDeclarationInformation'
import { getInfoByNS } from '@/services/warehouse/generateDeclarationInformation'
import { downloadPdf, downloadPdfAcross, printAllReport } from '@/utils/utils'
import { template } from './ReportComponents/reportConfig'




let merchandiseDom: any = null
let customsDeclarationDom: any = null
// let customsManifestDom: any = null
const App: React.FC = () => {
    const [tabIndex, setTabIndex] = useState('generateDeclarationInformationTable');
    const [generateDeclarationInformationParams, setGenerateDeclarationInformationParams] = useState<paramType>({
        invoiceNumber: '',
        templateNumber: 0,
        soNumber: REACT_APP_ENV === 'stag' ? 'SO-581330' : '',
        deliveryNumbers: '',
        numberOfCases: '',
        shippingFee: '',
        soldFor: template[0].termSale[0],
        premium: 0,
        countrtOfOrigin: template[0].countryOrigin[0],
        ultimateDestination: template[0].ultimateDestination[0],
        data: [],
        hsCode: [],
    });
    const [printDoms, setPrintDoms] = useState<any>({
        generateDeclarationInformationTable: true,
        customsManifestTable: true,
        customsDeclaration: true,
        all: true,
    });
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const items: TabsProps['items'] = [
        {
            key: 'generateDeclarationInformationTable',
            label: <>Merchandise invoice</>,
            children: <GenerateDeclarationInformation params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} />,
        },
        {
            key: 'customsManifestTable',
            label: <>Customs manifest</>,
            children: <CustomsManifest params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} />,
        },
        {
            key: 'customsDeclaration',
            label: <>Customs declaration</>,
            children: <CustomsDeclaration params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} />,
        }
    ];

    const cloneCustomsDeclaration = () => {
        setTimeout(() => {
            const tempCustomsDeclarationDom = document.getElementById('tempCustomsDeclaration');
            const tempMerchandiseInvoiceDom = document.getElementById('tempMerchandiseInvoice');
            if (merchandiseDom && tempMerchandiseInvoiceDom) {
                const cloneDom = merchandiseDom.cloneNode(true)
                tempMerchandiseInvoiceDom.innerHTML = ''
                tempMerchandiseInvoiceDom.appendChild(cloneDom)
            }
            if (customsDeclarationDom && tempCustomsDeclarationDom) {
                const cloneDom = customsDeclarationDom.cloneNode(true)
                tempCustomsDeclarationDom.innerHTML = ''
                tempCustomsDeclarationDom.appendChild(cloneDom)
            }
        })
    }
    const printAll = () => {
        if (!customsDeclarationDom) {
            setTabIndex('customsDeclaration')
        }
        if (!merchandiseDom) {
            setTabIndex('generateDeclarationInformation')
        }
        setOpenModal(true)
        setTimeout(() => {
            cloneCustomsDeclaration()
        })
        setTimeout(() => {
            printAllReport('printAllDom', 'Clearance of goods')
            setOpenModal(false)
        }, 500)
    }
    const onChange = (key: string) => {
        if (tabIndex === 'customsDeclaration') {
            customsDeclarationDom = document.getElementById('customsDeclarationBox')
        }
        if (tabIndex === 'generateDeclarationInformationTable') {
            merchandiseDom = document.getElementById('merchandiseInvoiceBox')
        }
        setTabIndex(key);

    };
    const getTotalAmountNum = (data: tInfoByNSItems[]) => {
        return data.reduce((sum, item) => {
            return sum + parseFloat(item.total_amount || "0")
        }, 0)
    }
    const genarateData = () => {
        setLoading(true)
        getInfoByNS({
            tranid: generateDeclarationInformationParams.soNumber,
        }).then((res) => {
            const { code, data, msg } = res
            if (code) {
                const hsCode = data.hs_code
                let tempData = data.ns_data.map((item: tInfoByNSItems) => {
                    const cn_hs_code = item.cn_hs_code.replace(/\./g, "") + '999'
                    const unit = hsCode.find((hsItem: any) => hsItem.name === cn_hs_code)?.unit || '个'
                    const blankSpaceBehindUnit = unit === '千克' ? item.qty : ''
                    return {
                        ...item,
                        currency: 'USD',
                        cn_hs_code,
                        unit,
                        blankSpaceBehindUnit,
                        needEdit: item.actual_volume_cbm == '0.0000000'
                    }
                })
                const shippingFee = tempData.find((item: tInfoByNSItems) => item.item.toLocaleLowerCase() === 'shipping fee')
                tempData = tempData.filter((item: tInfoByNSItems) => item.item.toLocaleLowerCase() !== 'shipping fee')
                const cooArray = tempData.map((item: tInfoByNSItems) => item.coo)
                // 去重
                const cooSet = new Set(cooArray)
                const cooArr = [...cooSet]
                let countrtOfOrigin: any = cooArr[0]
                if (cooArr.length > 1) {
                    countrtOfOrigin = 'Multiple'
                }
                setGenerateDeclarationInformationParams({
                    ...generateDeclarationInformationParams,
                    shippingFee: shippingFee ? shippingFee.total_amount : 0,
                    premium: getTotalAmountNum(tempData) * 0.0005,
                    data: tempData,
                    hsCode,
                    countrtOfOrigin,
                })
            } else {
                throw msg
            }
        }).catch((err) => {
            message.error(err)
        }).finally(() => {
            setLoading(false)
        })
    }
    const checkItem: MenuProps['items'] = [
        {
            key: '1',
            label: <span style={{ marginLeft: '5px' }}>Merchandise invoice</span>,
            icon: <Checkbox checked={printDoms.generateDeclarationInformationTable} onChange={e => {
                setPrintDoms({
                    ...printDoms,
                    all: e.target.checked ? printDoms.all : false,
                    generateDeclarationInformationTable: e.target.checked,
                })
            }} />,
        },
        {
            key: '2',
            label: <span style={{ marginLeft: '5px' }}>Customs manifest</span>,
            icon: <Checkbox checked={printDoms.customsManifestTable} onChange={e => {
                setPrintDoms({
                    ...printDoms,
                    all: e.target.checked ? printDoms.all : false,
                    customsManifestTable: e.target.checked,
                })
            }} />,
        },
        {
            key: '3',
            label: <span style={{ marginLeft: '5px' }}>Customs declaration</span>,
            icon: <Checkbox checked={printDoms.customsDeclaration} onChange={e => {
                setPrintDoms({
                    ...printDoms,
                    all: e.target.checked ? printDoms.all : false,
                    customsDeclaration: e.target.checked,
                })
            }} />,
        },
        {
            key: '4',
            label: <Button
                style={{ width: '100%' }}
                size='small'
                onClick={() => {
                    setPrintDoms({
                        ...printDoms,
                        all: false,
                    })
                    printAll()
                }}>
                Download
            </Button>
        }
    ];
    return <div >
        <Space style={{ marginBottom: 10 }}>
            <span>
                Template：
                <Select defaultValue={0} style={{ width: 200 }} onChange={(e) => {
                    setGenerateDeclarationInformationParams({
                        ...generateDeclarationInformationParams,
                        ultimateDestination: template[e].ultimateDestination[0],
                        soldFor: template[e].termSale[0],
                        templateNumber: e,
                    })
                }}>
                    {template.map((item, index) => {
                        return <Select.Option value={index} key={`template-${index + 1}`}>{item.tempLateName}</Select.Option>
                    })}
                </Select></span>
            <span>
                SO Number：
                <Input style={{ width: 120 }} value={generateDeclarationInformationParams.soNumber} onChange={(e) => {
                    setGenerateDeclarationInformationParams({
                        ...generateDeclarationInformationParams,
                        soNumber: e.target.value,
                    })
                }} />

            </span>
            <Button type="primary" disabled={!generateDeclarationInformationParams.soNumber} onClick={() => {
                genarateData()
            }}>
                Genarate
            </Button>
            <Button
                onClick={() => {
                    const tempItem: any = items.find((item) => item.key === tabIndex)
                    if (tabIndex === 'customsDeclaration' || tabIndex === 'customsManifestTable') {
                        downloadPdfAcross(tempItem.key, tempItem.label)
                        return
                    }
                    downloadPdf(tempItem.key, tempItem.label)
                }}>Print Current Report</Button>
            <Dropdown.Button
                open={open}
                onOpenChange={(e) => {
                    setOpen(e)
                }}
                onClick={() => {
                    setPrintDoms({
                        ...printDoms,
                        all: true,
                    })
                    printAll()
                }}
                menu={{
                    items: checkItem,
                    onClick: () => {
                        setOpen(true)
                    }
                }}>
                Download All
            </Dropdown.Button>
            <SettingComponent reload={genarateData} />
        </Space>
        <Modal
            title='View'
            width={1600}
            style={{
                minWidth: '1600px'
            }}
            open={openModal}
            onCancel={() => {
                setOpenModal(false)
            }}
            bodyStyle={{
                overflowX: 'scroll',
                maxWidth: '1600px',
            }}
            okText='Download'>
            <div id='printAllDom'>
                {(printDoms.generateDeclarationInformationTable || printDoms.all) && <div id='tempMerchandiseInvoice'>not yet</div>}
                {(printDoms.customsManifestTable || printDoms.all) && <><div
                    className='whole-node'
                    style={{
                        marginTop: '100px',
                    }} />
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <CustomsManifestTable params={generateDeclarationInformationParams} setParams={setGenerateDeclarationInformationParams} width={600} />
                    </div></>}
                {(printDoms.customsDeclaration || printDoms.all) && <><div
                    className='whole-node'
                    style={{
                        marginLeft: '12%',
                        marginTop: '100px',
                    }} />
                    <div id='tempCustomsDeclaration'>not yet</div></>}
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