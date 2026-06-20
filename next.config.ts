import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/pricing",
        destination: "/?page=pricing",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
