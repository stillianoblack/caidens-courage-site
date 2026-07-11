# Kit MCP Setup and Safety

Kit MCP is optional and was not configured or queried during implementation. It is distinct from the v4 API adapter and must never be the production synchronization transport.

Before connecting, inventory the exact tools exposed by the authorized account, classify each as read/write, document revocation, and keep `KIT_MCP_ASSISTANT_ENABLED=false`. Approved future use is read-only documentation or aggregate account inspection after explicit authorization. Prohibited use includes sending broadcasts, creating/enrolling subscribers, removing suppression, changing CRM lifecycle/customer state, bypassing consent, or accessing child data.

UI status is informational: Connected, Not configured, or Disabled. A connection does not grant CRM authorization.
