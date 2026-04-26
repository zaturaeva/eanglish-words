var api = {
    token: localStorage.getItem('token'),

    setToken: function(token) {
        this.token = token;
        localStorage.setItem('token', token);
    },

    clearToken: function() {
        this.token = null;
        localStorage.removeItem('token');
    },

    request: async function(method, url, body) {
        var headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = 'Bearer ' + this.token;
        }

        var options = { method: method, headers: headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        var response = await fetch('/api' + url, options);
        var data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request error');
        }

        return data;
    },

    get: function(url) { return this.request('GET', url); },
    post: function(url, body) { return this.request('POST', url, body); }
};

export default api;