import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정 파일 (Netlify 정적 배포 시 dist 폴더로 빌드됨)
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
