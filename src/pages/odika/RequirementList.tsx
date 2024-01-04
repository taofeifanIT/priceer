import {
    Button,
    Input,
    Modal,
    Space,
    Select,
    Divider,
    Alert,
    Form,
    Upload,
    message,
    Typography,
    Steps,
    Spin,
    Tooltip,
    Popconfirm,
    Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { getSkuList, saveDesign, editDesign, getDesignList, getDesignDetail, read } from '@/services/odika/requirementList';
import type { RequirementListItem, submitDesignParams, saveDesignParams } from '@/services/odika/requirementList';
import { getToken } from '@/utils/token'
import { getImageUrl } from '@/utils/utils'
import { FormattedMessage, getLocale } from 'umi';
import { FilePdfOutlined, EyeFilled } from '@ant-design/icons';
import getInfoComponent from './components/getInfoComponent'
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import axios from 'axios';
import { useModel } from 'umi';
const { Text } = Typography;
// 1:可编辑   2：待排序   3：待审核  4:审核失败   5：待排期   6：制作中 7：完成

const localFront = (key: string) => {
    return <FormattedMessage id={`pages.odika.RequirementList.${key}`} />
}

const localFrontFromViewDesign = (key: string) => {
    return <FormattedMessage id={`pages.odika.ViewDesign.${key}`} />
}

const ProcessItem = [
    { value: 1, label: localFront('InEditing') },
    { value: 2, label: localFront('RequirementsAudit') },
    { value: 3, label: localFront('PendingSorting') },
    { value: 4, label: localFront('PendingReview') },
    { value: 5, label: localFront('Review') },
    { value: 6, label: localFront('PendingScheduling') },
    { value: 7, label: localFront('InProduction') },
    { value: 8, label: localFront('Completed') },
    { value: 9, label: localFront('failTheAudit') },
    { value: 10, label: localFront('qualityAudit') },
    { value: 11, label: localFront('Completed') },
]

const SceneList = [
    '客厅',
    '卧室',
    '厨房',
    '洗手间',
    '阳台',
    '书房',
    '门厅',
    '过道',
    '户外',
    '工具间'
]

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 20 },
        sm: { span: 16 },
    },
};

const ActionModel = forwardRef((props: { refresh: () => void }, ref) => {
    const { refresh } = props;
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [skuList, setSkuList] = useState([]);
    const [skuListLoading, setSkuListLoading] = useState(false);
    const [currentSku, setCurrentSku] = useState('');
    const [editRecord, setEditRecord] = useState<RequirementListItem>({} as RequirementListItem);
    const [detailLoading, setDetailLoading] = useState(false);
    const checkStatus = false;
    const handleCancel = () => {
        setVisible(false);
        if (editRecord.id) {
            setEditRecord({} as RequirementListItem)
        }
    };

    const onChange = (value: string) => {
        setCurrentSku(value)
    };


    const getSkulist = () => {
        if (skuList.length) return;
        setSkuListLoading(true);
        getSkuList().then(res => {
            setSkuListLoading(false);
            setSkuList(res.data.map((item: { sku: any; }) => ({ label: item.sku, value: item.sku })))
        })
    }

    const setDetail = (data: submitDesignParams) => {
        const formParams = {
            competitor: (data?.competitor.length ? data.competitor : []).map(item => {
                return { asin: item }
            }) || undefined,
            mainPictures: data.mainPictures?.map((item, index) => ({
                memo: item.memo,
                file: item.url ? item.url.map((url: string, i: number) => ({
                    uid: 'mainPictures' + index + i,
                    name: 'image.png',
                    status: 'done',
                    response: { data: { file_name: url } },
                    thumbUrl: getImageUrl(item.thumbnail[i]),
                    url: getImageUrl(url)
                })) : [],
            })),
            whiteBackgroundMemo: data.mainPicture?.whiteBackgroundAndProps.memo,
            whiteBackgroundFile: data.mainPicture?.whiteBackgroundAndProps?.url ? data.mainPicture?.whiteBackgroundAndProps?.url.map((url: string, index: number) => ({
                uid: '1' + index,
                name: 'image.png',
                status: 'done',
                response: { data: { file_name: url } },
                thumbUrl: getImageUrl(data.mainPicture?.whiteBackgroundAndProps?.thumbnail[index]),
                url: getImageUrl(url)
            })) : [],
            sizeAndNaterialMemo: data.mainPicture?.sizeAndNaterial.memo,
            sizeAndNaterialFile: data.mainPicture?.sizeAndNaterial?.url ? data.mainPicture?.sizeAndNaterial?.url.map((url: string, index: number) => ({
                uid: '2' + index,
                name: 'image.png',
                status: 'done',
                response: { data: { file_name: url } },
                thumbUrl: getImageUrl(data.mainPicture?.sizeAndNaterial?.thumbnail[index]),
                url: getImageUrl(url)
            })) : [],
            auxiliaryPictureSellingPoint: data.auxiliaryPicture?.sellingPoint,
            auxiliaryPictureMemo: data.auxiliaryPicture?.memo,
            auxiliaryPictureFile: data.auxiliaryPicture?.url ? data.auxiliaryPicture?.url.map((url: string, index: number) => ({
                uid: '3' + index,
                name: 'image.png',
                status: 'done',
                response: { data: { file_name: url } },
                thumbUrl: getImageUrl(data.auxiliaryPicture?.thumbnail[index]),
                url: getImageUrl(url)
            })) : [],
            auxiliaryPictures: data.auxiliaryPictures?.map((item, index) => ({
                sellingPoint: item.sellingPoint.map((point: string) => ({ point })),
                memo: item.memo,
                file: item.url ? item.url.map((url: string, i: number) => ({
                    uid: 'auxiliaryPictures' + index + i,
                    name: 'image.png',
                    status: 'done',
                    response: { data: { file_name: url } },
                    thumbUrl: getImageUrl(item.thumbnail[i]),
                    url: getImageUrl(url)
                })) : [],
            })),
            auxiliaryPictureScene: data?.auxiliaryPictureScene?.map((item, index) => ({
                scene: item.scene,
                memo: item.memo,
                file: item.url ? item.url.map((url: string, i: number) => ({
                    uid: 'auxiliaryPictureScene' + index + i,
                    name: 'image.png',
                    status: 'done',
                    response: { data: { file_name: url } },
                    thumbUrl: getImageUrl(item.thumbnail[i]),
                    url: getImageUrl(url)
                })) : [],
            })),
            aPlusType: data.aPlus?.type,
            aplusScene: data.aPlus?.aplusScene?.map((item, index) => ({
                scene: item.scene,
                memo: item.memo,
                pictureRequirement: item.pictureRequirement,
                file: (item.url && item.url.length) ? item.url.map((url: string, i: number) => ({
                    uid: 'aplusScene' + index + i,
                    name: 'image.png',
                    status: 'done',
                    response: { data: { file_name: url } },
                    thumbUrl: getImageUrl(item.thumbnail[i]),
                    url: getImageUrl(url)
                })) : []
            })),
            detailPicture: data.detailPicture?.map((item, index) => ({
                detailRequirementPoint: item.detailRequirementPoint,
                memo: item.memo,
                file: item.url ? item.url.map((url: string, i: number) => ({
                    uid: 'detailPicture' + index + i,
                    name: 'image.png',
                    status: 'done',
                    response: { data: { file_name: url } },
                    thumbUrl: getImageUrl(item.thumbnail[i]),
                    url: getImageUrl(url)
                })) : []
            }))
        }
        form.setFieldsValue(formParams)
    }

    const getDetail = (id: number) => {
        setDetailLoading(true);
        getDesignDetail({ id }).then(res => {
            if (!res.code) {
                // console.log(res)
                throw res.msg
            } else {
                setDetail(res.data)
            }
        }).catch(err => {
            console.log(err)
            message.error(JSON.stringify(err))
        }).finally(() => {
            setDetailLoading(false);
        })
    }

    const onFinish = (type: string) => {
        if (!currentSku) {
            message.error('Please select SKU!')
            return
        }
        form.validateFields().then(values => {
            const params: saveDesignParams = {
                sku: currentSku,
                competitor: values.competitor?.map((item: { asin: any; }) => item.asin) || '',
                mainPictures: values.mainPictures?.map((item: { memo: any; file: any; }) => ({
                    memo: item.memo,
                    url: (item.file && item.file.length) ? item?.file.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : undefined
                })),
                mainPicture: {
                    whiteBackgroundAndProps: {
                        memo: values.whiteBackgroundMemo,
                        url: (values.whiteBackgroundFile && values.whiteBackgroundFile.length) ? values?.whiteBackgroundFile.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : ''
                    },
                    sizeAndNaterial: {
                        memo: values.sizeAndNaterialMemo,
                        url: (values.sizeAndNaterialFile && values.sizeAndNaterialFile.length) ? values?.sizeAndNaterialFile.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : ''
                    }
                },
                auxiliaryPicture: {
                    sellingPoint: values.auxiliaryPictureSellingPoint,
                    memo: values.auxiliaryPictureMemo,
                    url: (values.auxiliaryPictureFile && values.auxiliaryPictureFile.length) ? values?.auxiliaryPictureFile.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : '',
                },
                auxiliaryPictures: values.auxiliaryPictures?.map((item: { sellingPoint: { point: string }[]; memo: any; file: any; }) => ({
                    sellingPoint: item.sellingPoint?.map((point) => {
                        return point.point
                    }),
                    memo: item.memo,
                    url: (item.file && item.file.length) ? item?.file.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : undefined
                })),
                auxiliaryPictureScene: values.auxiliaryPictureScene?.map((item: { scene: any; memo: any; file: any; }) => ({
                    scene: item.scene,
                    memo: item.memo,
                    url: (item.file && item.file.length) ? item?.file.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : undefined
                })),
                aPlus: {
                    type: values.aPlusType,
                    aplusScene: values.aplusScene?.map((item: { scene: any; memo: any; pictureRequirement: any; file: any; }) => ({
                        scene: item.scene,
                        memo: item.memo,
                        pictureRequirement: item.pictureRequirement,
                        url: (item.file && item.file.length) ? item?.file.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : undefined
                    }))
                },
                detailPicture: values.detailPicture?.map((item: { detailRequirementPoint: any; memo: any; file: any; }) => ({
                    detailRequirementPoint: item.detailRequirementPoint,
                    memo: item.memo,
                    url: (item.file && item.file.length) ? item?.file.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : undefined
                }))

            }
            if (editRecord.id) {
                params.id = editRecord.id
            }
            const api = type === 'save' ? editDesign : saveDesign
            const loading = type === 'save' ? setSaveLoading : setConfirmLoading
            loading(true);
            api(params).then(res => {
                if (res.code) {
                    message.success('save successfully！')
                } else {
                    throw res.msg
                }
            }).catch(err => {
                message.error(err)
            }).finally(() => {
                loading(false);
                handleCancel()
                setCurrentSku('')
                form.resetFields();
                refresh()
            })
        })
    };

    const modelTitle = <>
        <Space>
            <span>SKU:</span>
            <Select
                showSearch
                placeholder="Select a person"
                optionFilterProp="children"
                loading={skuListLoading}
                onChange={onChange}
                disabled={!!editRecord.sku}
                style={{ width: 200 }}
                value={currentSku}
                filterOption={(input, option: any) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={skuList}
            />
        </Space>
    </>

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const uploadComponent = (num = 1) => {
        return <Upload
            accept=".jpg, .jpeg, .png"
            action={`${API_URL}/design/uploadImage`}
            headers={{ authorization: 'authorization-text', token: getToken() }}
            listType="picture-card"
            maxCount={num}
            multiple={num > 1 ? true : false}
        >
            <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
            </div>
        </Upload>
    }

    const getTitle = (title: any, size: any, more?: any) => {
        return <div>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>{title}</Typography.Title>
            <div style={{ color: 'gray' }}>{size}</div>
            {more}
        </div>
    }
    useImperativeHandle(ref, () => ({
        showModal(record?: RequirementListItem) {
            setVisible(true);
            getSkulist()
            if (record) {
                setEditRecord({} as RequirementListItem)
                setEditRecord(record)
                setCurrentSku(record.sku)
                getDetail(record.id)
            } else {
                setCurrentSku('')
                form.resetFields();
            }
        }
    }));

    return (<Modal
        width={800}
        title={modelTitle}
        open={visible}
        maskClosable={false}
        onCancel={handleCancel}
        footer={[
            <Button key="back" onClick={handleCancel}>Cancel</Button>,
            <Button key="save" type="primary" loading={saveLoading} onClick={() => onFinish('save')}>Save</Button>,
            <Popconfirm
                key={'submit'}
                placement="top"
                title={'Confirm submission?'}
                description={'It cannot be modified after submission'}
                onConfirm={() => onFinish('submit')}
                okText="Yes"
                cancelText="No"
            >
                <Button key="submit" type="primary" loading={confirmLoading}>Submit</Button>
            </Popconfirm>,
        ]}
    >
        <Spin spinning={detailLoading}>
            <Form
                form={form}
                name="dynamic_form_nest_item"
                autoComplete="off"
                initialValues={{
                    aPlusType: 'A++',
                }}
                {...formItemLayout}
            >
                <Divider plain>{localFront('CompetitiveAsin')}</Divider>
                <Form.List name="competitor">
                    {(fields, { add, remove }) => (
                        <div style={{ paddingLeft: '100px' }}>
                            {fields.map((field) => (
                                <Space key={field.key} align='baseline' style={{ position: 'relative' }}>
                                    <Form.Item
                                        {...field}
                                        label={'Asin' + (field.name + 1)}
                                        name={[field.name, 'asin']}
                                    // rules={[{ required: true, message: 'Missing asin' }]}
                                    >
                                        <Input style={{ width: 400 }} />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(field.name)} style={{ position: 'absolute', right: -50, top: 7 }} />
                                </Space>
                            ))}

                            <Form.Item>
                                <Button style={{ marginLeft: 73, width: 400 }} type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add Asin
                                </Button>
                            </Form.Item>
                        </div>
                    )}
                </Form.List>
                <Divider plain>
                    {getTitle(localFrontFromViewDesign('mainPicture'), '2000:2000')}
                </Divider>
                <Alert message={localFrontFromViewDesign('WhiteBackgroundPictureAndProps')} type="info" style={{ marginBottom: '20px' }} />
                <Form.List
                    name="mainPictures">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ marginBottom: 8, position: 'relative' }}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'memo']}
                                        label={localFrontFromViewDesign('pictrueDesc')}
                                        rules={[{ required: checkStatus, message: 'Missing memo' }]}
                                    >
                                        <Input.TextArea placeholder="memo" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ position: 'absolute', right: 90, top: 7 }} />
                                    <Form.Item
                                        name={[name, 'file']}
                                        label={localFrontFromViewDesign('picture')}
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                    >
                                        {uploadComponent(50)}
                                    </Form.Item>
                                </div>
                            ))}
                            <Form.Item label={" "} colon={false}>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    {localFront('addNewMainPicture')}
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Divider plain>
                    {getTitle(localFrontFromViewDesign('subscene'), '2000:2000')}
                </Divider>
                <Alert message={localFrontFromViewDesign('sizeAndMaterial')} type="info" style={{ marginBottom: '20px' }} />
                <Form.Item
                    name={'sizeAndNaterialMemo'}
                    label={localFrontFromViewDesign('pictrueDesc')}
                    rules={[{ required: checkStatus, message: 'Missing Memo' }]}
                >
                    <Input.TextArea placeholder="请输入需求/Please enter general requirement" />
                </Form.Item>
                <Form.Item
                    name={'sizeAndNaterialFile'}
                    valuePropName="fileList"
                    label={localFrontFromViewDesign('picture')}
                    getValueFromEvent={normFile}
                >
                    {uploadComponent(20)}
                </Form.Item>
                <Divider plain>{getTitle(localFrontFromViewDesign('secondPicture'), localFront('pictureTextDetailsIcon'), <span style={{ color: 'gray' }}>2000:2000</span>)}</Divider>
                <Form.List
                    name="auxiliaryPictures">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ marginBottom: 8, position: 'relative' }}>
                                    {name !== 0 && <Divider plain style={{ marginBottom: '40px' }} />}
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ position: 'absolute', right: 10, top: name !== 0 ? 10 : -30, fontSize: '20px' }} />
                                    <Form.List name={[name, 'sellingPoint']}>
                                        {(fields, { add, remove }) => (
                                            <div style={{ paddingLeft: '71px' }}>
                                                {fields.map((field) => (
                                                    <Space key={field.key} align='baseline' >
                                                        <div style={{ display: 'inline-block', position: 'relative', width: '190px', }}>
                                                            <Form.Item
                                                                {...field}
                                                                labelCol={{ span: 8 }}
                                                                label={"Point " + (field.name + 1)}
                                                                name={[field.name, 'point']}
                                                                style={{ display: 'inline-block' }}
                                                            >
                                                                <Input style={{ width: 100 }} />
                                                            </Form.Item>
                                                            <MinusCircleOutlined onClick={() => remove(field.name)} style={{ position: 'absolute', top: 10, }} />
                                                        </div>
                                                    </Space>
                                                ))}

                                                <Form.Item>
                                                    <Button style={{ marginLeft: 106, width: 380 }} type="dashed" onClick={() => add()} size='small' block icon={<PlusOutlined />}>
                                                        Add Point
                                                    </Button>
                                                </Form.Item>
                                            </div>
                                        )}
                                    </Form.List>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'memo']}
                                        label={localFrontFromViewDesign('pictrueDesc')}
                                        rules={[{ required: checkStatus, message: 'Missing memo' }]}
                                    >
                                        <Input.TextArea placeholder="memo" />
                                    </Form.Item>
                                    <Form.Item
                                        name={[name, 'file']}
                                        label={localFrontFromViewDesign('picture')}
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                    >
                                        {uploadComponent(50)}
                                    </Form.Item>
                                </div>
                            ))}
                            <Form.Item label={" "} colon={false}>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    {localFrontFromViewDesign('addNewSellingPoint')}
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                {/* 卖点图 */}
                <Divider plain>{getTitle(localFront('sceneGraph'), "")}</Divider>
                <Form.List
                    name="auxiliaryPictureScene">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ marginBottom: 8, position: 'relative' }}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'scene']}
                                        label={<>{localFrontFromViewDesign('scene')}{name + 1}</>}
                                        rules={[{ required: checkStatus, message: 'Missing scene' }]}
                                    >
                                        <Select>
                                            {SceneList.map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ position: 'absolute', right: 90, top: 7 }} />
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'memo']}
                                        label={localFrontFromViewDesign('pictrueDesc')}
                                        rules={[{ required: checkStatus, message: 'Missing memo' }]}
                                    >
                                        <Input.TextArea placeholder="memo" />
                                    </Form.Item>
                                    <Form.Item
                                        name={[name, 'file']}
                                        label={localFrontFromViewDesign('picture')}
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                    >
                                        {uploadComponent(50)}
                                    </Form.Item>
                                </div>
                            ))}
                            <Form.Item label={" "} colon={false}>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    {localFront('addScene')}
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Form.Item
                    label="" colon={false} noStyle>
                    <Divider plain>
                        <Form.Item
                            name={'aPlusType'}
                            label=""
                            rules={[{ required: checkStatus, message: 'Missing aPlusType' }]}>
                            <Select style={{ 'width': '150px', 'position': 'relative', 'top': '10px' }}>
                                <Select.Option value={'A++'}>A++ {localFront('template')}</Select.Option>
                                <Select.Option value={'A+'}>A+ {localFront('template')}</Select.Option>
                            </Select>
                        </Form.Item>
                    </Divider>
                </Form.Item>
                <Form.List
                    name="aplusScene">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ marginBottom: 8, position: 'relative' }}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'scene']}
                                        label={<>{localFrontFromViewDesign('scene')}{name + 1}</>}
                                        rules={[{ required: checkStatus, message: 'Missing scene' }]}
                                    >
                                        <Select>
                                            {SceneList.map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ position: 'absolute', right: 90, top: 7 }} />
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'memo']}
                                        label={localFrontFromViewDesign('pictrueDesc')}
                                        rules={[{ required: checkStatus, message: 'Missing memo' }]}
                                    >
                                        <Input.TextArea placeholder="请输入文字需求/Please enter text requirement" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'pictureRequirement']}
                                        label={localFrontFromViewDesign('pictureRequirement')}
                                        rules={[{ required: checkStatus, message: 'Missing pictureRequirement' }]}
                                    >
                                        <Input.TextArea placeholder="请输入画面要求/Please enter picture requirement" />
                                    </Form.Item>
                                    <Form.Item
                                        name={[name, 'file']}
                                        label={localFrontFromViewDesign('picture')}
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                    >
                                        {uploadComponent(20)}
                                    </Form.Item>
                                </div>
                            ))}
                            <Form.Item label={" "} colon={false}>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    style={{ height: 'auto' }}
                                    icon={<PlusOutlined />}>
                                    {/* {localFront('sceneRotograph')} (2928:1200) */}
                                    {localFront('sceneRotograph')}  {localFront('sceneMemoLine1')}
                                    <br />
                                    {localFront('sceneMemoLine2')}
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                {/* <Divider plain>{localFrontFromViewDesign('detail')}</Divider> */}
                <Form.List
                    name="detailPicture">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} style={{ marginBottom: 8, position: 'relative' }}>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'detailRequirementPoint']}
                                        label={<>{localFrontFromViewDesign('detailRequirementPoint')}{name + 1}</>}
                                        rules={[{ required: checkStatus, message: 'Missing detailRequirementPoint' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ position: 'absolute', right: 90, top: 7 }} />
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'memo']}
                                        label={localFrontFromViewDesign('pictureRequirement')}
                                        rules={[{ required: checkStatus, message: 'Missing memo' }]}
                                    >
                                        <Input.TextArea placeholder="请输入画面需求/Please enter screen requirement" />
                                    </Form.Item>
                                    <Form.Item
                                        name={[name, 'file']}
                                        label={localFrontFromViewDesign('picture')}
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                    >
                                        {uploadComponent(20)}
                                    </Form.Item>
                                </div>
                            ))}
                            <Form.Item label={" "} colon={false}>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    {localFront('detailMapPresentation')}  (1300:700)
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Spin>
    </Modal>)
})

export default () => {
    const actionRef = useRef();
    const actionTableRef = useRef<ActionType>();
    const statusWidth = getLocale() === 'en-US' ? 1050 : 950
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    const isOperationsAdministrator = currentUser?.authGroup.title === 'Operations administrator'
    const currrentUserName = currentUser?.username
    const isRequirementsManager = currentUser?.authGroup.title === 'Requirements manager'

    const getErrorMsg = (record: RequirementListItem, currentStatus: { value: number, label: string }) => {
        let errorMsg = ''
        let tempStatus = 0
        if (currentStatus.value === 4 && record.reason) {
            errorMsg = record.reason
            tempStatus = 1
        } else if (currentStatus.value === 2 && record.reason_require) {
            errorMsg = record.reason_require
            tempStatus = 1
        } else if (currentStatus.value === 10 && record.reason_canto) {
            errorMsg = record.reason_canto
            tempStatus = 1
        } else {
            errorMsg = currentStatus.label
        }
        const error = <Tooltip placement="top" title={<div style={{
            // 保留换行
            wordBreak: 'break-word', whiteSpace: 'pre-wrap'
        }}>
            {errorMsg}
        </div>} >
            <span style={{ color: 'red' }}>
                {/* {(record.status === currentStatus.value) ? }
                <FormattedMessage id='pages.odika.RequirementList.failTheAudit' /> {record.status}{currentStatus.value} */}
                {currentStatus.label}
            </span>
        </Tooltip>
        if (tempStatus) {
            return error
        }
        return currentStatus.label
    }
    const translateStep = (statusValue: number) => {
        if (statusValue === 8 || statusValue === 9) {
            return 2
        }
        if (statusValue === 2) {
            return 3
        }
        if (statusValue === 3) {
            return 4
        }
        return statusValue
    }

    const toRead = (id: number) => {
        read({ id }).then(res => {
            if (res.code === 1) {
                actionTableRef?.current?.reload()
            } else {
                message.error(res.msg)
            }
        })
    }

    const getStepComponent = (record: RequirementListItem) => {
        return (<div style={{ 'width': statusWidth }}>
            <Steps
                size="small"
                current={translateStep(record.status) - 1}
                items={ProcessItem.filter(item => ![0, 5, 8, 9].includes(item.value)).map((item) => ({ title: getErrorMsg(record, item) }))}
            />
        </div>)
    }

    const getOperationEdit = (record: RequirementListItem) => {
        const obj = { disabled: true, color: '' }
        if (record.status === 1 || record.status === 9) {
            obj.disabled = false
        }
        if (record.status === 4) {
            obj.color = '#f39f6c'
        } else if (record.status === 9) {
            obj.color = '#f39f6c'
        }
        return obj
    }

    const getCantoUrl = (sku: string) => {
        return `https://telstraight.canto.com/library?keyword=${sku}&viewIndex=0&gSortingForward=false&gOrderProp=uploadDate&display=fitView&from=fitView`
    }

    const columns: ProColumns<RequirementListItem>[] = [
        {
            title: localFront('info'),
            dataIndex: 'info',
            key: 'info',
            width: 385,
            search: false,
            render: (_, record) => getInfoComponent(record)
        },
        {
            title: localFront('CreateInfo'),
            dataIndex: 'creator',
            key: 'creator',
            width: 200,
            search: false,
            render: (_, record) => {
                return <div style={{ 'width': '200px' }}>
                    <div><Text type="secondary">{localFront('creator')}：</Text>{record.creator}</div>
                    <div><Text type="secondary">{localFront('creationTime')}：</Text>{record.createTime}</div>
                </div>
            }
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            hideInTable: true,
        },
        {
            title: <FormattedMessage id='page.layouts.userLayout.username.placeholder' />,
            dataIndex: 'username',
            key: 'username',
            hideInTable: true,
        },
        {
            title: localFront('status'),
            dataIndex: 'status',
            key: 'status',
            width: statusWidth + 50,
            valueType: 'select',
            valueEnum: {
                'option-1': { text: localFront('InEditing') },
                'option-8': { text: localFront('RequirementsAudit') },
                'option-9': { text: localFront('firstInstance') },
                'option-2': { text: localFront('PendingSorting') },
                'option-3': { text: localFront('PendingReview') },
                'option-4': { text: localFront('designInstance') },
                'option-5': { text: localFront('PendingScheduling') },
                'option-6': { text: localFront('InProduction') },
                'option-7': { text: localFront('qualityAudit') },
                'option-10': { text: localFront('Canto') },
                'option-11': { text: localFront('lastInstance') },
            },
            render: (_, record) => getStepComponent(record)
        },
        // is_read
        {
            title: localFront('isRead'),
            dataIndex: 'is_read',
            key: 'is_read',
            hideInTable: true,
            valueType: 'select',
            valueEnum: {
                '1': { text: localFront('unRead') },
                '2': { text: localFront('read') },
            },
        },
        {
            // 预计完成时间
            title: localFront('EstimatedCompletionTime'),
            dataIndex: 'expectTime',
            key: 'expectTime',
            search: false,
            width: 250
        },
        {
            title: localFront('operation'),
            dataIndex: 'action',
            key: 'action',
            width: 160,
            search: false,
            fixed: 'right',
            render: (_, record) => {
                const { disabled, color } = getOperationEdit(record)
                const { status } = record
                let actionBtn = <Button type="link" onClick={() => {
                    window.open(`/odika/ViewDesign?id=${record.id}`)
                }}><FormattedMessage id='pages.layouts.View' /></Button>
                if (isRequirementsManager && status === 7) {
                    actionBtn = <Button type="link" onClick={() => {
                        window.open(`/odika/ViewDesign?id=${record.id}&check=true&type=3`)
                    }}><FormattedMessage id='pages.odika.requirementSortList.check' /></Button>
                }
                return <Space>
                    {!disabled && <Button type="link" style={{ color: color }} onClick={() => {
                        actionRef?.current.showModal(record);
                    }}>{localFront('Edit')}</Button>}
                    {actionBtn}
                    {record.status === 10 ? <a target='blank' href={getCantoUrl(record.sku)}><img width={'25'} src='/canto.png' /></a> : ''}
                    {(record.status === 10 && currrentUserName === record.creator && record.is_read === 1) &&
                        <EyeFilled
                            style={{
                                fontSize: '20px',
                                verticalAlign: 'bottom',
                                marginLeft: '10px',
                                color: '#1890ff'
                            }}
                            onClick={() => {
                                toRead(record.id)
                            }}
                        />}
                </Space>
            }
        }
    ]

    const onMenuClick: MenuProps['onClick'] = (e) => {
        const type = e.key;
        // 上传页面模板
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf';
        const url = `${API_URL}/design/uploadTemplate`;
        fileInput.click();
        fileInput.onchange = (e: any) => {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);
            const config = {
                headers: { 'Content-Type': 'multipart/form-data', token: getToken() }
            };
            axios.post(url, formData, config).then(res => {
                if (res.data.code === 1 || res.data.code === 200) {
                    message.success('successfully upload')
                } else {
                    throw res.data.msg
                }
            }).catch(err => {
                message.error(err)
            })
        }
    };

    const listingPageTemplateItems = [
        {
            key: '2',
            label: localFront('replacePageTemplate'),
        },
    ];

    const listingContentTemplateItems = [
        {
            key: '1',
            label: localFront('replaceContentTemplate'),
        },
    ];

    const titleCpmponent = () => {
        return <Space>
            {isOperationsAdministrator ?
                <>
                    <Dropdown.Button
                        size='small'
                        icon={<FilePdfOutlined />}
                        menu={{ items: listingPageTemplateItems, onClick: onMenuClick }}
                        onClick={() => {
                            const fileUrl = `${API_URL}/storage/upload/design/Listing_page.pdf`;
                            window.open(fileUrl)
                        }}>
                        {localFront('viewPageTemplate')}
                    </Dropdown.Button>
                    <Dropdown.Button
                        size='small'
                        icon={<FilePdfOutlined />}
                        menu={{ items: listingContentTemplateItems, onClick: onMenuClick }}
                        onClick={() => {
                            const fileUrl = `${API_URL}/storage/upload/design/Listing_content.pdf`;
                            window.open(fileUrl)
                        }}>{localFront('viewContentTemplate')}
                    </Dropdown.Button>
                </> :
                <>
                    <Button
                        size='small'
                        onClick={() => {
                            const fileUrl = `${API_URL}/storage/upload/design/Listing_page.pdf`;
                            window.open(fileUrl)
                        }}>
                        {localFront('viewPageTemplate')}
                    </Button>
                    <Button
                        size='small'
                        onClick={() => {
                            const fileUrl = `${API_URL}/storage/upload/design/Listing_content.pdf`;
                            window.open(fileUrl)
                        }}>
                        {localFront('viewContentTemplate')}
                    </Button>
                </>}
            <Button size='small' type="primary" onClick={() => {
                actionRef?.current.showModal();
            }}>
                {localFront('CreateRequirement')}
            </Button>
        </Space>
    }

    return (<div >
        <ProTable<RequirementListItem>
            columns={columns}
            actionRef={actionTableRef}
            cardBordered
            request={async (params) => {
                // 表单搜索项会从 params 传入，传递给后端接口。
                const tempParams: any = {
                    ...params,
                    // status: params.status ? translateStatus(params.status) : undefined,
                    status: params.status ? params.status.split('-')[1] : undefined,
                    len: params.pageSize,
                    page: params.current
                };
                const res = await getDesignList(tempParams);
                return {
                    data: res.data.data,
                    // success 请返回 true，
                    // 不然 table 会停止解析数据，即使有数据
                    success: res.code === 1,
                    // 不传会使用 data 的长度，如果是分页一定要传
                    total: res.data.total,
                };
            }}
            scroll={{ x: columns.reduce((a, b) => a + Number(b.width), 0) }}
            rowKey="id"
            search={{
                labelWidth: 'auto',
            }}
            size='small'
            options={{
                density: false,
                fullScreen: false,
                setting: false,
            }}
            pagination={{
                pageSize: 10,
            }}
            dateFormatter="string"
            toolBarRender={() => [
                titleCpmponent()
            ]}
        />
        <ActionModel refresh={() => {
            actionTableRef.current?.reload()
        }} ref={actionRef} />
    </div>)
}