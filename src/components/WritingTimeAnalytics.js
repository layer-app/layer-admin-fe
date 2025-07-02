import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Progress } from 'antd';
import { Histogram, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const WritingTimeAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        averageWritingTime: [],
        timeDistribution: [],
        timeByTemplate: [],
        timeByUserType: [],
        timeTrends: []
    });

    useEffect(() => {
        fetchWritingTimeData();
    }, [dateRange]);

    const fetchWritingTimeData = async () => {
        setLoading(true);
        try {
            // 실제 API 호출로 대체 예정
            const mockData = {
                averageWritingTime: [
                    { template: '일일 회고', avgTime: 8.5, medianTime: 7.2 },
                    { template: '주간 회고', avgTime: 15.3, medianTime: 13.8 },
                    { template: '월간 회고', avgTime: 25.7, medianTime: 22.1 },
                    { template: '프로젝트 회고', avgTime: 32.4, medianTime: 28.5 },
                    { template: '학습 회고', avgTime: 18.9, medianTime: 16.3 }
                ],
                timeDistribution: [
                    { range: '0-5분', users: 1250, percentage: 18.5 },
                    { range: '5-10분', users: 2100, percentage: 31.2 },
                    { range: '10-15분', users: 1800, percentage: 26.8 },
                    { range: '15-20분', users: 980, percentage: 14.6 },
                    { range: '20-30분', users: 420, percentage: 6.2 },
                    { range: '30분+', users: 180, percentage: 2.7 }
                ],
                timeByTemplate: [
                    { template: '일일 회고', '0-5분': 45, '5-10분': 35, '10-15분': 15, '15분+': 5 },
                    { template: '주간 회고', '0-5분': 15, '5-10분': 25, '10-15분': 35, '15분+': 25 },
                    { template: '월간 회고', '0-5분': 5, '5-10분': 15, '10-15분': 25, '15분+': 55 },
                    { template: '프로젝트 회고', '0-5분': 2, '5-10분': 8, '10-15분': 20, '15분+': 70 },
                    { template: '학습 회고', '0-5분': 10, '5-10분': 20, '10-15분': 30, '15분+': 40 }
                ],
                timeByUserType: [
                    { userType: '신규 사용자', avgTime: 12.5 },
                    { userType: '경험 사용자', avgTime: 18.3 },
                    { userType: '전문 사용자', avgTime: 22.7 }
                ],
                timeTrends: [
                    { date: '2024-01', avgTime: 15.2 },
                    { date: '2024-02', avgTime: 16.1 },
                    { date: '2024-03', avgTime: 17.3 },
                    { date: '2024-04', avgTime: 16.8 },
                    { date: '2024-05', avgTime: 18.5 },
                    { date: '2024-06', avgTime: 19.2 }
                ]
            };

            setData(mockData);
        } catch (error) {
            console.error('작성 시간 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '템플릿',
            dataIndex: 'template',
            key: 'template',
        },
        {
            title: '평균 시간',
            dataIndex: 'avgTime',
            key: 'avgTime',
            render: (time) => `${time}분`,
            sorter: (a, b) => a.avgTime - b.avgTime,
        },
        {
            title: '중간값',
            dataIndex: 'medianTime',
            key: 'medianTime',
            render: (time) => `${time}분`,
            sorter: (a, b) => a.medianTime - b.medianTime,
        }
    ];

    const userTypeColumns = [
        {
            title: '사용자 유형',
            dataIndex: 'userType',
            key: 'userType',
        },
        {
            title: '평균 작성 시간',
            dataIndex: 'avgTime',
            key: 'avgTime',
            render: (time) => `${time}분`,
            sorter: (a, b) => a.avgTime - b.avgTime,
        }
    ];

    return (
        <div>
            <Title level={3}>작성 시간 분석</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="[🚨 미구현] 템플릿별 평균 작성 시간" loading={loading}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.averageWritingTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="template" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value}분`} />
                                <Legend />
                                <Bar dataKey="avgTime" fill="#1890ff" name="평균 시간" />
                                <Bar dataKey="medianTime" fill="#52c41a" name="중간값" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="[🚨 미구현] 작성 시간 분포" loading={loading}>
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

                <Col xs={24}>
                    <Card title="[🚨 미구현] 템플릿별 작성 시간 분포" loading={loading}>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={data.timeByTemplate}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="template" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Legend />
                                <Bar dataKey="0-5분" fill="#52c41a" stackId="a" />
                                <Bar dataKey="5-10분" fill="#1890ff" stackId="a" />
                                <Bar dataKey="10-15분" fill="#faad14" stackId="a" />
                                <Bar dataKey="15분+" fill="#f5222d" stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="[🚨 미구현] 사용자 유형별 평균 작성 시간" loading={loading}>
                        <Table
                            columns={userTypeColumns}
                            dataSource={data.timeByUserType}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="[🚨 미구현] 작성 시간 추이" loading={loading}>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data.timeTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value}분`} />
                                <Line type="monotone" dataKey="avgTime" stroke="#1890ff" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="[🚨 미구현] 템플릿별 상세 작성 시간 통계" loading={loading}>
                        <Table
                            columns={columns}
                            dataSource={data.averageWritingTime}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default WritingTimeAnalytics;
