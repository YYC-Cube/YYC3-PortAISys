/**
 * @file main.tsx
 * @description YYC³ PortAISys 前端入口 — React 应用挂载
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-16
 * @status stable
 * @license MIT
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)