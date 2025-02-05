import axios from 'axios'

const api = axios.create({
baseURL: 'http://192.64.114.83:2029',
});

export default api