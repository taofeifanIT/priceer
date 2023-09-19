import { Button, Result } from 'antd';
import React from 'react';
import { history, useModel } from 'umi';
import { findIndexPage } from '@/utils/utils';
const NoFoundPage: React.FC = () => {
    const { initialState } = useModel('@@initialState');
    const newMenu: any = initialState?.currentUser?.menu.sort((a: any, b: any) => a.id - b.id);
    const indexPage = findIndexPage(newMenu);
    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you have no access to this page"
            extra={
                <Button type="primary" onClick={() => history.push(indexPage)}>
                    Back Home
                </Button>
            }
        />
    );
}

export default NoFoundPage;
