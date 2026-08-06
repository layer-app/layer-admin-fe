import React, { useCallback, useEffect, useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Switch,
    Space,
    Tag,
    message,
} from 'antd';
import { PlusOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../utils/api';
import { PopupIconType, PopupIconLabel, PopupIconColor } from '../constants/popupIconType';

const { TextArea } = Input;

const PopupManagement = () => {
    const [popups, setPopups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingPopupId, setEditingPopupId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const fetchPopups = useCallback(async (currentPage, currentPageSize) => {
        setLoading(true);
        try {
            const res = await api.get('/admin/popup', {
                params: { page: currentPage - 1, size: currentPageSize },
            });
            setPopups(res.data.popups);
            setTotal(res.data.totalCount);
        } catch (error) {
            message.error('팝업 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPopups(page, pageSize);
    }, [fetchPopups, page, pageSize]);

    const openCreateModal = () => {
        setEditingPopupId(null);
        form.resetFields();
        form.setFieldsValue({
            iconType: PopupIconType.DEFAULT,
            isActive: true,
        });
        setModalOpen(true);
    };

    const openEditModal = async (popupId) => {
        try {
            const res = await api.get(`/admin/popup/${popupId}`);
            const popup = res.data;
            setEditingPopupId(popupId);
            form.setFieldsValue({
                iconType: popup.iconType,
                title: popup.title,
                content: popup.content,
                moveButtonUrl: popup.moveButtonUrl,
                isActive: popup.isActive,
            });
            setModalOpen(true);
        } catch (error) {
            message.error('팝업 정보를 불러오지 못했습니다.');
        }
    };

    const handleModalCancel = () => {
        setModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                iconType: values.iconType,
                title: values.title,
                content: values.content,
                moveButtonUrl: values.moveButtonUrl || null,
                isActive: values.isActive,
            };

            setSubmitting(true);
            if (editingPopupId) {
                await api.put(`/admin/popup/${editingPopupId}`, payload);
                message.success('팝업이 수정되었습니다.');
            } else {
                await api.post('/admin/popup', payload);
                message.success('팝업이 등록되었습니다.');
            }
            setModalOpen(false);
            form.resetFields();
            fetchPopups(page, pageSize);
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            message.error('저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (popupId, nextActive) => {
        try {
            await api.patch(`/admin/popup/${popupId}/active`, { isActive: nextActive });
            message.success(nextActive ? '팝업이 활성화되었습니다.' : '팝업이 비활성화되었습니다.');
            setPopups((prev) =>
                prev.map((popup) => (popup.id === popupId ? { ...popup, isActive: nextActive } : popup))
            );
        } catch (error) {
            message.error('노출 상태 변경 중 오류가 발생했습니다.');
        }
    };

    const columns = [
        {
            title: '아이콘',
            dataIndex: 'iconType',
            width: 100,
            render: (iconType) => <Tag color={PopupIconColor[iconType]}>{PopupIconLabel[iconType]}</Tag>,
        },
        {
            title: '제목',
            dataIndex: 'title',
        },
        {
            title: '노출',
            dataIndex: 'isActive',
            width: 90,
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    checkedChildren="노출"
                    unCheckedChildren="비노출"
                    onChange={(checked) => handleToggleActive(record.id, checked)}
                />
            ),
        },
        {
            title: '작성일',
            dataIndex: 'createdAt',
            width: 110,
            render: (createdAt) => dayjs(createdAt).format('YYYY-MM-DD'),
        },
        {
            title: '관리',
            width: 80,
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <div className="popup-management">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
                    팝업 작성
                </Button>
            </div>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={popups}
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

            <Modal
                title={editingPopupId ? '팝업 수정' : '팝업 작성'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={handleModalCancel}
                confirmLoading={submitting}
                okText={editingPopupId ? '수정' : '등록'}
                cancelText="취소"
                width={560}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="iconType" label="아이콘" rules={[{ required: true }]}>
                        <Select
                            options={Object.values(PopupIconType).map((value) => ({
                                value,
                                label: `${PopupIconLabel[value]} (${value})`,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item
                        name="title"
                        label="팝업 제목"
                        rules={[{ required: true, message: '제목을 입력해주세요.' }]}
                    >
                        <Input placeholder="팝업 제목" maxLength={30} showCount />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="팝업 내용"
                        rules={[{ required: true, message: '내용을 입력해주세요.' }]}
                    >
                        <TextArea rows={6} placeholder="팝업 내용" maxLength={800} showCount />
                    </Form.Item>
                    <Form.Item
                        name="moveButtonUrl"
                        label="이동 버튼 주소"
                        tooltip="비워두면 확인 버튼만 노출되고, 값이 있으면 이동 버튼이 함께 노출됩니다."
                        rules={[{ type: 'url', message: '올바른 URL 형식이 아닙니다.', warningOnly: false }]}
                    >
                        <Input prefix={<LinkOutlined />} placeholder="https://example.com (선택)" />
                    </Form.Item>
                    <Form.Item name="isActive" label="노출 여부" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PopupManagement;
