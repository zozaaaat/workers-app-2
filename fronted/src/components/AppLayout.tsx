import React, { useState } from 'react';
import { Layout, Menu, theme as antTheme } from 'antd';
import {
  DashboardOutlined,
  IdcardOutlined,
  FileDoneOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = antTheme.useToken();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/workers', icon: <TeamOutlined />, label: 'Workers' },
    { key: '/licenses', icon: <IdcardOutlined />, label: 'Licenses' },
    { key: '/leaves', icon: <FileDoneOutlined />, label: 'Leaves' },
    { key: '/activity-log', icon: <FileDoneOutlined />, label: 'Activity Log' },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname.startsWith('/licenses') ? '/licenses' : location.pathname]}
          onClick={handleMenuClick}
          items={[
            ...menuItems,
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: '0 16px', background: colorBgContainer }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
          })}
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{ padding: 24, minHeight: 360, background: colorBgContainer }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
