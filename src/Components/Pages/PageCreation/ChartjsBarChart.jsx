// ** React Imports
import { forwardRef, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'


// ** Third Party Imports
import { Bar } from 'react-chartjs-2'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports

const ChartjsBarChart = props => {
  const { yellow = '#ffcf5c', chartData, title, des } = props

  const theme = useTheme()

  const borderColor = theme.palette.divider
  const labelColor = theme.palette.text.disabled

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500 },
    scales: {
      x: {
        grid: {
          color: borderColor
        },
        ticks: { color: labelColor }
      },
      y: {
        min: 0,
        max: Math.max(...chartData.series),
        grid: {
          color: borderColor
        },
        ticks: {
          stepSize: Math.max(...chartData.series) / 10,
          color: labelColor
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        maxBarThickness: 15,
        backgroundColor: yellow,
        borderColor: 'transparent',
        borderRadius: { topRight: 15, topLeft: 15 },
        data: chartData.series
      }
    ]
  }

 

  return (
    <Card>
      <CardHeader
        title={title}
        subheader={des}
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: 0 },
          '& .MuiCardHeader-content': { mb: [2, 0] }
        }}
      />
      <CardContent>
        <Bar data={data} height={400} options={options} />
      </CardContent>
    </Card>
  )
}

export default ChartjsBarChart
