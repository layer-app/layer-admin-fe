import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 로컬 스토리지에서 인증 상태 확인
        const token = localStorage.getItem('admin_token');
        const userData = localStorage.getItem('admin_user');

        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (password) => {
        try {
            const response = await api.get('/admin/login', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-ADMIN-TOKEN': password
                }
            });

            if (response.status === 200) {
                localStorage.setItem('admin_token', password);
                setIsAuthenticated(true);
                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, message: errorData.message || '아이디 또는 비밀번호가 올바르지 않습니다.' };
            }
        } catch (error) {
            return { success: false, message: '로그인 중 오류가 발생했습니다.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
