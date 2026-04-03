import { useMemo } from 'react'
import useCollection from './useCollection'
import useBackground from './useBackground'
import useTable from './useTable'
import useContainer from './useContainer'
import useBox from './useBox'
import useUploadImage from './useUploadImage'
import useUploadVideo from './useUploadVideo'
import useRichText from './useRichText'
import useFlexControl from './useFlexControl'
import useButton from './useButton'
import useIconView from './useIconView'
import useCart from './useCart'
import slate from '@react-page/plugins-slate'
import useSpacer from './useSpacer'
import useProgressBar from './useProgressBar'
import useOtp from './useOtp'
import useOrder from './useOrder'
import '@react-page/plugins-slate/lib/index.css'
import useHeader from './useHeader'
import useSection from './UseSection'
import useDynamicTable from './useDynamicTable'
import useGoogleMap from './useMap'
import useChart from './useChart'
import useReport from './useReport'
import useIFrame from './useIframe'
import useMenuItem from './useMenuItem'
import usePopup from './usePopup'
import useRenderPage from './useRenderPage'

export default function useCellPlugins({
  advancedEdit,
  locale,
  readOnly,
  buttonRef,
  workflowId,
  pageId,
  entitiesId,
  collectionName,
  pageName,
  FormType,
  layoutComponent,
  isPrint
}) {
  // Hooks Drag Drop Components
  const { collection } = useCollection({
    advancedEdit,
    locale,
    readOnly,
    buttonRef,
    workflowId,
    pageId,
    entitiesId,
    collectionName,
    pageName,
    FormType, FormType, isPrint
  })
  const { order } = useOrder({ advancedEdit, locale, readOnly, buttonRef })
  const { chart } = useChart({ advancedEdit, locale, readOnly, buttonRef })
  const { backgroundPlugin } = useBackground({ locale, buttonRef })
  const { table } = useTable({ advancedEdit, locale, buttonRef, pageId, entitiesId, collectionName, pageName })

  const { report } = useReport({ advancedEdit, locale, buttonRef, pageId, entitiesId, collectionName, pageName })
  const { ContainerPlugin } = useContainer({ locale, buttonRef })
  const { BoxControl } = useBox({ locale, buttonRef })
  const { UploadImage } = useUploadImage({ locale, buttonRef })
  const { UploadVideo } = useUploadVideo({ locale, buttonRef })
  const { RichText } = useRichText({ locale, buttonRef })
  const { ProgressBar } = useProgressBar({ locale, buttonRef })
  const { Otp } = useOtp({ locale, buttonRef })
  const { Header } = useHeader({ locale, buttonRef })
  const { FlexControlCell } = useFlexControl({ locale, buttonRef })
  const { ButtonCell } = useButton({ locale, buttonRef })
  const { cartCell } = useCart({ locale, readOnly, buttonRef })
  const { IconView } = useIconView({ locale, buttonRef })
  const { SectionControl } = useSection({ locale, buttonRef })
  const { dynamicTable } = useDynamicTable({ locale, buttonRef, advancedEdit })
  const { GoogleMap } = useGoogleMap({ locale, buttonRef })
  const { spacer } = useSpacer({ locale, buttonRef })
  const { iFrame } = useIFrame({ advancedEdit, locale, readOnly, buttonRef })
  const { menuItem } = useMenuItem({ locale, buttonRef })
  const { popup } = usePopup({ locale, buttonRef, readOnly })
  const { renderPage } = useRenderPage({ locale, buttonRef, layoutComponent, FormType })

  const cellPlugins = useMemo(
    () => [
      slate(),
      ContainerPlugin,
      BoxControl,
      backgroundPlugin,
      UploadImage,
      UploadVideo,
      spacer,
      collection,
      table,
      RichText,
      ProgressBar,
      Otp,
      ButtonCell,
      FlexControlCell,
      order,
      chart,
      cartCell,
      IconView,
      Header,
      report,
      SectionControl,
      dynamicTable,
      GoogleMap,
      iFrame,
      menuItem,
      popup,
      renderPage,
    ],
    [
      backgroundPlugin,
      ContainerPlugin,
      BoxControl,
      UploadImage,
      UploadVideo,
      spacer,
      collection,
      chart,
      order,
      table,
      RichText,
      ProgressBar,
      Otp,
      ButtonCell,
      FlexControlCell,
      cartCell,
      IconView,
      Header,
      report,
      SectionControl,
      dynamicTable,
      GoogleMap,
      iFrame,
      menuItem,
      popup,
      renderPage,
    ]
  )

  return {
    cellPlugins: cellPlugins
      .filter(item => item.id !== 'ory/editor/core/content/slate')
      .sort((a, b) => a.title.toLocaleLowerCase().localeCompare(b.title.toLocaleLowerCase()))
  }
}
