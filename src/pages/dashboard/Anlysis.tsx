import { PageContainer } from '@ant-design/pro-components';
import { Card, Typography, Button, Modal, Steps } from 'antd';
import { LoadingOutlined, SmileOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { exportPDF } from '@/utils/utils'
import styles from './Welcome.less';
const { Step } = Steps;


const CodePreview: React.FC = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

const Anlysis: React.FC = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);


  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    // setIsModalOpen(false);
    exportPDF("test")
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  console.log(props)
  return (
    <PageContainer>
      <Card>
        <div id='pdfbox' style={{ 'display': 'inline-block', width: '440px' }}>
          <Modal width={630} visible={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
            <div id='viewBox'>
            </div>
          </Modal>
          {/* <div style={{ 'padding': '12px' }}>
            <img style={{ 'width': '420px' }} src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHdpZHRoPSI2NTIuNSIgaGVpZ2h0PSIxNTAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KCTxnIGlkPSJiYXJzIiBmaWxsPSJibGFjayIgc3Ryb2tlPSJub25lIj4KCQk8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMTMuNSIgeT0iMCIgd2lkdGg9IjQuNSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMzYiIHk9IjAiIHdpZHRoPSI0LjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjQ5LjUiIHk9IjAiIHdpZHRoPSIxMy41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSI3Ni41IiB5PSIwIiB3aWR0aD0iNC41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSI4NS41IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iOTkiIHk9IjAiIHdpZHRoPSI0LjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjExMi41IiB5PSIwIiB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMTMwLjUiIHk9IjAiIHdpZHRoPSI5IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSIxNDguNSIgeT0iMCIgd2lkdGg9IjQuNSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMTYyIiB5PSIwIiB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMTgwIiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMTk4IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMjE2IiB5PSIwIiB3aWR0aD0iNC41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSIyMjUiIHk9IjAiIHdpZHRoPSIxMy41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSIyNDcuNSIgeT0iMCIgd2lkdGg9IjQuNSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMjY1LjUiIHk9IjAiIHdpZHRoPSI0LjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjI3NC41IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMjk3IiB5PSIwIiB3aWR0aD0iNC41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSIzMTUiIHk9IjAiIHdpZHRoPSI5IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSIzMjguNSIgeT0iMCIgd2lkdGg9IjEzLjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjM0Ni41IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iMzY5IiB5PSIwIiB3aWR0aD0iNC41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSIzNzgiIHk9IjAiIHdpZHRoPSI0LjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjM5NiIgeT0iMCIgd2lkdGg9IjEzLjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjQxNCIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjQyNy41IiB5PSIwIiB3aWR0aD0iMTMuNSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iNDQ1LjUiIHk9IjAiIHdpZHRoPSI0LjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjQ1OSIgeT0iMCIgd2lkdGg9IjEzLjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjQ3NyIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjQ5NSIgeT0iMCIgd2lkdGg9IjkiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjUxNy41IiB5PSIwIiB3aWR0aD0iNC41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSI1MjYuNSIgeT0iMCIgd2lkdGg9IjEzLjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjU0NC41IiB5PSIwIiB3aWR0aD0iNC41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSI1NTgiIHk9IjAiIHdpZHRoPSI0LjUiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjU3MS41IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iNTk0IiB5PSIwIiB3aWR0aD0iOSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iNjE2LjUiIHk9IjAiIHdpZHRoPSIxMy41IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSI2MzQuNSIgeT0iMCIgd2lkdGg9IjQuNSIgaGVpZ2h0PSIxMzgiIC8+CgkJPHJlY3QgeD0iNjQzLjUiIHk9IjAiIHdpZHRoPSI5IiBoZWlnaHQ9IjEzOCIgLz4KCQk8cmVjdCB4PSI2NTIuNSIgeT0iMCIgd2lkdGg9IjAiIGhlaWdodD0iMTM4IiAvPgoJCTxyZWN0IHg9IjY1Mi41IiB5PSIwIiB3aWR0aD0iMCIgaGVpZ2h0PSIxMzgiIC8+Cgk8dGV4dCB4PSIzMjYuMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiICB5PSIxNTAiIGlkPSJjb2RlIiBmaWxsPSJibGFjayIgZm9udC1zaXplID0iMTJweCIgPlgwMDNCTEg3MFI8L3RleHQ+Cgk8L2c+Cjwvc3ZnPgo=" />
            <p style={{ 'textAlign': 'center', 'marginTop': '8px', 'fontFamily': 'cursive', 'fontWeight': 600 }}>
              New - Dell Universal Dock -D6000 - 452-BCNU...K Dsipalys, LED Indicator, Black
            </p>
          </div> */}
          <Steps>
            <Step status="finish" title="Login" icon={<UserOutlined />} >1</Step>
            <Step status="finish" title="Verification" icon={<SolutionOutlined />}>2</Step>
            <Step status="process" title="Pay" icon={<LoadingOutlined />}>3</Step>
            <Step status="wait" title="Done" icon={<SmileOutlined />}>4</Step>
          </Steps>
        </div>
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
      </Card>
    </PageContainer>
  );
};

export default Anlysis;
