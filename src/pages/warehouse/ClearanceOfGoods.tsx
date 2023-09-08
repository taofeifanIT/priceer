import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import GenerateDeclarationInformation from './components/GenerateDeclarationInformation';




const onChange = (key: string) => {
    console.log(key);
};

const items: TabsProps['items'] = [
    {
        key: '1',
        label: 'Automatically generate customs declaration information',
        children: <GenerateDeclarationInformation />,
    },
];



const App: React.FC = () => <Tabs
    defaultActiveKey="1"
    style={{
        background: '#fff',
        padding: '0px 8px',
        minHeight: document.body.clientHeight - 94,
    }} items={items} onChange={onChange} />;

export default App;