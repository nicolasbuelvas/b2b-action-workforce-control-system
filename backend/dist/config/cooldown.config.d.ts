export type CooldownRule = {
    durationMs: number;
};
export type CooldownActionRules = Record<string, CooldownRule>;
export type CooldownCategoryRules = {
    actions?: CooldownActionRules;
    default?: CooldownRule;
};
export declare const COOLDOWN_RULES: {
    website_inquiry: {
        default: {
            durationMs: number;
        };
        categories: {
            product_a: {
                default: {
                    durationMs: number;
                };
            };
            product_b: {
                default: {
                    durationMs: number;
                };
            };
        };
    };
    linkedin_inquiry: {
        actions: {
            message: {
                durationMs: number;
            };
            connect: {
                durationMs: number;
            };
        };
        categories: {
            product_a: {
                actions: {
                    message: {
                        durationMs: number;
                    };
                    connect: {
                        durationMs: number;
                    };
                };
            };
        };
    };
    backlink_outreach: {
        default: {
            durationMs: number;
        };
    };
};
