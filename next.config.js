const path = require('path')
const withTM = require('next-transpile-modules')(['monaco-editor'])

/** @type {import('next').NextConfig} */
module.exports = withTM({
  reactStrictMode: false,
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'en',
    localeDetection: true
  },
  env: {
    API_URL: 'https://localhost:44375/api',
    //API_URL: 'https://localhost:44375/api',
    identityUrl: 'https://localhost:7000/'
  },
  images: {
    domains: []
  },
  webpack: config => {
    // Add aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision'),
      'react/jsx-dev-runtime.js': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
      'react/jsx-runtime.js': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      '@rsuite/icons/RemindFill.js': path.resolve(__dirname, 'node_modules/@rsuite/icons/RemindFill.js')

      // 'rsuite/esm/locales/index.js': path.resolve(__dirname, 'node_modules/rsuite/lib/locales/index.js'),
      // 'rsuite/esm/locales/index.js': path.resolve(__dirname, 'node_modules/rsuite/esm/locales/index.js'),
      // 'rsuite/esm/utils/index.js': path.resolve(__dirname, 'node_modules/rsuite/esm/utils/index.js'),
    }

    return config
  }
})
