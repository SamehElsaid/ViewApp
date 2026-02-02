import React, { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useIntl } from 'react-intl'
import { axiosPost } from 'src/Components/axiosCall'

function clamp(v, a = 0, b = 1) {
  return Math.min(b, Math.max(a, v))
}
function hexToRgb(hex) {
  if (!hex) return null
  hex = hex.replace(/^#/, '').trim()
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('')
  }
  if (hex.length !== 6) return null
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  return { r, g, b }
}
function toHex2(n) {
  const h = Math.round(clamp(n, 0, 255)).toString(16)

  return h.length === 1 ? '0' + h : h
}

function getTransparentColor(hex, opacity = 0.1) {
  hex = hex.replace('#', '').trim()

  // لو اللون 3 حروف نمدّه لـ 6
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('')
  }

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export default function StatisticsReport({ data }) {
  const { locale } = useIntl()
  const [statisticsData, setStatisticsData] = useState([])
  const [loading, setLoading] = useState(true)

  const transTitle = locale === "ar" ? data.title_ar : data.title_en
  const title = transTitle ?? "Statistics Group"
  const tranDesc = locale === "ar" ? data.description_ar : data.description_en
  const des = tranDesc || "Statistics on various categories"  

  useEffect(() => {
    if (data.is_api_generated) {
      setLoading(true)
      axiosPost(`dynamic-report-data/get-collections-data-by-API-name`, locale, {
        reportAPIName: data.userReportName,
        pageSize: 0,
        pageNumber: 0
      })
        .then(res => {
          if (res.status) {
            const statisticsData = res?.data?.result.flatMap(item => {
              const findIcon = data.statisticsValues?.find(value => value.key === Object.keys(item)[0])


              return Object.entries(item).map(([key, value]) => ({
                label: key,
                value: value,
                icon: findIcon?.icon || 'mdi:chart-bar',
                color: findIcon?.color || 'blue',
                opacityColor: getTransparentColor(findIcon?.color || 'blue', 0.1)
              }))
            })
            setStatisticsData(statisticsData)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.is_api_generated, locale, data.reload])

  if (loading) {
    return <div className='p-3 text-gray-500'>Loading statistics...</div>
  }

  if (!statisticsData.length) {
    return <div className='p-3 text-gray-500'>No statistics to display.</div>
  }


  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4'>
        <div className='flex flex-col justify-center   text-sm text-gray-600'>
          <strong className='text-base text-gray-900'>{title}</strong>
          <span className='text-sm text-gray-500'>{des}</span>
        </div>

        <div className='flex flex-wrap gap-3'>
          {statisticsData.map((stat, statIdx) => (
            <div
              key={`stat-${statIdx}`}
              className='flex min-w-[180px] flex-1 items-center gap-3 rounded-xl bg-white p-4 shadow-lg'
            >
              <div
                className='flex h-11 w-11 items-center justify-center rounded-xl'
                style={{
                  background: stat.opacityColor,
                  color: stat.color || '#6b7280'
                }}
              >
                {stat.icon ? <Icon icon={stat.icon} width={22} height={22} /> : null}
              </div>
              <div className='flex flex-col'>
                <span className='text-[13px] font-semibold text-gray-500'>{stat.label}</span>
                <strong className='text-[17px] text-gray-900 tracking-[0.2px]' title={stat.value}>
                  {stat.value}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
