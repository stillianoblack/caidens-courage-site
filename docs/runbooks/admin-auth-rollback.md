# Admin Auth Rollback

The approved rollback is code rollback, not simultaneous authentication modes.

1. Disable Admin deployment promotion if Supabase sign-in or role resolution fails.
2. Keep CRM/provider writes disabled.
3. Revert the Admin Supabase Auth integration as one reviewed change in the affected environment.
4. If an emergency legacy build is explicitly approved, enable its clearly named emergency flag only in that isolated build; it must never authorize CRM endpoints.
5. Validate existing Admin functions and remove the emergency flag immediately after recovery.

Do not delete Auth users, role assignments, audit events, or CRM migrations during rollback. After production acceptance, remove the unused passcode helpers, passcode environment variables, storage keys, and this emergency path in a separate reviewed cleanup.
