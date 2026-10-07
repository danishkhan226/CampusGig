export const sendSuccess = (res, data = {}, arg3 = 200, arg4 = null) => {
  let statusCode = 200;
  let message = null;

  if (typeof arg3 === 'number') {
    statusCode = arg3;
    message = typeof arg4 === 'string' ? arg4 : null;
  } else if (typeof arg3 === 'string') {
    message = arg3;
    statusCode = typeof arg4 === 'number' ? arg4 : 200;
  }

  const response = {
    success: true,
    data
  };
  if (message) {
    response.message = message;
  }
  return res.status(statusCode).json(response);
};

export const sendError = (res, message = 'Something went wrong', arg3 = 500, arg4 = null) => {
  let statusCode = 500;
  let errors = null;

  if (typeof arg3 === 'number') {
    statusCode = arg3;
    errors = arg4;
  } else if (typeof arg3 === 'object' && arg3 !== null) {
    errors = arg3;
    statusCode = typeof arg4 === 'number' ? arg4 : 500;
  }

  const response = {
    success: false,
    message: typeof message === 'string' ? message : 'An error occurred'
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};
