/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境部署路径（从环境变量读取）
  basePath: process.env.NODE_ENV === 'production' ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : '',

  // 静态资源前缀（生产环境）
  assetPrefix: process.env.NODE_ENV === 'production' ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : '',

  // 使用 standalone 输出（支持动态路由，适合 nginx 反向代理）
  output: 'standalone',

  // 图片优化配置
  images: {
    unoptimized: true,
  },

  // Turbopack优化配置（开发环境性能）
  experimental: {
    turbo: {
      // 启用增量编译，加快后续编译速度
      resolveAlias: {},
      // 优化开发环境
      looseEsm: true,
    },
  },

  // 跳过类型检查和ESLint（开发环境加快编译）
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },

  // 性能优化：启用SWC压缩和代码分割
  swcMinify: true,

  // 启用增量静态再生成（ISR）
  onDemandEntries: {
    maxInactiveAge: 15 * 1000, // 15秒后移除不使用的页面
    pagesBufferLength: 5, // 保持5个页面在缓冲区
  },

  // 优化webpack配置（仅Turbopack不支持时使用）
  webpack: (config, { isServer, dev }) => {
    // 开发模式优化
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false, // 开发环境不压缩，加快编译
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // 将大型库分离到单独的chunk
            reactVendor: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react-vendor',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // 其他第三方库
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 9,
              reuseExistingChunk: true,
              enforce: true,
            },
            // 共享的组件和工具
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  // 开发环境快速刷新优化
  reactStrictMode: false, // 关闭严格模式（开发时会触发双重渲染）
};

export default nextConfig;
