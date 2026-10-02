# Zoho CRM Contact Form Setup

The Emitronix contact and article enquiry forms submit to `/api/contact`, which calls `lib/zoho.ts` from the server. Real Zoho credentials must stay in server environment variables. This document describes the inspected implementation; actual production configuration and delivery remain **REQUIRES LIVE VERIFICATION**.

## Required Environment Variables

```dotenv
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
```

These values are intentionally blank. Set real credentials privately; do not put them in this document or Git.

## Optional Runtime Defaults

```dotenv
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
ZOHO_API_DOMAIN=https://www.zohoapis.com
ZOHO_CRM_MODULE=Leads
ZOHO_LEAD_SOURCE=Website Contact Form
```

The OAuth request is `POST ${ZOHO_ACCOUNTS_URL}/oauth/v2/token`. The CRM request is `POST ${OAuth api_domain or ZOHO_API_DOMAIN}/crm/v8/${ZOHO_CRM_MODULE}`. OAuth's returned API domain takes precedence over the configured fallback. The CRM version is hardcoded to v8; the implementation has no API-version or custom service-field environment override.

## Zoho OAuth Notes

- An authorized operator must verify the actual account, valid refresh token, OAuth scope and create permissions for the configured module. No specific CRM user/account is established by the inspected code.
- Match the Accounts/API domains to the tenant's data center; `.com` is the source default, not proof of the production tenant.
- Do not commit `.env`, `.env.local`, access tokens, refresh tokens, client secrets or API keys.

## Lead Field Mapping

| Website field | Zoho CRM Lead field |
| --- | --- |
| Full name | First_Name, Last_Name |
| Company | Company; fallback is `Website Enquiry - Emitronix` |
| Email | Email |
| Mobile | Phone, Mobile |
| Service | Description; not a custom CRM field |
| Project location/details | Description |
| Submitted page/browser context and consent | Description |
| Lead source | Lead_Source from `ZOHO_LEAD_SOURCE` |

## Receipt, Failure and Duplicate Behavior

- Contact/blog requests return success after a CRM success or `DUPLICATE_DATA` acknowledgement. Missing required configuration returns 503; typed provider failure returns 502; unexpected failure returns 500.
- `DUPLICATE_DATA` is treated as success. Verify tenant uniqueness rules preserve two distinct enquiries using the same email with different service/message details; acknowledgement alone does not prove that new details were stored.
- The client and API coalesce identical submissions locally; in-memory pending/recent protection does not establish cross-worker or durable idempotency.
- Careers submit to `/api/careers`, save a private CV/JSON record first, then attempt a best-effort notification lead. Storage is authoritative: CRM notification failure is logged while the saved application returns success. The CV is not attached to Zoho.
- No SMTP sender or incoming notification webhook is implemented. Intended email/team notifications must be verified in the actual tenant's workflows.

## Controlled Live Verification — Not Established Locally

Only an explicitly authorized operator should apply production environment changes, restart/deploy or submit a live synthetic test. These notes do not authorize those actions. Use an owned test inbox/number and an anonymous QA marker, with no real customer data.

1. Privately verify the required credentials, correct data center, OAuth/module/field permissions and intended lead-source option; never display tokens or secrets in the evidence.
2. Submit authorized synthetic contact and article enquiries; confirm actual CRM receipt and every mapped field rather than relying on the browser success message.
3. Verify identical-request handling and separate enquiries sharing an email but having different service/message details, recording the tenant's approved duplicate policy.
4. For a synthetic career submission, verify private CV/JSON persistence separately from CRM notification. Confirm the intended team notification/email receipt in the controlled inbox.
5. Exercise provider/configuration/storage failure and retry in an isolated approved staging environment; do not break production credentials or permissions to manufacture failures.

Until these checks are supported by actual tenant/deployment evidence, production Zoho configuration, field acceptance and delivery remain **REQUIRES LIVE VERIFICATION**.
