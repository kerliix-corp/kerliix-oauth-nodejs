import KerliixOAuth from "../dist/index.js";

(async () => {
  const client = new KerliixOAuth({
    clientId: "demo-client",
    redirectUri: "https://example.com/callback",
    baseUrl: "https://api.kerliix.com"
  });

  console.log("✅ Authorization URL:");
  console.log(client.getAuthUrl(["openid", "profile", "email"], "test123"));
})();
