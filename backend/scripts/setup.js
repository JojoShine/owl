#!/usr/bin/env node

/**
 * Owl Platform - 一键快速启动脚本
 * 跨平台支持 (Windows, macOS, Linux)
 *
 * 本脚本用于本地开发环境的快速启动
 *
 * 前端环境配置：
 *   - 开发环境：frontend/.env.local（http://localhost:3000）
 *   - 生产环境：frontend/.env.production（通过 nginx /owl 路径）
 *
 * 后端环境配置：
 *   - 开发环境：backend/.env（NODE_ENV=development）
 *   - 生产环境：backend/.env.production（NODE_ENV=production）
 *
 * 生产部署：
 *   1. 前端：npm run build && npm start
 *   2. 后端：NODE_ENV=production npm start 或使用 PM2
 */

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const readline = require('readline');

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// 日志函数
const logger = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 询问函数
const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

/**
 * 检查命令是否存在
 */
function commandExists(cmd) {
  const isWindows = process.platform === 'win32';
  const checkCmd = isWindows ? `where ${cmd}` : `which ${cmd}`;
  try {
    spawnSync(checkCmd, { shell: true, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查前置条件
 */
async function checkPrerequisites() {
  logger.info('检查前置条件...');

  // 检查 Node.js
  if (!commandExists('node')) {
    logger.error('Node.js 未安装，请先安装 Node.js >= 16.x');
    process.exit(1);
  }
  logger.success('Node.js 已安装');

  // 检查 npm
  if (!commandExists('npm')) {
    logger.error('npm 未安装');
    process.exit(1);
  }
  logger.success('npm 已安装');

  // 检查 PostgreSQL
  if (!commandExists('psql')) {
    logger.warning('PostgreSQL 未在 PATH 中，请确保 PostgreSQL 服务已启动');
  } else {
    logger.success('PostgreSQL 已安装');
  }

  // 检查 Redis
  if (!commandExists('redis-cli')) {
    logger.warning('Redis 未在 PATH 中，请确保 Redis 服务已启动');
  } else {
    logger.success('Redis 已安装');
  }
}

/**
 * 检查 .env 文件
 */
function checkEnvFile() {
  logger.info('检查环境配置...');

  const backendEnvPath = path.join(process.cwd(), 'backend', '.env');

  if (!fs.existsSync(backendEnvPath)) {
    const examplePath = path.join(process.cwd(), 'backend', '.env.example');

    if (fs.existsSync(examplePath)) {
      logger.warning('.env 文件不存在，正在复制 .env.example...');
      fs.copyFileSync(examplePath, backendEnvPath);
      logger.warning('已创建 .env 文件，请编辑 backend/.env 配置数据库等信息');
      return false;
    } else {
      logger.error('.env.example 文件不存在');
      return false;
    }
  }

  logger.success('已找到 .env 配置文件');
  return true;
}

/**
 * 读取 .env 文件
 */
function readEnvFile() {
  const envPath = path.join(process.cwd(), 'backend', '.env');
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  content.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });

  return env;
}

/**
 * 检查数据库配置
 */
function checkDatabaseConfig() {
  logger.info('检查数据库配置...');

  const env = readEnvFile();
  const requiredKeys = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

  const missing = requiredKeys.filter((key) => !env[key]);

  if (missing.length > 0) {
    logger.warning('数据库配置不完整，缺少: ' + missing.join(', '));
    return false;
  }

  logger.success('数据库配置完整');
  return true;
}

/**
 * 运行 npm 命令
 */
function runNpmCommand(cmd, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    logger.info(`运行: npm ${cmd}`);

    const child = spawn('npm', cmd.split(' '), {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令失败: npm ${cmd}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 安装依赖
 */
async function installDependencies() {
  logger.info('安装项目依赖...');

  try {
    // 后端依赖
    logger.info('安装后端依赖...');
    await runNpmCommand('install --legacy-peer-deps', path.join(process.cwd(), 'backend'));
    logger.success('后端依赖安装完成');

    // 前端依赖
    logger.info('安装前端依赖...');
    await runNpmCommand('install --legacy-peer-deps', path.join(process.cwd(), 'frontend'));
    logger.success('前端依赖安装完成');
  } catch (err) {
    logger.error(err.message);
    throw err;
  }
}

/**
 * 创建前端 .env.local
 */
function createFrontendEnv() {
  logger.info('检查前端环境配置...');

  const envPath = path.join(process.cwd(), 'frontend', '.env.local');

  if (!fs.existsSync(envPath)) {
    const envContent = `NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=Owl Platform
`;
    fs.writeFileSync(envPath, envContent);
    logger.success('已创建 .env.local 文件');
  } else {
    logger.success('前端环境配置已存在');
  }
}

/**
 * 初始化数据库
 */
async function initDatabase() {
  logger.info('初始化数据库...');

  try {
    await runNpmCommand('run db:reset', path.join(process.cwd(), 'backend'));
    logger.success('数据库初始化完成');
    logger.info('默认用户凭证:');
    logger.info('  用户名: admin  密码: Admin@123');
    logger.info('  用户名: manager  密码: Manager@123');
    logger.info('  用户名: user  密码: User@123');
  } catch (err) {
    logger.error(err.message);
    throw err;
  }
}

/**
 * 启动服务
 */
async function startServices() {
  logger.info('启动服务...');
  logger.info('后端将启动在: http://localhost:3001');
  logger.info('前端将启动在: http://localhost:3000');
  logger.warning('按 Ctrl+C 停止服务');

  const backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'backend'),
    stdio: 'inherit',
    shell: true,
  });

  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'frontend'),
    stdio: 'inherit',
    shell: true,
  });

  // 处理进程退出
  const cleanup = () => {
    backendProcess.kill();
    frontendProcess.kill();
    logger.info('服务已停止');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

/**
 * 主程序
 */
async function main() {
  console.clear?.() || console.log('\x1B[2J\x1B[0f');

  console.log(`${colors.blue}`);
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                 Owl Platform - 一键快速启动脚本                            ║');
  console.log('║                                                                            ║');
  console.log('║  本脚本将自动：                                                             ║');
  console.log('║  1. 检查依赖环境                                                            ║');
  console.log('║  2. 安装项目依赖                                                            ║');
  console.log('║  3. 初始化数据库                                                            ║');
  console.log('║  4. 启动后端和前端服务                                                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  try {
    // 检查前置条件
    await checkPrerequisites();

    console.log('');

    // 检查 .env 文件
    if (!checkEnvFile()) {
      logger.error('请编辑 backend/.env 文件配置数据库信息后，重新运行此脚本');
      process.exit(1);
    }

    console.log('');

    // 检查数据库配置
    if (!checkDatabaseConfig()) {
      logger.error('请编辑 backend/.env 文件配置以下内容:');
      logger.error('  DB_HOST=localhost');
      logger.error('  DB_PORT=5432');
      logger.error('  DB_NAME=owl_platform');
      logger.error('  DB_USER=postgres');
      logger.error('  DB_PASSWORD=your_password');
      process.exit(1);
    }

    console.log('');

    // 确认继续
    const answer = await question('是否继续安装依赖并初始化数据库? (y/n): ');
    if (answer.toLowerCase() !== 'y') {
      logger.info('已取消');
      process.exit(0);
    }

    console.log('');

    // 安装依赖
    await installDependencies();

    console.log('');

    // 创建前端环境配置
    createFrontendEnv();

    console.log('');

    // 初始化数据库
    await initDatabase();

    console.log('');

    logger.success('所有准备工作完成！');

    console.log('');

    // 启动服务
    rl.close();
    await startServices();
  } catch (err) {
    logger.error('启动失败: ' + err.message);
    process.exit(1);
  }
}

// 运行主程序
main();
