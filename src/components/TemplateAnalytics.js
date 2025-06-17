import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tabs, Typography } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileTextOutlined, StarOutlined, UnorderedListOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const TemplateAnalytics = ({ dateRange, fullWidth = false }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        recommendationVsList: [],
        topRecommendedTemplates: [],
        topListTemplates: [],
        mostUsedTemplates: [],
        templateUsageData: []
    });

    useEffect(() => {
        fetchTemplateData();
    }, [dateRange]);

    const fetchTemplateData = async () => {
        setLoading(true);
        try {
            // TODO: 실제 API 호출로 대체 예정
            // 임시 데이터
            const mockData = {
                recommendationVsList: [
                    { name: '추천받기', value: 65, fill: '#1890ff' },
                    { name: '리스트 보기', value: 35, fill: '#52c41a' }
                ],
                topRecommendedTemplates: [
                    { name: '일일 회고', count: 1250, percentage: 28.5 },
                    { name: '주간 회고', count: 980, percentage: 22.3 },
                    { name: '월간 회고', count: 750, percentage: 17.1 },
                    { name: '프로젝트 회고', count: 620, percentage: 14.2 },
                    { name: '학습 회고', count: 450, percentage: 10.3 }
                ],
                topListTemplates: [
                    { name: '일일 회고', count: 890, percentage: 32.1 },
                    { name: '주간 회고', count: 720, percentage: 26.0 },
                    { name: '월간 회고', count: 580, percentage: 20.9 },
                    { name: '프로젝트 회고', count: 420, percentage: 15.2 },
                    { name: '학습 회고', count: 160, percentage: 5.8 }
                ],
                mostUsedTemplates: [
                    { name: '일일 회고', count: 2140, percentage: 31.2 },
                    { name: '주간 회고', count: 1700, percentage: 24.8 },
                    { name: '월간 회고', count: 1330, percentage: 19.4 },
                    { name: '프로젝트 회고', count: 1040, percentage: 15.2 },
                    { name: '학습 회고', count: 610, percentage: 8.9 }
                ],
                templateUsageData: [
                    { name: '일일 회고', 추천받기: 1250, 리스트보기: 890, 총사용: 2140 },
                    { name: '주간 회고', 추천받기: 980, 리스트보기: 720, 총사용: 1700 },
                    { name: '월간 회고', 추천받기: 750, 리스트보기: 580, 총사용: 1330 },
                    { name: '프로젝트 회고', 추천받기: 620, 리스트보기: 420, 총사용: 1040 },
                    { name: '학습 회고', 추천받기: 450, 리스트보기: 160, 총사용: 610 }
                ]
            };

            setData(mockData);
        } catch (error) {
            console.error('템플릿 데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '템플릿명',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '사용 횟수',
            dataIndex: 'count',
            key: 'count',
            sorter: (a, b) => a.count - b.count,
        },
        {
            title: '비율',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (percentage) => `${percentage}%`,
            sorter: (a, b) => a.percentage - b.percentage,
        }
    ];

    const renderOverview = () => (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
                <Card title="추천받기 vs 리스트보기 비율" loading={loading}>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={data.recommendationVsList}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.recommendationVsList.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </Col>

            <Col xs={24} md={12}>
                <Card title="가장 많이 사용되는 템플릿" loading={loading}>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.mostUsedTemplates}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#1890ff" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );

    const renderDetailedAnalysis = () => (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
                <Card title="추천받기로 선택된 템플릿 TOP 5" loading={loading}>
                    <Table
                        columns={columns}
                        dataSource={data.topRecommendedTemplates}
                        pagination={false}
                        size="small"
                    />
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title="리스트보기로 선택된 템플릿 TOP 5" loading={loading}>
                    <Table
                        columns={columns}
                        dataSource={data.topListTemplates}
                        pagination={false}
                        size="small"
                    />
                </Card>
            </Col>

            <Col xs={24}>
                <Card title="템플릿별 선택 방식 비교" loading={loading}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.templateUsageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="추천받기" fill="#1890ff" />
                            <Bar dataKey="리스트보기" fill="#52c41a" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </Row>
    );

    if (fullWidth) {
        return (
            <div>
                <Title level={3}>템플릿 분석</Title>
                <Tabs defaultActiveKey="overview">
                    <TabPane tab="개요" key="overview">
                        {renderOverview()}
                    </TabPane>
                    <TabPane tab="상세 분석" key="detailed">
                        {renderDetailedAnalysis()}
                    </TabPane>
                </Tabs>
            </div>
        );
    }

    return (
        <Card title="템플릿 분석" loading={loading}>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={data.recommendationVsList}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.recommendationVsList.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default TemplateAnalytics;
