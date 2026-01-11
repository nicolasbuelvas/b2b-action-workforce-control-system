"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthConfig = void 0;
exports.AuthConfig = {
    jwt: {
        secret: process.env.JWT_SECRET || 'CHANGE_ME_IN_PROD',
        expiresIn: '1d',
        refreshExpiresIn: '7d',
    },
    password: {
        saltRounds: 12,
        minLength: 8,
    },
};
//# sourceMappingURL=auth.config.js.map