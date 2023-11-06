import React, { useState, useEffect } from 'react';
import { getQueryVariable } from '@/utils/utils'
import { getDesignDetail, checkDesign, checkImage } from '@/services/odika/requirementList';
import type { saveDesignParams } from '@/services/odika/requirementList';
import { FormattedMessage } from 'umi';
import { message, Space, Typography, Image, Empty, Tag, Button, Affix, Drawer, Form, Input, Radio } from 'antd';
const { Text, Title } = Typography;

const COLORS = ['#f50', '#2db7f5', '#87d068', '#108ee9', '#f50', '#2db7f5', '#87d068', '#108ee9', '#f50', '#2db7f5', '#87d068', '#108ee9']

const tagStyle: React.CSSProperties = {
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    marginBottom: '5px',
}

const CheckForm = (props: { check?: string }) => {
    const { check } = props;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const finish = () => {
        form.validateFields().then(values => {
            setLoading(true)
            const state = getQueryVariable('state')
            const params = {
                id: parseInt(getQueryVariable('id')),
                status: state ? undefined : values.status,
                reason: values.reason,
                state: state ? parseInt(state) : undefined,
                type: parseInt(state)
            }
            const api: any = state ? checkImage : checkDesign
            api(params).then((res: any) => {
                if (res.code) {
                    message.success('Audit completed！')
                } else {
                    message.error(res.msg)
                }
            }).finally(() => {
                setLoading(false)
                onClose()
            })
        })
    }
    return (
        <>
            <Affix offsetBottom={20} offsetRight={20} style={{ 'textAlign': 'right' }}>
                {(check && check === 'true') ? <Button type='primary' onClick={showDrawer}>Check</Button> : null}
            </Affix>
            <Drawer
                title="Check requirement"
                width={720}
                onClose={onClose}
                open={open}
                bodyStyle={{ paddingBottom: 80 }}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button onClick={finish} loading={loading} type="primary">
                            Submit
                        </Button>
                    </Space>
                }
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        name="status"
                        label={<FormattedMessage id='pages.odika.RequirementList.result' />}
                        rules={[{ required: true, message: 'Please select a result' }]}
                    >
                        <Radio.Group>
                            <Radio value="1">
                                <FormattedMessage id='pages.odika.RequirementList.pass' />
                            </Radio>
                            <Radio value="0">
                                <FormattedMessage id='pages.odika.RequirementList.fail' />
                            </Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="reason"
                        label={<FormattedMessage id='pages.odika.RequirementList.remark' />}
                        rules={[{ required: false, message: 'Please enter reason' }]}
                    >
                        <Input.TextArea
                            style={{ width: '100%' }}
                            placeholder="Please enter reason"
                        />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
};

const HEIGHT = 200
const WIDTH = 250

export default () => {
    const [id] = useState<number>(parseInt(getQueryVariable('id')))
    const [check] = useState(getQueryVariable('check'))
    const [designDetail, setDesignDetail] = useState<saveDesignParams>()
    const initData = () => {
        getDesignDetail({ id: id }).then(res => {
            if (res.code) {
                setDesignDetail(res.data)
            } else {
                message.error(res.msg)
            }

        })
    }
    // 获取浏览器宽度
    const getBrowserWidth = () => {
        let width = 0;
        if (window.innerWidth) {
            width = window.innerWidth;
        } else if ((document as any).body && (document as any).body.clientWidth) {
            width = (document as any).body.clientWidth;
        }
        if (document.documentElement && document.documentElement.clientWidth) {
            width = document.documentElement.clientWidth;
        }
        return width;
    }

    const getImage = (url: string, thumbUrl: string | undefined) => {
        if (url) {
            const imgUrl = API_URL + '/storage/' + url
            return <Image
                style={{ border: '4px solid #eee' }}
                src={imgUrl}
                preview={{ src: imgUrl }}
                height={HEIGHT}
                width={WIDTH} />
        } else {
            return <Empty description={<FormattedMessage id={'pages.odika.ViewDesign.imageMessage'} />} style={{ 'width': '250px', height: 200, paddingTop: 40 }} image={`${API_URL}/example/default.png`} />
        }
    }
    const checkWhiteBackgroundAndProps = (whiteBackgroundAndProps: any) => {
        return (whiteBackgroundAndProps?.url || whiteBackgroundAndProps?.memo)
    }
    const checkSizeAndNaterial = (sizeAndNaterial: any) => {
        return (sizeAndNaterial?.url || sizeAndNaterial?.memo)
    }
    const checkAuxiliaryPictureScene = (auxiliaryPictureScene: any) => {
        return auxiliaryPictureScene?.length
    }
    const checkAPlus = (aPlus: any) => {
        return aPlus?.aplusScene?.length
    }
    const checkDetailPicture = (detailPicture: any) => {
        return detailPicture?.length
    }
    const checkMainPictures = (mainPictures: any) => {
        return mainPictures?.length
    }
    const checkAuxiliaryPictures = (auxiliaryPictures: any) => {
        return auxiliaryPictures?.length
    }
    useEffect(() => {
        initData()
    }, [])
    return (<>
        <div style={{ background: '#fff', padding: '20px', position: 'relative', top: -25, left: -25, width: getBrowserWidth() }}>
            <Space size={'large'} style={{ 'marginBottom': '20px' }} align='start'>
                <Text strong>SKU：{designDetail?.sku}</Text>
                <Text strong>Initiator：{designDetail?.username}</Text>
                <Text strong>Date：{designDetail?.createTime}</Text>
            </Space>
            {designDetail?.competitor?.length && (<><Title level={3} style={{ 'marginTop': '20px' }}><FormattedMessage id='pages.odika.RequirementList.CompetitiveAsin' /></Title>
                <div style={{ 'marginBottom': '20px' }}>
                    <div>
                        <div>
                            <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                <div>
                                    {designDetail?.competitor.map((item) => {
                                        return <a href={`https://www.amazon.com/dp/${item}`} target='_blank' rel="noreferrer" key={item}><Tag key={item}>{item}</Tag></a>
                                    })}
                                </div>
                            </Space>
                        </div>
                    </div>
                </div></>)}
            {checkMainPictures(designDetail?.mainPictures) ? (<><Title level={3} style={{ 'marginTop': '20px' }}><FormattedMessage id='pages.odika.ViewDesign.mainPicture' />(2000:2000px)</Title>
                <div>
                    {designDetail?.mainPictures?.map((item, index) => {
                        return <div style={{ 'display': 'inline-block', verticalAlign: 'top', marginRight: index !== designDetail?.mainPictures?.length ? 10 : 0 }} key={index}>
                            <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                {
                                    (item.url && item.url.length) ? item.url.map((subItem, subIndex) => {
                                        return <div key={subItem}>
                                            <div>{getImage(subItem, (item as any).thumbnail[subIndex])}</div>
                                        </div>
                                    }) : <div>{getImage('', '')}</div>
                                }
                            </Space>
                            <div>
                                <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                    <span><FormattedMessage id='pages.odika.ViewDesign.pictrueDesc' />：</span>
                                    <div style={{ width: ((item.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{item.memo}</div>
                                </Space>
                            </div>
                        </div>
                    })}
                </div></>) : null}
            {(checkWhiteBackgroundAndProps(designDetail?.mainPicture.whiteBackgroundAndProps) && checkSizeAndNaterial(designDetail?.mainPicture.sizeAndNaterial)) &&
                <Title level={3} style={{ 'marginTop': '20px' }}><FormattedMessage id='pages.odika.ViewDesign.mainPicture' /> (2000:2000px)</Title>}
            <div>
                {checkWhiteBackgroundAndProps(designDetail?.mainPicture.whiteBackgroundAndProps) && (<div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                    <Title level={5}><FormattedMessage id='pages.odika.ViewDesign.WhiteBackgroundPictureAndProps' /></Title>
                    <div>
                        {designDetail?.mainPicture.whiteBackgroundAndProps.url ? designDetail.mainPicture.whiteBackgroundAndProps.url.map((item, index) => {
                            return <div key={index} style={{ display: 'inline-block', marginRight: index !== designDetail?.mainPicture?.whiteBackgroundAndProps?.url?.length ? 10 : 0 }}>
                                {getImage(item, (designDetail?.mainPicture?.whiteBackgroundAndProps as any).thumbnail[index])}
                            </div>
                        }) : <Empty description={<FormattedMessage id='pages.odika.ViewDesign.imageMessage' />} style={{ 'width': '250px', height: 200, paddingTop: 40 }} image={`${API_URL}/example/default.png`} />}
                    </div>
                    <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                        <span><FormattedMessage id='pages.odika.ViewDesign.pictrueDesc' />：</span>
                        <div style={{ width: ((designDetail?.mainPicture?.whiteBackgroundAndProps?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{designDetail?.mainPicture.whiteBackgroundAndProps.memo}</div>
                    </Space>
                </div>)}
                {checkSizeAndNaterial(designDetail?.mainPicture.sizeAndNaterial) && (<div style={{ verticalAlign: 'top', marginTop: '10px' }}>
                    <Title level={3}><FormattedMessage id='pages.odika.ViewDesign.subscene' />(2000:2000px)</Title>
                    <Title level={5}><FormattedMessage id='pages.odika.ViewDesign.sizeAndMaterial' /></Title>
                    <div>
                        {designDetail?.mainPicture.sizeAndNaterial.url ? designDetail.mainPicture.sizeAndNaterial.url.map((item, index) => {
                            return <div key={index} style={{ display: 'inline-block', marginRight: index !== designDetail?.mainPicture?.sizeAndNaterial?.url?.length ? 10 : 0 }}>
                                {getImage(item, (designDetail?.mainPicture?.sizeAndNaterial as any).thumbnail[index])}
                            </div>
                        }) : <Empty description={<FormattedMessage id='pages.odika.ViewDesign.imageMessage' />} style={{ 'width': '250px', height: 200, paddingTop: 40 }} image={`${API_URL}/example/default.png`} />}
                    </div>
                    <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                        <span><FormattedMessage id='pages.odika.ViewDesign.pictrueDesc' />：</span>
                        <div style={{ width: ((designDetail?.mainPicture?.sizeAndNaterial?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{designDetail?.mainPicture.sizeAndNaterial.memo}</div>
                    </Space>
                </div>)}
            </div>
            {/* {checkAuxiliaryPicture(designDetail?.auxiliaryPicture) && (<><Title level={3} style={{ 'marginTop': '20px' }}><FormattedMessage id='pages.odika.ViewDesign.secondPicture' /></Title>
                <div style={{ 'marginBottom': '20px' }}>
                    <div>
                        <div>
                            {designDetail?.auxiliaryPicture.url ? designDetail.auxiliaryPicture.url.map((item, index) => {
                                return <div key={index} style={{ display: 'inline-block', marginRight: index !== designDetail?.auxiliaryPicture?.url?.length ? 10 : 0 }}>
                                    {getImage(item, (designDetail?.auxiliaryPicture as any).thumbnail[index])}
                                </div>
                            }) : <Empty description={<FormattedMessage id='pages.odika.ViewDesign.imageMessage' />} style={{ 'width': '250px', height: 200, paddingTop: 40 }} image={`${API_URL}/example/default.png`} />}
                        </div>
                        <div>
                            <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                <span><FormattedMessage id='pages.odika.ViewDesign.SellingPoint' />：</span>
                                <div>
                                    {designDetail?.auxiliaryPicture?.sellingPoint?.map((item, index) => {
                                        return <Tag color={COLORS[index]} key={index}>{item}</Tag>
                                    })}
                                </div>
                            </Space>
                        </div>
                        <div>
                            <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                <span><FormattedMessage id='pages.odika.ViewDesign.pictrueDesc' />：</span>
                                <div style={{ width: ((designDetail?.auxiliaryPicture?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{designDetail?.auxiliaryPicture.memo}</div>
                            </Space>
                        </div>
                    </div>
                </div></>)} */}
            {checkAuxiliaryPictures(designDetail?.auxiliaryPictures) ? (<><Title level={3} style={{ 'marginTop': '20px' }}><FormattedMessage id='pages.odika.ViewDesign.secondPicture' />（2000:2000px）&nbsp;&nbsp;<FormattedMessage id='pages.odika.RequirementList.pictureTextDetailsIcon' /></Title>
                <div>
                    {designDetail?.auxiliaryPictures?.map((item, index) => {
                        return <div style={{ 'display': 'inline-block', verticalAlign: 'top', marginRight: index !== designDetail?.auxiliaryPictures?.length ? 10 : 0 }} key={index}>
                            <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                {
                                    (item.url && item.url.length) ? item.url.map((subItem, subIndex) => {
                                        return <div key={subItem}>
                                            <div>{getImage(subItem, (item as any).thumbnail[subIndex])}</div>
                                        </div>
                                    }) : <div>{getImage('', '')}</div>
                                }
                            </Space>
                            <div>
                                <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                    <span><FormattedMessage id='pages.odika.ViewDesign.SellingPoint' />：</span>
                                    <div style={{ maxWidth: ((item.url?.length || 1) * WIDTH - 50) }}>
                                        {item?.sellingPoint?.map((point, pointIndex) => {
                                            return <Tag color={COLORS[pointIndex]} style={tagStyle} key={point}>{point}</Tag>
                                        })}
                                    </div>
                                </Space>
                            </div>
                            <div>
                                <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                    <span><FormattedMessage id='pages.odika.ViewDesign.pictrueDesc' />：</span>
                                    <div style={{ width: ((item.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{item.memo}</div>
                                </Space>
                            </div>
                        </div>
                    })}
                </div></>) : null}
            {
                (checkAuxiliaryPictureScene(designDetail?.auxiliaryPictureScene)) ? (<><Title level={3} style={{ 'marginTop': '20px' }}><FormattedMessage id='pages.odika.RequirementList.sceneGraph' /> (2000:2000px)</Title>
                    <div>
                        {designDetail?.auxiliaryPictureScene?.map((item, index) => {
                            return <div key={index} style={{ display: 'inline-block', verticalAlign: 'top' }}>
                                <div>
                                    {item.url ? item.url.map((subItem, subIndex) => {
                                        return <div key={subItem} style={{ display: 'inline-block', marginRight: subIndex !== item.url.length ? 10 : 0 }}>
                                            {getImage(subItem, (item as any).thumbnail[subIndex])}
                                        </div>
                                    }) : <Empty description={<FormattedMessage id='pages.odika.ViewDesign.imageMessage' />} style={{ 'width': '250px', height: 200, paddingTop: 40 }} image={`${API_URL}/example/default.png`} />}
                                </div>
                                <div>
                                    <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                        <span><FormattedMessage id='pages.odika.ViewDesign.scene' />{index + 1}：</span>
                                        <div style={{ width: 205, wordBreak: 'break-word' }}>{item.scene}</div>
                                    </Space>
                                </div>
                                <div>
                                    <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                        <span><FormattedMessage id='pages.odika.ViewDesign.pictrueDesc' />：</span>
                                        <div style={{ width: ((item?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{item.memo}</div>
                                    </Space>
                                </div>
                            </div>
                        })}
                    </div></>)
                    : null}
            {checkAPlus(designDetail?.aPlus) ? (<>
                <Title level={5} style={{ 'marginTop': '20px' }}>{designDetail?.aPlus.type}&nbsp;&nbsp;<FormattedMessage id='pages.odika.RequirementList.template' /></Title>
                <Title level={5} style={{ 'marginTop': '20px' }}><FormattedMessage id='pages.odika.ViewDesign.sceneRotograph' /> (2928:1200px)</Title>
                <div style={{ 'marginBottom': '20px', 'verticalAlign': 'textTop' }}>
                    {designDetail?.aPlus.aplusScene?.map((item, index) => {
                        return <div style={{ 'display': 'inline-block', verticalAlign: 'top', marginRight: index !== designDetail?.aPlus.aplusScene?.length ? 10 : 0 }} key={index}>
                            <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                {
                                    (item.url && item.url.length) ? item.url.map((subItem, subIndex) => {
                                        return <div key={subItem}>
                                            <div>{getImage(subItem, (item as any).thumbnail[subIndex])}</div>
                                        </div>
                                    }) : <div>{getImage('', '')}</div>
                                }
                            </Space>
                            <div>
                                <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                    <span><FormattedMessage id='pages.odika.ViewDesign.scene' />{index + 1}：</span>
                                    <div style={{ width: ((item?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word' }}>{item.scene}</div>
                                </Space>
                            </div>
                            <div>
                                <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                    <span><FormattedMessage id='pages.odika.ViewDesign.pictureRequirement' />：</span>
                                    <div style={{ width: ((item?.url?.length || 1) * WIDTH - 80), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{item.pictureRequirement}</div>
                                </Space>
                            </div>
                            <div>
                                <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                    <span><FormattedMessage id='pages.odika.ViewDesign.pictrueDesc' />：</span>
                                    <div style={{ width: ((item?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{item.memo}</div>
                                </Space>
                            </div>
                        </div>
                    })}
                </div>
            </>) : null}
            {checkDetailPicture(designDetail?.detailPicture) ? (<><Title level={5} style={{ 'marginTop': '20px' }}><FormattedMessage id='pages.odika.ViewDesign.detail' /> (1300:700)</Title>
                <div>
                    {designDetail?.detailPicture?.map((item, index) => {
                        return <div style={{ 'display': 'inline-block', verticalAlign: 'top', marginRight: index !== designDetail?.aPlus.aplusScene?.length ? 10 : 0 }} key={index}>
                            <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                {
                                    (item.url && item.url.length) ? item.url.map((subItem, subIndex) => {
                                        return <div key={subItem}>
                                            <div>{getImage(subItem, (item as any).thumbnail[subIndex])}</div>
                                        </div>
                                    }) : <div>{getImage('', '')}</div>
                                }
                            </Space>
                            <div>
                                <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                    <span><FormattedMessage id='pages.odika.ViewDesign.detailRequirementPoint' />{index + 1}：</span>
                                    <div style={{ width: ((item?.url?.length || 1) * WIDTH - 90), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{item.detailRequirementPoint}</div>
                                </Space>
                            </div>
                            {item.memo && <div>
                                <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                    <span><FormattedMessage id='pages.odika.ViewDesign.pictrueDesc' />：</span>
                                    <div style={{ width: ((item?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{item.memo}</div>
                                </Space>
                            </div>}
                        </div>
                    })}
                </div></>) : null}
        </div>
        {/* 放一个按钮固定在右下角 */}
        <CheckForm check={check} />
    </>)
}