export const googleConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL!,
  },
  defaultRoleId: 1,
  allowedDomain: "reallygreattech.com",
  clientUrl: process.env.DEV_CLIENT_URL!,
};
