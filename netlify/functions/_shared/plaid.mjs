import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

let cached;

export function plaidClient() {
  if (cached) return cached;
  const env = (process.env.PLAID_ENV || 'sandbox').toLowerCase();
  const basePath = PlaidEnvironments[env];
  if (!basePath) {
    throw new Error(`Unknown PLAID_ENV "${env}". Use sandbox, development, or production.`);
  }
  const config = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
        'Plaid-Version': '2020-09-14',
      },
    },
  });
  cached = new PlaidApi(config);
  return cached;
}
