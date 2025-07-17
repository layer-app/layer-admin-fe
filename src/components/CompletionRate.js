import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Typography, Progress } from 'antd';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const { Title, Text } = Typography;

const CompletionRate = ({ dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        overallCompletionRate: [],
        completionByTemplate: [],
        completionByTimeframe: [],
        completionTrends: [],
        completionStatus: [],
        userCompletionData: []
    });

    useEffect(() => {
        fetchCompletionData();
    }, [dateRange]);

    const fetchCompletionData = async () => {
        setLoading(true);
        try {
            // 실제 API 호출로 대체 예정
            const mockData = {
                overallCompletionRate: [
                    { status: '완료', count: 45678, percentage: 78.5 },
                    { status: '진행중', count: 8920, percentage: 15.3 },
                    { status: '미완료', count: 3602, percentage: 6.2 }
                ],
                completionByTemplate: [
                    { template: '일일 회고', completed: 18920, total: 21400, rate: 88.4 },
                    { template: '주간 회고', completed: 14200, total: 17000, rate: 83.5 },
                    { template: '월간 회고', completed: 10800, total: 13300, rate: 81.2 },
                    { template: '프로젝트 회고', completed: 8200, total: 10400, rate: 78.8 },
                    { template: '학습 회고', completed: 4558, total: 6100, rate: 74.7 }
                ],
                completionByTimeframe: [
                    { timeframe: '1일 이내', completed: 12500, total: 13500, rate: 92.6 },
                    { timeframe: '3일 이내', completed: 15800, total: 17200, rate: 91.9 },
                    { timeframe: '7일 이내', completed: 18900, total: 21000, rate: 90.0 },
                    { timeframe: '14일 이내', completed: 21000, total: 24000, rate: 87.5 },
                    { timeframe: '30일 이내', completed: 23500, total: 28000, rate: 83.9 },
                    { timeframe: '30일 초과', completed: 22178, total: 30200, rate: 73.4 }
                ],
                completionTrends: [
                    { month: '2024-01', rate: 75.2 },
                    { month: '2024-02', rate: 76.8 },
                    { month: '2024-03', rate: 78.1 },
                    { month: '2024-04', rate: 79.5 },
                    { month: '2024-05', rate: 80.2 },
                    { month: '2024-06', rate: 81.8 }
                ],
                completionStatus: [
                    { status: '완료', count: 45678, color: '#52c41a' },
                    { status: '진행중', count: 8920, color: '#faad14' },
                    { status: '미완료', count: 3602, color: '#f5222d' }
                ],
                userCompletionData: [
                    { userType: '신규 사용자', completionRate: 72.5, avgCompletionTime: 2.3 },
                    { userType: '경험 사용자', completionRate: 81.2, avgCompletionTime: 1.8 },
                    { userType: '전문 사용자', completionRate: 88.7, avgCompletionTime: 1.2 }
                ]
            };

            setData(mockData);
        } catch (error) {
            console.error('완료율 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const timeframeColumns = [
        {
            title: '기간',
            dataIndex: 'timeframe',
            key: 'timeframe',
        },
        {
            title: '완료 수',
            dataIndex: 'completed',
            key: 'completed',
            sorter: (a, b) => a.completed - b.completed,
        },
        {
            title: '총 수',
            dataIndex: 'total',
            key: 'total',
            sorter: (a, b) => a.total - b.total,
        },
        {
            title: '완료율',
            dataIndex: 'rate',
            key: 'rate',
            render: (rate) => (
                <div>
                    <Progress percent={rate} size="small" />
                    <Text>{rate}%</Text>
                </div>
            ),
            sorter: (a, b) => a.rate - b.rate,
        }
    ];

    return (
        <div>
            <Title level={3}>완료율 분석</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <Card title="[🚨 미구현] 완료율 추이" loading={loading}>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={data.completionTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${value}%`} />
                                <Line type="monotone" dataKey="rate" stroke="#52c41a" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title="[🚨 미구현] 기간별 상세 완료율" loading={loading}>
                        <Table
                            columns={timeframeColumns}
                            dataSource={data.completionByTimeframe}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CompletionRate;
