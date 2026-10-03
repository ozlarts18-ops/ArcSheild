export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const errorDetails = error.errors?.map(err => ({
      field: err.path.join('.'),
      message: err.message
    })) || [{ message: 'Invalid request payload format' }];

    return res.status(400).json({
      success: false,
      message: 'Validation failed for submitted data.',
      errors: errorDetails
    });
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters supplied.'
    });
  }
};
