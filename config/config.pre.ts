// https://umijs.org/config/
import { defineConfig } from 'umi';
const { REACT_APP_ENV } = process.env;
export default defineConfig({
    plugins: [
        // https://github.com/zthxxx/react-dev-inspector
        'react-dev-inspector/plugins/umi/react-inspector',
    ],
    // https://github.com/zthxxx/react-dev-inspector#inspector-loader-props
    inspectorConfig: {
        exclude: [],
        babelPlugins: [],
        babelOptions: {},
    },
    define: {
        API_URL: 'http://n.demo.com',
        REACT_APP_ENV: REACT_APP_ENV || false
    },
});
