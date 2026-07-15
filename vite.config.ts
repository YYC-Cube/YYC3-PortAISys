/**
 * @file vite.config.ts
 * @description Vite 构建配置 — YYC³ PortAISys 全端部署
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @updated 2026-07-16
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  // 路径解析
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './core'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },

  // 开发服务器
  server: {
    port: 3200,
    host: true,
    strictPort: true,
  },

  // 预览服务器
  preview: {
    port: 4173,
    host: true,
  },

  // 静态资源 base（GitHub Pages 部署时使用绝对路径）
  base: '/',
})