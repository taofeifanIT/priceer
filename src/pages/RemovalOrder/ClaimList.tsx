import { useRef, useState } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import type { FormInstance } from 'antd';
import { Space, Image,Input } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { getShipmentList, addClaimNumber } from '@/services/removalOrder'

export type TableListItem = {
    id: number,
    store_id: number,
    ns_id: number,
    uuid: string,
    uuid_num: number,
    order_id: string,
    sku: string,
    msku: string,
    fnsku: string,
    dispostion: string
    shipment_date: string;
    shipped_quantity: number,
    carrier: string,
    tracking_number: string,
    removal_order_type: string,
    mid: string,
    seller_name: string,
    shipment_date_timestamp: number,
    overseas_removal_order_no: string,
    is_track: number,
    tracking_last_status: string,
    tracking_info: string,
    tracking_last_times: number,
    shipment_status: string,
    memo: string,
    images: string,
    checked_at: number,
    store_name: string,
    claim_number: string
}

const SetClaimComponent = (props:{claim_number: string}) => {
    const { claim_number } = props
    const [claimValue,setClaimValue] = useState(claim_number)
    return (<>
        <Input.Search value={claimValue}  />
    </>)
}

export default () => {
    const actionRef: any = useRef<FormInstance>();
    const [visible, setVisible] = useState(false);

    const columns: ProColumns<TableListItem>[] = [
        {
            title: 'Store Name',
            dataIndex: 'store_name',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'Order ID',
            dataIndex: 'order_id',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'Tracking Number',
            dataIndex: 'tracking_number',
            valueType: 'text',
            hideInTable: true
        },
        {
            title: 'MSKU',
            dataIndex: 'msku',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'FNSKU',
            dataIndex: 'fnsku',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'Shipment Date',
            dataIndex: 'shipment_date',
            align: 'center',
            valueType: 'text',
        },
        {
            title: 'Removal Type',
            dataIndex: 'removal_order_type',
            align: 'center',
            valueType: 'select',
            valueEnum: {
                Return: { text: 'Return' },
                Disposal: { text: 'Disposal' },
                Liquidate: { text: 'Liquidations' },
            },
        },
        {
            title: 'Disposition',
            dataIndex: 'disposition',
            align: 'center',
            valueType: 'text',
            valueEnum: {
                Sellable: { text: 'Sellable' },
                Unsellable: { text: 'Unsellable' }
            }
        },
        {
            title: 'Shipped Quantity',
            dataIndex: 'shipped_quantity',
            align: 'center',
            valueType: 'digit',
            search: false,
        },
        {
            title: 'Carrier',
            dataIndex: 'carrier',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'Tracking Number',
            dataIndex: 'tracking_number',
            align: 'center',
            valueType: 'text',
            search: false,
        },
        {
            title: 'Images',
            dataIndex: 'images',
            align: 'center',
            search: false,
            render: (_, record) => {
                const imageList = JSON.parse(record.images)
                return (
                    <Space size="middle">
                        <Image
                            preview={{ visible: false }}
                            width={200}
                            src={`http://api-rp.itmars.net/storage/${imageList[0]}`}
                            onClick={() => setVisible(true)}
                        />
                        <div style={{ display: 'none' }}>
                            <Image.PreviewGroup preview={{ visible, onVisibleChange: (vis) => setVisible(vis) }}>
                                {imageList.map((image: string) => (
                                    <Image src={`http://api-rp.itmars.net/storage/${image}`} />
                                ))}
                            </Image.PreviewGroup>
                        </div>
                    </Space>
                )
            }
        },
        {
            title: 'Claim Number',
            dataIndex: 'claim_number',
            align: 'center',
            valueType: 'text',
            search: false,
            render: (record) => {
                return <SetClaimComponent claim_number={record.claim_number} />
            }
        },
    ];
    return (<>
        <ProTable<TableListItem>
            columns={columns}
            actionRef={actionRef}
            request={async (params) =>
                // 表单搜索项会从 params 传入，传递给后端接口。
                // console.log(params, sorter, filter);
                new Promise((resolve) => {
                    const tempParams: any = {
                        ...params,
                        shipment_status: 'inconsistent',
                        len: params.pageSize,
                        page: params.current
                    }
                    getShipmentList(tempParams).then((res) => {
                        resolve({
                            data: res.data.data,
                            // success 请返回 true，
                            // 不然 table 会停止解析数据，即使有数据
                            success: !!res.code,
                            // 不传会使用 data 的长度，如果是分页一定要传
                            total: res.data.total,
                        });
                    });
                })
            }
            rowKey="id"
            pagination={{
                showQuickJumper: true,
            }}
            search={{
                labelWidth: 'auto',
            }}
            size="small"
            bordered
            dateFormatter="string"
            headerTitle="Removal Order List"
            toolBarRender={() => []}
        />
    </>);
};

// export default connect(({ globalparams }: any) => ({ globalparams }))(ListedProduct);
