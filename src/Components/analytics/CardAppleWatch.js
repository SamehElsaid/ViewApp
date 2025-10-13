// ** MUI Imports
import Card from '@mui/material/Card'
import CustomChip from 'src/@core/components/mui/chip'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { Box, LinearProgress } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import { useIntl } from 'react-intl'

const CardAppleWatch = ({ data }) => {
  const { messages } = useIntl()
  const status = data.status ?? 'active'

  return (
    <Card className=''>
      <CardContent sx={{ p: 5 }} className='flex flex-col !h-full'>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={1} className='!flex-1'>
          <Typography variant='h5' className='!font-bold'>
            {data.title || 'Customer Onboarding'}
          </Typography>
          <CustomChip
            label={messages.card?.[status]}
            skin='light'
            color={status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning'}
            size='small'
          />
        </Box>

        <Box display='flex' justifyContent='space-between' alignItems='center' className='!mt-4'>
          <Typography variant='body2' className='!font-bold'>
            {messages.card.progress}
          </Typography>
          <Typography variant='body2' color='primary' className='!font-bold'>
            {data.progress}%
          </Typography>
        </Box>

        <LinearProgress variant='determinate' value={data.progress} sx={{ height: 8, borderRadius: 4, my: 1.5 }} />

        <Box display='flex' alignItems='center' className='!mt-4'>
          <AssignmentIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
          <Typography variant='body2' color='text.secondary' className='!font-bold'>
            {data.tasksRemaining} {messages.card.tasksRemaining}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CardAppleWatch
