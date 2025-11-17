const dictionaryService = require('./dictionary.service');
const { success } = require('../../utils/response');

class DictionaryController {
  /**
   * 根据类型获取字典
   * GET /api/dictionaries/:type
   */
  async getDictionaryByType(req, res, next) {
    try {
      const { type } = req.params;
      const items = await dictionaryService.getDictionaryByType(type);
      success(res, items, '获取字典成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取多个字典类型
   * GET /api/dictionaries?types=business_category,business_status
   */
  async getDictionaries(req, res, next) {
    try {
      const { types } = req.query;

      if (!types) {
        return success(res, {}, '请提供字典类型');
      }

      const typeArray = types.split(',').map(t => t.trim());
      const items = await dictionaryService.getDictionaryByTypes(typeArray);
      success(res, items, '获取字典成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DictionaryController();