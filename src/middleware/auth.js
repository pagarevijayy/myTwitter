const utils = require('../utils/utils');

const auth = async (req, res, next) => {
    try {

        const token = req.cookies.authToken;

        if (!token) {
            throw new Error();
        }

        const user = await utils.getAuthorizedUser(token);

        req.token = token;
        req.user = user;

        next();

    } catch (e) {
        res.status(401).send({
            error: "Please authenticate."
        });
    }
};

module.exports = auth;