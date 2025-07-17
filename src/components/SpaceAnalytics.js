import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Pagination } from 'antd';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { getDateParams } from '../utils/dateParams';
import { SpaceCategoryType } from '../constants/spaceCategoryType';

const { Title, Text } = Typography;

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

            const [teamVsIndividualRes] = await Promise.all([
                api.get('/admin/space/individual-vs-team', { params: { ...baseParams } }),
            ]);

            setData({
                teamVsIndividual: parseTeamVsIndividual(teamVsIndividualRes.data),
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
