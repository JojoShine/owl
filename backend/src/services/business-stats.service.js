const { Op } = require('sequelize');
const db = require('../models');
const { logger } = require('../config/logger');

class BusinessStatsService {
  /**
   * 获取业务概览统计数据（优化版：减少查询次数）
   */
  async getOverviewStats() {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      // 使用一次SQL查询获取所有经营主体统计
      const [entityStats] = await db.sequelize.query(`
        SELECT
          COUNT(*) FILTER (WHERE removed = false) as "totalEntities",
          COUNT(*) FILTER (
            WHERE removed = false
            AND created_at >= :yesterday
            AND created_at < :today
          ) as "yesterdayNew",
          COUNT(*) FILTER (WHERE removed = false AND is_claimed = true) as "claimedCount",
          COUNT(*) FILTER (WHERE removed = false AND is_claimed = false) as "unclaimedCount"
        FROM business_entity
      `, {
        replacements: { yesterday, today },
        type: db.sequelize.QueryTypes.SELECT,
      });

      // 查询无照经营数量
      const unlicensedCount = await db.UnlicensedBusiness.count({
        where: { deleted_at: null }
      });

      return {
        totalEntities: parseInt(entityStats.totalEntities) || 0,
        yesterdayNew: parseInt(entityStats.yesterdayNew) || 0,
        unlicensedCount: unlicensedCount || 0,
        claimedCount: parseInt(entityStats.claimedCount) || 0,
        unclaimedCount: parseInt(entityStats.unclaimedCount) || 0,
      };
    } catch (error) {
      logger.error('Error getting overview stats:', error);
      throw error;
    }
  }

  /**
   * 获取网格统计数据（优化版2：使用子查询避免大表JOIN）
   */
  async getGridStats() {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      // 使用子查询优化，避免大表笛卡尔积
      const gridStats = await db.sequelize.query(`
        WITH grid_staff AS (
          SELECT
            zrpq,
            COUNT(*) as staff_count,
            array_agg(user_id) as user_ids
          FROM user_auth
          WHERE zrpq IS NOT NULL AND zrpq != ''
          GROUP BY zrpq
        ),
        claimed_stats AS (
          SELECT
            ua.zrpq,
            COUNT(DISTINCT be.nbxh) as total_claimed,
            COUNT(DISTINCT CASE
              WHEN be.claimed_at >= :yesterday AND be.claimed_at < :today
              THEN be.nbxh
            END) as yesterday_claimed
          FROM user_auth ua
          INNER JOIN business_entity be ON be.claimed_by = ua.user_id AND be.removed = false
          WHERE ua.zrpq IS NOT NULL AND ua.zrpq != ''
          GROUP BY ua.zrpq
        ),
        survey_stats AS (
          SELECT
            ua.zrpq,
            COUNT(sr.id) as total_surveys,
            COUNT(CASE
              WHEN sr.created_at >= :yesterday AND sr.created_at < :today
              THEN sr.id
            END) as yesterday_surveys
          FROM user_auth ua
          INNER JOIN survey_record sr ON sr.user_id = ua.user_id
          WHERE ua.zrpq IS NOT NULL AND ua.zrpq != ''
          GROUP BY ua.zrpq
        )
        SELECT
          gs.zrpq as "gridName",
          gs.staff_count::int as "staffCount",
          COALESCE(cs.total_claimed, 0)::int as "totalClaimed",
          COALESCE(cs.yesterday_claimed, 0)::int as "yesterdayClaimed",
          COALESCE(ss.total_surveys, 0)::int as "totalSurveys",
          COALESCE(ss.yesterday_surveys, 0)::int as "yesterdaySurveys"
        FROM grid_staff gs
        LEFT JOIN claimed_stats cs ON cs.zrpq = gs.zrpq
        LEFT JOIN survey_stats ss ON ss.zrpq = gs.zrpq
        ORDER BY gs.zrpq
      `, {
        replacements: {
          yesterday: yesterday,
          today: today,
        },
        type: db.sequelize.QueryTypes.SELECT,
      });

      return gridStats;
    } catch (error) {
      logger.error('Error getting grid stats:', error);
      throw error;
    }
  }

  /**
   * 获取等级统计数据（仅统计已认领企业）
   */
  async getGradeStats() {
    try {
      // 获取最新的核查记录中的等级统计
      // 只统计已认领的企业（is_claimed = true），未认领企业的等级数据是历史数据没有意义

      const gradeStats = await db.sequelize.query(`
        SELECT
          sr.grade,
          COUNT(DISTINCT sr.business_id) as count
        FROM survey_record sr
        INNER JOIN (
          SELECT business_id, MAX(created_at) as max_created_at
          FROM survey_record
          GROUP BY business_id
        ) latest ON sr.business_id = latest.business_id AND sr.created_at = latest.max_created_at
        INNER JOIN business_entity be ON be.nbxh = sr.business_id
        WHERE sr.grade IN ('A', 'B', 'C', 'D')
          AND be.is_claimed = true
          AND be.removed = false
        GROUP BY sr.grade
        ORDER BY sr.grade
      `, {
        type: db.sequelize.QueryTypes.SELECT,
      });

      // 将结果格式化为对象
      const result = {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
      };

      gradeStats.forEach(stat => {
        result[stat.grade] = parseInt(stat.count);
      });

      return result;
    } catch (error) {
      logger.error('Error getting grade stats:', error);
      throw error;
    }
  }

  /**
   * 获取完整的统计数据
   */
  async getAllStats() {
    try {
      const [overviewStats, gridStats, gradeStats] = await Promise.all([
        this.getOverviewStats(),
        this.getGridStats(),
        this.getGradeStats(),
      ]);

      return {
        overview: overviewStats,
        grids: gridStats,
        grades: gradeStats,
      };
    } catch (error) {
      logger.error('Error getting all stats:', error);
      throw error;
    }
  }
}

module.exports = new BusinessStatsService();