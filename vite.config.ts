import react from '@vitejs/plugin-react'
import { copyFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'
import { defineConfig, Plugin } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// 自定义插件：复制并重命名 CSS 文件给 content script 使用
function copyContentCssPlugin(): Plugin {
  return {
    name: 'copy-content-css',
    closeBundle() {
      const assetsDir = resolve(__dirname, 'dist/assets')
      try {
        const files = readdirSync(assetsDir)
        // 查找主应用的 CSS 文件（来自 index.html）
        const indexCssFile = files.find(f => f.startsWith('index-') && f.endsWith('.css'))
        
        if (indexCssFile) {
          const sourcePath = join(assetsDir, indexCssFile)
          const destPath = resolve(__dirname, 'dist/content.css')
          
          // 复制文件
          copyFileSync(sourcePath, destPath)
          console.log(`✓ Copied ${indexCssFile} to content.css`)
        }
      } catch (err) {
        console.warn('Warning: Could not copy content CSS file:', err)
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/manifest.json',
          dest: '.'
        }
      ]
    }),
    copyContentCssPlugin()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.tsx')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js'
          }
          if (chunkInfo.name === 'content') {
            return 'content.js'
          }
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // 对于 content script，将所有依赖内联到一个文件中
        manualChunks: (id) => {
          // 如果是 content 相关的文件，不分割
          if (id.includes('src/content')) {
            return 'content'
          }
        }
      }
    }
  }
})
