'use strict';

const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

/**
 * 通用变量映射服务
 *
 * 职责：
 * - 根据变量映射配置从数据对象中提取变量
 * - 支持嵌套路径、特殊值、类型转换
 * - 验证必填变量
 * - 智能推荐映射关系
 */
class VariableMapperService {
  /**
   * 根据映射配置从数据对象中提取变量
   * @param {Object} dataObject - 原始数据对象
   * @param {Object} variableMapping - 变量映射配置 { 模版变量名: 数据字段路径 }
   * @param {Array} variableSchema - 变量 Schema（可选，用于验证和类型转换）
   * @returns {Object} 提取后的变量对象
   */
  extractVariables(dataObject, variableMapping, variableSchema = []) {
    const variables = {};

    for (const [templateVar, dataPath] of Object.entries(variableMapping)) {
      // 1. 处理特殊值
      if (dataPath.startsWith('__') && dataPath.endsWith('__')) {
        variables[templateVar] = this.handleSpecialValue(dataPath, dataObject);
        continue;
      }

      // 2. 使用 lodash.get 提取嵌套字段
      let value = _.get(dataObject, dataPath);

      // 3. 应用默认值（如果提供了 schema）
      const schema = variableSchema.find(s => s.name === templateVar);
      if (value === undefined || value === null) {
        value = schema?.defaultValue ?? '';
      }

      // 4. 类型转换
      if (schema) {
        value = this.convertType(value, schema.type);
      }

      variables[templateVar] = value;
    }

    return variables;
  }

  /**
   * 处理特殊值
   * @param {String} specialValue - 特殊值标识符
   * @param {Object} dataObject - 数据对象（预留，某些特殊值可能需要）
   * @returns {*} 处理后的值
   */
  handleSpecialValue(specialValue, dataObject) {
    const handlers = {
      '__timestamp__': () => new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      '__date__': () => new Date().toLocaleDateString('zh-CN', {
        timeZone: 'Asia/Shanghai'
      }),
      '__time__': () => new Date().toLocaleTimeString('zh-CN', {
        timeZone: 'Asia/Shanghai'
      }),
      '__now__': () => Date.now(),
      '__uuid__': () => uuidv4(),
    };

    return handlers[specialValue]?.() ?? '';
  }

  /**
   * 类型转换
   * @param {*} value - 原始值
   * @param {String} type - 目标类型
   * @returns {*} 转换后的值
   */
  convertType(value, type) {
    if (value === null || value === undefined) return '';

    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value) || 0;
      case 'boolean':
        return Boolean(value);
      case 'date':
        return new Date(value).toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai'
        });
      case 'json':
        return typeof value === 'object' ? JSON.stringify(value) : value;
      default:
        return value;
    }
  }

  /**
   * 验证必填变量
   * @param {Object} variables - 提取后的变量对象
   * @param {Array} variableSchema - 变量 Schema
   * @returns {Object} { valid: Boolean, errors: Array<String> }
   */
  validateVariables(variables, variableSchema) {
    const errors = [];

    for (const schema of variableSchema) {
      if (schema.required && !variables[schema.name]) {
        errors.push(`缺少必填变量: ${schema.label || schema.name}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 生成映射建议（智能推荐）
   * 根据模版变量名和数据对象字段，推荐可能的映射关系
   * @param {Array} variableSchema - 变量 Schema
   * @param {Object} dataObject - 数据对象
   * @returns {Object} 推荐的映射关系
   */
  suggestMapping(variableSchema, dataObject) {
    const suggestions = {};

    for (const schema of variableSchema) {
      const varName = schema.name.toLowerCase();

      // 尝试精确匹配
      if (dataObject.hasOwnProperty(schema.name)) {
        suggestions[schema.name] = schema.name;
        continue;
      }

      // 尝试模糊匹配
      for (const key of Object.keys(dataObject)) {
        if (key.toLowerCase().includes(varName) ||
            varName.includes(key.toLowerCase())) {
          suggestions[schema.name] = key;
          break;
        }
      }

      // 使用示例值作为默认值（如果未找到匹配）
      if (!suggestions[schema.name] && schema.example) {
        suggestions[schema.name] = `__literal:${schema.example}__`;
      }
    }

    return suggestions;
  }
}

module.exports = new VariableMapperService();
