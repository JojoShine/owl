/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境部署在 /owl 路径下
  basePath: process.env.NODE_ENV === 'production' ? '/owl' : '',

  // 静态资源前缀（生产环境）
  assetPrefix: process.env.NODE_ENV === 'production' ? '/owl' : '',

  // 使用 standalone 输出（支持动态路由，适合 nginx 反向代理）
  output: 'standalone',

  // 图片优化配置
  images: {
    unoptimized: true,
  },

  // 跳过类型检查和ESLint（可选，加快构建速度）
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
