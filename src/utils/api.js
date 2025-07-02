import axios from 'axios';

// axios 기본 설정
const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://stgapi.layerapp.io',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'X-ADMIN-TOKEN': localStorage.getItem('admin_token'),
    },
});

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status !== 200) {
            // 인증 실패 시 로그인 페이지로 리다이렉트
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
