import React, { useCallback, useEffect, useState } from 'react';
import {
    Layout,
    Menu,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    DatePicker,
    Space,
    Tag,
    Popconfirm,
    message,
    Typography,
} from 'antd';
import {
    DashboardOutlined,
    NotificationOutlined,
    LogoutOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    PushpinFilled,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { NoticeCategoryType, NoticeCategoryLabel, NoticeCategoryColor } from '../constants/noticeCategoryType';
import './DashboardPage.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const NoticeListPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingNoticeId, setEditingNoticeId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchNotices = useCallback(async (currentPage, currentPageSize) => {
        setLoading(true);
        try {
            const res = await api.get('/admin/notice', {
                params: { page: currentPage - 1, size: currentPageSize },
            });
            setNotices(res.data.notices);
            setTotal(res.data.totalCount);
        } catch (error) {
            message.error('공지사항 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotices(page, pageSize);
    }, [fetchNotices, page, pageSize]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const openCreateModal = () => {
        setEditingNoticeId(null);
        form.resetFields();
        form.setFieldsValue({
            category: NoticeCategoryType.GENERAL,
            isPinned: false,
            isActive: true,
        });
        setModalOpen(true);
    };

    const openEditModal = async (noticeId) => {
        try {
            const res = await api.get(`/admin/notice/${noticeId}`);
            const notice = res.data;
            setEditingNoticeId(noticeId);
            form.setFieldsValue({
                title: notice.title,
                content: notice.content,
                category: notice.category,
                isPinned: notice.isPinned,
                isActive: notice.isActive,
                period: [
                    notice.startAt ? dayjs(notice.startAt) : null,
                    notice.endAt ? dayjs(notice.endAt) : null,
                ],
            });
            setModalOpen(true);
        } catch (error) {
            message.error('공지사항 정보를 불러오지 못했습니다.');
        }
    };

    const handleModalCancel = () => {
        setModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const [start, end] = values.period || [null, null];
            const payload = {
                title: values.title,
                content: values.content,
                category: values.category,
                isPinned: values.isPinned,
                isActive: values.isActive,
                startAt: start ? start.format('YYYY-MM-DDTHH:mm:ss') : null,
                endAt: end ? end.format('YYYY-MM-DDTHH:mm:ss') : null,
            };

            setSubmitting(true);
            if (editingNoticeId) {
                await api.put(`/admin/notice/${editingNoticeId}`, payload);
                message.success('공지사항이 수정되었습니다.');
            } else {
                await api.post('/admin/notice', payload);
                message.success('공지사항이 등록되었습니다.');
            }
            setModalOpen(false);
            form.resetFields();
            fetchNotices(page, pageSize);
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            message.error('저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (noticeId) => {
        try {
            await api.delete(`/admin/notice/${noticeId}`);
            message.success('공지사항이 삭제되었습니다.');
            fetchNotices(page, pageSize);
        } catch (error) {
            message.error('삭제 중 오류가 발생했습니다.');
        }
    };

    const columns = [
        {
            title: '',
            dataIndex: 'isPinned',
            width: 32,
            render: (isPinned) => (isPinned ? <PushpinFilled style={{ color: '#faad14' }} /> : null),
        },
        {
            title: '제목',
            dataIndex: 'title',
        },
        {
            title: '카테고리',
            dataIndex: 'category',
            width: 100,
            render: (category) => <Tag color={NoticeCategoryColor[category]}>{NoticeCategoryLabel[category]}</Tag>,
        },
        {
            title: '노출',
            dataIndex: 'isActive',
            width: 90,
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'default'}>{isActive ? '노출중' : '비노출'}</Tag>
            ),
        },
        {
            title: '노출기간',
            width: 260,
            render: (_, record) => {
                const start = record.startAt ? dayjs(record.startAt).format('YYYY-MM-DD HH:mm') : '제한없음';
                const end = record.endAt ? dayjs(record.endAt).format('YYYY-MM-DD HH:mm') : '제한없음';
                return `${start} ~ ${end}`;
            },
        },
        {
            title: '작성일',
            dataIndex: 'createdAt',
            width: 110,
            render: (createdAt) => dayjs(createdAt).format('YYYY-MM-DD'),
        },
        {
            title: '관리',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record.id)} />
                    <Popconfirm
                        title="이 공지사항을 삭제할까요?"
                        okText="삭제"
                        cancelText="취소"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={220} className="dashboard-sider">
                <div className="logo">
                    <h2>Layer 어드민</h2>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={['notices']}
                    className="dashboard-menu"
                    items={[
                        { key: 'dashboard', icon: <DashboardOutlined />, label: '대시보드' },
                        { key: 'notices', icon: <NotificationOutlined />, label: '공지사항 관리' },
                    ]}
                    onClick={({ key }) => (key === 'dashboard' ? navigate('/dashboard') : null)}
                />
            </Sider>

            <Layout>
                <Header className="dashboard-header">
                    <div className="header-content">
                        <div className="header-left">
                            <Title level={4} style={{ margin: 0 }}>
                                공지사항 관리
                            </Title>
                        </div>
                        <div className="header-right">
                            <Space>
                                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                                    공지 작성
                                </Button>
                                <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
                                    로그아웃
                                </Button>
                            </Space>
                        </div>
                    </div>
                </Header>

                <Content className="dashboard-content">
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={notices}
                        loading={loading}
                        pagination={{
                            current: page,
                            pageSize,
                            total,
                            showSizeChanger: true,
                            onChange: (nextPage, nextPageSize) => {
                                setPage(nextPage);
                                setPageSize(nextPageSize);
                            },
                        }}
                    />
                </Content>
            </Layout>

            <Modal
                title={editingNoticeId ? '공지사항 수정' : '공지사항 작성'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={handleModalCancel}
                confirmLoading={submitting}
                okText={editingNoticeId ? '수정' : '등록'}
                cancelText="취소"
                width={640}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="title" label="제목" rules={[{ required: true, message: '제목을 입력해주세요.' }]}>
                        <Input placeholder="공지사항 제목" />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="본문"
                        rules={[{ required: true, message: '본문을 입력해주세요.' }]}
                    >
                        <TextArea rows={8} placeholder="공지사항 본문" />
                    </Form.Item>
                    <Form.Item name="category" label="카테고리" rules={[{ required: true }]}>
                        <Select
                            options={Object.values(NoticeCategoryType).map((value) => ({
                                value,
                                label: NoticeCategoryLabel[value],
                            }))}
                        />
                    </Form.Item>
                    <Form.Item name="period" label="노출기간 (미지정 시 제한없음)">
                        <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} allowEmpty={[true, true]} />
                    </Form.Item>
                    <Space size={32}>
                        <Form.Item name="isPinned" label="상단 고정" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="isActive" label="노출 여부" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </Layout>
    );
};

export default NoticeListPage;
