import { Products, CountryCode } from 'plaid';
import { plaidClient } from './_shared/plaid.mjs';
import { requireApiKey, jsonResponse, errorResponse, safeHandler } from './_shared/auth.mjs';

export default safeHandler(async (req) => {
  if (req.method !== 'POST') return jsonResponse({ error: 'method not allowed' }, 405);
  const denied = requireApiKey(req);
  if (denied) return denied;

  try {
    const client = plaidClient();
    const { data } = await client.linkTokenCreate({
      user: { client_user_id: 'ledger-singleton' },
      client_name: 'Ledger',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    return jsonResponse({ link_token: data.link_token, expiration: data.expiration });
  } catch (err) {
    return errorResponse(err);
  }
});
