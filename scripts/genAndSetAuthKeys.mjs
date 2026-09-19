import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { execFileSync } from "node:child_process";

const { publicKey, privateKey } = await generateKeyPair("RS256", {
  extractable: true,
});
const pkcs8 = await exportPKCS8(privateKey);
const jwk = await exportJWK(publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...jwk }] });

const set = (name, value) =>
  execFileSync(
    process.execPath,
    ["node_modules/convex/bin/main.js", "env", "set", name],
    { input: value, stdio: ["pipe", "ignore", "inherit"] },
  );

set("JWT_PRIVATE_KEY", pkcs8.trim());
set("JWKS", jwks);
set("SITE_URL", process.env.CONVEX_SITE_URL ?? "http://127.0.0.1:3211");
console.log("Auth keys generated and set on the deployment.");
