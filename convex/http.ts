import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { components } from "./_generated/api";
import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { AgentMail } from "@agentmail/convex";
import { auth } from "./auth";

const agentmail = new AgentMail(components.agentmail);

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/agentmail/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) =>
    agentmail.handleWebhook(ctx as never, req),
  ),
});

// App-owned root routing: exact routes above win; everything else serves the
// static site. Keeps auth + webhook URLs at their stable paths.
registerStaticRoutes(http, components.staticHosting);

export default http;
