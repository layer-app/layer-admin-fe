import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tabs, Typography, Tag } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UserRetention = ({ dateRange, fullWidth = false }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        firstRetrospectiveRetention: [],
        periodicRetrospectiveUsers: [],
        retentionByPeriod: [],
        userRetentionData: []
    });

    useEffect(() => {
        fetchRetentionData();
    }, [dateRange]);

    const fetchRetentionData = async () => {
        setLoading(true);
        try {
            // 실제 API 호출로 대체 예정
            const mockData = {
                firstRetrospectiveRetention: [
                    { period: '1일', retention: 85.2 },
                    { period: '3일', retention: 72.1 },
                    { period: '7일', retention: 58.3 },
                    { period: '14일', retention: 45.7 },
                    { period: '30일', retention: 32.4 },
                    { period: '60일', retention: 28.1 },
                    { period: '90일', retention: 25.3 }
                ],
                periodicRetrospectiveUsers: [
                    { frequency: '매일', users: 1250, percentage: 15.2 },
                    { frequency: '주 2-3회', users: 2100, percentage: 25.5 },
                    { frequency: '주 1회', users: 3200, percentage: 38.8 },
                    { frequency: '월 2-3회', users: 1200, percentage: 14.6 },
                    { frequency: '월 1회', users: 480, percentage: 5.8 }
                ],
                retentionByPeriod: [
                    { period: '1주', retention: 78.5 },
                    { period: '2주', retention: 65.2 },
                    { period: '1개월', retention: 52.1 },
                    { period: '2개월', retention: 41.3 },
                    { period: '3개월', retention: 35.7 },
                    { period: '6개월', retention: 28.9 }
                ],
                userRetentionData: [
                    { cohort: '2024-01', '1주': 85, '2주': 72, '1개월': 58, '2개월': 45, '3개월': 38 },
                    { cohort: '2024-02', '1주': 82, '2주': 68, '1개월': 55, '2개월': 42, '3개월': 35 },
                    { cohort: '2024-03', '1주': 88, '2주': 75, '1개월': 61, '2개월': 48, '3개월': 40 },
                    { cohort: '2024-04', '1주': 80, '2주': 65, '1개월': 52, '2개월': 39, '3개월': 32 },
                    { cohort: '2024-05', '1주': 86, '2주': 73, '1개월': 59, '2개월': 46, '3개월': 39 }
                ]
            };

            setData(mockData);
        } catch (error) {
            console.error('리텐션 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '주기',
            dataIndex: 'frequency',
            key: 'frequency',
        },
        {
            title: '사용자 수',
            dataIndex: 'users',
            key: 'users',
            sorter: (a, b) => a.users - b.users,
        },
        {
            title: '비율',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (percentage) => `${percentage}%`,
            sorter: (a, b) => a.percentage - b.percentage,
        }
    ];

    const renderOverview = () => (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
                <Card title="신규 사용자 첫 회고 후 리텐션" loading={loading}>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={data.firstRetrospectiveRetention}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Line type="monotone" dataKey="retention" stroke="#1890ff" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>

            <Col xs={24} md={12}>
                <Card title="주기적 회고 작성 사용자 분포" loading={loading}>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={data.periodicRetrospectiveUsers}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ frequency, percentage }) => `${frequency} ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="users"
                            >
                                {data.periodicRetrospectiveUsers.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );

    const renderDetailedAnalysis = () => (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
                <Card title="주기별 회고 작성 사용자" loading={loading}>
                    <Table
                        columns={columns}
                        dataSource={data.periodicRetrospectiveUsers}
                        pagination={false}
                        size="small"
                    />
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title="기간별 리텐션 추이" loading={loading}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.retentionByPeriod}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Bar dataKey="retention" fill="#52c41a" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>

            <Col xs={24}>
                <Card title="코호트별 리텐션 분석" loading={loading}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.userRetentionData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="cohort" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                            <Bar dataKey="1주" fill="#1890ff" />
                            <Bar dataKey="2주" fill="#52c41a" />
                            <Bar dataKey="1개월" fill="#faad14" />
                            <Bar dataKey="2개월" fill="#f5222d" />
                            <Bar dataKey="3개월" fill="#722ed1" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );

    if (fullWidth) {
        return (
            <div>
                <Title level={3}>리텐션 분석</Title>
                <Tabs defaultActiveKey="overview">
                    <TabPane tab="개요" key="overview">
                        {renderOverview()}
                    </TabPane>
                    <TabPane tab="상세 분석" key="detailed">
                        {renderDetailedAnalysis()}
                    </TabPane>
                </Tabs>
            </div>
        );
    }

    return (
        <Card title="리텐션 분석" loading={loading}>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.firstRetrospectiveRetention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Line type="monotone" dataKey="retention" stroke="#1890ff" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default UserRetention;
