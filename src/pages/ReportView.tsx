import { PageContainer } from '@ant-design/pro-components';
import { Alert, Card, Typography } from 'antd';
import React from 'react';
import { FormattedMessage, useIntl } from 'umi';

const ReportView: React.FC = () => {
    const intl = useIntl();

    return (
        <PageContainer>
            <Card>
                <Alert
                    message={intl.formatMessage({
                        id: 'pages.welcome.alertMessage',
                        defaultMessage: 'report view.',
                    })}
                    type="success"
                    showIcon
                    banner
                    style={{
                        margin: -12,
                        marginBottom: 24,
                    }}
                />
                <Typography.Text strong>
                    <a
                        href="https://procomponents.ant.design/components/table"
                        rel="noopener noreferrer"
                        target="__blank"
                    >
                        <FormattedMessage id="pages.welcome.link" defaultMessage="Anlysis" />
                    </a>
                </Typography.Text>
            </Card>
        </PageContainer>
    );
};

export default ReportView;
