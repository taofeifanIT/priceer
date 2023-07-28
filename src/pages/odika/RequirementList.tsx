import { Button, Card, Table, Radio, Input, Modal, Space, Select, Divider, Alert, Form, Upload, message, Typography, Steps, Spin, Tooltip, Popconfirm } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { getSkuList, saveDesign, editDesign, getDesignList, getDesignDetail } from '@/services/odika/requirementList';
import type { RequirementListItem, submitDesignParams, saveDesignParams } from '@/services/odika/requirementList';
import { getToken } from '@/utils/token'
import { getImageUrl } from '@/utils/utils'
import { FormattedMessage, getLocale } from 'umi';
import getInfoComponent from './components/getInfoComponent'
const { Search } = Input;
const { Text } = Typography;
// 1:可编辑   2：待排序   3：待审核  4:审核失败   5：待排期   6：制作中 7：完成

const localFront = (key: string) => {
    return <FormattedMessage id={`pages.odika.RequirementList.${key}`} />
}

const localFrontFromViewDesign = (key: string) => {
    return <FormattedMessage id={`pages.odika.ViewDesign.${key}`} />
}

const ProcessItem = [
    { value: 0, label: localFront('All') },
    { value: 1, label: localFront('InEditing') },
    { value: 2, label: localFront('PendingSorting') },
    { value: 3, label: localFront('PendingReview') },
    { value: 4, label: localFront('Review') },
    { value: 5, label: localFront('PendingScheduling') },
    { value: 6, label: localFront('InProduction') },
    { value: 7, label: localFront('Completed') },
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
    const aPlusType = Form.useWatch('aPlusType', form);
    const [editRecord, setEditRecord] = useState<RequirementListItem>({} as RequirementListItem);
    const [detailLoading, setDetailLoading] = useState(false);
    const checkStatus = false;
    const handleCancel = () => {
        setVisible(false);
        setEditRecord({} as RequirementListItem)
        setCurrentSku('')
        form.resetFields();
    };

    const onChange = (value: string) => {
        setCurrentSku(value)
    };

    const onSearch = (value: string) => {
        console.log('search:', value);
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
        console.log(data.mainPicture.whiteBackgroundAndProps)
        const formParams = {
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
                console.log(res)
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
            message.error('请选择SKU!')
            return
        }
        form.validateFields().then(values => {
            console.log(values)
            const params: saveDesignParams = {
                sku: currentSku,
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
                auxiliaryPictureScene: values.auxiliaryPictureScene?.map((item: { scene: any; memo: any; file: any; }) => ({
                    scene: item.scene,
                    memo: item.memo,
                    url: (item.file && item.file.length) ? item?.file.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : ''
                })),
                aPlus: {
                    type: values.aPlusType,
                    aplusScene: values.aplusScene?.map((item: { scene: any; memo: any; pictureRequirement: any; file: any; }) => ({
                        scene: item.scene,
                        memo: item.memo,
                        pictureRequirement: item.pictureRequirement,
                        url: (item.file && item.file.length) ? item?.file.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : ''
                    }))
                },
                detailPicture: values.detailPicture?.map((item: { detailRequirementPoint: any; memo: any; file: any; }) => ({
                    detailRequirementPoint: item.detailRequirementPoint,
                    memo: item.memo,
                    url: (item.file && item.file.length) ? item?.file.map((file: { response: { data: { file_name: any; }; }; }) => file.response?.data?.file_name) : ''
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
                    message.success('保存成功')
                } else {
                    throw res.msg
                }
            }).catch(err => {
                message.error(err)
            }).finally(() => {
                loading(false);
                handleCancel()
                refresh()
            })
        })
    };

    // const pasteUpload = (event) => {
    //     event.stopPropagation()
    //     console.log(event)
    //     const data = event.clipboardData || window.clipboardData
    //     let tempFile = null // 存储文件数据
    //     if (data.items && data.items.length) {
    //         // 检索剪切板items
    //         for (const value of data.items) {
    //             if (value.type.indexOf('image') !== -1) {
    //                 tempFile = value.getAsFile()
    //                 break
    //             }
    //         }
    //     }
    //     console.log('tempFile', tempFile)
    //     // handleUpload(tempFile)
    // }

    const modelTitle = <>
        <Space>
            <span>SKU:</span>
            <Select
                showSearch
                placeholder="Select a person"
                optionFilterProp="children"
                loading={skuListLoading}
                onChange={onChange}
                onSearch={onSearch}
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
            action="http://api-rp.itmars.net/design/uploadImage"
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

    useImperativeHandle(ref, () => ({
        showModal(record?: RequirementListItem) {
            setVisible(true);
            getSkulist()
            if (record) {
                setEditRecord(record)
                setCurrentSku(record.sku)
                getDetail(record.id)
            }
        }
    }));

    return (<Modal
        width={800}
        title={modelTitle}
        open={visible}
        onCancel={handleCancel}
        footer={[
            <Button key="back" onClick={handleCancel}>Cancel</Button>,
            <Button key="save" type="primary" loading={saveLoading} onClick={() => onFinish('save')}>Save</Button>,
            <Popconfirm
                key={'submit'}
                placement="top"
                title={'确认提交？'}
                description={'提交后不可修改'}
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
                    // auxiliaryPictureScene: [{ scene: '', memo: '' }],
                    aPlusType: 'A+',
                    // aplusScene: [{ scene: '', memo: '', pictureRequirement: '' }],
                    // detailPicture: [{ detailRequirementPoint: '', memo: '' }],
                }}
                {...formItemLayout}
            >
                <Divider plain>{localFrontFromViewDesign('mainPicture')}</Divider>
                <Alert message={localFrontFromViewDesign('WhiteBackgroundPictureAndProps')} type="info" style={{ marginBottom: '20px' }} />
                <Form.Item
                    name={'whiteBackgroundMemo'}
                    label={localFrontFromViewDesign('pictrueDesc')}
                    rules={[{ required: checkStatus, message: 'Missing Memo' }]}
                >
                    <Input.TextArea placeholder="请输入道具需求/Please enter props requirement" />
                </Form.Item>
                <Form.Item
                    name={'whiteBackgroundFile'}
                    valuePropName="fileList"
                    label={localFrontFromViewDesign('picture')}
                    getValueFromEvent={normFile}
                >
                    {uploadComponent(20)}
                </Form.Item>
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
                <Divider plain>{localFrontFromViewDesign('secondPicture')}</Divider>
                <Form.Item
                    name={'auxiliaryPictureSellingPoint'}
                    label={localFrontFromViewDesign('SellingPoint')}
                    rules={[{ required: checkStatus, message: 'Missing Selling Point' }]}
                >
                    <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="Tags Mode"
                    />
                </Form.Item>
                <Form.Item
                    name={'auxiliaryPictureMemo'}
                    label={localFrontFromViewDesign('pictrueDesc')}
                    rules={[{ required: checkStatus, message: 'Missing Memo' }]}
                >
                    <Input.TextArea placeholder="请输入需求/Please enter general requirement" />
                </Form.Item>
                <Form.Item
                    name={'auxiliaryPictureFile'}
                    label={localFrontFromViewDesign('picture')}
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                >
                    {uploadComponent(20)}
                </Form.Item>
                <Divider plain>{localFrontFromViewDesign('subscene')}</Divider>
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
                                <Select.Option value={'A+'}>A+(970x600)</Select.Option>
                                <Select.Option value={'A++'}>A++(1464x600)</Select.Option>
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
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    {localFront('addMore')}{aPlusType}{localFrontFromViewDesign('scene')}
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
                <Divider plain>{localFrontFromViewDesign('detail')}</Divider>
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
                                    {localFront('addMore')}
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
    const [status, setStatus] = useState<number>(0);
    const actionRef: any = useRef();
    const [data, setData] = useState<RequirementListItem[]>([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            showSizeChanger: true,
            showQuickJumper: true,
            current: 1,
            total: 0,
            pageSize: 10,
        },
    });
    const statusWidth = getLocale() === 'en-US' ? 900 : 660

    const initData = () => {
        setLoading(true);
        getDesignList({
            status: status || undefined, keyword: keyword || undefined, ...{
                len: tableParams.pagination?.pageSize,
                page: tableParams.pagination?.current
            }
        }).then(res => {
            if (res.code) {
                setData(res.data.data)
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: res.data.total,
                    },
                });
            } else {
                throw res.msg
            }
        }).finally(() => {
            setLoading(false);
        }).catch(err => {
            message.error(err)
        })
    }
    const getParams = (changeParams: any) => {
        const params = {
            status: status || undefined, keyword: keyword || undefined, ...{
                len: tableParams.pagination?.pageSize,
                page: tableParams.pagination?.current
            },
            ...changeParams
        }
        return params
    }
    const newInitData = (params: any) => {
        setLoading(true);
        getDesignList(params).then(res => {
            if (res.code) {
                setData(res.data.data)
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: res.data.total,
                    },
                });
            } else {
                throw res.msg
            }
        }).finally(() => {
            setLoading(false);
        }).catch(err => {
            message.error(err)
        })
    }
    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue>,
        sorter: SorterResult<any>,
    ) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };

    const onSearch = (value: string) => {
        setKeyword(value)
        setTableParams({
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                current: 1
            }
        })
    };
    const getErrorMsg = (record: RequirementListItem, currentStatus: { value: number, label: string }) => {
        if (currentStatus.value === 4 && record.reason && record.status === 4) {
            return <Tooltip placement="top" title={record.reason}><span style={{ color: 'red' }}>审核</span></Tooltip>
        } else {
            return currentStatus.label
        }

    }
    const getStepComponent = (record: RequirementListItem) => {
        return (<div style={{ 'width': statusWidth }}>
            <Steps
                size="small"
                current={record.status - 1}
                items={ProcessItem.filter(item => item.value !== 0).map((item) => ({ title: getErrorMsg(record, item) }))}
            />
        </div>)
    }

    const getOperationEdit = (record: RequirementListItem) => {
        const obj = { disabled: true, color: '' }
        if (record.status === 1 || record.status === 4) {
            obj.disabled = false
        }
        if (record.status === 4) {
            obj.color = '#f39f6c'
        }
        return obj
    }

    const getCantoUrl = (sku: string) => {
        return `https://telstraight.canto.com/library?keyword=${sku}&viewIndex=0&gSortingForward=false&gOrderProp=uploadDate&display=fitView&from=fitView`
    }
    const columns: ColumnsType<RequirementListItem> = [
        {
            title: localFront('info'),
            dataIndex: 'info',
            key: 'info',
            width: 385,
            render: (text: any, record: any) => getInfoComponent(record)
        },
        {
            title: localFront('CreateInfo'),
            dataIndex: 'creator',
            key: 'creator',
            width: 200,
            render: (text: any, record: any) => {
                return <div style={{ 'width': '200px' }}>
                    <div><Text type="secondary">{localFront('creator')}：</Text>{record.creator}</div>
                    <div><Text type="secondary">{localFront('creationTime')}：</Text>{record.createTime}</div>
                </div>
            }
        },
        {
            title: localFront('status'),
            dataIndex: 'status',
            key: 'status',
            width: statusWidth + 50,
            render: (text: any, record: any) => getStepComponent(record)
        },
        {
            // 预计完成时间
            title: localFront('EstimatedCompletionTime'),
            dataIndex: 'expectTime',
            key: 'expectTime',
            width: 250
        },
        {
            title: localFront('operation'),
            dataIndex: 'action',
            key: 'action',
            width: 140,
            fixed: 'right',
            render: (text: any, record) => {
                const { disabled, color } = getOperationEdit(record)
                return <Space align='start'>
                    <Button type="link" disabled={disabled} style={{ color: color }} onClick={() => {
                        actionRef.current.showModal(record);
                    }}>{localFront('Edit')}</Button>
                    {record.status === 7 ? <a target='blank' href={getCantoUrl(record.sku)}><img width={'25'} src='/canto.png' /></a> : ''}
                </Space>
            }
        }
    ]

    useEffect(() => {
        newInitData(getParams({ 'init': undefined }))
    }, [JSON.stringify(tableParams.pagination), keyword, status])

    return (<div style={{ 'background': '#fff' }}>
        <Card
            size='small'
            title={<Button size='small' type="primary" onClick={() => {
                actionRef.current.showModal();
            }}>{localFront('CreateRequirement')}</Button>}
            extra={<>
                <Radio.Group size='small' value={status} onChange={(e) => {
                    setStatus(e.target.value)
                    setTableParams({
                        ...tableParams,
                        pagination: {
                            ...tableParams.pagination,
                            current: 1
                        }
                    })
                }}>
                    {ProcessItem.map(item => <Radio.Button key={item.value} value={item.value}>{item.label}</Radio.Button>)}
                </Radio.Group>
                <Search size='small' placeholder="input search text" onSearch={onSearch} style={{ width: 200, marginLeft: '10px' }} />
            </>}
        >
            <Table<RequirementListItem>
                loading={loading}
                columns={columns}
                scroll={{ x: columns.reduce((a, b) => a + Number(b.width), 0) }}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                dataSource={data} />
        </Card>
        <ActionModel refresh={initData} ref={actionRef} />
    </div>)
}