import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const result = await login(values.password);
            if (result.success) {
                message.success('로그인되었습니다.');
                navigate('/dashboard');
            } else {
                message.error(result.message);
            }
        } catch (error) {
            message.error('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <Card className="login-card">
                    <div className="login-header">
                        <h1>Layer 어드민</h1>
                        <p>관리자 로그인</p>
                    </div>
                    <Form
                        name="login"
                        onFinish={onFinish}
                        autoComplete="off"
                        size="large"
                    >
                        <Form.Item
                            name="username"
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="아이디 x"
                                disabled
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '비밀번호를 입력해주세요!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="비밀번호"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                            >
                                로그인
                            </Button>
                        </Form.Item>
                    </Form>
                    <div className="login-info">
                        <p>테스트 계정: 공유문서 참고 </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
