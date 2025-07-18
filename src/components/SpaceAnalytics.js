import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Pagination } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { getDateParams } from '../utils/dateParams';

const { Title, Text } = Typography;

// 진행중인 회고 관련 MOCK 데이터
const mockOngoingStats = {
    spaceClickRate: 47.2, // %
    taskEnterRate: 62.5,  // %
    taskCompleteRate: 38.1, // %
    abandonedRate: 21.7, // %
};

const SpaceAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        teamVsIndividual: [],
    });

    const [teamSpaceRatioData, setTeamSpaceRatioData] = useState([]);
    const [teamSpaceRatioAvg, setTeamSpaceRatioAvg] = useState(null);
    const [teamSpaceRatioPage, setTeamSpaceRatioPage] = useState(1);
    const [teamSpaceRatioTotalPages, setTeamSpaceRatioTotalPages] = useState(1);
    const [teamSpaceRatioLoading, setTeamSpaceRatioLoading] = useState(false);

    const fetchSpaceData = useCallback(async () => {
        setLoading(true);
        try {
            const baseParams = getDateParams(dateRange);

            const teamVsIndividualRes = await api.get('/admin/space/individual-vs-team', { params: { ...baseParams } });
            const raw = teamVsIndividualRes.data;
            const total = raw.reduce((sum, item) => sum + item.spaceCount, 0);
            setData({
                teamVsIndividual: raw.map(item => ({
                    type: item.category === 'TEAM' ? '팀 스페이스' : '개인 스페이스',
                    count: item.spaceCount,
                    percentage: total > 0 ? Math.round((item.spaceCount / total) * 1000) / 10 : 0
                })),
            });
        } catch (error) {
            console.error('스페이스 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    const fetchTeamSpaceRatio = useCallback(async (page = 1) => {
        setTeamSpaceRatioLoading(true);
        try {
            const baseParams = getDateParams(dateRange);
            const res = await api.get('/admin/space/average-team-space-ratio-per-member', {
                params: {
                    ...baseParams,
                    page,
                    size: 20,
                },
            });
            setTeamSpaceRatioData(res.data.averageTeamSpaceRatios || []);
            setTeamSpaceRatioAvg(res.data.averageTeamSpaceRatioPerMember);
            setTeamSpaceRatioTotalPages(res.data.totalPages || 1);
        } catch (e) {
            setTeamSpaceRatioData([]);
            setTeamSpaceRatioAvg(null);
            setTeamSpaceRatioTotalPages(1);
        } finally {
            setTeamSpaceRatioLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchSpaceData();
        fetchTeamSpaceRatio(1);
        setTeamSpaceRatioPage(1);
    }, [dateRange, fetchSpaceData, fetchTeamSpaceRatio]);

    const handleTeamSpaceRatioPageChange = (page) => {
        setTeamSpaceRatioPage(page);
        fetchTeamSpaceRatio(page);
    };

    const teamSpaceRatioColumns = [
        { title: '멤버 ID', dataIndex: 'memberId', key: 'memberId' },
        { title: '전체 스페이스 수', dataIndex: 'totalCount', key: 'totalCount' },
        { title: '팀 스페이스 수', dataIndex: 'teamCount', key: 'teamCount' },
        { title: '팀 스페이스 비율', key: 'ratio', render: (_, r) => r.totalCount > 0 ? `${((r.teamCount / r.totalCount) * 100).toFixed(1)}%` : '-' },
    ];

    return (
        <div>
            <Title level={3}>스페이스 분석</Title>

            {/* 진행중인 회고 관련 MOCK 지표 카드 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                <Col xs={24} md={8}>
                    <Card title="[🚨미구현, FE 도움 필요] 진행중인 회고 스페이스 클릭률">
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#1890ff', marginBottom: 8 }}>
                            {mockOngoingStats.spaceClickRate}%
                        </div>
                        <div style={{ color: '#888' }}>
                            (진행중인 회고가 있을 때 스페이스 클릭률)
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="[🚨미구현, FE 도움 필요] 테스크 진입/완료 비율">
                        <div style={{ marginBottom: 8 }}>
                            <span style={{ fontWeight: 500 }}>진입률: </span>
                            <span style={{ fontWeight: 700, color: '#52c41a' }}>{mockOngoingStats.taskEnterRate}%</span>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <span style={{ fontWeight: 500 }}>완료률: </span>
                            <span style={{ fontWeight: 700, color: '#faad14' }}>{mockOngoingStats.taskCompleteRate}%</span>
                        </div>
                        <Statistic
                            value={mockOngoingStats.taskCompleteRate}
                            suffix="%"
                            precision={1}
                            valueStyle={{ color: '#faad14' }}
                        />
                        <div style={{ color: '#888', marginTop: 8 }}>
                            (진행중인 회고 테스크에 들어간 비율과 완료한 비율)
                        </div>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="[🚨미구현, FE 도움 필요] 방치 비율">
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f', marginBottom: 8 }}>
                            {mockOngoingStats.abandonedRate}%
                        </div>
                        <div style={{ color: '#888' }}>
                            (진행중인 회고가 7일 이상 방치된 비율)
                        </div>
                    </Card>
                </Col>
            </Row>

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
                                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="모든 멤버의 팀스페이스 비율 평균" style={{ marginBottom: 16 }}>
                        <Statistic
                            value={teamSpaceRatioAvg !== null ? (teamSpaceRatioAvg * 100).toFixed(1) : '-'}
                            suffix="%"
                            precision={1}
                            loading={teamSpaceRatioLoading}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 32 }}>
                <Col xs={24}>
                    <Card title="각 멤버별 팀스페이스 비율" style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                            ※ 설정한 기간 동안 스페이스를 만들었거나, 스페이스에 합류한 멤버만 리스트에 표시됩니다.
                        </Text>
                        <Table
                            columns={teamSpaceRatioColumns}
                            dataSource={teamSpaceRatioData}
                            rowKey="memberId"
                            loading={teamSpaceRatioLoading}
                            pagination={false}
                            size="small"
                        />
                        <Pagination
                            current={teamSpaceRatioPage}
                            total={teamSpaceRatioTotalPages * 20}
                            pageSize={20}
                            onChange={handleTeamSpaceRatioPageChange}
                            style={{ marginTop: 16, textAlign: 'right' }}
                            showSizeChanger={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SpaceAnalytics;
