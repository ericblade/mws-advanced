const extError = require('es6-error');

/**
 * Thrown when completely Invalid Parameters are given and we have no way of making sense of them
 *
 * @class InvalidUsage
 * @extends {Error}
 */
class InvalidUsage extends extError {}

/**
 * Thrown when an Error response comes from the Service (not a mws-simple.ServerError though)
 *
 * @class ServiceError
 * @extends {Error}
 */
class ServiceError extends extError {}

/**
 * Thrown when a request is cancelled by MWS -- we have no way of knowing automatically if we should retry or not
 *
 * @class RequestCancelled
 * @extends {Error}
 */
class RequestCancelled extends extError {}

/**
 * Thrown when parameters fail validation locally, before being sent to MWS
 *
 * @class ValidationError
 * @extends {Error}
 */
class ValidationError extends extError {}

module.exports = {
    InvalidUsage,
    RequestCancelled,
    ServiceError,
    ValidationError,
};
