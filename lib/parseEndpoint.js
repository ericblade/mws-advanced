const { callEndpoint } = require('./callEndpoint');

const parseEndpoint =
    (outParser, inParser = x => x) =>
        name =>
            async (callOptions, opt) =>
                outParser(await callEndpoint(name, inParser(callOptions), opt));

module.exports = {
    parseEndpoint,
};
