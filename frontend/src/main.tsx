import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './utils/api-test'

const rootElement = document.getElementById('root')

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  console.error('❌ Root element not found!')
  document.body.innerHTML = `
    <div style="padding: 50px; text-align: center; font-family: Arial;">
      <h1 style="color: red;">❌ خطأ: Root element not found</h1>
      <p>لم يتم العثور على العنصر بـ id="root"</p>
      <p>تأكد من وجود &lt;div id="root"&gt;&lt;/div&gt; في index.html</p>
    </div>
  `
}
