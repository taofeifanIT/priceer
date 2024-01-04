import React, { useState } from 'react';
import { Tabs, Button, Select, Input, message, Spin, Modal, Space, Checkbox, Dropdown, Upload, Popover, Switch, InputNumber } from 'antd';
import type { TabsProps, MenuProps, UploadProps } from 'antd';
import { GenerateDeclarationInformation, CustomsManifest, CustomsDeclaration, CustomsManifestTable, SettingComponent } from './ReportComponents';
import type { paramType, tInfoByNSItems } from '@/services/warehouse/generateDeclarationInformation'
import { getInfoByNS } from '@/services/warehouse/generateDeclarationInformation'
import { downloadPdf, downloadPdfAcross, printAllReport, checkDecimal } from '@/utils/utils'
import { template } from './ReportComponents/reportConfig'
import { round, chain, multiply, divide, subtract, add } from 'mathjs'
import { UploadOutlined } from '@ant-design/icons';
import { getToken } from '@/utils/token'
import { exportTablesExcel } from '@/utils/excelHelper'
import ReactHTMLTableToExcel from 'react-html-table-to-excel'


let merchandiseDom: any = null
let customsDeclarationDom: any = null
// let customsManifestDom: any = null


const tableDom = {
    merchandiseTable: null,
    customsManifestTable: null,
    customsDeclarationTable: null,
}

const App: React.FC = () => {
    const [tabIndex, setTabIndex] = useState('generateDeclarationInformationTable');
    const [generateDeclarationInformationParams, setGenerateDeclarationInformationParams] = useState<paramType>({
        invoiceNumber: '',
        templateNumber: 0,
        soNumber: REACT_APP_ENV === 'stag' ? 'SO-S243142' : '',
        deliveryNumbers: '',
        numberOfCases: '',
        shippingFee: '',
        soldFor: template[0].termSale[0],
        premium: 0,
        countrtOfOrigin: template[0].countryOrigin[0],
        ultimateDestination: template[0].ultimateDestination[0],
        data: [],
        hsCode: [],
        totalInvoiceValue: 0,
        totalAmountAll: 0,
        declarationTotal: 0,
        printAll: false,
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
    const [fileLoading, setFileLoading] = useState(false);
    const [nsLink, setNsLink] = useState('');
    const [unitPriceRatio, setUnitPriceRatio] = useState(1);
    const [isShowUnitPriceRatio, setIsShowUnitPriceRatio] = useState(false);
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
    const uploadProps: UploadProps = {
        // 只支持上传一个文件
        showUploadList: false,
        multiple: false,
        // 限制文件类型
        accept: '.xls,.xlsx,.pdf',
        customRequest(options) {
            const { file } = options
            const fileName = generateDeclarationInformationParams.soNumber + '-' + new Date().getTime()
            const formData = new FormData()
            // 判断文件后缀
            const suffix = (file as any).name.split('.')[1]
            // xls xlsx pdf
            let fileType = ''
            if (suffix === 'xls' || suffix === 'xlsx') {
                fileType = 'EXCEL'
            }
            if (suffix === 'pdf') {
                fileType = 'PDF'
            }
            formData.append('file_content', file)
            formData.append('file_name', fileName)
            formData.append('file_type', fileType)
            formData.append('tran_id', generateDeclarationInformationParams.soNumber)
            setFileLoading(true)
            fetch(`${API_URL}/shipment/uploadFileToNs`, {
                method: 'POST',
                headers: {
                    'token': getToken(),
                },
                body: formData,
            }).then((res) => res.json()).then((res) => {
                const { code, msg, data } = res
                if (code) {
                    setNsLink(data.url)
                    message.success(<>
                        Successful！<a target='_blank' href={data.url} rel="noreferrer">{data.url}</a>
                    </>, 5)
                } else {
                    message.error(msg)
                }
            }).catch((err) => {
                message.error(JSON.stringify(err))
            }).finally(() => {
                setFileLoading(false)
            })
        },
        // 上传文件之前的钩子
        beforeUpload(file) {
            // 判断文件后缀
            const suffix = file.name.split('.')[1]
            if (suffix !== 'xls' && suffix !== 'xlsx' && suffix !== 'pdf') {
                message.error('Please upload xls, xlsx or pdf file')
                return false
            }
            return true
        },

    };

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
        setGenerateDeclarationInformationParams({
            ...generateDeclarationInformationParams,
            printAll: true,
        })
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
            setGenerateDeclarationInformationParams({
                ...generateDeclarationInformationParams,
                printAll: false,
            })
        }, 500)
    }
    const getPremium = (data: tInfoByNSItems[]) => {
        const premium = data.reduce((sum, item) => {
            return chain(Number(item.total_amount || "0")).multiply(0.0005).add(sum).done()
        }, 0)
        return premium
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
    const checkMultipleCoo = (record: tInfoByNSItems) => {
        // 如果是多国家，返回true
        const { coo } = record
        const multipleCoo = coo.split('/')
        if (multipleCoo.length > 1) {
            return record.qty
        }
        return false
    }
    const caculateData = (unitPriceRatioValue: number, isShowUnitPriceRatioValue: boolean) => {
        const shippingFee = generateDeclarationInformationParams.shippingFee
        // 处理基础数据，hscode到单位的转换，计算total_amount（unit_price_usd * qty）
        let tempData: any = generateDeclarationInformationParams.data.map((item: tInfoByNSItems) => {
            const unit_price_usd = isShowUnitPriceRatioValue ? round(multiply(Number(item.baseUnitPriceUsd), unitPriceRatioValue), 4) : Number(item.unit_price_usd)
            const total_amount = item.item.toLocaleLowerCase() === 'shipping fee' ? item.total_amount : checkDecimal(round(unit_price_usd * Number(item.qty), 2))
            return {
                ...item,
                unit_price_usd,
                total_amount,
            }
        })
        const totalAmountAll = tempData.reduce((sum: number, item: tInfoByNSItems) => {
            return chain(Number(item.total_amount || "0")).add(sum).done()
        }, 0)
        // 计算所有货品的总保费premium
        const premium = getPremium(tempData)
        // 计算商业发票中的Total Invoice Value（Total Amount 之和 + Shipping Fee + Premium）
        const totalInvoiceValue = chain(Number(totalAmountAll)).add(shippingFee ? Number(shippingFee) : 0).round(2).done()
        tempData = tempData.map((item: tInfoByNSItems) => {
            // 将运费和保费按照比例分配到每个货品中
            // declarationSum = total_amount + shipingFeeInItem + premiumInItem
            const shipingFeeInItem = round(multiply(divide(Number(item.total_amount), totalAmountAll), subtract(Number(shippingFee), premium)), 2)
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
        // const different = subtract(totalInvoiceValue, declarationTotal)
        const different = subtract(round(totalInvoiceValue, 5), round(declarationTotal, 5))
        // console.log(different, totalInvoiceValue, declarationTotal)
        if (different !== 0) {
            const lastItem = tempData[tempData.length - 1]
            lastItem.shipingFeeInItem = add(lastItem.shipingFeeInItem, different)
            lastItem.declarationSum = round(add(add(lastItem.shipingFeeInItem, Number(lastItem.total_amount)), lastItem.premiumInItem), 2)
            tempData[tempData.length - 1] = lastItem
            declarationTotal = tempData.reduce((sum: number, item: { declarationSum: any; }) => {
                return chain(sum).add(item.declarationSum).done()
            }, 0)
        }
        setGenerateDeclarationInformationParams({
            ...generateDeclarationInformationParams,
            premium,
            data: tempData,
            totalAmountAll,
            totalInvoiceValue,
            declarationTotal,
        })
    }
    const genarateData = () => {
        setLoading(true)
        getInfoByNS({
            tranid: generateDeclarationInformationParams.soNumber,
        }).then((res) => {
            const { code, data, msg } = res
            if (code) {
                const hsCode = data.hs_code
                // 因为shippingFee也在ns_data里面，所以要先找到shippingFee,对shippingFee进行处理，并且不能保留在原始的ns_data里面
                const shippingFee = data.ns_data.find((item: tInfoByNSItems) => item.item.toLocaleLowerCase() === 'shipping fee')
                // 处理基础数据，hscode到单位的转换，计算total_amount（unit_price_usd * qty）
                let tempData = data.ns_data.map((item: tInfoByNSItems) => {
                    const cn_hs_code = item.cn_hs_code.replace(/\./g, "") + '999'
                    const unit = hsCode.find((hsItem: any) => hsItem.name === cn_hs_code)?.unit || '个'
                    const blankSpaceBehindUnit = unit === '千克' ? item.qty : ''
                    const baseUnitPriceUsd = item.unit_price_usd
                    // const total_amount = item.item.toLocaleLowerCase() === 'shipping fee' ? item.total_amount : checkDecimal(round(item.unit_price_usd * Number(item.qty), 2))
                    const total_amount = item.total_amount
                    const isCanada = generateDeclarationInformationParams.ultimateDestination === 'Canada'
                    // 如果是加拿大，使用ca_hs_code，否则使用us_hs_code
                    const hts = isCanada ? item.ca_hs_code : item.us_hs_code
                    return {
                        ...item,
                        currency: 'USD',
                        cn_hs_code,
                        unit,
                        hts,
                        blankSpaceBehindUnit,
                        baseUnitPriceUsd,
                        total_amount,
                        needEdit: item.actual_volume_cbm == '0.0000000',
                        baseQty: checkMultipleCoo(item),
                    }
                })
                // 在基础数据中删除shippingFee，在上面已经保留过了
                tempData = tempData.filter((item: tInfoByNSItems) => item.item.toLocaleLowerCase() !== 'shipping fee')
                const totalAmountAll = tempData.reduce((sum: number, item: tInfoByNSItems) => {
                    return chain(Number(item.total_amount || "0")).add(sum).done()
                }, 0)
                // 计算所有货品的总保费premium
                const premium = getPremium(tempData)
                // 计算商业发票中的Total Invoice Value（Total Amount 之和 + Shipping Fee + Premium）
                const totalInvoiceValue = chain(Number(totalAmountAll)).add(shippingFee ? Number(shippingFee.total_amount) : 0).round(2).done()
                tempData = tempData.map((item: tInfoByNSItems) => {
                    // 将运费和保费按照比例分配到每个货品中
                    // declarationSum = total_amount + shipingFeeInItem + premiumInItem
                    const shipingFeeInItem = round(multiply(divide(Number(item.total_amount), totalAmountAll), subtract(Number(shippingFee.total_amount), premium)), 2)
                    const premiumInItem = Number(item.total_amount) * 0.0005
                    return {
                        ...item,
                        shipingFeeInItem,
                        premiumInItem,
                        declarationSum: round(add(add(shipingFeeInItem, Number(item.total_amount)), premiumInItem), 2),
                    }
                })
                // 获取所有货品的国家
                const cooArray = tempData.map((item: tInfoByNSItems) => item.coo)
                const cooSet = new Set(cooArray)
                const cooArr = [...cooSet]
                let countrtOfOrigin: any = cooArr[0]
                // 如果国家大于1个，则显示Multiple
                if (cooArr.length > 1) {
                    countrtOfOrigin = 'Multiple'
                }
                // 计算所有货品的总金额，使用均摊过的运费和保费的declarationSum计算，这里的数据将用在 ”报关单“ 总计
                let declarationTotal = tempData.reduce((sum: number, item: { declarationSum: any; }) => {
                    return chain(sum).add(item.declarationSum).done()
                }, 0)
                // 计算商业发票的 "Total Invoice Value" 和报关单的 "总计" 是否相等，不相等则将差额加到最后一个货品的运费中,重新计算declarationSum和declarationTotal
                // const different = subtract(totalInvoiceValue, declarationTotal)
                const different = subtract(round(totalInvoiceValue, 5), round(declarationTotal, 5))
                // console.log(different, totalInvoiceValue, declarationTotal)
                if (different !== 0) {
                    const lastItem = tempData[tempData.length - 1]
                    lastItem.shipingFeeInItem = add(lastItem.shipingFeeInItem, different)
                    lastItem.declarationSum = round(add(add(lastItem.shipingFeeInItem, Number(lastItem.total_amount)), lastItem.premiumInItem), 2)
                    tempData[tempData.length - 1] = lastItem
                    declarationTotal = tempData.reduce((sum: number, item: { declarationSum: any; }) => {
                        return chain(sum).add(item.declarationSum).done()
                    }, 0)
                }
                setGenerateDeclarationInformationParams({
                    ...generateDeclarationInformationParams,
                    shippingFee: shippingFee ? shippingFee.total_amount : 0,
                    premium,
                    data: tempData,
                    hsCode,
                    totalAmountAll,
                    totalInvoiceValue,
                    countrtOfOrigin,
                    declarationTotal,
                })
            } else {
                throw msg
            }
        }).catch((err) => {
            console.log(err)
            message.error(JSON.stringify(err))
        }).finally(() => {
            setLoading(false)
        })
    }

    const downLoadAllTable = () => {
        exportTablesExcel(
            ['generateDeclarationInformationTable'],
            'test.xlsx'
        )
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
    return <div>
        <Space style={{ marginBottom: 10 }}>
            <span>
                Template：
                <Select defaultValue={0} style={{ width: 120 }} onChange={(e) => {
                    setGenerateDeclarationInformationParams({
                        ...generateDeclarationInformationParams,
                        ultimateDestination: template[e].ultimateDestination[0],
                        soldFor: template[e].termSale[0],
                        templateNumber: e,
                    })
                }}
                    options={[
                        {
                            label: 'Warehouse',
                            // options: template.map((item, index) => {
                            //     return {
                            //         label: item.tempLateName,
                            //         value: index,
                            //     }
                            // })
                            // options 取前18个
                            options: template.slice(0, 18).map((item, index) => {
                                return {
                                    label: item.tempLateName,
                                    value: index,
                                }
                            })
                        },
                        {
                            label: 'Mellon',
                            options: template.slice(18).map((item, index) => {
                                return {
                                    label: item.tempLateName,
                                    value: index + 18,
                                }
                            })
                        }
                    ]}
                />
                {/* {template.map((item, index) => {
                        return <Select.Option value={index} key={`template-${index + 1}`}>{item.tempLateName}</Select.Option>
                    })}
                </Select> */}
            </span>
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
                    const lable = tempItem.label.props.children
                    if (tabIndex === 'customsDeclaration' || tabIndex === 'customsManifestTable') {
                        downloadPdfAcross(tempItem.key, lable)
                        return
                    }
                    downloadPdf(tempItem.key, lable)
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
            {tabIndex === 'customsDeclaration' && <ReactHTMLTableToExcel
                id="test-table-xls-button3"
                className="ant-btn ant-btn-default"
                table="customsDeclaration"
                filename="Customs_declaration"
                sheet="tablexls"
                format="xlsx"
                buttonText="Customs Declaration Excel" />}
            {tabIndex === 'customsManifestTable' && <ReactHTMLTableToExcel
                id="test-table-xls-button2"
                className="ant-btn ant-btn-default"
                table="customsManifestTable"
                filename="Customs_manifest"
                sheet="tablexls"
                buttonText="Customs Manifest Excel" />}
            {tabIndex === 'generateDeclarationInformationTable' && <ReactHTMLTableToExcel
                id="test-table-xls-button"
                className="ant-btn ant-btn-default"
                table="generateDeclarationInformationTable"
                filename="Merchandise_invoice"
                sheet="tablexls"
                buttonText="Merchandise Invoice Excel" />}
            {/* <Button onClick={() => {
                downLoadAllTable()
            }
            }>Download All Table</Button> */}
            <Popover content={nsLink ? <div>
                <a
                    href={nsLink}
                    target="_blank"
                    rel="noreferrer"
                >{nsLink}</a>
            </div> : ''} placement="bottom">
                <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} loading={fileLoading}>Upload file to NS</Button>
                </Upload>

            </Popover>
            <SettingComponent reload={genarateData} />
        </Space>
        <div>
            <Space>
                Unit price ratio:
                <InputNumber step={0.1} style={{ width: 70 }} value={unitPriceRatio} onChange={(val) => {
                    setUnitPriceRatio(val || 0)
                    if (isShowUnitPriceRatio) {
                        caculateData(val || 1, isShowUnitPriceRatio)
                    }
                }} />
                <Switch
                    checked={isShowUnitPriceRatio}
                    checkedChildren="Open"
                    unCheckedChildren="Close"
                    onChange={(val) => {
                        setIsShowUnitPriceRatio(val)
                        if (val) {
                            caculateData(unitPriceRatio, val)
                        } else {
                            caculateData(1, true)
                        }
                    }}
                />
            </Space>
        </div>
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