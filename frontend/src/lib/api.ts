export const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

export const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
}; export const getAuthHeaders = () => {
    if (typeof document !== 'undefined') {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
        }
    }
    return { 'Content-Type': 'application/json' };
};
