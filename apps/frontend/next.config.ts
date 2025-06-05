import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "4c5992f7-83a7-4636-9f2b-00bae7a41784"
});

export default withCivicAuth(nextConfig);
