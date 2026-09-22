import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { action, internalAction } from "./_generated/server";

const DEFAULT_AGENTMAIL_BASE_URL = "https://api.agentmail.to/v0";

// Provision the shared MailHere AgentMail inbox once, store it in appSettings.
// Uses the AgentMail REST API directly because the component's createInbox
// is an internal action that cannot be called from the app.
export const ensureInbox = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.runQuery(internal.settings.getSetting, {
      key: "agentmail_inbox_id",
    });
    if (existing) return null;

    const apiKey = process.env.AGENTMAIL_API_KEY;
    if (!apiKey) throw new Error("AGENTMAIL_API_KEY is not set");
    const trimmed = apiKey.trim();
    if (!trimmed.startsWith("am_")) {
      throw new Error(`AGENTMAIL_API_KEY does not look like an AgentMail key (starts with ${JSON.stringify(trimmed.slice(0, 5))}, length ${trimmed.length}). It must start with "am_".`);
    }

    const baseUrl = (process.env.AGENTMAIL_BASE_URL ?? DEFAULT_AGENTMAIL_BASE_URL).replace(/\/$/, "");

    // Discover the key's scope. Inbox-scoped or pod-scoped keys cannot create
    // top-level inboxes, so we route accordingly.
    const meResp = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${trimmed}` },
    });
    if (!meResp.ok) {
      const text = await meResp.text();
      throw new Error(
        `AgentMail API key rejected on /auth/me (status ${meResp.status}, key length ${trimmed.length}): ${text.slice(0, 500)}. ` +
        `Ensure AGENTMAIL_API_KEY is a valid AgentMail API key from console.agentmail.to.`
      );
    }
    const identity = (await meResp.json()) as {
      scope_type?: "organization" | "pod" | "inbox";
      scope_id?: string;
      organization_id?: string;
      pod_id?: string;
      inbox_id?: string;
    };

    const clientId = "mailhere-shared-inbox";
    const body = JSON.stringify({
      username: "mailhere",
      display_name: "MailHere",
      client_id: clientId,
    });

    let inbox: { inbox_id?: string; email?: string; address?: string };

    if (identity.scope_type === "inbox" && identity.inbox_id) {
      // Use the inbox the key is already bound to.
      const inboxResp = await fetch(`${baseUrl}/inboxes/${identity.inbox_id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      if (!inboxResp.ok) {
        const text = await inboxResp.text();
        throw new Error(`AgentMail inbox-scoped key cannot read its inbox (status ${inboxResp.status}): ${text.slice(0, 500)}.`);
      }
      inbox = await inboxResp.json();
    } else if (identity.scope_type === "organization") {
      const response = await fetch(`${baseUrl}/inboxes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${trimmed}`,
          "Content-Type": "application/json",
        },
        body,
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`AgentMail create inbox failed: ${response.status} ${text.slice(0, 500)}. Ensure the key has permission to create inboxes.`);
      }
      inbox = await response.json();
    } else if (identity.scope_type === "pod" && identity.pod_id) {
      // Pod-scoped keys must create inside the pod.
      const createResp = await fetch(`${baseUrl}/pods/${identity.pod_id}/inboxes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${trimmed}`,
          "Content-Type": "application/json",
        },
        body,
      });
      if (createResp.ok) {
        inbox = await createResp.json();
      } else if (createResp.status === 409 || createResp.status === 422) {
        // Likely already exists with this client_id; list and reuse.
        const listResp = await fetch(`${baseUrl}/pods/${identity.pod_id}/inboxes?limit=100`, {
          method: "GET",
          headers: { Authorization: `Bearer ${trimmed}` },
        });
        if (!listResp.ok) {
          const text = await listResp.text();
          throw new Error(`AgentMail pod inbox list failed: ${listResp.status} ${text.slice(0, 500)}.`);
        }
        const list = (await listResp.json()) as { inboxes?: Array<{ inbox_id?: string; email?: string; client_id?: string }> };
        const existing = list.inboxes?.find((i) => i.client_id === clientId);
        if (!existing || !existing.inbox_id) {
          const text = await createResp.text();
          throw new Error(`AgentMail create inbox failed: ${createResp.status} ${text.slice(0, 500)} and no existing inbox with client_id ${clientId} was found.`);
        }
        inbox = existing;
      } else {
        const text = await createResp.text();
        throw new Error(`AgentMail create inbox failed: ${createResp.status} ${text.slice(0, 500)}. Ensure the key has permission to create inboxes in pod ${identity.pod_id}.`);
      }
    } else {
      throw new Error(`Unsupported AgentMail key scope: ${identity.scope_type}. Use an organization-level, pod-scoped, or inbox-scoped API key.`);
    }

    const inboxId = inbox.inbox_id ?? "";
    const address = inbox.email ?? inbox.address ?? "";
    if (!inboxId) throw new Error("AgentMail did not return an inbox id");

    await ctx.runMutation(internal.settings.setSetting, {
      key: "agentmail_inbox_id",
      value: inboxId,
    });
    if (address) {
      await ctx.runMutation(internal.settings.setSetting, {
        key: "agentmail_inbox_address",
        value: address,
      });
    }
    return null;
  },
});

// Public trigger: called once from the dashboard after sign-in. Idempotent.
export const ensureSetup = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.runMutation(internal.crawler.seedSources, {});
    await ctx.scheduler.runAfter(0, internal.setup.ensureInbox, {});
    return null;
  },
});
