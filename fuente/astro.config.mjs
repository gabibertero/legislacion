import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';
import sitio from './sitio.config.mjs';

export default defineConfig({
  site: sitio.site,
  outDir: '../docs', // NUNCA '../' ni la raíz: Astro vacía outDir y borraría .git
  base: sitio.base,
  output: 'static',
  build: { assets: 'assets-astro' }, // sin guion bajo: Jekyll ignora carpetas con _
  integrations: [mdx()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
  },
});
