import { message, Popconfirm } from 'antd';
import { useState } from 'react';

function DeleteComponent(props: { params: any; api: any, initData: () => void }) {
    const { params, api, initData } = props;
    const [visible, setVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const showPopconfirm = () => {
        setVisible(true);
    };
    const handleOk = () => {
        setConfirmLoading(true);
        api(params)
            .then((res: any) => {
                if (res.code) {
                    message.success('The operation was successful！');
                    initData();
                } else {
                    throw res.msg;
                }
            })
            .catch((e: string) => {
                message.error(e);
            })
            .finally(() => {
                setVisible(false);
                setConfirmLoading(false);
            });
    };

    const handleCancel = () => {
        setVisible(false);
    };
    return (
        <Popconfirm
            title="Are you sure you want to delete this data?"
            open={visible}
            onConfirm={handleOk}
            okButtonProps={{ loading: confirmLoading }}
            onCancel={handleCancel}
        >
            <a style={{ 'color': 'red' }} onClick={showPopconfirm}>delete</a>
        </Popconfirm>
    );
}

export default DeleteComponent;