/**
 * 邮件模版标准变量定义
 * 为不同类型的邮件模版定义可用的变量集合
 */

const EMAIL_TEMPLATE_VARIABLES = {
  /**
   * 接口监控告警模版
   */
  API_MONITOR_ALERT: {
    name: '接口监控告警',
    description: '用于接口监控失败时发送告警邮件',
    variables: {
      monitorName: {
        label: '监控名称',
        description: '接口监控的名称',
        example: '用户服务健康检查',
      },
      url: {
        label: '接口地址',
        description: '被监控的接口URL',
        example: 'https://api.example.com/health',
      },
      method: {
        label: '请求方法',
        description: 'HTTP请求方法',
        example: 'GET',
      },
      status: {
        label: '监控状态',
        description: '监控检测结果状态',
        example: 'failed',
      },
      statusCode: {
        label: 'HTTP状态码',
        description: '接口返回的HTTP状态码',
        example: '500',
      },
      errorMessage: {
        label: '错误信息',
        description: '监控失败的详细错误信息',
        example: '请求超时',
      },
      responseTime: {
        label: '响应时间',
        description: '接口响应时间',
        example: '3000ms',
      },
      timestamp: {
        label: '告警时间',
        description: '告警发生的时间',
        example: '2025-10-21 15:30:00',
      },
    },
  },

  /**
   * 系统监控告警模版
   */
  SYSTEM_ALERT: {
    name: '系统监控告警',
    description: '用于系统指标异常时发送告警邮件',
    variables: {
      ruleName: {
        label: '规则名称',
        description: '告警规则的名称',
        example: 'CPU使用率过高告警',
      },
      metricType: {
        label: '监控类型',
        description: '监控指标类型',
        example: '系统',
      },
      metricName: {
        label: '指标名称',
        description: '具体的监控指标',
        example: 'CPU使用率',
      },
      currentValue: {
        label: '当前值',
        description: '指标的当前值',
        example: '85.5',
      },
      threshold: {
        label: '阈值',
        description: '告警阈值',
        example: '80',
      },
      condition: {
        label: '条件',
        description: '触发条件',
        example: '>',
      },
      level: {
        label: '告警级别',
        description: '告警的严重程度',
        example: 'warning',
      },
      message: {
        label: '告警信息',
        description: '完整的告警消息',
        example: 'CPU使用率过高告警: cpu_usage 当前值 85.50 > 80',
      },
      timestamp: {
        label: '告警时间',
        description: '告警发生的时间',
        example: '2025-10-21 15:30:00',
      },
    },
  },

  /**
   * 通用通知模版
   */
  GENERAL_NOTIFICATION: {
    name: '通用通知',
    description: '用于一般性通知邮件',
    variables: {
      title: {
        label: '标题',
        description: '通知标题',
        example: '系统维护通知',
      },
      content: {
        label: '内容',
        description: '通知的主要内容',
        example: '系统将于今晚22:00进行维护',
      },
      userName: {
        label: '用户名',
        description: '接收通知的用户名',
        example: '张三',
      },
      timestamp: {
        label: '时间',
        description: '通知时间',
        example: '2025-10-21 15:30:00',
      },
    },
  },
};

/**
 * 获取所有模版类型
 */
function getTemplateTypes() {
  return Object.keys(EMAIL_TEMPLATE_VARIABLES).map(key => ({
    value: key,
    label: EMAIL_TEMPLATE_VARIABLES[key].name,
    description: EMAIL_TEMPLATE_VARIABLES[key].description,
  }));
}

/**
 * 获取指定模版类型的变量列表
 */
function getVariablesByType(templateType) {
  const template = EMAIL_TEMPLATE_VARIABLES[templateType];
  if (!template) {
    return [];
  }

  return Object.keys(template.variables).map(key => ({
    name: key,
    ...template.variables[key],
  }));
}

/**
 * 验证变量是否存在于指定模版类型中
 */
function validateVariable(templateType, variableName) {
  const template = EMAIL_TEMPLATE_VARIABLES[templateType];
  if (!template) {
    return false;
  }

  return template.variables.hasOwnProperty(variableName);
}

module.exports = {
  EMAIL_TEMPLATE_VARIABLES,
  getTemplateTypes,
  getVariablesByType,
  validateVariable,
};
