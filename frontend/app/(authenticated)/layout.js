import RequireAuth from '@/components/auth/require-auth';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { SocketProvider } from '@/contexts/SocketContext';
import { WatermarkProvider } from '@/contexts/WatermarkContext';
import WatermarkRenderer from '@/components/common/watermark/watermark-renderer';

export default function AuthenticatedLayout({ children }) {
  return (
    <RequireAuth>
      <WatermarkProvider>
        <SocketProvider>
          <div className="h-screen flex overflow-hidden">
            {/* 侧边栏 */}
            <aside className="w-64 flex-shrink-0">
              <Sidebar />
            </aside>

            {/* 主内容区域 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 顶部导航 */}
              <Header />

              {/* 页面内容 */}
              <main className="flex-1 overflow-y-auto bg-background p-6">
                {children}
              </main>
            </div>
          </div>
          {/* 水印渲染器放在最后，确保在最上层 */}
          <WatermarkRenderer />
        </SocketProvider>
      </WatermarkProvider>
    </RequireAuth>
  );
}