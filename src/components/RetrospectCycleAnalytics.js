import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
} from 'recharts';
import api from '../utils/api';
import { getDateParams } from '../utils/dateParams';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const fmt = (val) =>
    val === null || val === undefined ? '-' : `${Math.round(val * 10) / 10}일`;

const RetrospectCycleAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/retrospect/creation-cycle', {
                params: getDateParams(dateRange),
            });
            setData(res.data);
        } catch (err) {
            console.error('회고 생성 주기 데이터 로딩 실패:', err);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartData = data?.distribution?.map((entry) => ({
        name: entry.label,
        percentage: entry.percentage,
    })) ?? [];

    return (
        <div>
            <Title level={3}>평균 회고 생성 주기 분석</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card title="전체 평균" loading={loading}>
                        <Statistic
                            value={data ? fmt(data.overallAverageDays) : '-'}
                            valueStyle={{ fontSize: 28 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            팀·개인 회고 포함, 유저별 연속 생성 간격의 평균
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card title="팀 회고 평균" loading={loading}>
                        <Statistic
                            value={data ? fmt(data.teamAverageDays) : '-'}
                            valueStyle={{ fontSize: 28 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            팀 스페이스 내 연속 회고 생성 간격의 평균
                        </Text>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card title="개인 회고 평균" loading={loading}>
                        <Statistic
                            value={data ? fmt(data.individualAverageDays) : '-'}
                            valueStyle={{ fontSize: 28 }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            개인 스페이스 내 연속 회고 생성 간격의 평균
                        </Text>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card title="생성 주기별 유저 분포" loading={loading}>
                        <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
                            - 2회 이상 회고를 생성한 유저를 대상으로, 유저별 평균 생성 간격(일)을 기준으로 분포를 나타냅니다.
                            <br />
                            - 비율(%) = (해당 구간 유저 수 ÷ 전체 대상 유저 수) × 100, 소수점 첫째 자리까지 표시
                        </div>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis unit="%" domain={[0, 100]} />
                                    <Tooltip formatter={(val) => [`${val}%`, '비율']} />
                                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                                        {chartData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Text type="secondary">데이터가 없습니다.</Text>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default RetrospectCycleAnalytics;
