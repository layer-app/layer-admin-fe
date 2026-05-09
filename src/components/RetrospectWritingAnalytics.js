import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Statistic } from 'antd';
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Legend,
    LineChart,
    Line,
    CartesianGrid,
} from 'recharts';
import api from '../utils/api';
import { getDateParams } from '../utils/dateParams';

const { Title } = Typography;

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CYCLE_COLORS = ['#007962', '#00C49F', '#57D7C1', '#FFBB28', '#FD8A8D'];

const formatNumber = (value) =>
    typeof value === 'number' && Number.isFinite(value) ? Math.floor(value).toLocaleString() : '-';

const formatPercent = (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
    return value === 0 ? '0%' : `${value.toFixed(1)}%`;
};

const formatMinutes = (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
    return value === 0 ? '0분' : `${value.toFixed(1)}분`;
};

const WritingTimeAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [completionRateLoading, setCompletionRateLoading] = useState(false);
    const [funnelLoading, setFunnelLoading] = useState(false);
    const [cycleDistLoading, setCycleDistLoading] = useState(false);
    const [cycleTrendLoading, setCycleTrendLoading] = useState(false);
    const [completionTrendLoading, setCompletionTrendLoading] = useState(false);

    const [completionRate, setCompletionRate] = useState(null);
    const [overview, setOverview] = useState({
        createdRetrospectCount: null,
        completedRetrospectCount: null,
        averageCompletionRate: null,
        averageRetrospectLength: null,
        averageWritingTimeMinutes: null,
    });
    const [data, setData] = useState({ timeDistribution: [] });
    const [funnel, setFunnel] = useState(null);
    const [cycleDist, setCycleDist] = useState(null);
    const [cycleTrend, setCycleTrend] = useState([]);
    const [completionTrend, setCompletionTrend] = useState([]);

    const fetchOverview = useCallback(async () => {
        setOverviewLoading(true);
        try {
            const res = await api.get('/admin/retrospect/overview', { params: getDateParams(dateRange) });
            const payload = res?.data || {};
            setOverview({
                createdRetrospectCount: payload.createdRetrospectCount ?? null,
                completedRetrospectCount: payload.completedRetrospectCount ?? null,
                averageCompletionRate: payload.averageCompletionRate ?? null,
                averageRetrospectLength: payload.averageRetrospectLength ?? null,
                averageWritingTimeMinutes: payload.averageWritingTimeMinutes ?? null,
            });
        } catch (error) {
            console.error('회고 작성 개요 데이터 로딩 실패:', error);
        } finally {
            setOverviewLoading(false);
        }
    }, [dateRange]);

    const fetchWritingTimeData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/retrospect/stay-time', { params: getDateParams(dateRange) });
            const raw = res.data;
            const total = raw.reduce((sum, item) => sum + item.count, 0);
            const timeDistribution = raw
                .filter(item => item.count > 0)
                .map(item => ({
                    range: item.answerTimeRangeLabel,
                    users: item.count,
                    percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
                }));
            setData({ timeDistribution });
        } catch (error) {
            console.error('작성 시간 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    const fetchCompletionRate = useCallback(async () => {
        setCompletionRateLoading(true);
        try {
            const res = await api.get('/admin/retrospect/completion-rate', { params: getDateParams(dateRange) });
            const payload = res?.data;
            const value = typeof payload === 'number'
                ? payload
                : (payload?.completionRate ?? payload?.averageCompletionRate ?? payload?.rate ?? null);
            setCompletionRate(typeof value === 'number' && Number.isFinite(value) ? value : null);
        } catch (error) {
            setCompletionRate(null);
            console.error('회고 작성 완수율 데이터 로딩 실패:', error);
        } finally {
            setCompletionRateLoading(false);
        }
    }, [dateRange]);

    const fetchFunnel = useCallback(async () => {
        setFunnelLoading(true);
        try {
            const res = await api.get('/admin/retrospect/funnel', { params: getDateParams(dateRange) });
            setFunnel(res.data);
        } catch (error) {
            console.error('퍼널 데이터 로딩 실패:', error);
        } finally {
            setFunnelLoading(false);
        }
    }, [dateRange]);

    const fetchCycleDist = useCallback(async () => {
        setCycleDistLoading(true);
        try {
            const res = await api.get('/admin/retrospect/writing-cycle/distribution', { params: getDateParams(dateRange) });
            setCycleDist(res.data);
        } catch (error) {
            console.error('작성 주기 분포 데이터 로딩 실패:', error);
        } finally {
            setCycleDistLoading(false);
        }
    }, [dateRange]);

    const fetchCycleTrend = useCallback(async () => {
        setCycleTrendLoading(true);
        try {
            const params = getDateParams(dateRange);
            const res = await api.get('/admin/retrospect/writing-cycle/monthly-trend', { params: { endDate: params.endDate } });
            setCycleTrend(res.data?.months ?? []);
        } catch (error) {
            console.error('작성 주기 월별 추이 로딩 실패:', error);
        } finally {
            setCycleTrendLoading(false);
        }
    }, [dateRange]);

    const fetchCompletionTrend = useCallback(async () => {
        setCompletionTrendLoading(true);
        try {
            const params = getDateParams(dateRange);
            const res = await api.get('/admin/retrospect/completion-trend', { params: { endDate: params.endDate } });
            setCompletionTrend(res.data?.months ?? []);
        } catch (error) {
            console.error('월별 완료율 추이 로딩 실패:', error);
        } finally {
            setCompletionTrendLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchOverview();
        fetchWritingTimeData();
        fetchCompletionRate();
        fetchFunnel();
        fetchCycleDist();
        fetchCycleTrend();
        fetchCompletionTrend();
    }, [fetchOverview, fetchWritingTimeData, fetchCompletionRate, fetchFunnel, fetchCycleDist, fetchCycleTrend, fetchCompletionTrend]);

    // Build cycle distribution bar chart data
    const cycleDistChartData = cycleDist?.distribution?.map((entry, i) => ({
        name: entry.label,
        비율: entry.percentage,
        fill: CYCLE_COLORS[i % CYCLE_COLORS.length],
    })) ?? [];

    // Build stacked bar chart for monthly cycle trend
    const cycleKeys = cycleDist?.distribution?.map(e => e.label) ?? [];
    const cycleTrendChartData = cycleTrend.map(m => {
        const row = { month: m.month };
        m.distribution.forEach(e => { row[e.label] = e.percentage; });
        return row;
    });

    // Funnel data
    const funnelSteps = funnel ? [
        { label: '생성', count: funnel.createdCount, rate: 100, color: '#00C49F' },
        { label: '시작 완수율', count: funnel.startedCount, rate: funnel.startedRate, color: '#34D399' },
        { label: '형식 완수율', count: funnel.qualityCount, rate: funnel.qualityRate, color: '#A78BFA' },
        { label: '제출 완수율', count: funnel.submittedCount, rate: funnel.submittedRate, color: '#F87171' },
    ] : [];

    return (
        <div>
            <Title level={3}>회고 작성 분석</Title>

            {/* KPI Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6} xl={4}>
                    <Card loading={overviewLoading}>
                        <Statistic title="생성된 회고 수" value={formatNumber(overview.createdRetrospectCount)} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6} xl={4}>
                    <Card loading={overviewLoading}>
                        <Statistic title="완료된 회고 수" value={formatNumber(overview.completedRetrospectCount)} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6} xl={5}>
                    <Card loading={overviewLoading}>
                        <Statistic title="평균 완수율" value={formatPercent(overview.averageCompletionRate)} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6} xl={5}>
                    <Card loading={overviewLoading}>
                        <Statistic title="평균 회고 길이" value={formatNumber(overview.averageRetrospectLength)} suffix="자" />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8} xl={6}>
                    <Card loading={overviewLoading}>
                        <Statistic title="평균 작성 시간" value={formatMinutes(overview.averageWritingTimeMinutes)} />
                    </Card>
                </Col>
            </Row>

            {/* Completion rate + Time distribution */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}>
                    <Card title="회고 작성 완수율 (평균)" loading={completionRateLoading}>
                        <Statistic value={formatPercent(completionRate)} />
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
                <Col xs={24} lg={12}>
                    <Card title="작성 시간 분포" loading={loading}>
                        <div style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
                            - 측정: 회고 질문 조회 시점부터 [제출하기] 버튼 클릭 시점까지
                            <br />
                            - 각 구간 비율 = (구간 인원 수 ÷ 전체 인원 수) × 100
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={data.timeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ range, percentage }) => `${range} ${percentage}%`}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="users"
                                >
                                    {data.timeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
            </Row>

            {/* 작성 습관 section */}
            <div style={{ marginTop: 28, marginBottom: 10, fontSize: 13, fontWeight: 600, color: '#8A98A6', borderBottom: '1px solid #E2E8EF', paddingBottom: 8 }}>
                작성 습관
            </div>

            <Row gutter={[16, 16]}>
                {/* Writing Cycle Distribution */}
                <Col xs={24} lg={12}>
                    <Card
                        title="작성 주기별 유저 분포"
                        loading={cycleDistLoading}
                        extra={cycleDist ? <span style={{ fontSize: 12, color: '#5A6B7C' }}>평균 작성 주기 <b style={{ color: '#004336' }}>{cycleDist.averageIntervalDays.toFixed(1)}일</b></span> : null}
                    >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                            {CYCLE_COLORS.map((color, i) => {
                                const labels = ['주기적 (7일↓)', '격주~월 (8~30일)', '분기적 (31~90일)', '비정기 (91~180일)', '휴면 (181일+)'];
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5A6B7C' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                                        {labels[i]}
                                    </div>
                                );
                            })}
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={cycleDistChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(val) => [`${val}%`, '비율']} />
                                <Bar dataKey="비율" radius={[4, 4, 0, 0]}>
                                    {cycleDistChartData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Monthly Cycle Trend */}
                <Col xs={24} lg={12}>
                    <Card title="작성 주기 분포 월별 추이" loading={cycleTrendLoading}
                        extra={<span style={{ fontSize: 11, color: '#8A98A6' }}>최근 6개월</span>}
                    >
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={cycleTrendChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(val, name) => [`${val}%`, name]} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                {cycleKeys.map((key, i) => (
                                    <Bar key={key} dataKey={key} stackId="a" fill={CYCLE_COLORS[i % CYCLE_COLORS.length]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* 완료 현황 section */}
            <div style={{ marginTop: 28, marginBottom: 10, fontSize: 13, fontWeight: 600, color: '#8A98A6', borderBottom: '1px solid #E2E8EF', paddingBottom: 8 }}>
                완료 현황
            </div>

            <Row gutter={[16, 16]}>
                {/* Funnel */}
                <Col xs={24} lg={12}>
                    <Card title="회고 완수 퍼널" loading={funnelLoading}
                        extra={<span style={{ fontSize: 11, color: '#8A98A6' }}>선택 기간 내 생성된 회고 기준</span>}
                    >
                        {funnelSteps.map((step, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, width: 80, textAlign: 'right', flexShrink: 0, color: step.color }}>
                                        {step.label}
                                    </span>
                                    <div style={{ flex: 1, height: 28, background: '#F0F4F8', borderRadius: 6, overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(step.rate, 100)}%`,
                                            height: '100%',
                                            background: step.color,
                                            borderRadius: 6,
                                            display: 'flex',
                                            alignItems: 'center',
                                            paddingLeft: 10,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: '#fff',
                                            transition: 'width 0.4s ease',
                                        }}>
                                            {step.rate.toFixed(1)}% · {step.count.toLocaleString()}건
                                        </div>
                                    </div>
                                </div>
                                {i < funnelSteps.length - 1 && (
                                    <div style={{ fontSize: 11, color: '#FF4D4F', paddingLeft: 94, marginBottom: 4 }}>
                                        ▼ {(step.rate - funnelSteps[i + 1].rate).toFixed(1)}% 미진행
                                    </div>
                                )}
                            </div>
                        ))}
                        {!funnel && !funnelLoading && (
                            <span style={{ color: '#8A98A6', fontSize: 13 }}>데이터가 없습니다.</span>
                        )}
                    </Card>
                </Col>

                {/* Monthly Completion Rate Trend */}
                <Col xs={24} lg={12}>
                    <Card title="월별 제출 완료율 추이" loading={completionTrendLoading}
                        extra={<span style={{ fontSize: 11, color: '#8A98A6' }}>최근 12개월</span>}
                    >
                        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                            {[
                                { label: '전체 완료율', color: '#8A98A6' },
                                { label: '팀 완료율', color: '#1677FF' },
                                { label: '개인 완료율', color: '#00C49F' },
                            ].map(({ label, color }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#5A6B7C' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                                    {label}
                                </div>
                            ))}
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={completionTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(val, name) => [`${val.toFixed(1)}%`, name]} />
                                <Line type="monotone" dataKey="overallRate" name="전체 완료율" stroke="#8A98A6" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="teamRate" name="팀 완료율" stroke="#1677FF" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="individualRate" name="개인 완료율" stroke="#00C49F" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default WritingTimeAnalytics;
