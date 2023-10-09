const handleRequests = require('./index');

const jsonConfig = [
  {
    type: 'sequential',
    requests: [
      { url: 'https://jsonplaceholder.typicode.com/posts/1', method: 'GET' },
      {
        url: 'https://jsonplaceholder.typicode.com/posts',
        method: 'POST',
        data: ({ previousResponse }) => ({ title: 'foo', body: previousResponse.data.body, userId: 1 })
      },
    ],
  },
  {
    type: 'parallel',
    requests: [
      {
        url: 'https://jsonplaceholder.typicode.com/posts/2',
        method: 'GET',
        data: ({ previousResponse }) => ({ userId: previousResponse.data.userId })
      },
      {
        url: 'https://jsonplaceholder.typicode.com/posts/3',
        method: 'GET',
        data: ({ previousResponse }) => ({ userId: previousResponse.data.userId })
      },
    ],
  },
];

handleRequests(jsonConfig)
  .then((groupResults) => {
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