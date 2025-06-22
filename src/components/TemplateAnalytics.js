import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Table, Tabs, Typography, message } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

const { Title } = Typography;
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

    const fetchTemplateData = useCallback(async () => {
        setLoading(true);
        try {
            // 실제 API 호출
            const [topRecommendedResponse, topListResponse, mostUsedResponse] = await Promise.all([
                api.get('/admin/template/recommended-count'),
                api.get('/admin/template/recommended-count', {
                    params: {
                        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
                        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
                    }
                }),
                api.get('/admin/template/recommended-count', {
                    params: {
                        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
                        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
                    }
                })
            ]);

            // API 응답 데이터 처리
            const topRecommendedTemplates = topRecommendedResponse.data.map(item => ({
                name: item.formTag,
                count: item.recommendedCount,
                percentage: 0 // 나중에 계산
            }));

            // 전체 추천 수 계산 후 percentage 업데이트
            const totalRecommended = topRecommendedTemplates.reduce((sum, item) => sum + item.count, 0);
            console.log(totalRecommended);
            topRecommendedTemplates.forEach(item => {
                item.percentage = totalRecommended > 0 ? Math.round((item.count / totalRecommended) * 100 * 10) / 10 : 0;
            });

            const topListTemplates = topListResponse.data.map(item => ({
                name: item.templateName,
                count: item.listViewCount,
                percentage: item.percentage
            }));

            const mostUsedTemplates = mostUsedResponse.data.map(item => ({
                name: item.templateName,
                count: item.totalUsage,
                percentage: item.percentage
            }));

            // 추천받기 vs 리스트보기 비율 계산
            const totalRecommendations = topRecommendedTemplates.reduce((sum, item) => sum + item.count, 0);
            const totalListView = topListTemplates.reduce((sum, item) => sum + item.count, 0);
            const total = totalRecommendations + totalListView;

            const recommendationVsList = [
                {
                    name: '추천받기',
                    value: totalRecommendations,
                    fill: '#1890ff',
                    percentage: total > 0 ? Math.round((totalRecommendations / total) * 100) : 0
                },
                {
                    name: '리스트 보기',
                    value: totalListView,
                    fill: '#52c41a',
                    percentage: total > 0 ? Math.round((totalListView / total) * 100) : 0
                }
            ];

            // 템플릿별 선택 방식 비교 데이터 생성
            const templateUsageData = mostUsedTemplates.map(template => {
                const recommended = topRecommendedTemplates.find(r => r.name === template.name);
                const listView = topListTemplates.find(l => l.name === template.name);

                return {
                    name: template.name,
                    추천받기: recommended?.count || 0,
                    리스트보기: listView?.count || 0,
                    총사용: template.count
                };
            });

            setData({
                recommendationVsList,
                topRecommendedTemplates,
                topListTemplates,
                mostUsedTemplates,
                templateUsageData
            });

            message.success('템플릿 데이터를 성공적으로 불러왔습니다.');
        } catch (error) {
            console.error('템플릿 데이터 로딩 실패:', error);

            // API 호출 실패 시 임시 데이터 사용

            message.warning('API 호출에 실패하여 임시 데이터를 표시합니다.');
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchTemplateData();
    }, [fetchTemplateData]);

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
