export type CooldownRule = {
  durationMs: number;
};

export type CooldownActionRules = Record<string, CooldownRule>;

export type CooldownCategoryRules = {
  actions?: CooldownActionRules;
  default?: CooldownRule;
};

export const COOLDOWN_RULES = {
  website_inquiry: {
    default: {
      durationMs: 7 * 24 * 60 * 60 * 1000, // 7 días
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
        durationMs: 48 * 60 * 60 * 1000, // 48h
      },
      connect: {
        durationMs: 7 * 24 * 60 * 60 * 1000, // 7 días
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
