import { Skeleton } from '@mui/material'
import Link from 'next/link'
import { Fragment } from 'react'
import { CiHome } from 'react-icons/ci'
import { useIntl } from 'react-intl'

export default function Breadcrumbs({ isDashboard = false, routers, loading }) {
  const { messages, locale } = useIntl()

  return (
    <div className='flex flex-wrap gap-2 items-center px-5 py-2'>
      <Link href={`/${locale}/`} className='flex gap-1 items-center'>
        <CiHome className='text-xl' />
        <span>{messages.home}</span>
      </Link>
      <span className='text-xl'>/</span>
      {isDashboard && (
        <Link href={`/${locale}/setting/`} className='flex gap-1 items-center'>
          <span>{messages.dashboard}</span>
        </Link>
      )}
      {loading
        ? routers?.map((_, i) => (
            <div className='w-[100px] flex items-center gap-1' key={i}>
              <span className='text-xl'>/</span>
              <Skeleton color={1} height={10} />
            </div>
          ))
        : routers?.map((router, i) => (
            <Fragment key={i}>
              <span className='text-xl'>/</span>
              {i === routers?.length - 1 ? (
                <span className='capitalize text-font-color/70'>{router.name}</span>
              ) : (
                <Link href={router.link} className='flex gap-1 items-center capitalize'>
                  <span>{router.name}</span>
                </Link>
              )}
            </Fragment>
          ))}
    </div>
  )
}
