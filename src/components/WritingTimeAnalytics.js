import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Progress } from 'antd';
import { Histogram, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { getDateParams } from '../utils/dateParams';

const { Title, Text } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const WritingTimeAnalytics = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        timeDistribution: [],
        timeByTemplate: [],
        timeByUserType: [],
        timeTrends: []
    });

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
    }, [fetchWritingTimeData]);

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
            </Row>
        </div>
    );
};

export default WritingTimeAnalytics;
