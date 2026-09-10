# Zoho SalesIQ Human Handover Runbook

This runbook covers the Jyothika Codeless Zobot used on `emitronix.ae`. It intentionally contains no widget token, numeric portal identifier, operator identifier, or customer data.

## Website channel

In SalesIQ, open **Settings > Brands > Emitronix > Website**.

1. Under **Installation**, keep one website embed enabled.
2. Under **Restrict code to specific websites**, confirm both the canonical and `www` hosts are listed. SalesIQ may display normalized `http://` entries in this control; do not delete working entries solely because of the displayed scheme. Validate the widget from both production hosts instead.
3. Under **Configurations**, keep **Website visitor tracking** enabled.
4. Set **Chat waiting time** to `30 Seconds`, the shortest option exposed by the SalesIQ website channel.
5. Under **Chat > Response message**, configure:
   - Waiting: `Please wait while I connect you with our team.`
   - Operators engaged: `Our team is currently assisting other visitors. Please leave your name, mobile number and enquiry, and we will contact you shortly.`
   - Operator busy: `Our team could not accept the chat in time. Please leave your name, mobile number and enquiry, and we will contact you shortly.`
   - Operator offline: `Our team is currently offline. Please leave your name, mobile number and enquiry, and we will contact you shortly.`

## Website-managed consent and tracking transport

This site uses its own cookie banner. In **Settings > Brands > Emitronix > Manage > General configurations > Privacy > Cookie management**, select **Manage cookies on my own** and save. Do not select **Use the SalesIQ banner for cookie consent**: that mode does not apply the website's `privacy.updateCookieConsent(...)` calls. Keep Analytics consent as the gate for visitor tracking; do not turn off consent requirements to make Live View populate.

The website's production **Content-Security-Policy** must include `wss://vts.zohopublic.com` in `connect-src`. The deployed SalesIQ tracking runtime uses that host's `/watchws` connection, and an `https:` source alone does not permit it. Keep the allowance specific to this host; other data centers must be verified against their own public widget configuration rather than enabling every WebSocket origin.

After any deployment or consent-setting change, verify both acceptance and denial: an Analytics-consented test visit should appear in Live View, while denied or untouched Analytics must not activate optional visitor tracking. A working chat launcher alone does not establish that tracking works. Name and email are only available if the visitor identifies themselves through an authorized interaction.

## Department and operator readiness

In **Settings > Brands > Emitronix**, confirm the bot's department is enabled and responsible for website chats. Then verify:

- At least one active operator belongs to that department.
- The operator is **Available** inside the department, not only in the account header.
- The operator concurrent chat limit has not been reached.
- In **Settings > Global Settings > Operator Availability**, keep **Set idle operators as offline** enabled. The verified portal idle limit is `30 mins`.
- Brand business hours match the verified company hours in `data/site.ts`.
- Outside business hours, the bot follows the offline enquiry branch instead of waiting for an operator.

## Jyothika flow

The `Speak to a Human` choice must connect to one **Forward to Operator** card. That card must:

- use chat forwarding;
- target the active Emitronix department;
- route to all available operators in that department;
- show `Please wait while I connect you with our team.`;
- connect **Offline hours**, **Operator not available**, and **Invalid operator** outputs to a visible offline explanation followed by the existing consented enquiry intake;
- stop the bot after a successful handover.

Save and publish the Zobot after changing the flow. A saved draft does not affect production.

## Acceptance tests

Use a fresh private browser session for each case so an old conversation cannot retain an earlier bot version.

1. **Online:** set an assigned operator to Available during business hours, request a human, accept the routed chat, and confirm the visitor input becomes available to the operator conversation.
2. **Offline:** set every assigned operator Offline, request a human, and confirm the offline explanation and enquiry intake appear without an indefinite typing indicator.
3. **Busy or rejected:** reach the operator chat limit or decline the request, wait no more than the configured 30 seconds, and confirm the fallback form appears.
4. **Invalid route:** temporarily test a non-production draft with an invalid operator output and confirm the same fallback route. Restore the valid department before publishing.
5. Repeat online and offline cases at desktop and mobile viewport sizes.
6. In SalesIQ **Zobot > Jyothika > Logs**, confirm each Forward card and fallback card reports Success.
7. In **Chats > Show details**, confirm the expected department and available-operator count were used.

The SalesIQ chat channel loads with optional categories denied so visitors can request support without accepting analytics or marketing cookies. Live View, page context and proactive SalesIQ actions remain disabled until the visitor grants Analytics consent; Functional consent is not required for the on-demand chat channel.

If the widget opens but Live View stays empty after Analytics is granted, verify the deployed JavaScript contains both `$zoho.salesiq.privacy.updateCookieConsent(...)` and `$zoho.salesiq.tracking.on()`. The privacy update runs in `afterReady`; tracking must be reconciled after that call because provider initialization can otherwise leave the session disabled. Do not force Live View for a rejected or untouched Analytics choice: SalesIQ's visitor identifiers and tracking are optional processing, not a prerequisite for a visitor-initiated chat.

Also check **Settings > Controls > Spammers > Do not track**. SalesIQ auto-picks operator IP addresses, and an enabled entry suppresses those visits from Live View while leaving the chat widget fully usable. Disable only the test IP that is meant to appear; retain intentional exclusions.

## Stale visitor recovery

SalesIQ can preserve a completed conversation in first-party visitor storage. If a previously closed session still renders old bot content or never creates a new record under **Chats**, test in a fresh private browser first. The supported `$zoho.salesiq.reset()` API clears the current SalesIQ visitor session and reloads the widget, but it must be invoked only as an explicit recovery action because it also ends any active chat.

The host website cannot inspect the Codeless bot's internal forwarding state inside the cross-origin SalesIQ frame. Timeout handling therefore belongs in the Forward card's failure outputs and the website channel's waiting-time responses, rather than in a page timer that could terminate a valid conversation.

## Official references

- [Forward to Operator card and failure outputs](https://help.zoho.com/portal/en/kb/salesiq-2-0/build-chatbots/codeless-bot-implementation-guide/articles/action-block)
- [Codeless bot handoff and restart actions](https://help.zoho.com/portal/en/kb/salesiq-2-0/build-chatbots/codeless-bot-implementation-guide/articles/zobots-chatbot-building-platform)
- [Website channel waiting time and visitor tracking](https://help.zoho.com/portal/en/kb/salesiq-2-0/for-administrators/setup-brand/articles/setting-up-the-website-channel)
- [Operator idle and concurrent-chat settings](https://help.zoho.com/portal/en/kb/salesiq-2-0/for-administrators/global-settings/articles/global-settings)
- [SalesIQ reset API](https://www.zoho.com/salesiq/help/developer-section/js-api-salesiq-reset.html)
- [Enable visitor tracking API](https://www.zoho.com/salesiq/help/developer-section/js-api-tracking-on.html)
- [Cookie consent API](https://www.zoho.com/salesiq/help/developer-section/js-api-privacy-update-cookie-consent.html)
- [Do Not Track controls](https://help.zoho.com/portal/en/kb/salesiq-2-0/for-administrators/controls/articles/do-not-track)
