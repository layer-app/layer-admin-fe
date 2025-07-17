import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tabs, Typography, Tag } from 'antd';
import { Tooltip, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import { getDateParams } from '../utils/dateParams';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// 사람이 읽기 쉬운 시간 단위로 변환하는 함수
function getHumanReadableDuration(seconds) {
    if (seconds == null) return '-';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}시간`;
    const days = Math.round(hours / 24);
    if (days < 365) return `${days}일`;
    const years = Math.round(days / 365);
    return `${years}년`;
}

const UserRetention = ({ dateRange, fullWidth = false }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        firstRetrospectiveRetention: [],
        periodicRetrospectiveUsers: [],
        retentionByPeriod: [],
        userRetentionData: [],
        userActivity: []
    });
    const [minCount, setMinCount] = useState(1);
    const [minLength, setMinLength] = useState(1);
    const [filteredRatio, setFilteredRatio] = useState(null);
    const [filteredLoading, setFilteredLoading] = useState(false);
    const [filteredCount, setFilteredCount] = useState(null);
    const [totalCount, setTotalCount] = useState(null);
    const [retentionPeriodSeconds, setRetentionPeriodSeconds] = useState(null);
    const [retentionCreateCount, setRetentionCreateCount] = useState(null);
    const [retentionTotalMemberCount, setRetentionTotalMemberCount] = useState(null);
    const [averageCumulativeCount, setAverageCumulativeCount] = useState(null);

    useEffect(() => {
        fetchCreateRetention();
        fetchAverageCumulativeCount();
    }, [dateRange]);

    const fetchCreateRetention = async () => {
        try {
            const baseParams = getDateParams(dateRange);
            const res = await api.get('/admin/retrospect/retention', { params: baseParams });
            setRetentionPeriodSeconds(res.data.retrospectRetentionPeriodSeconds);
            setRetentionCreateCount(res.data.retrospectCreateCount);
            setRetentionTotalMemberCount(res.data.totalMemberCount);
        } catch (e) {
            setRetentionPeriodSeconds(null);
            setRetentionCreateCount(null);
            setRetentionTotalMemberCount(null);
        }
    };

    // 평균 누적 회고 수 패칭 함수
    const fetchAverageCumulativeCount = async () => {
        try {
            const baseParams = getDateParams(dateRange);
            const res = await api.get('/admin/retrospect/cumulative-count', { params: baseParams });
            setAverageCumulativeCount(res.data.averageCumulativeCount);
        } catch (e) {
            setAverageCumulativeCount(null);
        }
    };

    const handleApplyFilter = async () => {
        if (!dateRange || !dateRange[0] || !dateRange[1]) {
            setFilteredRatio(null);
            setFilteredCount(null);
            setTotalCount(null);
            return;
        }
        setFilteredLoading(true);
        try {
            const baseParams = getDateParams(dateRange);
            const response = await api.get('/admin/retrospect/meaningful', {
                params: {
                    ...baseParams,
                    retrospectLength: minLength,
                    retrospectCount: minCount,
                },
            });
            const { meaningfulMemberCount, totalMemberCount } = response.data;
            setFilteredCount(meaningfulMemberCount);
            setTotalCount(totalMemberCount);
            if (totalMemberCount === 0) {
                setFilteredRatio('0.0');
            } else {
                setFilteredRatio(((meaningfulMemberCount / totalMemberCount) * 100).toFixed(1));
            }
        } catch (e) {
            setFilteredRatio(null);
            setFilteredCount(null);
            setTotalCount(null);
        } finally {
            setFilteredLoading(false);
        }
    };

    const renderOverview = () => (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Card title="회고 생성 리텐션 기간" loading={loading} style={{ marginBottom: 16, flex: 1 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                            {retentionPeriodSeconds !== null ? getHumanReadableDuration(retentionPeriodSeconds) : '-'}
                        </div>
                        <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
                            (평균적으로 해당 기간 동안 첫 회고 생성 후 {retentionPeriodSeconds !== null ? getHumanReadableDuration(retentionPeriodSeconds) : '-'} 후에 다음 회고가 생성됨)
                        </div>
                        <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
                            (해당 기간동안 만약 특정 유저가 여러 회고를 작성한 경우, 가장 짧은 기간을 선택하여 평균에 합산)
                        </div>
                    </Card>
                    <Card title="스페이스당 누적 평균 회고 수" loading={loading} style={{ flex: 1 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                            {averageCumulativeCount !== null ? averageCumulativeCount : '-'}
                        </div>
                        <div style={{ color: '#888', fontSize: 13 }}>
                            (선택한 기간 내 모든 스페이스의 누적 회고 수의 평균값)
                        </div>
                    </Card>
                </div>
            </Col>
            {/* 오른쪽: 기존 카드 */}
            <Col xs={24} md={12}>
                <Card title="회고 생성 리텐션 비율" loading={loading} style={{ height: '100%' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                        {retentionCreateCount !== null && retentionTotalMemberCount !== null
                            ? `${retentionCreateCount} / ${retentionTotalMemberCount}명 (${retentionTotalMemberCount > 0 ? ((retentionCreateCount / retentionTotalMemberCount) * 100).toFixed(1) : 0}%)`
                            : '-'}
                    </div>
                    <PieChart width={200} height={200}>
                        <Pie
                            data={[
                                { name: '회고 생성', value: retentionCreateCount || 0 },
                                { name: '미생성', value: (retentionTotalMemberCount || 0) - (retentionCreateCount || 0) }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name} ${value}`}
                        >
                            <Cell key="created" fill="#1890ff" />
                            <Cell key="not-created" fill="#f0f0f0" />
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    <div style={{ color: '#888', fontSize: 13, marginBottom: 15 }}>
                        (기존 유저는 새로운 회고 1개 이상, 해당 기간동안 새로 가입한 유저는 새로운 회고 2개 이상인 비율)
                    </div>
                </Card>
            </Col>
        </Row>
    );

    return (
        <Card
            style={{ marginBottom: 24 }}
            bodyStyle={{ padding: 24 }}
            loading={loading}
        >
            <Row align="middle" gutter={24}>
                <Col>
                    <div style={{
                        background: '#1890ff',
                        borderRadius: '50%',
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <UserOutlined style={{ color: '#fff', fontSize: 28 }} />
                    </div>
                </Col>
                <Col flex="auto">
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                        유의미한 회고를 주기적으로 작성하는 사용자의 비율
                    </div>
                    <Statistic
                        value={filteredRatio}
                        suffix="%"
                        precision={1}
                        valueStyle={{ fontSize: 32, color: '#1890ff', fontWeight: 700 }}
                    />
                    <Progress
                        percent={Number(filteredRatio) || 0}
                        showInfo={false}
                        strokeColor="#1890ff"
                        style={{ marginTop: 8 }}
                    />
                    <div style={{ color: '#888', marginTop: 4 }}>
                        {filteredCount !== null && totalCount !== null && (
                            <span>({filteredCount} / {totalCount}명)</span>
                        )}
                    </div>
                    <div style={{
                        background: '#f0f5ff',
                        borderRadius: 8,
                        padding: '8px 12px',
                        marginTop: 12,
                        fontSize: 13,
                        color: '#555'
                    }}>
                        날짜, 최소 작성 횟수, 최소 회고 총 글자수를 입력한 뒤 <b>적용</b> 버튼을 누르면 해당 조건을 만족하는 사용자의 비율과 실제 인원수를 확인할 수 있습니다.
                    </div>
                    <Row gutter={16} align="middle" style={{ marginTop: 16 }}>
                        <Col>
                            <Text>최소 작성 횟수:</Text>
                        </Col>
                        <Col>
                            <input
                                type="number"
                                min={1}
                                value={minCount}
                                onChange={e => setMinCount(Number(e.target.value))}
                                style={{ width: 80 }}
                            />
                        </Col>
                        <Col>
                            <Text>최소 회고 총 글자수:</Text>
                        </Col>
                        <Col>
                            <input
                                type="number"
                                min={1}
                                value={minLength}
                                onChange={e => setMinLength(Number(e.target.value))}
                                style={{ width: 100 }}
                            />
                        </Col>
                        <Col>
                            <button onClick={handleApplyFilter} disabled={filteredLoading}>
                                {filteredLoading ? '계산중...' : '적용'}
                            </button>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Tabs defaultActiveKey="overview" style={{ marginTop: 32 }}>
                <TabPane tab="개요" key="overview">
                    {renderOverview()}
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default UserRetention;
