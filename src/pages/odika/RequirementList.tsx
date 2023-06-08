import { Button, Card, Table, Radio, Input, Modal, Space, Select, Divider, Alert, Form, Upload, message } from 'antd';
import { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { getSkuList, saveDesignParams } from '@/services/odika/requirementList';
const { Search } = Input;

// 1:可编辑   2：待排序   3：待审核  4:审核失败   5：审核成功  6：待排期  7：制作中  8：完成
const ProcessItem = [
    { value: 1, label: '编辑中' },
    { value: 2, label: '待排序' },
    { value: 3, label: '待审核' },
    { value: 4, label: '审核失败' },
    { value: 5, label: '审核成功' },
    { value: 6, label: '待排期' },
    { value: 7, label: '制作中' },
    { value: 8, label: '完成' },
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

const ActionModel = forwardRef((props, ref) => {
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [skuList, setSkuList] = useState([]);
    const [skuListLoading, setSkuListLoading] = useState(false);
    const [currentSku, setCurrentSku] = useState('');
    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setVisible(false);
            setConfirmLoading(false);
        }, 2000);
    };
    const handleCancel = () => {
        setVisible(false);
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
    const onFinish = () => {
        if (!currentSku) {
            message.error('请选择SKU')
            return
        }
        form.validateFields().then(values => {
            const params = {
                sku: currentSku,
                mainPicture: {
                    whiteBackgroundMemo: values.whiteBackgroundMemo,
                    whiteBackgroundFile: values.whiteBackgroundFile
                },
                sizeAndNaterial: {
                    sizeAndNaterialMemo: values.sizeAndNaterialMemo,
                    sizeAndNaterialFile: values.sizeAndNaterialFile
                }
            }
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
                onSearch={onSearch}
                style={{ width: 200 }}
                filterOption={(input, option: any) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={skuList}
            />
        </Space>
    </>
    useImperativeHandle(ref, () => ({
        showModal() {
            setVisible(true);
            getSkulist()
        }
    }));
    return (<Modal
        width={800}
        title={modelTitle}
        open={visible}
        onOk={onFinish}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
    >
        <Form
            form={form}
            name="dynamic_form_nest_item"
            autoComplete="off"
            initialValues={{
                auxiliaryPictureScene: [{ scene: '', memo: '' }],
                aPlusType: 'A+',
                aplusScene: [{ scene: '', memo: '', pictureRequirement: '' }],
                detailPicture: [{ detailRequirementPoint: '', memo: '' }],
            }}
            {...formItemLayout}
        >
            <Divider plain>主图</Divider>
            <Alert message="白底图 + 道具" type="info" style={{ marginBottom: '20px' }} />
            <Form.Item
                name={'whiteBackgroundMemo'}
                label="备注"
                rules={[{ required: true, message: 'Missing Memo' }]}
            >
                <Input.TextArea placeholder="请输入道具需求" />
            </Form.Item>
            <Form.Item
                name={'whiteBackgroundFile'}
                label="图片"
            >
                <Upload action="/upload.do" listType="picture-card" maxCount={1}>
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Upload>
            </Form.Item>
            <Alert message="尺寸 + 材质" type="info" style={{ marginBottom: '20px' }} />
            <Form.Item
                name={'sizeAndNaterialMemo'}
                label="备注"
                rules={[{ required: true, message: 'Missing Memo' }]}
            >
                <Input.TextArea placeholder="请输入需求" />
            </Form.Item>
            <Form.Item
                name={'sizeAndNaterialFile'}
                label="图片"
            >
                <Upload action="/upload.do" listType="picture-card" maxCount={1}>
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Upload>
            </Form.Item>
            <Divider plain>副图</Divider>
            <Form.Item
                name={'auxiliaryPictureSellingPoint'}
                label="卖点"
                rules={[{ required: true, message: 'Missing Memo' }]}
            >
                <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Tags Mode"
                />
            </Form.Item>
            <Form.Item
                name={'auxiliaryPictureMemo'}
                label="备注"
                rules={[{ required: true, message: 'Missing Memo' }]}
            >
                <Input.TextArea placeholder="请输入需求" />
            </Form.Item>
            <Form.Item
                name={'auxiliaryPictureFile'}
                label="图片"
            >
                <Upload action="/upload.do" listType="picture-card" maxCount={1}>
                    <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Upload>
            </Form.Item>
            <Divider plain>副图场景</Divider>
            <Form.List
                name="auxiliaryPictureScene">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <div key={key} style={{ marginBottom: 8, position: 'relative' }}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'scene']}
                                    label={'场景' + (name + 1)}
                                    rules={[{ required: true, message: 'Missing scene' }]}
                                >
                                    <Select>
                                        {SceneList.map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)}
                                    </Select>
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} style={{ position: 'absolute', right: 90, top: 7 }} />
                                <Form.Item
                                    {...restField}
                                    name={[name, 'memo']}
                                    label={'需求'}
                                    rules={[{ required: true, message: 'Missing memo' }]}
                                >
                                    <Input.TextArea placeholder="memo" />
                                </Form.Item>
                                <Form.Item
                                    name={[name, 'file']}
                                    label="图片"
                                >
                                    <Upload action="/upload.do" listType="picture-card" maxCount={1}>
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </div>
                        ))}
                        <Form.Item label={" "} colon={false}>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                继续添加场景
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
                        rules={[{ required: true, message: 'Missing aPlusType' }]}>
                        <Select style={{ 'width': '100px', 'position': 'relative', 'top': '10px' }}>
                            <Select.Option value={'A+'}>A+</Select.Option>
                            <Select.Option value={'A++'}>A++</Select.Option>
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
                                    label={'场景' + (name + 1)}
                                    rules={[{ required: true, message: 'Missing scene' }]}
                                >
                                    <Select>
                                        {SceneList.map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)}
                                    </Select>
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} style={{ position: 'absolute', right: 90, top: 7 }} />
                                <Form.Item
                                    {...restField}
                                    name={[name, 'memo']}
                                    label={'需求'}
                                    rules={[{ required: true, message: 'Missing memo' }]}
                                >
                                    <Input.TextArea placeholder="请输入文字需求" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'pictureRequirement']}
                                    label={'画面要求'}
                                    rules={[{ required: true, message: 'Missing pictureRequirement' }]}
                                >
                                    <Input.TextArea placeholder="请输入画面要求" />
                                </Form.Item>
                                <Form.Item
                                    name={[name, 'file']}
                                    label="图片"
                                >
                                    <Upload action="/upload.do" listType="picture-card" maxCount={1}>
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </div>
                        ))}
                        <Form.Item label={" "} colon={false}>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                继续添加
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Divider plain>细节</Divider>
            <Form.List
                name="detailPicture">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <div key={key} style={{ marginBottom: 8, position: 'relative' }}>
                                <Form.Item
                                    {...restField}
                                    name={[name, 'detailRequirementPoint']}
                                    label={'细节需求点' + (name + 1)}
                                    rules={[{ required: true, message: 'Missing detailRequirementPoint' }]}
                                >
                                    <Select>
                                        {SceneList.map(item => <Select.Option key={item} value={item}>{item}</Select.Option>)}
                                    </Select>
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} style={{ position: 'absolute', right: 90, top: 7 }} />
                                <Form.Item
                                    {...restField}
                                    name={[name, 'memo']}
                                    label={'画面需求'}
                                    rules={[{ required: true, message: 'Missing memo' }]}
                                >
                                    <Input.TextArea placeholder="请输入画面需求" />
                                </Form.Item>
                                <Form.Item
                                    name={[name, 'file']}
                                    label="图片"
                                >
                                    <Upload action="/upload.do" listType="picture-card" maxCount={1}>
                                        <div>
                                            <PlusOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </div>
                        ))}
                        <Form.Item label={" "} colon={false}>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                继续添加
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
        </Form>
    </Modal>)
})

export default () => {
    const [size, setSize] = useState('');
    const actionRef: any = useRef();
    const onSearch = (value: string) => console.log(value);
    return (<div style={{ 'background': '#fff' }}>
        <Card
            size='small'
            title={<Button type="primary" onClick={() => {
                actionRef.current.showModal();
            }}>创建需求</Button>}
            extra={<>
                <Radio.Group value={size} onChange={(e) => setSize(e.target.value)}>
                    {ProcessItem.map(item => <Radio.Button key={item.value} value={item.value}>{item.label}</Radio.Button>)}
                </Radio.Group>
                <Search placeholder="input search text" onSearch={onSearch} style={{ width: 200, marginLeft: '10px' }} />
            </>}
        >
            {size}
        </Card>
        <ActionModel ref={actionRef} />
    </div>)
}