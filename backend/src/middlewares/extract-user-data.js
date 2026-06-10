/**
 * 中间件：提取用户数据和权限信息
 *
 * 在每个请求中：
 * 1. 从 JWT token 或 session 中获取 userId
 * 2. 查询用户信息和所在部门
 * 3. 获取用户部门及下级部门的所有用户 ID
 * 4. 将信息存储在 req.userContext 中供后续使用
 */

const db = require('../models');

/**
 * 提取用户数据中间件
 * @param {object} req - Express 请求对象
 * @param {object} res - Express 响应对象
 * @param {function} next - Express next 函数
 */
async function extractUserData(req, res, next) {
  try {
    // 假设 userId 已经从 JWT token 中提取并存储在 req.userId 中
    // 如果你使用的是其他认证方式，需要相应调整
    if (!req.userId) {
      // 如果没有 userId，创建一个最小的 userContext
      req.userContext = {
        userId: null,
        userDepartmentId: null,
        userDepartmentUsers: [],
        accessLevel: 'SELF',
      };
      return next();
    }

    // 查询用户信息
    const user = await db.User.findByPk(req.userId);

    if (!user) {
      return res.status(401).json({ code: 401, message: 'User not found' });
    }

    // 获取用户所在部门
    const userDepartmentId = user.department_id;

    // 获取用户所在部门的所有用户（包括用户本身）
    let userDepartmentUsers = [user.id];

    if (userDepartmentId) {
      // 查询本部门及下级部门的所有用户
      const departmentUsers = await db.User.findAll({
        where: {
          department_id: userDepartmentId,
        },
        attributes: ['id'],
        raw: true,
      });

      const departmentUserIds = departmentUsers.map(u => u.id);
      userDepartmentUsers = [...new Set([...userDepartmentUsers, ...departmentUserIds])];
    }

    // 从用户的 access_level 字段获取权限级别
    const accessLevel = user.access_level || 'SELF';

    // 将信息存储在 req.userContext 中
    req.userContext = {
      userId: user.id,
      userDepartmentId,
      userDepartmentUsers,
      accessLevel,
    };

    next();
  } catch (error) {
    console.error('Error in extractUserData middleware:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
}

module.exports = extractUserData;
