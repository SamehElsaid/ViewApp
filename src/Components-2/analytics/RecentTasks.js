// components/RecentTasks.tsx
import {
  Box,
  Typography,
  Checkbox,
  Chip,
  Avatar,
  Stack,
  Divider,
  Button,
  IconButton,
  Card,
  Grid,
  CardContent,
  CardHeader,
  useTheme
} from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CustomAvatar from 'src/@core/components/mui/avatar'

const tasks = [
  {
    id: 1,
    title: 'Update customer onboarding workflow',
    status: 'In Progress',
    due: 'Today',
    completed: true,
    assignees: ['JS', 'AK'],
    color: 'warning'
  },
  {
    id: 2,
    title: 'Review and approve marketing campaign',
    status: 'Overdue',
    due: 'Yesterday',
    completed: false,
    assignees: ['TW'],
    color: 'error'
  },
  {
    id: 3,
    title: 'Update API documentation',
    status: 'Completed',
    due: '2 days ago',
    completed: true,
    assignees: ['JS'],
    color: 'success'
  },
  {
    id: 4,
    title: 'Prepare quarterly report presentation',
    status: 'In Progress',
    due: 'Next week',
    completed: false,
    assignees: ['LM', 'JS'],
    color: 'warning'
  }
]

export default function RecentTasks() {
  const theme = useTheme()

  return (
    <Card>
      <CardHeader title='Recent Tasks' sx={{ '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' } }} />
      <CardContent
        sx={{ pt: theme => `${theme.spacing(7)} !important`, pb: theme => `${theme.spacing(7.5)} !important` }}
      >
        <div className='flex flex-col gap-3'>
          {tasks.map(task => (
            <Box
              key={task.id}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[10],
                borderRadius: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box display='flex' alignItems='center'>
                <Checkbox checked={task.completed} />
                <Typography
                  variant='body1'
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}
                >
                  {task.title}
                </Typography>
                <Box className='ms-auto'>
                  <Chip label={task.status} color={task.color} size='small' variant='outlined' />
                </Box>
              </Box>
              <div className='flex gap-2'>
                <Box display='flex' alignItems='center' gap={1} pl={4}>
                  <CalendarTodayIcon fontSize='small' color='action' />
                  <Typography variant='body2'>
                    {task.status === 'Completed' ? 'Completed' : 'Due'}: {task.due}
                  </Typography>
                </Box>

                <Stack direction='row' className='ms-auto' spacing={1} mt={1} pl={4}>
                  {task.assignees.map((name, index) => (

                    <CustomAvatar  key={name} skin='light-static' color={index % 2 ? 'error' : 'success'}>
                      {name}
                    </CustomAvatar>
                  ))}
                </Stack>
              </div>
            </Box>
          ))}

          <Button variant='outlined' fullWidth>
            View All Tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
