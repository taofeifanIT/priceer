import { useState, useRef } from 'react'
import { Button, Modal, message, Popconfirm } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { list_hs_code, add_hs_code, edit_hs_code, del_hs_code } from '@/services/warehouse/generateDeclarationInformation'
import type { UnitItem } from '@/services/warehouse/generateDeclarationInformation'
import type { ProColumns } from '@ant-design/pro-table';
import type { FormInstance } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';



const SettingComponent = (props: {
    reload?: () => void
}) => {
    const { reload } = props
    const actionRef: any = useRef<FormInstance>();
    const [openModal, setOpenModal] = useState(false);
    const [unitData, setUnitData] = useState<any[]>([]);
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
    const [units, setUnits] = useState<any[]>([]);
    // 设置一个字段判断是否有操作或者编辑
    const [isEdit, setIsEdit] = useState(false)
    const columns: ProColumns<UnitItem>[] = [
        {
            title: 'HS code',
            dataIndex: 'name',
            width: 100,
            ellipsis: true,
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            width: 100,
            ellipsis: true,
            valueType: 'select',
            valueEnum: units.reduce((pre, cur) => {
                pre[cur] = {
                    text: cur,
                }
                return pre
            }, {}),
        },
        {
            title: 'Action',
            valueType: 'option',
            width: 100,
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.id);
                    }}
                >
                    Edit
                </a>,
                <Popconfirm
                    key="del"
                    title="Are you sure to delete this Code?"
                    onConfirm={async () => {
                        await del_hs_code({
                            id: record.id,
                        })
                        message.success('Delete Success')
                        setIsEdit(true)
                        actionRef.current?.reload()

                    }}
                    okText="Yes"
                    cancelText="No">
                    <a
                        key="delete"
                    >
                        Delete
                    </a>
                </Popconfirm>,
            ],
        },
    ]
    return <>
        <Button icon={<SettingOutlined />} onClick={() => {
            setOpenModal(true)
        }} />
        <Modal
            title="Setting HS Code Unit"
            open={openModal}
            onCancel={() => {
                setOpenModal(false)
                if (isEdit) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    reload && reload()
                    setIsEdit(false)
                }
            }}
            onOk={() => {
                setOpenModal(false)
                if (isEdit) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    reload && reload()
                    setIsEdit(false)
                }
            }}
        >
            <EditableProTable<UnitItem>
                rowKey="id"
                actionRef={actionRef}
                columns={columns}
                value={unitData}
                onChange={setUnitData}
                recordCreatorProps={{
                    position: 'bottom',
                    creatorButtonText: 'New Unit',
                    record: () => ({
                        id: Number((Math.random() * 1000000).toFixed(0)),
                        name: '',
                        unit: '',
                        type: 2,

                    }),
                }}
                pagination={{
                    pageSize: 10,
                }}
                scroll={{ y: 480 }}
                request={async (params) => {
                    const { current, pageSize } = params;
                    const tempParams = {
                        page: current,
                        len: pageSize,
                    }
                    const res = await list_hs_code(tempParams)
                    if (res.code) {
                        setUnits(res.data.unit)
                        return {
                            data: res.data.data,
                            success: true,
                            total: res.data.total,
                        };
                    }
                    message.error(res.msg)
                    return {
                        data: [],
                        success: false,
                        total: 0,
                    };

                }}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onSave: async (_, row) => {
                        let id: any = row.id
                        let api: any = edit_hs_code
                        if (row.type === 2) {
                            id = undefined
                            api = add_hs_code
                        }
                        await new Promise((resolve, reject) => {
                            api({
                                id,
                                name: row.name,
                                unit: row.unit,
                            }).then((res: any) => {
                                if (res.code) {
                                    message.success(res.msg)
                                    setIsEdit(true)
                                    actionRef.current?.reload()
                                    resolve(true)
                                    return
                                }
                                message.error(res.msg)
                                reject(false)
                            })
                        });
                    },
                    onChange: setEditableRowKeys,
                }}
            />
        </Modal>
    </>
}

export default SettingComponent