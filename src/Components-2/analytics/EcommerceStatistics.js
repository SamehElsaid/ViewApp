// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports

const EcommerceStatistics = ({ data }) => {
  const backgroundColors = [
    'bg-green-500/30',
    'bg-blue-500/30',
    'bg-yellow-500/30',
    'bg-red-500/30',
    'bg-purple-500/30',
    'bg-pink-500/30'
  ]

  const textColors = [
    'text-green-500',
    'text-blue-500',
    'text-yellow-500',
    'text-red-500',
    'text-purple-500',
    'text-pink-500'
  ]

  const randomColor = backgroundColors.find(item => item.includes(data.color)) || backgroundColors[0]
  const randomTextColor = textColors.find(item => item.includes(data.color)) || textColors[0]

  return (
    <Card>
      <Grid item xs={6} md={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div className={`flex justify-center items-center w-10 h-10 rounded-full ${randomColor} ${randomTextColor}`}>
            <Icon icon={data.icon || 'tabler:chart-pie-2'} fontSize='1.5rem' />
          </div>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h5'>{data.value}</Typography>
            <Typography variant='body2'>{data.title}</Typography>
          </Box>
        </Box>
      </Grid>
    </Card>
  )
}

export default EcommerceStatistics
