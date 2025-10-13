// ** Next Imports
import Head from 'next/head'
import { useRouter } from 'next/router'
import 'monaco-editor/esm/vs/base/browser/ui/actionbar/actionbar.css';
import 'react-phone-number-input/style.css'
import 'react-datepicker/dist/react-datepicker.css'
import 'keen-slider/keen-slider.min.css'
import { CacheProvider } from '@emotion/react'
import themeConfig from 'src/configs/themeConfig'
import UserLayout from 'src/layouts/UserLayout'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import NextProgress from 'nextjs-progressbar'
import 'react-toastify/dist/ReactToastify.css'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'src/iconify-bundle/icons-bundle-react'
import '../../styles/globals.css'
import { Provider } from 'react-redux'
import ar from '../../i18n/ar.json'
import en from '../../i18n/en.json'
import { IntlProvider } from 'react-intl'
import { store } from 'src/store'
import HomeApp from 'src/Components/HomeApp'
import { ToastContainer } from 'react-toastify'
import { useCookies } from 'react-cookie'
import 'animate.css/animate.min.css'



const clientSideEmotionCache = createEmotionCache()

const message = {
  en,
  ar
}



const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const contentHeightFixed = Component.contentHeightFixed ?? false
  const [mode, _] = useCookies(['mode'])

  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)
  const setConfig = Component.setConfig ?? undefined

  const { locale } = useRouter()

  const getDir = location => {
    if (location !== 'ar') {
      return 'ltr'
    } else {
      return 'rtl'
    }
  }

  return (
    <Provider store={store}>
      <IntlProvider locale={locale} messages={message[locale]}>
        <CacheProvider value={emotionCache}>
          <Head>
            <title>{`${themeConfig.templateName} `}</title>
            <meta name='description' content={`${themeConfig.templateName}`} />
            <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
            <meta name='viewport' content='initial-scale=1, width=device-width' />
          </Head>
          <div dir={getDir(locale)} className={getDir(locale)}>
            <div className='bg-red-500'>
              <NextProgress color='#00cfe8' />
            </div>
            <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={{ ...settings, direction: getDir(locale) }}>
                      <ToastContainer theme={settings.mode} className='ToastContainer' />
                      <HomeApp>{getLayout(<Component {...pageProps} />)}</HomeApp>
                    </ThemeComponent>
                  )
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </div>
        </CacheProvider>
      </IntlProvider>
    </Provider>
  )
}

export default App
