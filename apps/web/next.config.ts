import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["@mi-dia/core", "@mi-dia/types", "@mi-dia/validators"],
};
export default nextConfig;
