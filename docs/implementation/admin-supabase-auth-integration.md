# Admin Supabase Auth Integration

The Admin Portal now uses the shared browser Supabase client for email/password authentication. `AdminAuthProvider` restores and refreshes the browser session, then sends its bearer token to `GET /.netlify/functions/admin-session`. Admin content is rendered only after that endpoint confirms an active server-side CRM Admin role.

The endpoint returns minimized identity data: user ID, masked email, selected active role, organization scope, permitted scopes, and feature availability. It ignores client-supplied role and scope values. Missing, invalid, and unauthorized sessions return 401 or 403.

The route provider covers `/admin`, `/admin/commerce`, `/admin/design-system`, and adventure-preview routes. Signed-out users see one email/password form; unauthorized Auth users see Access Denied; authorized users retain the existing Admin navigation and features. CRM requests already obtain the current Supabase access token and send it as a bearer token.

Password recovery remains a documented follow-up because no verified recovery flow existed. Public signup is not exposed.
