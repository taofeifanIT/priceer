import { useState, useEffect } from 'react';
import { getQueryVariable } from '@/utils/utils'
import { getDesignDetail, checkDesign } from '@/services/odika/requirementList';
import type { saveDesignParams } from '@/services/odika/requirementList';
import { message, Space, Typography, Image, Empty, Tag, Button, Affix, Drawer, Form, Input, Radio } from 'antd';
const { Text, Title } = Typography;

const COLORS = ['#f50', '#2db7f5', '#87d068', '#108ee9', '#f50', '#2db7f5', '#87d068', '#108ee9', '#f50', '#2db7f5', '#87d068', '#108ee9']


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
            checkDesign({ id: parseInt(getQueryVariable('id')), status: values.status, reason: values.reason }).then(res => {
                if (res.code) {
                    message.success('审核成功')
                    // window.location.href = '/odika/requirementManagement'
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
                        label="结果"
                        rules={[{ required: true, message: 'Please select a result' }]}
                    >
                        <Radio.Group>
                            <Radio value="1">通过</Radio>
                            <Radio value="0">不通过</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="reason"
                        label="备注"
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
            const imgUrl = 'http://api-rp.itmars.net/storage/' + url
            const thumb = 'http://api-rp.itmars.net/storage/' + thumbUrl
            return <Image
                style={{ border: '4px solid #eee' }}
                src={thumb}
                preview={{ src: imgUrl }}
                height={HEIGHT}
                width={WIDTH} />
        } else {
            return <Empty description='没有图片' style={{ 'width': '250px', height: 200, paddingTop: 40 }} image='http://api-rp.itmars.net/example/default.png' />
        }
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
            <Title level={3}>主图</Title>
            <div>
                <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                    <Title level={5}>白底图 + 道具</Title>
                    <div>
                        {designDetail?.mainPicture.whiteBackgroundAndProps.url ? designDetail.mainPicture.whiteBackgroundAndProps.url.map((item, index) => {
                            return <div key={index} style={{ display: 'inline-block', marginRight: index !== designDetail?.mainPicture?.whiteBackgroundAndProps?.url?.length ? 10 : 0 }}>
                                {getImage(item, (designDetail?.mainPicture?.whiteBackgroundAndProps as any).thumbnail[index])}
                            </div>
                        }) : <Empty description='没有图片' style={{ 'width': '250px', height: 200, paddingTop: 40 }} image='http://api-rp.itmars.net/example/default.png' />}
                    </div>
                    <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                        <span>描述：</span>
                        <div style={{ width: ((designDetail?.mainPicture?.whiteBackgroundAndProps?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word' }}>{designDetail?.mainPicture.whiteBackgroundAndProps.memo}</div>
                    </Space>
                </div>
                <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
                    <Title level={5}>尺寸 + 材质</Title>
                    <div>
                        {designDetail?.mainPicture.sizeAndNaterial.url ? designDetail.mainPicture.sizeAndNaterial.url.map((item, index) => {
                            return <div key={index} style={{ display: 'inline-block', marginRight: index !== designDetail?.mainPicture?.sizeAndNaterial?.url?.length ? 10 : 0 }}>
                                {getImage(item, (designDetail?.mainPicture?.sizeAndNaterial as any).thumbnail[index])}
                            </div>
                        }) : <Empty description='没有图片' style={{ 'width': '250px', height: 200, paddingTop: 40 }} image='http://api-rp.itmars.net/example/default.png' />}
                    </div>
                    <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                        <span>描述：</span>
                        <div style={{ width: ((designDetail?.mainPicture?.sizeAndNaterial?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word' }}>{designDetail?.mainPicture.sizeAndNaterial.memo}</div>
                    </Space>
                </div>
            </div>
            <Title level={3} style={{ 'marginTop': '20px' }}>副图</Title>
            <div style={{ 'marginBottom': '20px' }}>
                <div>
                    <div>
                        {designDetail?.auxiliaryPicture.url ? designDetail.auxiliaryPicture.url.map((item, index) => {
                            return <div key={index} style={{ display: 'inline-block', marginRight: index !== designDetail?.auxiliaryPicture?.url?.length ? 10 : 0 }}>
                                {getImage(item, (designDetail?.auxiliaryPicture as any).thumbnail[index])}
                            </div>
                        }) : <Empty description='没有图片' style={{ 'width': '250px', height: 200, paddingTop: 40 }} image='http://api-rp.itmars.net/example/default.png' />}
                    </div>
                    <div>
                        <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                            <span>卖点：</span>
                            <div>
                                {designDetail?.auxiliaryPicture?.sellingPoint?.map((item, index) => {
                                    return <Tag color={COLORS[index]} key={index}>{item}</Tag>
                                })}
                            </div>
                        </Space>
                    </div>
                    <div>
                        <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                            <span>描述：</span>
                            <div style={{ width: ((designDetail?.auxiliaryPicture?.url?.length || 1) * WIDTH - 50), wordBreak: 'break-word' }}>{designDetail?.auxiliaryPicture.memo}</div>
                        </Space>
                    </div>
                </div>
            </div>
            <Title level={3} style={{ 'marginTop': '20px' }}>副图场景</Title>
            <div>
                {designDetail?.auxiliaryPictureScene?.map((item, index) => {
                    return <div key={index} style={{ display: 'inline-block', verticalAlign: 'top' }}>
                        <div>
                            {item.url ? item.url.map((subItem, subIndex) => {
                                return <div key={subItem} style={{ display: 'inline-block', marginRight: subIndex !== item.url.length ? 10 : 0 }}>
                                    {getImage(subItem, (item as any).thumbnail[subIndex])}
                                </div>
                            }) : <Empty description='没有图片' style={{ 'width': '250px', height: 200, paddingTop: 40 }} image='http://api-rp.itmars.net/example/default.png' />}
                        </div>
                        <div>
                            <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                <span>场景{index + 1}：</span>
                                <div style={{ width: 205, wordBreak: 'break-word' }}>{item.scene}</div>
                            </Space>
                        </div>
                        <div>
                            <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                <span>描述：</span>
                                <div style={{ width: ((item.url.length || 1) * WIDTH - 50), wordBreak: 'break-word' }}>{item.memo}</div>
                            </Space>
                        </div>
                    </div>
                })}
            </div>
            <Title level={3} style={{ 'marginTop': '20px' }}>{designDetail?.aPlus.type}{designDetail?.aPlus.type === 'A+' ? '(970x600)' : '(1464x600)'}</Title>
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
                                <span>场景{index + 1}：</span>
                                <div style={{ width: ((item.url.length || 1) * WIDTH - 50), wordBreak: 'break-word' }}>{item.scene}</div>
                            </Space>
                        </div>
                        <div>
                            <Space size={'small'} style={{ 'marginTop': '10px' }} align='start'>
                                <span>画面要求：</span>
                                <div style={{ width: ((item.url.length || 1) * WIDTH - 80), wordBreak: 'break-word' }}>{item.pictureRequirement}</div>
                            </Space>
                        </div>
                        <div>
                            <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                <span>描述：</span>
                                <div style={{ width: ((item.url.length || 1) * WIDTH - 50), wordBreak: 'break-word' }}>{item.memo}</div>
                            </Space>
                        </div>
                    </div>
                })}
            </div>
            <Title level={3} style={{ 'marginTop': '20px' }}>细节</Title>
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
                                <span>细节需求点：</span>
                                <div style={{ width: ((item.url.length || 1) * WIDTH - 90), wordBreak: 'break-word' }}>{item.detailRequirementPoint}</div>
                            </Space>
                        </div>
                        <div>
                            <Space size={'small'} style={{ 'marginTop': '10px', marginBottom: '15px' }} align='start'>
                                <span>描述：</span>
                                <div style={{ width: ((item.url.length || 1) * WIDTH - 50), wordBreak: 'break-word' }}>{item.memo}</div>
                            </Space>
                        </div>
                    </div>
                })}
            </div>
        </div>
        {/* 放一个按钮固定在右下角 */}
        <CheckForm check={check} />
    </>)
}