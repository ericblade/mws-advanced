/* eslint-disable max-classes-per-file */

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
class ServiceError extends extError {
    constructor(message) {
        super(message);
        // if this should go to a sub-class, then choose that. note that this creates a bit of a
        // chicken and egg problem, requiring disabling eslint no-use-before-define.
        // I want subclasses to extend ServiceError, but I also want ServiceError to figure out
        // which subclass to use automagically.
        if (this.constructor === ServiceError) {
            const test = message.match(/Invalid (.*) identifier (.*) for marketplace (.*)/);
            if (test && test.length === 4) {
                // eslint-disable-next-line no-use-before-define
                return new InvalidIdentifier(message, test[1], test[2], test[3]);
            }
        }
    }
}

/**
 * Thrown when receiving an "Invalid" identifier message, which is also the same as "identifier
 * does not exist" -- when calling something like getMatchingProductForId, MWS will return
 * "Invalid Identifier" for any situation in which an identifier is not found. It may or may not
 * be technically valid, but it definitely doesn't exist on their side.
 *
 * @class InvalidIdentifier
 * @extends {ServiceError}
 */
class InvalidIdentifier extends ServiceError {
    constructor(message, type, identifier, marketplace) {
        super(message);
        this.type = type;
        this.identifier = identifier;
        this.marketplace = marketplace;
    }
}

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
    InvalidIdentifier,
    RequestCancelled,
    ServiceError,
    ValidationError,
};
