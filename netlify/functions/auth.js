const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { path, httpMethod, headers, body } = event;
  const backendUrl = `https://prestamos123.netlify.app/${path}`;

  const response = await fetch(backendUrl, {
    method: httpMethod,
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: httpMethod !== 'GET' ? body : undefined,
  });

  const responseBody = await response.json();

  return {
    statusCode: response.status,
    body: JSON.stringify(responseBody),
  };
};
