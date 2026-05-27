'use client';

import React, { useState, useEffect } from 'react';

export function Watermark({
  lines = [],
  fontSize = 24,
  fontWeight = '400',
  color = '#000000',
  opacity = 0.1,
  rotation = 45,
  spacing = 150,
  enabled = true,
}) {
  const [isDark, setIsDark] = useState(false);

  // 检测暗黑模式
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // 监听主题变化
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  if (!enabled) {
    return null;
  }

  // 根据暗黑模式调整颜色
  let watermarkColor = color;
  if (isDark && color === '#000000') {
    watermarkColor = '#ffffff';
  } else if (!isDark && color === '#ffffff') {
    watermarkColor = '#000000';
  }

  // 合并所有行为单个文本
  const watermarkText = lines.filter(l => l).join('\n') || '水印';

  // 生成简单的 SVG - 尺寸与 spacing 匹配
  const svgContent = `
    <svg width="${spacing}" height="${spacing}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${spacing} ${spacing}">
      <text
        x="${spacing / 2}"
        y="${spacing / 2}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="${fontSize}"
        font-weight="${fontWeight}"
        fill="${watermarkColor}"
        opacity="${opacity}"
        font-family="Arial, sans-serif"
        transform="rotate(${rotation} ${spacing / 2} ${spacing / 2})"
      >
        ${watermarkText.split('\n').map((line, i) =>
          `<tspan x="${spacing / 2}" dy="${i === 0 ? '0' : fontSize * 1.2}">${line}</tspan>`
        ).join('')}
      </text>
    </svg>
  `;

  const encodedSvg = encodeURIComponent(svgContent);
  const svgDataUri = `data:image/svg+xml;utf8,${encodedSvg}`;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage: `url('${svgDataUri}')`,
        backgroundRepeat: `repeat`,
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: '0 0',
        zIndex: 99999,
      }}
      aria-hidden="true"
    />
  );
}

export default Watermark;
