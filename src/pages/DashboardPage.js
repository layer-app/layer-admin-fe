import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, DatePicker, Button, Space, Typography } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    BarChartOutlined,
    LogoutOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import TemplateAnalytics from '../components/TemplateAnalytics';
import UserRetention from '../components/UserRetention';
import WritingTimeAnalytics from '../components/RetrospectWritingAnalytics';
import SpaceAnalytics from '../components/SpaceAnalytics';
import RegistrationAnalytics from '../components/RegistrationAnalytics';
import './DashboardPage.css';
import api from '../utils/api';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [selectedMenu, setSelectedMenu] = useState('overview');
    const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
    const [loading, setLoading] = useState(false);
    const [outlineStats, setOutlineStats] = useState({
        totalMemberCount: null,
        totalSpaceCount: null,
        totalRetrospectCount: null,
        totalRetrospectAnswerCount: null,
    });

    useEffect(() => {
        const fetchOutlineStats = async () => {
            setLoading(true);
            try {
                const res = await api.get('/admin/outline');
                setOutlineStats(res.data);
            } catch (error) {
                setOutlineStats({
                    totalMemberCount: null,
                    totalSpaceCount: null,
                    totalRetrospectCount: null,
                    totalRetrospectAnswerCount: null,
                });
                console.error('개요 통계 데이터 로딩 실패:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOutlineStats();
    }, []);

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
            label: '회고 작성 분석',
        },
        {
            key: 'spaces',
            icon: <UserOutlined />,
            label: '스페이스 분석',
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
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                            ※ 아래 4개의 데이터는 날짜와 상관없이 전체 누적 카운트입니다.
                        </Text>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="총 사용자"
                                        value={outlineStats.totalMemberCount !== null ? outlineStats.totalMemberCount : '-'}
                                        prefix={<UserOutlined />}
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="총 스페이스 수"
                                        value={outlineStats.totalSpaceCount !== null ? outlineStats.totalSpaceCount : '-'}
                                        prefix={<AppstoreOutlined />}
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="총 회고 수"
                                        value={outlineStats.totalRetrospectCount !== null ? outlineStats.totalRetrospectCount : '-'}
                                        prefix={<FileTextOutlined />}
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} lg={6}>
                                <Card>
                                    <Statistic
                                        title="총 회고 답변 수"
                                        value={outlineStats.totalRetrospectAnswerCount !== null ? outlineStats.totalRetrospectAnswerCount : '-'}
                                        prefix={<EditOutlined />}
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                            <Col xs={24} lg={12}>
                                <TemplateAnalytics dateRange={dateRange} />
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
