import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import {satteri} from '@astrojs/markdown-satteri';
import {publicDocumentationUrl} from './src/lib/paths';
const documentationLinks = {
  name: 'documentation-links',
  link(node,ctx) { ctx.setField(node,'url',publicDocumentationUrl(node.url)); },
  definition(node,ctx) { ctx.setField(node,'url',publicDocumentationUrl(node.url)); },
};
export default defineConfig({site:'https://subiz.com.vn',base:'/developers',trailingSlash:'never',output:'static', integrations:[react(),mdx()], markdown:{processor:satteri({mdastPlugins:[documentationLinks]}),shikiConfig:{themes:{light:'github-light',dark:'github-dark'},defaultColor:false}}});
