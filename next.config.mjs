import withAnalyzer from "@next/bundle-analyzer";
export default withAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
