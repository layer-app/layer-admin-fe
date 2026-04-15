import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Table, Tabs, Typography } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { TemplateChoiceType } from '../constants/templateChoiceType';
import { getDateParams } from '../utils/dateParams';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

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
            const baseParams = getDateParams(dateRange);
            // 실제 API 호출
            const [mostUsedResponse, topRecommendedResponse, topListViewResponse] = await Promise.all([
                api.get('/admin/template/choice-count', {
                    params: {
                        ...baseParams
                    }
                }),
                api.get('/admin/template/choice-count', {
                    params: {
                        ...baseParams,
                        choiceType: TemplateChoiceType.RECOMMENDATION
                    }
                }),
                api.get('/admin/template/choice-count', {
                    params: {
                        ...baseParams,
                        choiceType: TemplateChoiceType.LIST_VIEW
                    }
                })
            ]);

            // API 응답 데이터 처리
            const mostUsedTemplates = mostUsedResponse.data.map(item => ({
                name: item.formTag,
                count: item.recommendedCount,
                percentage: 0
            }));

            const topRecommendedTemplates = topRecommendedResponse.data.map(item => ({
                name: item.formTag,
                count: item.recommendedCount,
                percentage: 0 // 나중에 계산
            }));
            const totalRecommendedCount = topRecommendedTemplates.reduce((sum, item) => sum + item.count, 0);
            topRecommendedTemplates.forEach(item => {
                item.percentage = totalRecommendedCount > 0 ? Math.round((item.count / totalRecommendedCount) * 100 * 10) / 10 : 0;
            });

            const topListViewTemplates = topListViewResponse.data.map(item => ({
                name: item.formTag,
                count: item.recommendedCount,
                percentage: 0
            }));
            const totalListViewCount = topListViewTemplates.reduce((sum, item) => sum + item.count, 0);
            topListViewTemplates.forEach(item => {
                item.percentage = totalListViewCount > 0 ? Math.round((item.count / totalListViewCount) * 100 * 10) / 10 : 0;
            });

            // 추천받기 vs 리스트보기 비율 계산
            const total = totalRecommendedCount + totalListViewCount;
            const recommendationVsList = [
                {
                    name: '추천받기',
                    value: totalRecommendedCount,
                    fill: '#1890ff',
                    percentage: total > 0 ? Math.round((totalRecommendedCount / total) * 100) : 0
                },
                {
                    name: '리스트 보기',
                    value: totalListViewCount,
                    fill: '#52c41a',
                    percentage: total > 0 ? Math.round((totalListViewCount / total) * 100) : 0
                }
            ];

            // 템플릿별 선택 방식 비교 데이터 생성
            const templateUsageData = mostUsedTemplates.map(template => {
                const recommended = topRecommendedTemplates.find(r => r.name === template.name);
                const listView = topListViewTemplates.find(l => l.name === template.name);

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
                topListViewTemplates,
                mostUsedTemplates,
                templateUsageData
            });

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
                <Card title="[🚨FE 쿼리 param 추가 필요] 추천받기 vs 리스트보기 비율" loading={loading}>
                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                        추천받기 비율 = (기간 내 추천받기로 선택된 템플릿 수 합계 ÷ (추천받기로 선택된 템플릿 수 합계 + 리스트 보기로 선택된 템플릿 수 합계)) × 100
                        <br />
                        리스트 보기 비율 = (기간 내 리스트 보기로 선택된 템플릿 수 합계 ÷ (추천받기로 선택된 템플릿 수 합계 + 리스트 보기로 선택된 템플릿 수 합계)) × 100
                        <br />
                        실제 표시는 소수점 이하를 반올림한 정수(%)입니다.
                    </Paragraph>
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
                            <Tooltip
                                formatter={(value, _name, { payload }) => [
                                    `${value}회 (${payload.percentage}%)`,
                                    '선택 수',
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </Col>

            <Col xs={24} md={12}>
                <Card title="가장 많이 사용되는 템플릿" loading={loading}>
                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                        사용 횟수 = 선택 방식(추천받기, 리스트 보기)을 모두 합산한, 기간 내 해당 템플릿이 선택된 총 횟수입니다.
                    </Paragraph>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.mostUsedTemplates}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => [`${value}회`, '선택 수']}
                            />
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
                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                        사용 횟수 = 기간 내 해당 템플릿이 추천받기로 선택된 횟수입니다.
                        <br />
                        비율(%) = (해당 템플릿의 사용 횟수 ÷ TOP 5 템플릿들의 사용 횟수 합계) × 100,
                        소수점 첫째 자리에서 반올림하여 표시합니다.
                    </Paragraph>
                    <Table
                        columns={columns}
                        dataSource={data.topRecommendedTemplates}
                        pagination={false}
                        size="small"
                    />
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title="[🚨미구현, FE 도움 필요] 리스트보기로 선택된 템플릿 TOP 5" loading={loading}>
                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                        사용 횟수 = 기간 내 해당 템플릿이 리스트 보기에서 선택된 횟수입니다.
                        <br />
                        비율(%) = (해당 템플릿의 사용 횟수 ÷ TOP 5 템플릿들의 사용 횟수 합계) × 100,
                        소수점 첫째 자리에서 반올림하여 표시합니다.
                    </Paragraph>
                    <Table
                        columns={columns}
                        dataSource={data.topListViewTemplates}
                        pagination={false}
                        size="small"
                    />
                </Card>
            </Col>

            <Col xs={24}>
                <Card title="[🚨미구현, FE 도움 필요] 템플릿별 선택 방식 비교" loading={loading}>
                    <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                        추천받기 = 기간 내 해당 템플릿이 추천받기로 선택된 횟수입니다.
                        <br />
                        리스트보기 = 기간 내 해당 템플릿이 리스트 보기에서 선택된 횟수입니다.
                        <br />
                        총사용 = 추천받기 횟수 + 리스트보기 횟수로 계산된, 템플릿의 전체 사용 횟수입니다.
                    </Paragraph>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.templateUsageData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                formatter={(value, name) => [`${value}회`, name]}
                            />
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
        <Card title="[🚨FE 쿼리 param 추가 필요] 템플릿 분석" loading={loading}>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                추천받기 비율 = (기간 내 추천받기로 선택된 템플릿 수 합계 ÷ (추천받기로 선택된 템플릿 수 합계 + 리스트 보기로 선택된 템플릿 수 합계)) × 100
                <br />
                리스트 보기 비율 = (기간 내 리스트 보기로 선택된 템플릿 수 합계 ÷ (추천받기로 선택된 템플릿 수 합계 + 리스트 보기로 선택된 템플릿 수 합계)) × 100
                <br />
                실제 표시는 소수점 이하를 반올림한 정수(%)입니다.
            </Paragraph>
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
                    <Tooltip
                        formatter={(value, _name, { payload }) => [
                            `${value}회 (${payload.percentage}%)`,
                            '선택 수',
                        ]}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default TemplateAnalytics;
