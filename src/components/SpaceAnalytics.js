import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Progress, Tag } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TeamOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { getDateParams } from '../utils/dateParams';
import { SpaceCategoryType } from '../constants/spaceCategoryType';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function parseTeamVsIndividual(raw) {
    const total = raw.reduce((sum, item) => sum + item.spaceCount, 0);
    return raw.map(item => ({
        type: item.category === SpaceCategoryType.TEAM ? '팀 스페이스' : '개인 스페이스',
        count: item.spaceCount,
        percentage: total > 0 ? Math.round((item.spaceCount / total) * 1000) / 10 : 0
    }));
}

const SpaceAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        teamVsIndividual: [],
        spaceGrowth: [],
        spaceActivity: [],
        retrospectiveCountBySpace: [],
        spaceTypeDistribution: []
    });

    const fetchSpaceData = useCallback(async () => {
        setLoading(true);
        try {
            const baseParams = getDateParams(dateRange);

            const [teamVsIndividualRes, spaceGrowthRes, spaceActivityRes, retrospectiveCountRes, spaceTypeDistRes] = await Promise.all([
                api.get('/admin/space/individual-vs-team', { params: { ...baseParams } }),
                // api.get('/admin/space/growth', { params: { ...baseParams } }),
                // api.get('/admin/space/activity', { params: { ...baseParams } }),
                // api.get('/admin/space/retrospective-count', { params: { ...baseParams } }),
                // api.get('/admin/space/type-distribution', { params: { ...baseParams } })
            ]);

            setData({
                teamVsIndividual: parseTeamVsIndividual(teamVsIndividualRes.data),
                spaceGrowth: null,
                spaceActivity: null,
                retrospectiveCountBySpace: null,
                spaceTypeDistribution: null
            });
        } catch (error) {
            console.error('스페이스 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchSpaceData();
    }, [fetchSpaceData]);

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
                    <Card title="[🚨 미구현] 스페이스 활성도 분포" loading={loading}>
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
                    <Card title="[🚨 미구현] 스페이스 성장 추이" loading={loading}>
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
                    <Card title="[🚨 미구현] 스페이스 유형별 분포" loading={loading}>
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
                    <Card title="[🚨 미구현] 스페이스 활성도 상세" loading={loading}>
                        <Table
                            columns={activityColumns}
                            dataSource={data.spaceActivity}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="[🚨 미구현] 스페이스별 회고 수 (TOP 10)" loading={loading}>
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
