/**
 * 数据访问控制（DAC）工具类
 * 基于 createdBy 字段的细粒度权限检查
 *
 * 支持四种权限级别：
 * - ALL: 可以看所有数据
 * - DEPARTMENT: 可以看本部门的数据
 * - DEPARTMENT_CHILDREN: 可以看本部门及下级部门的数据
 * - SELF: 只能看自己创建的数据
 */

const { Op } = require('sequelize');

class DataAccessControl {
  constructor(userId, userDepartmentUsers = []) {
    this.userId = userId;
    // userDepartmentUsers 是一个数组，包含本部门及下级部门的所有用户 ID
    this.userDepartmentUsers = Array.isArray(userDepartmentUsers) ? userDepartmentUsers : [];
  }

  /**
   * 获取权限级别对应的过滤条件
   * @param {string} accessLevel - 权限级别：ALL, DEPARTMENT, DEPARTMENT_CHILDREN, SELF
   * @returns {object} Sequelize WHERE 子句
   */
  getFilterWhere(accessLevel) {
    switch (accessLevel) {
      case 'ALL':
        // 无过滤，可以看所有数据
        return {};

      case 'SELF':
        // 只能看自己创建的数据
        return { created_by: this.userId };

      case 'DEPARTMENT':
      case 'DEPARTMENT_CHILDREN':
        // 本部门及下级部门的所有用户创建的数据
        if (this.userDepartmentUsers.length === 0) {
          // 如果没有部门用户，默认只能看自己的
          return { created_by: this.userId };
        }
        return { created_by: { [Op.in]: this.userDepartmentUsers } };

      default:
        throw new Error(`Invalid access level: ${accessLevel}`);
    }
  }

  /**
   * 检查用户是否可以访问该条数据
   * @param {object} record - 数据记录
   * @param {string} accessLevel - 权限级别
   * @returns {boolean} 是否可以访问
   */
  canAccess(record, accessLevel) {
    if (!record || !record.created_by) {
      // 如果记录或 created_by 不存在，默认不允许访问
      return false;
    }

    switch (accessLevel) {
      case 'ALL':
        return true;

      case 'SELF':
        return record.created_by === this.userId;

      case 'DEPARTMENT':
      case 'DEPARTMENT_CHILDREN':
        return this.userDepartmentUsers.includes(record.created_by);

      default:
        return false;
    }
  }

  /**
   * 获取用户的实际访问权限级别（从用户的 access_level 属性）
   * @param {object} user - 用户对象（需要包含 access_level 字段）
   * @returns {string} 权限级别
   */
  static getUserAccessLevel(user) {
    if (!user || !user.access_level) {
      return 'SELF';
    }
    return user.access_level;
  }
}

module.exports = DataAccessControl;
