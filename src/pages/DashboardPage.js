import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, DatePicker, Button, Space, Typography } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    BarChartOutlined,
    LogoutOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import TemplateAnalytics from '../components/TemplateAnalytics';
import UserRetention from '../components/UserRetention';
import WritingTimeAnalytics from '../components/WritingTimeAnalytics';
import SpaceAnalytics from '../components/SpaceAnalytics';
import CompletionRate from '../components/CompletionRate';
import RegistrationAnalytics from '../components/RegistrationAnalytics';
import './DashboardPage.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedMenu, setSelectedMenu] = useState('overview');
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
    const [loading, setLoading] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRefresh = () => {
        setLoading(true);
        // 데이터 새로고침 로직
        setTimeout(() => setLoading(false), 1000);
    };

    const menuItems = [
        {
            key: 'overview',
            icon: <DashboardOutlined />,
            label: '개요',
        },
        {
            key: 'templates',
            icon: <FileTextOutlined />,
            label: '템플릿 분석',
        },
        {
            key: 'retention',
            icon: <BarChartOutlined />,
            label: '리텐션 분석',
        },
        {
            key: 'writing-time',
            icon: <BarChartOutlined />,
            label: '작성 시간 분석',
        },
        {
            key: 'spaces',
            icon: <UserOutlined />,
            label: '스페이스 분석',
        },
        {
            key: 'completion',
            icon: <BarChartOutlined />,
            label: '완료율 분석',
        },
        {
            key: 'registration',
            icon: <UserOutlined />,
            label: '회원가입 분석',
        },
    ];

    const renderContent = () => {
        switch (selectedMenu) {
            case 'overview':
                return (
                    <div className="overview-content">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="총 사용자"
                                        value={11234}
                                        prefix={<UserOutlined />}
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="총 회고 수"
                                        value={45678}
                                        prefix={<FileTextOutlined />}
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="활성 스페이스"
                                        value={892}
                                        prefix={<UserOutlined />}
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="평균 작성 시간"
                                        value={15.2}
                                        suffix="분"
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                            <Col xs={24} lg={12}>
                                <TemplateAnalytics dateRange={dateRange} />
                            </Col>
                            <Col xs={24} lg={12}>
                                <UserRetention dateRange={dateRange} />
                            </Col>
                        </Row>
                    </div>
                );
            case 'templates':
                return <TemplateAnalytics dateRange={dateRange} fullWidth />;
            case 'retention':
                return <UserRetention dateRange={dateRange} fullWidth />;
            case 'writing-time':
                return <WritingTimeAnalytics dateRange={dateRange} />;
            case 'spaces':
                return <SpaceAnalytics dateRange={dateRange} />;
            case 'completion':
                return <CompletionRate dateRange={dateRange} />;
            case 'registration':
                return <RegistrationAnalytics dateRange={dateRange} />;
            default:
                return <div>페이지를 선택해주세요.</div>;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={250} className="dashboard-sider">
                <div className="logo">
                    <h2>Layer 어드민</h2>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[selectedMenu]}
                    items={menuItems}
                    onClick={({ key }) => setSelectedMenu(key)}
                    className="dashboard-menu"
                />
            </Sider>

            <Layout>
                <Header className="dashboard-header">
                    <div className="header-content">
                        <div className="header-left">
                            <Title level={4} style={{ margin: 0, color: '#fff' }}>
                                {menuItems.find(item => item.key === selectedMenu)?.label}
                            </Title>
                        </div>
                        <div className="header-right">
                            <Space>
                                <RangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                    format="YYYY-MM-DD"
                                />
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleRefresh}
                                    loading={loading}
                                >
                                    새로고침
                                </Button>
                                <Button
                                    icon={<LogoutOutlined />}
                                    onClick={handleLogout}
                                    danger
                                >
                                    로그아웃
                                </Button>
                            </Space>
                        </div>
                    </div>
                </Header>

                <Content className="dashboard-content">
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardPage;
