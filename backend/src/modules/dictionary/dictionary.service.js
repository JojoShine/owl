const db = require('../../models');

class DictionaryService {
  /**
   * 根据字典类型获取字典项
   */
  async getDictionaryByType(dictType) {
    const items = await db.Dictionary.findAll({
      where: {
        dict_type: dictType,
        is_active: true,
      },
      order: [['sort_order', 'ASC']],
      attributes: ['dict_code', 'dict_name', 'dict_value', 'sort_order'],
    });

    return items;
  }

  /**
   * 获取多个字典类型
   */
  async getDictionaryByTypes(dictTypes) {
    const items = await db.Dictionary.findAll({
      where: {
        dict_type: dictTypes,
        is_active: true,
      },
      order: [['dict_type', 'ASC'], ['sort_order', 'ASC']],
      attributes: ['dict_type', 'dict_code', 'dict_name', 'dict_value', 'sort_order'],
    });

    // 按类型分组
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.dict_type]) {
        grouped[item.dict_type] = [];
      }
      grouped[item.dict_type].push({
        code: item.dict_code,
        name: item.dict_name,
        value: item.dict_value,
        sort: item.sort_order,
      });
    });

    return grouped;
  }
}

module.exports = new DictionaryService();
