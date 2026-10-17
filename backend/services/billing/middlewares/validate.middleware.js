const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(result.error);
    }

    // Use normalized and validated data from Zod.
    req.validated = req.validated || {};
    req.validated[source] = result.data;

    next();
  };
};

export default validate;
