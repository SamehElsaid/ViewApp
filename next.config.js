const path = require('path')
const withTM = require('next-transpile-modules')(['monaco-editor'])

/** @type {import('next').NextConfig} */


const appTypes = [
  "Form Builder",
  "View as Admin",
  "View as User"
]

const appType = appTypes[2]
const DEV_MODE = false
const IDENTITY_URL = DEV_MODE ? 'https://localhost:7000/' : 'https://cortextest.singleclic.com/IdentityServer/'

module.exports = withTM({
  reactStrictMode: false,
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'en',
    localeDetection: true
  },
  trailingSlash: true,
  env: {
    API_URL: 'https://cortextest.singleclic.com/LowCode/api',
    DEV_MODE: DEV_MODE,
    IDENTITY_URL: IDENTITY_URL,
    APP_TYPE: appType
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
      '@rsuite/icons/RemindFill.js': path.resolve(__dirname, 'node_modules/@rsuite/icons/RemindFill.js'),
      'jodit/es2021/jodit.min.css': path.resolve(__dirname, 'src/jodit-css-stub.js'),
      'jodit/es2018/jodit.min.css': path.resolve(__dirname, 'src/jodit-css-stub.js'),
      'jodit/es2015/jodit.min.css': path.resolve(__dirname, 'src/jodit-css-stub.js'),
      'jodit/es5/jodit.min.css': path.resolve(__dirname, 'src/jodit-css-stub.js')
    }

    return config
  }
})
