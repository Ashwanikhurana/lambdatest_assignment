const axios = require('axios');

const makeRequest = async (config, previousResponse) => {
  const { url, method, data, token } = config;
  let processedData = data;
  
  if (typeof data === 'function') {
    processedData = data(previousResponse);
  }

  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios({ url, method, data: processedData, headers });
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message, config };
  }
};

const handleParallelRequests = async (configs, previousResponse) => {
  const promises = configs.map((config) => makeRequest(config, previousResponse));
  const results = await Promise.allSettled(promises);
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return { status: 'error', error: result.reason, config: configs[index] };
    }
  });
};

const handleSequentialRequests = async (configs, previousResponse) => {
  let results = [];
  for (let config of configs) {
    const result = await makeRequest(config, previousResponse);
    results.push(result);
    if (result.status === 'success') {
      previousResponse = result.response;
    } else {
      break;
    }
  }
  return results;
};

const handleRequests = async (jsonConfig) => {
  let results = [];
  let previousResponse;
  for (let group of jsonConfig) {
    const { requests, type } = group;
    let groupResults;
    if (type === 'parallel') {
      groupResults = await handleParallelRequests(requests, previousResponse);
    } else if (type === 'sequential') {
      groupResults = await handleSequentialRequests(requests, previousResponse);
    } else {
      throw new Error('Invalid type. Type can be either parallel or sequential.');
    }
    results.push(groupResults);
    const lastSuccessResult = groupResults.reverse().find(result => result.status === 'success');
    if (lastSuccessResult) {
      previousResponse = lastSuccessResult.response;
    }
  }
  return results;
};

const jsonConfig = [
  {
    type: 'sequential',
    requests: [
      { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
      { 
        url: 'https://jsonplaceholder.typicode.com/posts', 
        method: 'POST', 
        data: (previousResponse) => ({ title: 'foo', body: previousResponse.data.body, userId: 1 }) 
      },
    ],
  },
  {
    type: 'parallel',
    requests: [
      { 
        url: 'https://jsonplaceholder.typicode.com/posts/2', 
        method: 'GET', 
        data: (previousResponse) => ({ userId: previousResponse.data.userId }) 
      },
      { 
        url: 'https://jsonplaceholder.typicode.com/posts/3', 
        method: 'GET', 
        data: (previousResponse) => ({ userId: previousResponse.data.userId }) 
      },
    ],
  },
];

handleRequests(jsonConfig)
  .then((groupResults) => {
    console.log('groupResults', groupResults);
    for (let results of groupResults) {
      for (let result of results) {
        if (result.status === 'success') {
          console.log('Response data:', result.response.data);
        } else {
          console.error('Request failed:', result.config);
          console.error('Error message:', result.error);
        }
      }
    }
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });

module.exports = handleRequests;
