// import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useIntl } from 'umi';

const Footer: React.FC = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '上海威昱网络科技IT技术部出品',
  });

  const currentYear = new Date().getFullYear();

  return (
    <DefaultFooter
      copyright={`${currentYear} ${defaultMessage}`}
    // links={[
    //   {
    //     key: 'DROP SHIP',
    //     title: 'DROP SHIP',
    //     href: 'https://vl-multi.itmars.net',
    //     blankTarget: true,
    //   },
    //   {
    //     key: 'github',
    //     title: <GithubOutlined />,
    //     href: 'https://github.com/taofeifanIT/priceer',
    //     blankTarget: true,
    //   },
    // ]}
    />
  );
};

export default Footer;
