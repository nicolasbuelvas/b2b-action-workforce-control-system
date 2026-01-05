"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOLDOWN_RULES = void 0;
exports.COOLDOWN_RULES = {
    website_inquiry: {
        default: {
            durationMs: 7 * 24 * 60 * 60 * 1000,
        },
        categories: {
            product_a: {
                default: {
                    durationMs: 7 * 24 * 60 * 60 * 1000,
                },
            },
            product_b: {
                default: {
                    durationMs: 14 * 24 * 60 * 60 * 1000,
                },
            },
        },
    },
    linkedin_inquiry: {
        actions: {
            message: {
                durationMs: 48 * 60 * 60 * 1000,
            },
            connect: {
                durationMs: 7 * 24 * 60 * 60 * 1000,
            },
        },
        categories: {
            product_a: {
                actions: {
                    message: {
                        durationMs: 48 * 60 * 60 * 1000,
                    },
                    connect: {
                        durationMs: 7 * 24 * 60 * 60 * 1000,
                    },
                },
            },
        },
    },
    backlink_outreach: {
        default: {
            durationMs: 14 * 24 * 60 * 60 * 1000,
        },
    },
};
//# sourceMappingURL=cooldown.config.js.map