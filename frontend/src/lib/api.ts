export const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return `http://${hostname}:3000/api`;
    }
    return 'http://localhost:3000/api';
};

export const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = window.location.port;
        return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    }
    return 'http://localhost:3001';
};export const getAuthHeaders = () => {
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
