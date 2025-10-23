'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * 数据库迁移：初始化默认邮件模版
 *
 * 添加三个默认模版：
 * 1. CPU使用率告警模版 - 系统CPU超出阈值时的告警邮件
 * 2. 内存使用率告警模版 - 系统内存超出阈值时的告警邮件
 * 3. 接口异常告警模版 - API接口监控异常时的告警邮件
 *
 * 目的：
 * - 为新系统提供开箱即用的告警模版
 * - 用户无需从零开始创建模版
 * - 提供专业的模版示例作为参考
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const templates = [
      {
        id: uuidv4(),
        name: 'CPU使用率告警模版',
        subject: '【系统告警】CPU使用率超出阈值',
        content: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #ff6b6b; margin-top: 0;">⚠️ CPU使用率告警</h2>
    <p>您的系统CPU使用率已超出设定阈值，请及时处理。</p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #856404;">告警详情</h3>
      <p><strong>规则名称：</strong>{{ruleName}}</p>
      <p><strong>当前值：</strong>{{currentValue}}%</p>
      <p><strong>阈值：</strong>{{threshold}}%</p>
      <p><strong>告警级别：</strong>{{level}}</p>
      <p><strong>告警时间：</strong>{{timestamp}}</p>
    </div>

    <p style="color: #666; font-size: 14px;">
      建议检查系统进程，排查是否有异常进程占用大量CPU资源。
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>`,
        variable_schema: JSON.stringify([
          { name: 'ruleName', label: '规则名称', description: '触发告警的规则名称', type: 'string', required: true, example: 'CPU使用率过高告警' },
          { name: 'currentValue', label: '当前值', description: '当前CPU使用率', type: 'number', required: true, example: '85' },
          { name: 'threshold', label: '阈值', description: '告警阈值', type: 'number', required: true, example: '80' },
          { name: 'level', label: '告警级别', description: '告警级别（info/warning/error/critical）', type: 'string', required: true, example: 'warning' },
          { name: 'timestamp', label: '告警时间', description: '告警发生时间', type: 'string', required: true, example: '2025-10-22 14:30:00' }
        ]),
        tags: JSON.stringify(['system', 'alert', 'cpu']),
        description: '系统CPU使用率超出阈值时的告警邮件模版',
        template_type: 'SYSTEM_ALERT',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: '内存使用率告警模版',
        subject: '【系统告警】内存使用率超出阈值',
        content: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #ff6b6b; margin-top: 0;">⚠️ 内存使用率告警</h2>
    <p>您的系统内存使用率已超出设定阈值，请及时处理。</p>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #856404;">告警详情</h3>
      <p><strong>规则名称：</strong>{{ruleName}}</p>
      <p><strong>当前值：</strong>{{currentValue}}%</p>
      <p><strong>阈值：</strong>{{threshold}}%</p>
      <p><strong>告警级别：</strong>{{level}}</p>
      <p><strong>告警时间：</strong>{{timestamp}}</p>
    </div>

    <p style="color: #666; font-size: 14px;">
      建议检查系统内存占用情况，清理不必要的进程或增加系统内存。
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>`,
        variable_schema: JSON.stringify([
          { name: 'ruleName', label: '规则名称', description: '触发告警的规则名称', type: 'string', required: true, example: '内存使用率过高告警' },
          { name: 'currentValue', label: '当前值', description: '当前内存使用率', type: 'number', required: true, example: '90' },
          { name: 'threshold', label: '阈值', description: '告警阈值', type: 'number', required: true, example: '85' },
          { name: 'level', label: '告警级别', description: '告警级别（info/warning/error/critical）', type: 'string', required: true, example: 'error' },
          { name: 'timestamp', label: '告警时间', description: '告警发生时间', type: 'string', required: true, example: '2025-10-22 14:30:00' }
        ]),
        tags: JSON.stringify(['system', 'alert', 'memory']),
        description: '系统内存使用率超出阈值时的告警邮件模版',
        template_type: 'SYSTEM_ALERT',
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: '接口异常告警模版',
        subject: '【接口告警】{{apiName}} 接口异常',
        content: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
    <h2 style="color: #dc3545; margin-top: 0;">🚨 接口异常告警</h2>
    <p>检测到接口调用异常，请及时处理。</p>

    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #721c24;">异常详情</h3>
      <p><strong>接口名称：</strong>{{apiName}}</p>
      <p><strong>接口地址：</strong>{{apiUrl}}</p>
      <p><strong>请求方法：</strong>{{method}}</p>
      <p><strong>异常类型：</strong>{{errorType}}</p>
      <p><strong>错误信息：</strong>{{errorMessage}}</p>
      <p><strong>状态码：</strong>{{statusCode}}</p>
      <p><strong>响应时间：</strong>{{responseTime}}ms</p>
      <p><strong>发生时间：</strong>{{timestamp}}</p>
    </div>

    <p style="color: #666; font-size: 14px;">
      建议检查接口服务状态、网络连接和相关依赖服务。
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">
      此邮件由系统自动发送，请勿回复
    </p>
  </div>
</div>`,
        variable_schema: JSON.stringify([
          { name: 'apiName', label: '接口名称', description: '监控接口的名称', type: 'string', required: true, example: '用户登录接口' },
          { name: 'apiUrl', label: '接口地址', description: '接口URL', type: 'string', required: true, example: 'https://api.example.com/login' },
          { name: 'method', label: '请求方法', description: 'HTTP请求方法', type: 'string', required: true, example: 'POST' },
          { name: 'errorType', label: '异常类型', description: '异常类型（超时/状态码异常/响应内容异常）', type: 'string', required: true, example: '超时' },
          { name: 'errorMessage', label: '错误信息', description: '详细错误信息', type: 'string', required: false, example: '请求超时' },
          { name: 'statusCode', label: '状态码', description: 'HTTP响应状态码', type: 'number', required: false, example: '500' },
          { name: 'responseTime', label: '响应时间', description: '接口响应时间（毫秒）', type: 'number', required: false, example: '3500' },
          { name: 'timestamp', label: '发生时间', description: '异常发生时间', type: 'string', required: true, example: '2025-10-22 14:30:00' }
        ]),
        tags: JSON.stringify(['api', 'alert', 'monitor']),
        description: '接口监控异常时的告警邮件模版',
        template_type: 'API_MONITOR_ALERT',
        created_at: now,
        updated_at: now,
      },
    ];

    // 插入默认模版
    await queryInterface.bulkInsert('email_templates', templates);

    console.log('✓ 成功创建 3 个默认邮件模版：');
    console.log('  1. CPU使用率告警模版');
    console.log('  2. 内存使用率告警模版');
    console.log('  3. 接口异常告警模版');
  },

  down: async (queryInterface, Sequelize) => {
    // 删除默认模版（根据名称）
    await queryInterface.bulkDelete('email_templates', {
      name: {
        [Sequelize.Op.in]: [
          'CPU使用率告警模版',
          '内存使用率告警模版',
          '接口异常告警模版',
        ],
      },
    });

    console.log('✓ 成功删除默认邮件模版');
  },
};
