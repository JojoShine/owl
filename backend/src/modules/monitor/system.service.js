const si = require('systeminformation');
const { MonitorMetric } = require('../../models');

/**
 * 系统监控服务
 */
class SystemMonitorService {
  /**
   * 获取 CPU 信息
   */
  async getCpuInfo() {
    try {
      const cpuLoad = await si.currentLoad();
      return {
        usage: parseFloat(cpuLoad.currentLoad.toFixed(2)),
        cores: cpuLoad.cpus.length,
        details: cpuLoad.cpus.map(cpu => ({
          load: parseFloat(cpu.load.toFixed(2)),
        })),
      };
    } catch (error) {
      console.error('获取CPU信息失败:', error);
      return { usage: 0, cores: 0, details: [] };
    }
  }

  /**
   * 获取内存信息
   */
  async getMemoryInfo() {
    try {
      const mem = await si.mem();
      const used = mem.used / (1024 * 1024 * 1024); // 转换为 GB
      const total = mem.total / (1024 * 1024 * 1024);
      const percent = (mem.used / mem.total) * 100;

      return {
        used: parseFloat(used.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        free: parseFloat((total - used).toFixed(2)),
        percent: parseFloat(percent.toFixed(2)),
      };
    } catch (error) {
      console.error('获取内存信息失败:', error);
      return { used: 0, total: 0, free: 0, percent: 0 };
    }
  }

  /**
   * 获取磁盘信息
   */
  async getDiskInfo() {
    try {
      const fsSize = await si.fsSize();
      if (!fsSize || fsSize.length === 0) {
        return { used: 0, total: 0, free: 0, percent: 0, disks: [] };
      }

      // 获取第一个磁盘作为主磁盘
      const mainDisk = fsSize[0];
      const used = mainDisk.used / (1024 * 1024 * 1024);
      const total = mainDisk.size / (1024 * 1024 * 1024);
      const percent = mainDisk.use;

      return {
        used: parseFloat(used.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        free: parseFloat((total - used).toFixed(2)),
        percent: parseFloat(percent.toFixed(2)),
        disks: fsSize.map(disk => ({
          fs: disk.fs,
          type: disk.type,
          mount: disk.mount,
          used: parseFloat((disk.used / (1024 * 1024 * 1024)).toFixed(2)),
          total: parseFloat((disk.size / (1024 * 1024 * 1024)).toFixed(2)),
          percent: parseFloat(disk.use.toFixed(2)),
        })),
      };
    } catch (error) {
      console.error('获取磁盘信息失败:', error);
      return { used: 0, total: 0, free: 0, percent: 0, disks: [] };
    }
  }

  /**
   * 获取网络信息
   */
  async getNetworkInfo() {
    try {
      const networkStats = await si.networkStats();
      if (!networkStats || networkStats.length === 0) {
        return { rx: 0, tx: 0, interfaces: [] };
      }

      // 获取第一个活动接口
      const mainInterface = networkStats[0];

      return {
        rx: parseFloat((mainInterface.rx_sec / 1024).toFixed(2)), // KB/s
        tx: parseFloat((mainInterface.tx_sec / 1024).toFixed(2)), // KB/s
        interfaces: networkStats.map(iface => ({
          iface: iface.iface,
          rx: parseFloat((iface.rx_sec / 1024).toFixed(2)),
          tx: parseFloat((iface.tx_sec / 1024).toFixed(2)),
        })),
      };
    } catch (error) {
      console.error('获取网络信息失败:', error);
      return { rx: 0, tx: 0, interfaces: [] };
    }
  }

  /**
   * 获取系统综合指标
   */
  async getSystemMetrics() {
    try {
      const [cpu, memory, disk, network] = await Promise.all([
        this.getCpuInfo(),
        this.getMemoryInfo(),
        this.getDiskInfo(),
        this.getNetworkInfo(),
      ]);

      return {
        cpu,
        memory,
        disk,
        network,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('获取系统指标失败:', error);
      throw error;
    }
  }

  /**
   * 保存监控数据到数据库
   */
  async saveMetrics(metrics) {
    try {
      const records = [];

      // 保存 CPU 指标
      records.push({
        metric_type: 'system',
        metric_name: 'cpu',
        value: metrics.cpu.usage,
        unit: '%',
        tags: { cores: metrics.cpu.cores },
      });

      // 保存内存指标
      records.push({
        metric_type: 'system',
        metric_name: 'memory',
        value: metrics.memory.percent,
        unit: '%',
        tags: {
          used_gb: metrics.memory.used,
          total_gb: metrics.memory.total,
        },
      });

      // 保存磁盘指标
      records.push({
        metric_type: 'system',
        metric_name: 'disk',
        value: metrics.disk.percent,
        unit: '%',
        tags: {
          used_gb: metrics.disk.used,
          total_gb: metrics.disk.total,
        },
      });

      // 保存网络指标
      records.push({
        metric_type: 'system',
        metric_name: 'network_rx',
        value: metrics.network.rx,
        unit: 'KB/s',
      });

      records.push({
        metric_type: 'system',
        metric_name: 'network_tx',
        value: metrics.network.tx,
        unit: 'KB/s',
      });

      await MonitorMetric.bulkCreate(records);
    } catch (error) {
      console.error('保存监控数据失败:', error);
    }
  }
}

module.exports = new SystemMonitorService();
