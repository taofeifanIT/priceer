// config/config.test.ts test环境对应的配置文件
import { defineConfig } from 'umi';
const { REACT_APP_ENV } = process.env;
/**
 * 导出的多环境变量命名约定：一律大写且采用下划线分割单词
 * 注意：在添加变量后，需要在src/typing.d.ts内添加该变量的声明，否则在使用变量时IDE会报错。
 */

export default defineConfig({
    define: {
        API_URL: 'http://staging.itmars.net', // API地址
        REACT_APP_ENV: REACT_APP_ENV || false,
    },
});