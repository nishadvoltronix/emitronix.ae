# Emitronix Corporate Website

Premium corporate website for Emitronix Contracting LLC in Dubai, UAE.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Local optimized visual assets

## Pages

- Home
- About
- Services
- Civil
- Interior
- Approval
- Projects
- Resources
- Contact

## Included

- White, dark navy and royal blue corporate design
- Dubai construction skyline hero
- Lead-generation contact form UI
- Civil construction, approval and interior fit-out content
- Authority approval trust cards
- Project showcase
- Dynamic sitemap at `/sitemap.xml`
- Dynamic robots file at `/robots.txt`
- Open Graph metadata
- JSON-LD LocalBusiness schema

## Run

```bash
npm install
npm run dev
```

On Windows PowerShell with strict execution policy restrictions, use:

```bash
npm.cmd run dev
```

You can also double-click `start-dev.cmd` from the project folder to launch the local dev server.

## Build

```bash
npm run build
```

## Zoho CRM Lead Integration

The contact and article enquiry forms submit to the consent-checked server-side API route at `/api/contact`, which creates a follow-up record in the configured CRM. CRM credentials must stay server-side in environment variables and must never be exposed in browser code.

Set these required server-only credentials privately in the intended environment:

```dotenv
ZOHO_CLIENT_ID=
ZOHO_CLIENT_SECRET=
ZOHO_REFRESH_TOKEN=
```

The optional defaults read by `lib/zoho.ts` are:

```dotenv
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
ZOHO_API_DOMAIN=https://www.zohoapis.com
ZOHO_CRM_MODULE=Leads
ZOHO_LEAD_SOURCE=Website Contact Form
```

Use the account/API domains for the actual tenant's data center. The helper posts to `${ZOHO_ACCOUNTS_URL}/oauth/v2/token`; the returned OAuth `api_domain` takes precedence over `ZOHO_API_DOMAIN`. CRM writes use `/crm/v8/<module>`. There is no environment override for the CRM API version or a custom service field.

Field mapping:

- Full name: split into `First_Name` and mandatory `Last_Name`
- Company: `Company`, using `Website Enquiry - Emitronix` when omitted
- Email: `Email`
- Phone: both `Phone` and `Mobile`
- Lead source: `Lead_Source`, using `ZOHO_LEAD_SOURCE`
- Selected service, project location, project details, page/browser context and consent: `Description`

**REQUIRES LIVE VERIFICATION:** the repository does not establish valid production credentials, OAuth scope, tenant/module/field permissions, duplicate rules or notification delivery. An authorized operator must confirm receipt and field mapping in the actual CRM, including two enquiries sharing an email but containing different service/message details. `DUPLICATE_DATA` is acknowledged as success and does not prove that new details were saved.

Contact/blog requests await CRM acknowledgement. Careers first save private CV/JSON files and then attempt a best-effort CRM notification; career HTTP 200 does not prove that notification was delivered, and the CV is not attached to Zoho. The application has no SMTP sender; intended email/team notifications require verification of the tenant's workflows. See [the detailed setup and live verification checklist](docs/zoho-crm-contact-form.md).

Server environment changes and production restarts require explicit authorization; these setup notes do not authorize deployment or a live test submission.

Update final production phone, email, social links and domain in `data/site.ts` before launch.
