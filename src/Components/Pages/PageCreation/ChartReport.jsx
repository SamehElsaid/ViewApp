import { useEffect } from 'react'
import { axiosPost } from 'src/Components/axiosCall'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { CircularProgress } from '@mui/material'
import DonutChart from './DonutChart'
import ApexLineChart from './ApexLineChart'
import ChartjsBarChart from './ChartjsBarChart'
import 'chart.js/auto'

export default function ChartReport({ data, onChange, readOnly, disabled }) {
  const { locale } = useIntl()
  const [chartData, setChartData] = useState({ labels: [], series: [] })
  const [loading, setLoading] = useState(true)

  const chartType = data.chartType || 'donuts'

  useEffect(() => {
    if (data.is_api_generated && data.viewValueInChart && data.viewInputValue) {
      setLoading(true)
      axiosPost(`dynamic-report-data/get-collections-data-by-API-name`, locale, {
        reportAPIName: data.userReportName,
        pageSize: 0,
        pageNumber: 0
      })
        .then(res => {
          if (res.status) {
            // const numericOnly = Object.fromEntries(
            //   Object.entries(res?.data?.result).filter(([key, value]) => typeof value === 'number')
            // )

            // const chartData = res?.data?.result.map(item => {
            //   const numericOnly = Object.fromEntries(
            //     Object.entries(item).filter(([key, value]) => typeof value === 'number')
            //   )

            //   return {
            //     labels: Object.keys(numericOnly),
            //     series: Object.values(numericOnly)
            //   }
            // })

            const labels = []
            const series = []

            res?.data?.result.forEach(item => {
              labels.push(item[data.viewInputValue])
              series.push(item[data.viewValueInChart])
            })

            setChartData({
              labels: labels,
              series: series
            })
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.is_api_generated, locale, data.viewValueInChart, data.viewInputValue, data.reload])


  const transTitle = locale === "ar" ? data.title_ar : data.title_en
  const title = transTitle ?? "Expense Ratio"
  const tranDesc = locale === "ar" ? data.description_ar : data.description_en
  const des = tranDesc || "Spending on various categories"


  return (
    <div>
      {loading && (
        <div className='flex justify-center items-center h-full min-h-[200px]'>
          <CircularProgress />
        </div>
      )}
      {chartType === 'donuts' && (
        <div className=''>
          <DonutChart chartData={chartData} title={title} des={des} />
        </div>
      )}
      {chartType === 'line' && (
        <div className=''>
          <ApexLineChart chartData={chartData} title={title} des={des} />
        </div>
      )}
      {chartType === 'bar' && (
        <div className=''>
          <ChartjsBarChart chartData={chartData} title={title} des={des} />
        </div>
      )}
    </div>
  )
}
