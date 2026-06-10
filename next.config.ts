import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Parent Projects folder also has a lockfile; pin the workspace root here.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
