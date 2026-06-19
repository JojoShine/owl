'use client';

import { SocketProvider } from './SocketContext';
import { WatermarkProvider } from './WatermarkContext';

/**
 * 组合所有第三方Provider，避免深层嵌套导致的性能问题
 * 这个组件将多个Provider合并为一个，减少React组件树的深度
 */
export function CombinedProviders({ children }) {
  return (
    <SocketProvider>
      <WatermarkProvider>
        {children}
      </WatermarkProvider>
    </SocketProvider>
  );
}
