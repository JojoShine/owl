import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { SearchIcon, XIcon } from 'lucide-react';

export default function LogFilters({ type, filters, onChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  // 同步外部 filters 到本地状态
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  /**
   * 处理输入变化
   */
  const handleChange = (key, value) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  /**
   * 应用筛选
   */
  const handleApply = () => {
    onChange(localFilters);
  };

  /**
   * 重置筛选
   */
  const handleReset = () => {
    const resetFilters = {
      startDate: '',
      endDate: '',
      userId: '',
      username: '',
      method: '',
      url: '',
      status: '',
      action: '',
    };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
  };

  /**
   * 获取筛选字段（根据日志类型）
   */
  const getFilterFields = () => {
    const common = [
      {
        key: 'startDate',
        label: '开始日期',
        type: 'date',
      },
      {
        key: 'endDate',
        label: '结束日期',
        type: 'date',
      },
    ];

    const typeFields = {
      operation: [
        {
          key: 'userId',
          label: '用户ID',
          type: 'text',
          placeholder: '输入用户ID',
        },
        {
          key: 'method',
          label: 'HTTP方法',
          type: 'select',
          options: [
            { value: '', label: '全部' },
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
          ],
        },
        {
          key: 'url',
          label: 'URL',
          type: 'text',
          placeholder: '输入URL关键词',
        },
      ],
      login: [
        {
          key: 'username',
          label: '用户名',
          type: 'text',
          placeholder: '输入用户名',
        },
        {
          key: 'action',
          label: '操作',
          type: 'select',
          options: [
            { value: '', label: '全部' },
            { value: 'login', label: '登录' },
            { value: 'logout', label: '登出' },
          ],
        },
        {
          key: 'status',
          label: '状态',
          type: 'select',
          options: [
            { value: '', label: '全部' },
            { value: 'success', label: '成功' },
            { value: 'failure', label: '失败' },
          ],
        },
      ],
      system: [],
      access: [
        {
          key: 'method',
          label: 'HTTP方法',
          type: 'select',
          options: [
            { value: '', label: '全部' },
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
          ],
        },
        {
          key: 'url',
          label: 'URL',
          type: 'text',
          placeholder: '输入URL关键词',
        },
      ],
      error: [],
      database: [
        {
          key: 'dbType',
          label: '数据库类型',
          type: 'select',
          options: [
            { value: '', label: '全部' },
            { value: 'redis', label: 'Redis' },
            { value: 'postgresql', label: 'PostgreSQL' },
          ],
        },
        {
          key: 'action',
          label: '操作类型',
          type: 'select',
          options: [
            { value: '', label: '全部' },
            { value: 'set', label: 'SET' },
            { value: 'get', label: 'GET' },
            { value: 'del', label: 'DEL' },
            { value: 'query', label: 'QUERY' },
          ],
        },
      ],
    };

    return [...common, ...(typeFields[type] || [])];
  };

  const fields = getFilterFields();

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex flex-wrap items-end gap-4">
        {fields.map((field) => (
          <div key={field.key} className={field.type === 'select' ? 'flex-shrink-0' : 'flex-1 min-w-[180px]'}>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {field.label}
            </label>
            {field.type === 'text' ? (
              <Input
                type="text"
                placeholder={field.placeholder || ''}
                value={localFilters[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            ) : field.type === 'date' ? (
              <DatePicker
                placeholder={field.placeholder || field.label}
                value={localFilters[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            ) : field.type === 'select' ? (
              <Select
                value={localFilters[field.key] || 'all'}
                onValueChange={(value) => handleChange(field.key, value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-auto min-w-[140px]">
                  <SelectValue placeholder={`选择${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        ))}

        {/* 操作按钮 */}
        <div className="flex-shrink-0 flex gap-2">
          <Button onClick={handleApply} size="lg">
            <SearchIcon className="w-4 h-4 mr-2" />
            查询
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <XIcon className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>
      </div>
    </div>
  );
}
