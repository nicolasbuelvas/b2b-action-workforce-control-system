export const AuthConfig = {
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
