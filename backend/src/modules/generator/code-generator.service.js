const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');
const { logger } = require('../../config/logger');
const ApiError = require('../../utils/ApiError');
const moduleConfigService = require('./module-config.service');
const { handlebarsHelpers, getJoiType } = require('./template-helpers');
const { clearCache } = require('../../config/rbac');

// 注册 Handlebars 辅助函数
Object.keys(handlebarsHelpers).forEach((helperName) => {
  Handlebars.registerHelper(helperName, handlebarsHelpers[helperName]);
});

class CodeGeneratorService {
  constructor() {
    // 模板目录路径
    this.templateDir = path.join(__dirname, 'templates');

    // 项目根目录
    this.projectRoot = path.join(__dirname, '../../../');

    // 后端代码生成目录
    this.backendModulesDir = path.join(this.projectRoot, 'src/modules');

    // 模板文件映射（仅后端，前端改为配置驱动）
    this.templates = {
      backend: {
        model: 'backend-model.hbs',
        service: 'backend-service.hbs',
        controller: 'backend-controller.hbs',
        routes: 'backend-routes.hbs',
        validation: 'backend-validation.hbs',
      },
      // 前端模板已移除，改为配置驱动的动态渲染
    };
  }

  /**
   * 生成代码
   * @param {String} moduleId - 模块配置 ID
   * @param {Object} options - 生成选项
   * @returns {Promise<Object>} 生成结果
   */
  async generateCode(moduleId, options = {}) {
    try {
      // 获取模块配置
      const moduleConfig = await moduleConfigService.getModuleConfigById(moduleId);

      // 读取数据库表结构
      const tableSchema = await this._readTableSchema(moduleConfig.table_name);

      // 准备模板数据（使用实际的表结构）
      const templateData = this._prepareTemplateData(moduleConfig, tableSchema);

      // ==========================================
      // 配置驱动架构 - 零文件生成，零重启
      // ==========================================

      // 生成前端页面配置（配置驱动，无需生成文件）
      if (options.generateFrontend !== false) {
        await this._generatePageConfig(moduleConfig);
        logger.info(`✓ Page config saved to database for module: ${moduleConfig.module_name}`);
      }

      // 自动创建菜单和权限
      await this._createMenu(moduleConfig);
      logger.info(`✓ Menu and permissions created for module: ${moduleConfig.module_name}`);

      // 配置驱动说明
      logger.info('=========================================');
      logger.info('  配置驱动架构 - 零文件生成，零重启');
      logger.info('=========================================');
      logger.info(`✓ 模块配置已保存到数据库`);
      logger.info(`✓ 前端页面配置已保存 (page_config)`);
      logger.info(`✓ 菜单和权限已创建`);
      logger.info(`✓ 路由通过 dynamic-routes.js 自动加载`);
      logger.info(`✓ 请求由 generic.controller + generic.service 处理`);
      logger.info(`✓ 无需重启应用，配置立即生效！`);
      logger.info('=========================================');

      return {
        success: true,
        moduleName: moduleConfig.module_name,
        modulePath: moduleConfig.module_path,
        configDriven: true,
        filesGenerated: 0,
        message: '配置驱动架构 - 无需生成文件，零重启！',
      };
    } catch (error) {
      logger.error('Code generation failed:', error);
      throw error;
    }
  }

  /**
   * 创建菜单
   * @param {Object} moduleConfig - 模块配置
   */
  async _createMenu(moduleConfig) {
    try {
      const db = require('../../models');

      // 检查菜单是否已存在
      const existingMenu = await db.Menu.findOne({
        where: { path: `/${moduleConfig.module_path}` }
      });

      if (existingMenu) {
        logger.info(`Menu already exists for module: ${moduleConfig.module_name}`);
        return;
      }

      // 创建菜单
      const menu = await db.Menu.create({
        name: moduleConfig.menu_name || moduleConfig.description || moduleConfig.module_name,
        path: `/${moduleConfig.module_path}`,
        icon: moduleConfig.menu_icon || 'FileText',
        sort: moduleConfig.menu_sort || 100,
        parent_id: moduleConfig.menu_parent_id || null,
        visible: true,
        status: 'active',
        type: 'menu',
      });

      logger.info(`Menu created for module: ${moduleConfig.module_name}`, { menuId: menu.id });

      // 创建权限
      const resource = moduleConfig.permission_prefix || moduleConfig.module_path;
      const permissions = [
        {
          code: `${resource}:read`,
          resource: resource,
          action: 'read',
          name: `查看${moduleConfig.description}`,
          description: `查看${moduleConfig.description}列表和详情`
        },
        {
          code: `${resource}:create`,
          resource: resource,
          action: 'create',
          name: `创建${moduleConfig.description}`,
          description: `创建新${moduleConfig.description}`
        },
        {
          code: `${resource}:update`,
          resource: resource,
          action: 'update',
          name: `更新${moduleConfig.description}`,
          description: `更新${moduleConfig.description}信息`
        },
        {
          code: `${resource}:delete`,
          resource: resource,
          action: 'delete',
          name: `删除${moduleConfig.description}`,
          description: `删除${moduleConfig.description}`
        },
      ];

      for (const permData of permissions) {
        const existingPerm = await db.Permission.findOne({ where: { code: permData.code } });
        if (!existingPerm) {
          await db.Permission.create(permData);
          logger.info(`Permission created: ${permData.code}`);
        }
      }

      // 为管理员角色分配菜单和权限
      // 查找所有管理员角色（支持 admin 和 super_admin）
      const adminRoles = await db.Role.findAll({
        where: {
          code: { [db.Sequelize.Op.in]: ['admin', 'super_admin'] }
        }
      });

      if (adminRoles.length === 0) {
        logger.warn(`No admin roles found. Menu created but not assigned to any role. Module: ${moduleConfig.module_name}`);
        logger.warn('Please ensure admin or super_admin roles exist in the database.');
        return;
      }

      logger.info(`Found ${adminRoles.length} admin role(s) for menu assignment:`, {
        roles: adminRoles.map(r => r.code),
        moduleName: moduleConfig.module_name
      });

      // 统计关联创建结果
      let menuAssignmentCount = 0;
      let permissionAssignmentCount = 0;

      // 为每个管理员角色创建菜单和权限关联
      for (const role of adminRoles) {
        try {
          // 关联菜单
          const [roleMenu, menuCreated] = await db.RoleMenu.findOrCreate({
            where: {
              role_id: role.id,
              menu_id: menu.id,
            }
          });

          if (menuCreated) {
            menuAssignmentCount++;
            logger.info(`Menu assigned to role '${role.code}' for module: ${moduleConfig.module_name}`);
          } else {
            logger.debug(`Menu already assigned to role '${role.code}' for module: ${moduleConfig.module_name}`);
          }

          // 关联权限
          for (const permData of permissions) {
            const permission = await db.Permission.findOne({ where: { code: permData.code } });
            if (permission) {
              const [rolePerm, permCreated] = await db.RolePermission.findOrCreate({
                where: {
                  role_id: role.id,
                  permission_id: permission.id,
                }
              });

              if (permCreated) {
                permissionAssignmentCount++;
              }
            } else {
              logger.warn(`Permission not found: ${permData.code}`);
            }
          }
        } catch (error) {
          logger.error(`Failed to assign menu/permissions to role '${role.code}':`, error);
        }
      }

      logger.info(`Menu and permissions assignment completed for module: ${moduleConfig.module_name}`, {
        rolesProcessed: adminRoles.length,
        menuAssignments: menuAssignmentCount,
        permissionAssignments: permissionAssignmentCount
      });

      // 清除RBAC缓存，确保新权限立即生效
      clearCache();
      logger.info(`RBAC cache cleared for module: ${moduleConfig.module_name}`);
    } catch (error) {
      logger.error('Failed to create menu:', error);
      // 不抛出错误，避免影响代码生成
    }
  }

  /**
   * 自动注册路由到主路由文件
   * @param {Object} moduleConfig - 模块配置
   */
  async _registerRoute(moduleConfig) {
    try {
      const routesFilePath = path.join(this.projectRoot, 'src/routes/index.js');

      // 读取主路由文件
      const routesContent = await fs.readFile(routesFilePath, 'utf-8');

      const modulePath = moduleConfig.module_path;
      const routeVarName = modulePath.replace(/-/g, '') + 'Routes'; // 例如: test-products -> testproductsRoutes
      const requireStatement = `const ${routeVarName} = require('../modules/${modulePath}/${modulePath}.routes');`;
      const useStatement = `router.use('/${modulePath}', ${routeVarName});`;

      // 检查是否已经注册
      if (routesContent.includes(requireStatement) && routesContent.includes(useStatement)) {
        logger.info(`Route already registered for module: ${moduleConfig.module_name}`);
        return;
      }

      let updatedContent = routesContent;

      // 1. 添加 require 语句（在 generatorRoutes 之后）
      if (!routesContent.includes(requireStatement)) {
        const generatorRequire = "const generatorRoutes = require('../modules/generator/generator.routes');";
        if (routesContent.includes(generatorRequire)) {
          updatedContent = updatedContent.replace(
            generatorRequire,
            `${generatorRequire}\n${requireStatement}`
          );
          logger.info(`Added require statement for ${modulePath}`);
        }
      }

      // 2. 添加 router.use 语句（在 generator 路由之后，健康检查之前）
      if (!updatedContent.includes(useStatement)) {
        const generatorUse = "router.use('/generator', generatorRoutes);";
        if (updatedContent.includes(generatorUse)) {
          updatedContent = updatedContent.replace(
            generatorUse,
            `${generatorUse}\n\n// 动态生成的模块路由\n${useStatement}`
          );
          logger.info(`Added router.use statement for ${modulePath}`);
        }
      }

      // 写回文件
      await fs.writeFile(routesFilePath, updatedContent, 'utf-8');

      logger.info(`Route registered successfully for module: ${moduleConfig.module_name}`);
    } catch (error) {
      logger.error('Failed to register route:', error);
      // 不抛出错误，避免影响代码生成
      logger.warn('Please manually register the route in src/routes/index.js');
    }
  }

  /**
   * 自动注册模型到 models/index.js
   * @param {Object} moduleConfig - 模块配置
   */
  async _registerModel(moduleConfig) {
    try {
      const modelsIndexPath = path.join(this.projectRoot, 'src/models/index.js');

      // 读取 models/index.js 文件
      let modelsContent = await fs.readFile(modelsIndexPath, 'utf-8');

      const moduleName = moduleConfig.module_name;
      const modelRequireStatement = `db.${moduleName} = require('./${moduleName}')(sequelize, Sequelize.DataTypes);`;

      // 检查是否已经注册
      if (modelsContent.includes(modelRequireStatement)) {
        logger.info(`Model already registered for module: ${moduleConfig.module_name}`);
        return;
      }

      // 查找插入位置（在 "// 导入中间表模型" 之前）
      const insertMarker = '// 导入中间表模型';

      if (modelsContent.includes(insertMarker)) {
        // 在标记之前插入新的模型导入
        modelsContent = modelsContent.replace(
          insertMarker,
          `// 动态生成的模型\n${modelRequireStatement}\n\n${insertMarker}`
        );
      } else {
        // 如果找不到标记，在设置模型关联之前插入
        const associateMarker = '// 设置模型关联';
        if (modelsContent.includes(associateMarker)) {
          modelsContent = modelsContent.replace(
            associateMarker,
            `// 动态生成的模型\n${modelRequireStatement}\n\n${associateMarker}`
          );
        }
      }

      // 写回文件
      await fs.writeFile(modelsIndexPath, modelsContent, 'utf-8');

      logger.info(`Model registered successfully for module: ${moduleConfig.module_name}`);
    } catch (error) {
      logger.error('Failed to register model:', error);
      // 不抛出错误，避免影响代码生成
      logger.warn('Please manually register the model in src/models/index.js');
    }
  }

  /**
   * 移除模型注册
   * @param {Object} moduleConfig - 模块配置
   */
  async _unregisterModel(moduleConfig) {
    try {
      const modelsIndexPath = path.join(this.projectRoot, 'src/models/index.js');

      // 读取 models/index.js 文件
      let modelsContent = await fs.readFile(modelsIndexPath, 'utf-8');

      const moduleName = moduleConfig.module_name;
      const modelRequireStatement = `db.${moduleName} = require('./${moduleName}')(sequelize, Sequelize.DataTypes);`;

      // 检查是否存在注册
      if (!modelsContent.includes(modelRequireStatement)) {
        logger.info(`Model not registered for module: ${moduleConfig.module_name}`);
        return;
      }

      // 移除模型注册语句（包括前后可能的注释和换行）
      const lines = modelsContent.split('\n');
      const filteredLines = [];
      let skipNextEmptyLine = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 跳过包含模型注册的行
        if (line.includes(modelRequireStatement)) {
          skipNextEmptyLine = true;
          continue;
        }

        // 跳过紧跟在模型注册后的空行
        if (skipNextEmptyLine && line.trim() === '') {
          skipNextEmptyLine = false;
          continue;
        }

        skipNextEmptyLine = false;
        filteredLines.push(line);
      }

      modelsContent = filteredLines.join('\n');

      // 写回文件
      await fs.writeFile(modelsIndexPath, modelsContent, 'utf-8');

      logger.info(`Model unregistered successfully for module: ${moduleConfig.module_name}`);
    } catch (error) {
      logger.error('Failed to unregister model:', error);
      // 不抛出错误，避免影响删除流程
      logger.warn('Please manually remove the model from src/models/index.js');
    }
  }

  /**
   * 删除菜单和权限
   * @param {Object} moduleConfig - 模块配置
   */
  async _deleteMenu(moduleConfig) {
    try {
      const db = require('../../models');

      // 查找菜单
      const menu = await db.Menu.findOne({
        where: { path: `/${moduleConfig.module_path}` }
      });

      if (!menu) {
        logger.info(`Menu not found for module: ${moduleConfig.module_name}`);
        return;
      }

      // 删除角色菜单关联
      await db.RoleMenu.destroy({
        where: { menu_id: menu.id }
      });

      // 删除菜单
      await menu.destroy();
      logger.info(`Menu deleted for module: ${moduleConfig.module_name}`);

      // 删除权限
      const resource = moduleConfig.permission_prefix || moduleConfig.module_path;
      const permissions = await db.Permission.findAll({
        where: { resource: resource }
      });

      for (const permission of permissions) {
        // 删除角色权限关联
        await db.RolePermission.destroy({
          where: { permission_id: permission.id }
        });

        // 删除权限
        await permission.destroy();
        logger.info(`Permission deleted: ${permission.code}`);
      }

      // 清除RBAC缓存
      clearCache();
      logger.info(`RBAC cache cleared for module: ${moduleConfig.module_name}`);
    } catch (error) {
      logger.error('Failed to delete menu:', error);
      // 不抛出错误，避免影响删除流程
    }
  }

  /**
   * 移除路由注册
   * @param {Object} moduleConfig - 模块配置
   */
  async _unregisterRoute(moduleConfig) {
    try {
      const routesFilePath = path.join(this.projectRoot, 'src/routes/index.js');

      // 读取主路由文件
      let routesContent = await fs.readFile(routesFilePath, 'utf-8');

      const modulePath = moduleConfig.module_path;
      const routeVarName = modulePath.replace(/-/g, '') + 'Routes';
      const requireStatement = `const ${routeVarName} = require('../modules/${modulePath}/${modulePath}.routes');`;
      const useStatement = `router.use('/${modulePath}', ${routeVarName});`;

      // 检查是否存在注册
      if (!routesContent.includes(requireStatement) && !routesContent.includes(useStatement)) {
        logger.info(`Route not registered for module: ${moduleConfig.module_name}`);
        return;
      }

      // 移除 require 语句
      if (routesContent.includes(requireStatement)) {
        routesContent = routesContent.replace(requireStatement + '\n', '');
        logger.info(`Removed require statement for ${modulePath}`);
      }

      // 移除 router.use 语句（包括可能的注释）
      if (routesContent.includes(useStatement)) {
        // 移除整行，包括可能的注释
        const lines = routesContent.split('\n');
        const filteredLines = lines.filter(line => {
          return !line.includes(useStatement) &&
                 !(line.trim() === '// 动态生成的模块路由' && lines[lines.indexOf(line) + 1]?.includes(useStatement));
        });
        routesContent = filteredLines.join('\n');
        logger.info(`Removed router.use statement for ${modulePath}`);
      }

      // 写回文件
      await fs.writeFile(routesFilePath, routesContent, 'utf-8');

      logger.info(`Route unregistered successfully for module: ${moduleConfig.module_name}`);
    } catch (error) {
      logger.error('Failed to unregister route:', error);
      // 不抛出错误，避免影响删除流程
      logger.warn('Please manually remove the route from src/routes/index.js');
    }
  }

  /**
   * 生成后端文件
   */
  async _generateBackendFiles(templateData) {
    const { modulePath, moduleName } = templateData;
    const moduleDir = path.join(this.backendModulesDir, modulePath);
    const modelsDir = path.join(this.projectRoot, 'src/models');
    const generatedFiles = [];

    // 确保模块目录存在
    await this._ensureDir(moduleDir);

    // 生成各个后端文件
    const backendFileConfigs = [
      {
        template: this.templates.backend.model,
        output: path.join(modelsDir, `${moduleName}.js`),
      },
      {
        template: this.templates.backend.service,
        output: path.join(moduleDir, `${modulePath}.service.js`),
      },
      {
        template: this.templates.backend.controller,
        output: path.join(moduleDir, `${modulePath}.controller.js`),
      },
      {
        template: this.templates.backend.routes,
        output: path.join(moduleDir, `${modulePath}.routes.js`),
      },
      // validation 文件已移除，减少文件生成数量，避免频繁重启
    ];

    for (const config of backendFileConfigs) {
      const content = await this._renderTemplate(config.template, templateData);
      await this._writeFile(config.output, content);
      generatedFiles.push(config.output);
    }

    return generatedFiles;
  }

  /**
   * 生成前端页面配置（配置驱动，无需生成文件）
   * @param {Object} moduleConfig - 模块配置
   */
  async _generatePageConfig(moduleConfig) {
    try {
      const configBuilderService = require('./config-builder.service');

      // 构建页面配置
      const pageConfig = configBuilderService.buildPageConfig(
        moduleConfig,
        moduleConfig.fields || []
      );

      // 验证配置
      if (!configBuilderService.validatePageConfig(pageConfig)) {
        throw new Error('Invalid page config generated');
      }

      // 保存到数据库
      await moduleConfig.update({ page_config: pageConfig });

      logger.info(`Page config saved to database for module: ${moduleConfig.module_name}`);

      return pageConfig;
    } catch (error) {
      logger.error('Failed to generate page config:', error);
      throw error;
    }
  }

  /**
   * 读取数据库表结构
   * @param {string} tableName - 表名
   * @returns {Promise<Array>} 表字段列表
   */
  async _readTableSchema(tableName) {
    try {
      const db = require('../../models');

      // 查询 PostgreSQL information_schema 获取表结构
      const query = `
        SELECT
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default,
          udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = :tableName
        ORDER BY ordinal_position
      `;

      const columns = await db.sequelize.query(query, {
        replacements: { tableName },
        type: db.sequelize.QueryTypes.SELECT,
      });

      logger.info(`Read table schema for ${tableName}: ${columns.length} columns`);

      return columns;
    } catch (error) {
      logger.error(`Failed to read table schema for ${tableName}:`, error);
      throw ApiError.internal(`无法读取表结构: ${tableName}`);
    }
  }

  /**
   * 将 PostgreSQL 数据类型映射到 Sequelize 数据类型
   * @param {Object} column - 列信息
   * @returns {string} Sequelize 数据类型
   */
  _mapPostgresToSequelize(column) {
    const { data_type, udt_name, character_maximum_length } = column;

    // 类型映射表
    const typeMap = {
      'integer': 'INTEGER',
      'bigint': 'BIGINT',
      'smallint': 'SMALLINT',
      'numeric': 'DECIMAL',
      'real': 'FLOAT',
      'double precision': 'DOUBLE',
      'character varying': character_maximum_length ? `STRING(${character_maximum_length})` : 'STRING',
      'varchar': character_maximum_length ? `STRING(${character_maximum_length})` : 'STRING',
      'character': 'CHAR',
      'text': 'TEXT',
      'boolean': 'BOOLEAN',
      'date': 'DATEONLY',
      'timestamp without time zone': 'DATE',
      'timestamp with time zone': 'DATE',
      'time': 'TIME',
      'json': 'JSON',
      'jsonb': 'JSONB',
      'uuid': 'UUID',
      'bytea': 'BLOB',
    };

    return typeMap[data_type] || typeMap[udt_name] || 'STRING';
  }

  /**
   * 准备模板数据
   */
  _prepareTemplateData(moduleConfig, tableSchema = null) {
    // 如果提供了 tableSchema，使用实际的数据库表结构
    // 否则使用配置的字段信息（向后兼容）
    let allFields = [];

    if (tableSchema && tableSchema.length > 0) {
      // 使用实际的数据库表结构
      allFields = tableSchema
        .filter(col => !['created_at', 'updated_at', 'deleted_at'].includes(col.column_name)) // 排除时间戳字段
        .map(col => ({
          name: col.column_name,
          type: this._mapPostgresToSequelize(col),
          nullable: col.is_nullable === 'YES',
          defaultValue: col.column_default,
          comment: col.column_name.replace(/_/g, ' '), // 简单的注释生成
          isPrimary: col.column_name === 'id',
        }));

      logger.info(`Using table schema: ${allFields.length} fields`);
    } else {
      // 使用配置的字段（向后兼容）
      const configFields = moduleConfig.fields || [];
      allFields = configFields.map(f => ({
        name: f.field_name,
        type: f.field_type,
        nullable: !f.is_required,
        defaultValue: f.form_default,
        comment: f.field_comment,
        isPrimary: f.field_name === 'id',
      }));

      logger.info(`Using config fields: ${allFields.length} fields`);
    }

    // 为模型生成准备字段列表
    const modelFields = allFields;

    // 提取搜索字段（用于 Service）
    const searchFields = allFields
      .filter(f => ['string', 'STRING', 'TEXT'].some(t => f.type.includes(t)))
      .map(f => ({
        name: f.name,
        type: f.type,
        comment: f.comment,
        joiType: 'string', // 搜索字段都是字符串
        searchType: 'like',
      }));

    // 提取列表显示字段
    const listFields = allFields
      .filter(f => f.name !== 'id')
      .slice(0, 5) // 默认显示前5个字段
      .map(f => ({
        name: f.name,
        comment: f.comment,
      }));

    // 提取表单字段
    const formFields = allFields
      .filter(f => !f.isPrimary && f.name !== 'id')
      .map(f => {
        // 根据 Sequelize 类型推断 Joi 类型
        let joiType = 'string';
        if (f.type.includes('INTEGER') || f.type.includes('BIGINT') || f.type.includes('FLOAT') || f.type.includes('DOUBLE') || f.type.includes('DECIMAL')) {
          joiType = 'number';
        } else if (f.type.includes('BOOLEAN')) {
          joiType = 'boolean';
        } else if (f.type.includes('DATE')) {
          joiType = 'date';
        }

        return {
          name: f.name,
          type: f.type,
          comment: f.comment,
          required: !f.nullable,
          defaultValue: f.defaultValue,
          joiType: joiType,
          maxLength: f.type.includes('STRING') ? null : undefined, // STRING 类型可能有长度限制
        };
      });

    return {
      // 模块信息
      tableName: moduleConfig.table_name,
      moduleName: moduleConfig.module_name,
      modulePath: moduleConfig.module_path,
      description: moduleConfig.description,
      permissionPrefix: moduleConfig.permission_prefix || moduleConfig.module_path,

      // 功能开关
      enableCreate: moduleConfig.enable_create !== false,
      enableUpdate: moduleConfig.enable_update !== false,
      enableDelete: moduleConfig.enable_delete !== false,
      enableBatchDelete: moduleConfig.enable_batch_delete !== false,
      enableExport: moduleConfig.enable_export !== false,
      enableImport: moduleConfig.enable_import !== false,

      // 字段列表
      fields: modelFields, // 用于模型模板
      searchFields,
      listFields,
      formFields,
      allFields,
    };
  }

  /**
   * 渲染模板
   */
  async _renderTemplate(templateName, data) {
    try {
      const templatePath = path.join(this.templateDir, templateName);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);
      return template(data);
    } catch (error) {
      logger.error(`Failed to render template ${templateName}:`, error);
      throw ApiError.internal(`模板渲染失败: ${templateName}`);
    }
  }

  /**
   * 写入文件
   */
  async _writeFile(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      logger.info(`File generated: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to write file ${filePath}:`, error);
      throw ApiError.internal(`文件写入失败: ${filePath}`);
    }
  }

  /**
   * 确保目录存在
   */
  async _ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        logger.error(`Failed to create directory ${dirPath}:`, error);
        throw ApiError.internal(`目录创建失败: ${dirPath}`);
      }
    }
  }

  /**
   * 删除模块（配置驱动 - 无文件删除）
   * @param {String} moduleId - 模块配置 ID
   */
  async deleteGeneratedCode(moduleId) {
    try {
      const moduleConfig = await moduleConfigService.getModuleConfigById(moduleId);

      logger.info('=========================================');
      logger.info(`  删除模块: ${moduleConfig.module_name}`);
      logger.info('=========================================');

      // 配置驱动架构下，通常没有生成的文件
      // 但为了兼容旧数据，仍保留文件删除逻辑
      const { generated_files } = moduleConfig;
      let deletedCount = 0;

      if (generated_files && generated_files.length > 0) {
        logger.info(`Found ${generated_files.length} legacy files to delete...`);

        for (const filePath of generated_files) {
          try {
            await fs.unlink(filePath);
            deletedCount++;
            logger.info(`✓ File deleted: ${filePath}`);
          } catch (error) {
            if (error.code !== 'ENOENT') {
              logger.warn(`Failed to delete file ${filePath}:`, error);
            }
          }
        }

        // 尝试删除空目录
        await this._deleteEmptyDirs(moduleConfig.module_path);
      } else {
        logger.info('✓ 配置驱动模式 - 无文件需要删除');
      }

      // 删除菜单和权限
      await this._deleteMenu(moduleConfig);
      logger.info('✓ Menu and permissions deleted');

      // 更新模块配置
      await moduleConfig.update({ generated_files: [] });

      logger.info('=========================================');
      logger.info(`✓ 模块删除完成: ${moduleConfig.module_name}`);
      logger.info('✓ 配置已清理，无需重启应用');
      logger.info('=========================================');

      return {
        message: '模块删除成功（配置驱动）',
        filesDeleted: deletedCount,
        configDriven: true,
      };
    } catch (error) {
      logger.error('Failed to delete module:', error);
      throw error;
    }
  }

  /**
   * 删除空目录
   */
  async _deleteEmptyDirs(modulePath) {
    // 前端已改为配置驱动，只需清理后端模块目录
    const dirs = [
      path.join(this.backendModulesDir, modulePath),
    ];

    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir);
        if (files.length === 0) {
          await fs.rmdir(dir);
          logger.info(`Empty directory deleted: ${dir}`);
        }
      } catch (error) {
        // 目录可能不存在或不为空，忽略错误
      }
    }
  }
}

module.exports = new CodeGeneratorService();
