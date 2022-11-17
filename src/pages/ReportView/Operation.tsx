/*
 * @Author: taofeifanIT 3553447302@qq.com
 * @Date: 2022-08-05 16:09:03
 * @LastEditors: taofeifanIT 3553447302@qq.com
 * @LastEditTime: 2022-08-15 16:55:38
 * @FilePath: \priceer\src\pages\ReportView.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import Component from './Component'
import { index, downloadFile } from '@/services/reportView'

const ReportView: React.FC = () => {
    return (
        <>
            <Component index={index} downloadFile={downloadFile} title='Operation' />
        </>
    );
};

export default ReportView;
