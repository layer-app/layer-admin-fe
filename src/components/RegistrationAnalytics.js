import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, DatePicker } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { UserAddOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const RegistrationAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        dailyRegistrations: [],
        weeklyRegistrations: [],
        monthlyRegistrations: [],
        registrationTrends: [],
        registrationBySource: [],
        conversionFunnel: []
    });

    useEffect(() => {
        fetchRegistrationData();
    }, [dateRange]);

    const fetchRegistrationData = async () => {
        setLoading(true);
        try {
            // 실제 API 호출로 대체 예정
            const mockData = {
                dailyRegistrations: [
                    { date: '2024-06-01', registrations: 45, visitors: 1200, conversion: 3.75 },
                    { date: '2024-06-02', registrations: 52, visitors: 1350, conversion: 3.85 },
                    { date: '2024-06-03', registrations: 38, visitors: 980, conversion: 3.88 },
                    { date: '2024-06-04', registrations: 61, visitors: 1520, conversion: 4.01 },
                    { date: '2024-06-05', registrations: 48, visitors: 1180, conversion: 4.07 },
                    { date: '2024-06-06', registrations: 55, visitors: 1420, conversion: 3.87 },
                    { date: '2024-06-07', registrations: 42, visitors: 1100, conversion: 3.82 },
                    { date: '2024-06-08', registrations: 67, visitors: 1680, conversion: 3.99 },
                    { date: '2024-06-09', registrations: 58, visitors: 1450, conversion: 4.00 },
                    { date: '2024-06-10', registrations: 49, visitors: 1250, conversion: 3.92 }
                ],
                weeklyRegistrations: [
                    { week: '2024-W01', registrations: 320, visitors: 8500, conversion: 3.76 },
                    { week: '2024-W02', registrations: 345, visitors: 9200, conversion: 3.75 },
                    { week: '2024-W03', registrations: 298, visitors: 7800, conversion: 3.82 },
                    { week: '2024-W04', registrations: 378, visitors: 10200, conversion: 3.71 },
                    { week: '2024-W05', registrations: 412, visitors: 11200, conversion: 3.68 },
                    { week: '2024-W06', registrations: 389, visitors: 10500, conversion: 3.70 },
                    { week: '2024-W07', registrations: 356, visitors: 9500, conversion: 3.75 },
                    { week: '2024-W08', registrations: 423, visitors: 11500, conversion: 3.68 },
                    { week: '2024-W09', registrations: 398, visitors: 10800, conversion: 3.69 },
                    { week: '2024-W10', registrations: 445, visitors: 12200, conversion: 3.65 }
                ],
                monthlyRegistrations: [
                    { month: '2024-01', registrations: 1250, visitors: 35000, conversion: 3.57 },
                    { month: '2024-02', registrations: 1380, visitors: 38000, conversion: 3.63 },
                    { month: '2024-03', registrations: 1520, visitors: 42000, conversion: 3.62 },
                    { month: '2024-04', registrations: 1680, visitors: 46000, conversion: 3.65 },
                    { month: '2024-05', registrations: 1820, visitors: 50000, conversion: 3.64 },
                    { month: '2024-06', registrations: 1950, visitors: 54000, conversion: 3.61 }
                ],
                registrationTrends: [
                    { period: '1월', registrations: 1250, growth: 0 },
                    { period: '2월', registrations: 1380, growth: 10.4 },
                    { period: '3월', registrations: 1520, growth: 10.1 },
                    { period: '4월', registrations: 1680, growth: 10.5 },
                    { period: '5월', registrations: 1820, growth: 8.3 },
                    { period: '6월', registrations: 1950, growth: 7.1 }
                ],
                registrationBySource: [
                    { source: '직접 접속', registrations: 850, percentage: 43.6 },
                    { source: '검색 엔진', registrations: 620, percentage: 31.8 },
                    { source: '소셜 미디어', registrations: 320, percentage: 16.4 },
                    { source: '추천 링크', registrations: 160, percentage: 8.2 }
                ],
                conversionFunnel: [
                    { stage: '방문자', count: 54000, conversion: 100 },
                    { stage: '회원가입 페이지', count: 8100, conversion: 15.0 },
                    { stage: '회원가입 완료', count: 1950, conversion: 3.6 }
                ]
            };

            setData(mockData);
        } catch (error) {
            console.error('회원가입 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '날짜',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: '회원가입 수',
            dataIndex: 'registrations',
            key: 'registrations',
            sorter: (a, b) => a.registrations - b.registrations,
        },
        {
            title: '방문자 수',
            dataIndex: 'visitors',
            key: 'visitors',
            sorter: (a, b) => a.visitors - b.visitors,
        },
        {
            title: '전환율',
            dataIndex: 'conversion',
            key: 'conversion',
            render: (conversion) => `${conversion}%`,
            sorter: (a, b) => a.conversion - b.conversion,
        }
    ];

    const sourceColumns = [
        {
            title: '유입 경로',
            dataIndex: 'source',
            key: 'source',
        },
        {
            title: '회원가입 수',
            dataIndex: 'registrations',
            key: 'registrations',
            sorter: (a, b) => a.registrations - b.registrations,
        },
        {
            title: '비율',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (percentage) => `${percentage}%`,
            sorter: (a, b) => a.percentage - b.percentage,
        }
    ];

    const funnelColumns = [
        {
            title: '단계',
            dataIndex: 'stage',
            key: 'stage',
        },
        {
            title: '사용자 수',
            dataIndex: 'count',
            key: 'count',
            sorter: (a, b) => a.count - b.count,
        },
        {
            title: '전환율',
            dataIndex: 'conversion',
            key: 'conversion',
            render: (conversion) => `${conversion}%`,
            sorter: (a, b) => a.conversion - b.conversion,
        }
    ];

    return (
        <div>
            <Title level={3}>회원가입 분석</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="일별 회원가입 추이" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.dailyRegistrations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="registrations" stroke="#1890ff" fill="#1890ff" fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="월별 회원가입 성장률" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.registrationTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Bar dataKey="growth" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="회원가입 전환 퍼널" loading={loading}>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data.conversionFunnel} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="stage" type="category" />
                                <Tooltip formatter={(value) => value.toLocaleString()} />
                                <Bar dataKey="count" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="유입 경로별 회원가입" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.registrationBySource}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="source" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="registrations" fill="#faad14" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="주별 회원가입 추이" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.weeklyRegistrations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="registrations" stroke="#1890ff" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="일별 상세 회원가입 데이터" loading={loading}>
                        <Table
                            columns={columns}
                            dataSource={data.dailyRegistrations}
                            pagination={{ pageSize: 10 }}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="유입 경로별 상세" loading={loading}>
                        <Table
                            columns={sourceColumns}
                            dataSource={data.registrationBySource}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="전환 퍼널 상세" loading={loading}>
                        <Table
                            columns={funnelColumns}
                            dataSource={data.conversionFunnel}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default RegistrationAnalytics;
