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
                        <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
                            - 각 구간의 인원 수 = 선택한 기간 동안, 회고 작성에 걸린 시간이 해당 구간에 속하는 사용자 수입니다.
                            <br />
                            - 측정 방식: 진행중인 회고를 클릭하여 회고 질문 조회 시점부터 회고 작성 완료하여 [제출하기] 버튼을 누른 시점까지 측정
                            <br />
                            - 각 구간의 비율(%) = (해당 구간 인원 수 ÷ 모든 구간 인원 수 합계) × 100 을 계산한 뒤,
                            소수점 둘째 자리에서 반올림하여 소수점 첫째 자리까지 표시합니다.
                        </div>
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
                                <Tooltip
                                    formatter={(value, _name, { payload }) => [
                                        `${value}명 (${payload.percentage}%)`,
                                        '사용자 수',
                                    ]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="회고 작성 완수율 (평균)" loading={completionRateLoading}>
                        <Statistic
                            value={completionRate !== null ? completionRate.toFixed(1) : '-'}
                            suffix="%"
                            precision={1}
                        />
                        <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                            - 회고별 목표 답변 수 = 각 회고에 설정된 목표 답변 수(회고 생성했을 당시의 space 전체 인원 수)입니다.
                            <br />
                            - 회고별 실제 답변 수 = 선택한 기간 동안 해당 회고에 기록된 실제 답변 건수 입니다.
                            <br />
                            - 각 회고의 완수율(%) = (회고별 실제 답변 수 ÷ 회고별 목표 답변 수) × 100 으로 계산합니다.
                            <br />
                            - 화면에 보이는 값은, 위에서 계산된 <b>모든 회고별 완수율(%)의 산술 평균값</b>입니다.
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default WritingTimeAnalytics;
