import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Progress, Tag } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TeamOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SpaceAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        teamVsIndividual: [],
        spaceGrowth: [],
        spaceActivity: [],
        retrospectiveCountBySpace: [],
        spaceTypeDistribution: []
    });

    useEffect(() => {
        fetchSpaceData();
    }, [dateRange]);

    const fetchSpaceData = async () => {
        setLoading(true);
        try {
            // 실제 API 호출로 대체 예정
            const mockData = {
                teamVsIndividual: [
                    { type: '팀 스페이스', count: 3200, percentage: 35.8 },
                    { type: '개인 스페이스', count: 5720, percentage: 64.2 }
                ],
                spaceGrowth: [
                    { month: '2024-01', team: 280, individual: 450, total: 730 },
                    { month: '2024-02', team: 320, individual: 520, total: 840 },
                    { month: '2024-03', team: 380, individual: 610, total: 990 },
                    { month: '2024-04', team: 420, individual: 680, total: 1100 },
                    { month: '2024-05', team: 480, individual: 750, total: 1230 },
                    { month: '2024-06', team: 520, individual: 820, total: 1340 }
                ],
                spaceActivity: [
                    { spaceType: '매우 활성', count: 1250, percentage: 14.0 },
                    { spaceType: '활성', count: 2100, percentage: 23.5 },
                    { spaceType: '보통', count: 3200, percentage: 35.8 },
                    { spaceType: '비활성', count: 1800, percentage: 20.1 },
                    { spaceType: '매우 비활성', count: 580, percentage: 6.5 }
                ],
                retrospectiveCountBySpace: [
                    { spaceName: '개발팀 A', type: '팀', retrospectiveCount: 156, memberCount: 8 },
                    { spaceName: '마케팅팀 B', type: '팀', retrospectiveCount: 89, memberCount: 5 },
                    { spaceName: '개인 스페이스 1', type: '개인', retrospectiveCount: 234, memberCount: 1 },
                    { spaceName: '개인 스페이스 2', type: '개인', retrospectiveCount: 187, memberCount: 1 },
                    { spaceName: '프로젝트팀 C', type: '팀', retrospectiveCount: 203, memberCount: 12 },
                    { spaceName: '개인 스페이스 3', type: '개인', retrospectiveCount: 145, memberCount: 1 }
                ],
                spaceTypeDistribution: [
                    { category: '개발팀', count: 1250, percentage: 14.0 },
                    { category: '마케팅팀', count: 980, percentage: 11.0 },
                    { category: '디자인팀', count: 720, percentage: 8.1 },
                    { category: '개인 학습', count: 2100, percentage: 23.5 },
                    { category: '개인 프로젝트', count: 1800, percentage: 20.1 },
                    { category: '기타', count: 1080, percentage: 12.1 }
                ]
            };

            setData(mockData);
        } catch (error) {
            console.error('스페이스 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '스페이스명',
            dataIndex: 'spaceName',
            key: 'spaceName',
        },
        {
            title: '유형',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === '팀' ? 'blue' : 'green'}>
                    {type}
                </Tag>
            ),
        },
        {
            title: '회고 수',
            dataIndex: 'retrospectiveCount',
            key: 'retrospectiveCount',
            sorter: (a, b) => a.retrospectiveCount - b.retrospectiveCount,
        },
        {
            title: '멤버 수',
            dataIndex: 'memberCount',
            key: 'memberCount',
            sorter: (a, b) => a.memberCount - b.memberCount,
        },
        {
            title: '인당 회고 수',
            key: 'perMember',
            render: (_, record) => Math.round(record.retrospectiveCount / record.memberCount),
            sorter: (a, b) => (a.retrospectiveCount / a.memberCount) - (b.retrospectiveCount / b.memberCount),
        }
    ];

    const activityColumns = [
        {
            title: '활성도',
            dataIndex: 'spaceType',
            key: 'spaceType',
        },
        {
            title: '스페이스 수',
            dataIndex: 'count',
            key: 'count',
            sorter: (a, b) => a.count - b.count,
        },
        {
            title: '비율',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (percentage) => `${percentage}%`,
            sorter: (a, b) => a.percentage - b.percentage,
        }
    ];

    return (
        <div>
            <Title level={3}>스페이스 분석</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="팀 vs 개인 스페이스 비율" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.teamVsIndividual}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ type, percentage }) => `${type} ${percentage}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {data.teamVsIndividual.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="스페이스 활성도 분포" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.spaceActivity}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="spaceType" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="스페이스 성장 추이" loading={loading}>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={data.spaceGrowth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="team" stroke="#1890ff" strokeWidth={2} name="팀 스페이스" />
                                <Line type="monotone" dataKey="individual" stroke="#52c41a" strokeWidth={2} name="개인 스페이스" />
                                <Line type="monotone" dataKey="total" stroke="#f5222d" strokeWidth={2} name="총 스페이스" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="스페이스 유형별 분포" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.spaceTypeDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#faad14" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="스페이스 활성도 상세" loading={loading}>
                        <Table
                            columns={activityColumns}
                            dataSource={data.spaceActivity}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="스페이스별 회고 수 (TOP 10)" loading={loading}>
                        <Table
                            columns={columns}
                            dataSource={data.retrospectiveCountBySpace}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SpaceAnalytics;
