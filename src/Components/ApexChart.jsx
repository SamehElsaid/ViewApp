// ** MUI Imports
import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Component Import
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// Predefined colors
const chartColors = ['#8A2BE2', '#1FD5EB', '#FFA1A1', '#7367f0', '#00d4bd', '#FF7F50', '#fdd835']

const ApexDynamicChart = ({ apiEndpoint, chartType = 'pie' }) => {
  const theme = useTheme()
  const [chartData, setChartData] = useState({ labels: [], series: [] })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiEndpoint)
        const result = await response.json()

        if (result?.data?.length) {
          const record = result.data[0]
          const labels = []
          const values = []

          Object.entries(record).forEach(([key, value]) => {
            let num
            if (typeof value === 'number') {
                num = value
            } 
            
            if (!isNaN(num)) {
                labels.push(key)
                values.push(num)
            }
          })

          setChartData({ labels, series: values })
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }

    fetchData()
  }, [apiEndpoint])

  // Common options
  const commonOptions = {
    labels: chartData.labels,
    colors: chartData.series.map((_, i) => chartColors[i % chartColors.length]),
    legend: {
      show: true,
      position: 'bottom',
      labels: { colors: theme.palette.text.secondary },
      markers: { offsetX: -3 },
      itemMargin: { vertical: 3, horizontal: 10 }
    }
  }

  let options = { ...commonOptions }
  let series = chartData.series

  // Adjust options/series based on chart type
  switch (chartType) {
    case 'radialBar':
      options = {
        ...commonOptions,
        stroke: { lineCap: 'round' },
        plotOptions: {
          radialBar: {
            hollow: { size: '30%' },
            track: { margin: 15, background: hexToRGBA(theme.palette.customColors.trackBg, 1) },
            dataLabels: {
              name: { fontSize: '2rem' },
              value: { fontSize: '1rem', color: theme.palette.text.secondary },
              total: {
                show: true,
                fontWeight: 400,
                label: chartData.labels[0] || '',
                fontSize: '1.125rem',
                color: theme.palette.text.primary,
                formatter: (w) => {
                  const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0) / w.globals.series.length
                  
                  return total % 1 === 0 ? total + '%' : total.toFixed(2) + '%'
                }
              }
            }
          }
        },
        grid: { padding: { top: -35, bottom: -30 } }
      }
      break

    case 'pie':
      options = { ...commonOptions }
      break

    case 'donut':
      options = {
        ...commonOptions,
        plotOptions: { pie: { donut: { size: '60%' } } }
      }
      break

    case 'line':
    case 'bar':
      series = [{ name: 'Value', data: chartData.series }]
      options = {
        ...commonOptions,
        xaxis: { categories: chartData.labels }
      }
      break
  }

  return (
    <Card>
      <CardHeader title={`${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`} />
      <CardContent>
        <ReactApexcharts type={chartType} height={400} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default ApexDynamicChart
