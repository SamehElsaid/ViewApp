import { useMemo, useEffect, useState } from 'react'
import ApexDonutChart from 'src/Components/analytics/ApexDonutChart'
import { FaChartPie } from 'react-icons/fa'
import { useIntl } from 'react-intl'
import ChartControl from '../ChartControl'
import { useSelector } from 'react-redux'

export default function useChart({ advancedEdit, locale, readOnly, buttonRef }) {
  const { messages } = useIntl()

  const donutColors = ['#fdd835', '#00d4bd', '#826bf8', '#1FD5EB', '#ffa1a1']

  const chart = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        const apiData = useSelector(state => state.api.data)
        const [items, setItems] = useState([])

        useEffect(() => {
          const findItems = apiData.find(item => item.link === data.api_url)
          if (findItems) {
            // setItems(findItems?.data ?? [])

            const myData = findItems?.data?.map((item, i) => {
              const value = item?.[data.value] || 0
              const label = item?.[data.label] || ''
              const color = item?.[data.color] || donutColors[i % 5]

              return { value, label, color }
            })

            setItems(myData)
          }
        }, [apiData, data])


        const mainData = data.itemsValue
          ? data.itemsValue.map((ele, i) => {
              const myData = { ...ele }
              if (!ele.color) {
                ele.color = donutColors[i % 5]
              }

              return myData
            })
          : [
              { value: 85, label: 'Operational', color: '#fdd835' },
              { value: 16, label: 'Operational', color: '#fe6161' }
            ]


        return <ApexDonutChart mainData={data.api_url ? items : mainData} onChange={onChange} />
      },
      id: 'chart',
      title: messages.useChart.title,
      description: messages.useChart.description,
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <ChartControl data={data} onChange={onChange} locale={locale} readOnly={readOnly} buttonRef={buttonRef} />
        )
      },
      icon: <FaChartPie className='text-2xl' />
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, advancedEdit, advancedEdit])

  return { chart }
}
