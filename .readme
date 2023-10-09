# API Requests Library

A simple JavaScript library for making sequential and parallel API requests based on a JSON configuration.

## Installation

bash
npm install api-requests-library


## Usage

javascript
const handleRequests = require('api-requests-library');

const jsonConfig = [
  {
    type: 'sequential',
    requests: [
      { url: 'https://api.example.com/endpoint1', method: 'GET', token: 'your-token-here' },
      { url: 'https://api.example.com/endpoint2', method: 'POST', data: { key: 'value' }, token: 'your-token-here' },
    ],
  },
  // other groups...
];

handleRequests(jsonConfig)
  .then(/* handle results */)
  .catch(/* handle error */);


In the above example, `handleRequests` will make the requests with the provided authorization tokens.

## Configuration

The library takes a JSON configuration that specifies the requests and their type (either 'parallel' or 'sequential').

Each request configuration can have the following properties:

- `url`: The URL of the request.
- `method`: The HTTP method of the request.
- `data`: The data payload of the request. If this is a function, it will be called with the response of the previous request.
- `token`: The authorization token for the request.

Each group in the JSON configuration can have the following properties:

- `type`: The type of the requests in the group. This can be either 'parallel' or 'sequential'.
- `requests`: An array of request configurations.

## Error Handling

If a request fails, the library will return an object with `status: 'error'`, the error message, and the request config. If a request succeeds, the library will return an object with `status: 'success'` and the response.