import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, DatePicker } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../utils/api';

const { Title, Text } = Typography;

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
            </Row>
        </div>
    );
};

export default RegistrationAnalytics;
