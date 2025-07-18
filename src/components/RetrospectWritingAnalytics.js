import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { getDateParams } from '../utils/dateParams';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const WritingTimeAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [completionRateLoading, setCompletionRateLoading] = useState(false);
    const [completionRate, setCompletionRate] = useState(null);
    const [data, setData] = useState({
        timeDistribution: [],
        timeByTemplate: [],
        timeByUserType: [],
        timeTrends: []
    });

    // 회고 작성 완수율 데이터 패칭
    const fetchCompletionRate = useCallback(async () => {
        setCompletionRateLoading(true);
        try {
            const baseParams = getDateParams(dateRange);
            const res = await api.get('/admin/retrospect/completion-rate', { params: { ...baseParams } });
            setCompletionRate(res.data.completionRate);
        } catch (error) {
            setCompletionRate(null);
            console.error('회고 작성 완수율 데이터 로딩 실패:', error);
        } finally {
            setCompletionRateLoading(false);
        }
    }, [dateRange]);

    const fetchWritingTimeData = useCallback(async () => {
        setLoading(true);
        try {
            const baseParams = getDateParams(dateRange);
            const timeDistRes = await api.get('/admin/retrospect/stay-time', { params: { ...baseParams } });
            const raw = timeDistRes.data;
            const total = raw.reduce((sum, item) => sum + item.count, 0);
            const timeDistribution = raw
                .filter(item => item.count > 0)
                .map(item => ({
                    range: item.answerTimeRangeLabel,
                    users: item.count,
                    percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0
                }));

            setData(prev => ({
                ...prev,
                timeDistribution
            }));
        } catch (error) {
            console.error('작성 시간 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchWritingTimeData();
        fetchCompletionRate();
    }, [fetchWritingTimeData, fetchCompletionRate]);

    return (
        <div>
            <Title level={3}>회고 작성 분석</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="작성 시간 분포" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.timeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ range, percentage }) => `${range} ${percentage}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="users"
                                >
                                    {data.timeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="회고 작성 완수율" loading={completionRateLoading}>
                        <Statistic
                            value={completionRate !== null ? (completionRate * 100).toFixed(1) : '-'}
                            suffix="%"
                            precision={1}
                        />
                        <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                            (선택한 기간 내 회고 작성 완수율을 의미합니다)
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default WritingTimeAnalytics;
