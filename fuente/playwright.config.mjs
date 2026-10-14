import { defineConfig, devices } from '@playwright/test';
import sitio from './sitio.config.mjs';

const url = `http://localhost:4321${sitio.base}`;

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.mjs',
  use: { baseURL: url },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npx astro preview --ignore-lock',
    url,
    reuseExistingServer: true,
  },
});
