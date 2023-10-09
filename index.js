const axios = require('axios');

const makeRequest = async (config, previousResponse, allResponses) => {
  const { url, method, data, token } = config;
  let processedData = data;

  if (typeof data === 'function') {
    processedData = data({ previousResponse, allResponses });
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

const handleParallelRequests = async (configs, previousResponse, allResponses) => {
  const promises = configs.map((config) => makeRequest(config, previousResponse, allResponses));
  const results = await Promise.allSettled(promises);
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return { status: 'error', error: result.reason, config: configs[index] };
    }
  });
};

const handleSequentialRequests = async (configs, previousResponse, allResponses) => {
  let results = [];
  for (let config of configs) {
    const result = await makeRequest(config, previousResponse, allResponses);
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
      groupResults = await handleParallelRequests(requests, previousResponse, results);
    } else if (type === 'sequential') {
      groupResults = await handleSequentialRequests(requests, previousResponse, results);
    } else {
      throw new Error('Invalid type. Type can be either parallel or sequential.');
    }
    results.push(groupResults);
    const lastSuccessResult = groupResults[groupResults.length - 1];
    if (lastSuccessResult) {
      previousResponse = lastSuccessResult.response;
    }
  }
  return results;
};

module.exports = handleRequests;
