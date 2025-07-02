import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, DatePicker } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { UserAddOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../utils/api';

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
        if (!dateRange || dateRange.length !== 2) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/admin/member/signup-count',
                    {
                        params: {
                            startDate: dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
                            endDate: dateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss')
                        }
                    }
                );

                const apiData = response.data;
                const dailyRegistrations = apiData.map(item => ({
                    date: item.signupDate,
                    registrations: item.signupCount
                }));

                setData(prev => ({
                    ...prev,
                    dailyRegistrations
                }));
            } catch (error) {
                console.error('회원가입 통계 데이터 불러오기 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

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
                    <Card title="[🚨 미구현] 월별 회원가입 성장률" loading={loading}>
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
                    <Card title="[🚨 미구현] 회원가입 전환 퍼널" loading={loading}>
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
                    <Card title="[🚨 미구현] 유입 경로별 회원가입" loading={loading}>
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
                    <Card title="[🚨 미구현] 주별 회원가입 추이" loading={loading}>
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
                    <Card title="[🚨 미구현] 일별 상세 회원가입 데이터" loading={loading}>
                        <Table
                            columns={columns}
                            dataSource={data.dailyRegistrations}
                            pagination={{ pageSize: 10 }}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="[미구현] 유입 경로별 상세" loading={loading}>
                        <Table
                            columns={sourceColumns}
                            dataSource={data.registrationBySource}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="[🚨 미구현] 전환 퍼널 상세" loading={loading}>
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
