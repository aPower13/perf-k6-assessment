import http from 'k6/http';

export function logIn(config) {
    const payload = `grant_type=password&username=${encodeURIComponent(config.credentials.username)}&password=${encodeURIComponent(config.credentials.password)}&scope=&client_id=&client_secret=`;

    const loginRes = http.post(`${config.baseURL}/log_in`, payload, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
    });

    if (loginRes.status !== 200) {
        throw new Error(`Login failed with status: ${loginRes.status}`);
    }

    if (!loginRes.body) {
        throw new Error('Login response body is empty');
    }

    const responseBody = loginRes.json();

    if (!responseBody.access_token) {
        throw new Error('No access_token in response');
    }

    return responseBody.access_token;
}