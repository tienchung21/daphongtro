const axios = require('axios');

const baseUrl = 'https://my.sepay.vn'; // hoặc đổi nếu cần
const token = ''; 

const client = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  }
});

exports.listTransactions = async (params = {}) => {
  const res = await client.get('/userapi/transactions/list', { params });
  return res.data;
};