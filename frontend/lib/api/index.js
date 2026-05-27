// API模块汇总导出
import * as authModule from './auth.api';
import * as userModule from './user.api';
import * as roleModule from './role.api';
import * as permissionModule from './permission.api';
import * as fileManagerModule from './file-manager.api';
import * as menuModule from './menu.api';
import * as departmentModule from './department.api';
import * as logModule from './log.api';
import * as jobModule from './job.api';
import * as dashboardModule from './dashboard.api';
import * as monitorModule from './monitor.api';
import * as notificationModule from './notification.api';
import * as generatorModule from './generator.api';
import * as statsModule from './stats.api';
import * as dictionaryModule from './dictionary.api';
import * as apiBuilderModule from './api-builder.api';
import * as watermarkModule from './watermark.api';
import * as thirdPartyKeysModule from './third-party-keys.api';

export const authApi = authModule.authApi;
export const userApi = userModule.userApi;
export const roleApi = roleModule.roleApi;
export const permissionApi = permissionModule.permissionApi;
export const { folderApi, fileApi, fileShareApi } = fileManagerModule;
export const menuApi = menuModule.menuApi;
export const departmentApi = departmentModule.departmentApi;
export const logApi = logModule.logApi;
export const jobApi = jobModule.jobApi;
export const dashboardApi = dashboardModule.dashboardApi;
export const { monitorApi, apiMonitorApi, alertApi } = monitorModule;
export const { notificationApi, emailApi, emailTemplateApi, notificationSettingsApi } = notificationModule;
export const generatorApi = generatorModule.generatorApi;
export const statsApi = statsModule.statsApi;
export const dictionaryApi = dictionaryModule.dictionaryApi;
export const apiBuilderApi = apiBuilderModule.apiBuilderApi;
export const watermarkApi = watermarkModule.watermarkApi;
export const thirdPartyKeysApi = thirdPartyKeysModule.thirdPartyKeysApi;

// 默认导出（用于向后兼容）
export default {
  authApi,
  userApi,
  roleApi,
  permissionApi,
  folderApi,
  fileApi,
  fileShareApi,
  menuApi,
  departmentApi,
  logApi,
  jobApi,
  dashboardApi,
  monitorApi,
  apiMonitorApi,
  alertApi,
  notificationApi,
  emailApi,
  emailTemplateApi,
  notificationSettingsApi,
  generatorApi,
  statsApi,
  dictionaryApi,
  apiBuilderApi,
  watermarkApi,
  thirdPartyKeysApi,
};