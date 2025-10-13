import React, { useEffect, useMemo, useState } from 'react'
import OTPInput from 'react-otp-input'
import { IoMdClose } from 'react-icons/io'
import OtpControl from '../OtpControl'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import { IoTimerOutline } from 'react-icons/io5'

export default function useOtp({ locale, buttonRef }) {
  const { messages } = useIntl()

  const Otp = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        const [otp, setOtp] = useState('')
        const [otpOpen, setOtpOpen] = useState(false)
        const [resendOtp, setResendOtp] = useState(0)
        const [loading, setLoading] = useState(false)
        const router = useRouter()
        const [queries, setQueries] = useState([])

        useEffect(() => {
          if (data.params) {
            const dataParams = []

            data.params?.forEach(param => {
              if (router.query[param.paramValue]) {
                dataParams.push({ [param.param]: router.query[param.paramValue] })
              }
            })
            console.log(dataParams)
            setQueries(dataParams)
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [data.params])

        useEffect(() => {
          if (otpOpen) {
            setResendOtp(60)
          }
        }, [otpOpen])
        useEffect(() => {
          let interval = null
          if (resendOtp !== 0) {
            interval = setInterval(() => {
              setResendOtp(prev => (prev === 0 ? 0 : prev - 1))
            }, 1000)
          }

          return () => clearInterval(interval)
        }, [resendOtp])

        return (
          <form
            onSubmit={e => {
              e.preventDefault()
              if (otp.length !== (+data?.numberOfOtp || 5)) {
                return toast.error(messages.useOtp.enterTheRequiredCode)
              }

              setLoading(true)

              const sendData = {
                [data?.key || 'code']: otp,
                ...queries.reduce((acc, item) => ({ ...acc, ...item }), {})
              }

              axios
                .post(data?.api_url, sendData)
                .then(res => {
                  if (res.status === 200) {
                    toast.success(messages.useOtp.processHasCompleted)
                    setOtp('')
                    if (data?.redirectLink) {
                      router.push(data?.redirectLink)
                    }
                  }
                })
                .catch(err => {})
                .finally(() => {
                  setOtp('')
                  setLoading(false)
                })
            }}
            className='w-[100%]  bg-white || rounded-md || py-5 || max-h-[100%] || overflow-y-auto || scrollStyle relative'
          >
            <button
              type='button'
              onClick={() => setOtpOpen(false)}
              className='w-[30px] absolute top-2 end-2 || flex || items-center || justify-center || h-[30px] || bg-mainColor || duration-300 || hover:bg-mainColor/80 || rounded-full'
            >
              <IoMdClose className='text-xl text-white' />
            </button>
            <div className='flex  || items-center || justify-center || flex-col'>
              <h2 className='text-[16px] || font-bold || text-mainColor || mb-3'>
                {data?.content_ar || messages.useOtp.enterVerificationCode}
              </h2>
              <div style={{ direction: 'ltr' }} className=''>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={data?.numberOfOtp ? (data?.numberOfOtp > 20 ? 20 : data?.numberOfOtp) : 5}
                  renderSeparator={<span style={{ color: data?.titleColor || '#00cfe8' }}>-</span>}
                  containerStyle={{
                    flexWrap: 'wrap',
                    gap: '5px',
                    justifyContent: 'center'
                  }}
                  renderInput={props => (
                    <input
                      {...props}
                      style={{
                        border: `1px solid ${data?.titleColor || '#00cfe8'}`,
                        outline: 'none'
                      }}
                      className='inputFix rounded-md  !mx-2 w-[40px] || !h-[50px] !px-0 md:!px-2 text-center'
                    />
                  )}
                />
              </div>
              <div className='flex || justify-between || items-center || mt-2 || mb-3'></div>

              <button
                type='submit'
                style={{
                  backgroundColor: data?.titleColor || '#00cfe8'
                }}
                className=' || relative  px-4 || overflow-hidden || hover:bg-mainColor/80 || duration-300 || text-white || block || w-fit || py-2 || rounded-xl '
              >
                <span
                  className={`${
                    loading ? 'visible opacity-100' : 'invisible opacity-0'
                  }  duration-75 cursor-not-allowed || transition-all absolute || items-center || justify-center || flex inset-0 bg-gray-300`}
                >
                  <span className=' w-[20px] || h-[20px] || border-2 || border-mainColor || rounded-full border-t-transparent || animate-spin'></span>
                </span>

                {messages.useOtp.complete}
              </button>
              <div className='mt-4'>
                <div className='flex gap-1 justify-center items-center'>
                  {resendOtp === 0 && messages.useOtp.ifYouDidNotReceive}
                  <button
                    disabled={loading || resendOtp !== 0}
                    type='button'
                    onClick={() => {
                      setLoading(true)
                      setTimeout(() => {
                        toast.success(messages.useOtp.otpHasBeenSend)
                        setResendOtp(+data?.timerTime || 60)
                        setLoading(false)
                      }, 1000)
                      axios
                        .get(data?.resendOtpLink)
                        .then(res => {
                          if (res.status === 200) {
                            toast.success(messages.useOtp.otpHasBeenSend)
                            setResendOtp(+data?.timerTime || 60)
                            setLoading(false)
                          }
                        })
                        .catch(err => {
                          toast.error(err?.response?.data?.message || messages.useOtp.errorOccurred)
                        })
                        .finally(() => {
                          setLoading(false)
                        })
                    }}
                    className={`${
                      resendOtp === 0 ? 'text-mainColor || font-bold || hover:text-mainColor/80 || duration-300' : ''
                    }`}
                  >
                    {resendOtp !== 0
                      ? ` ${messages.useOtp.YouCannotResendAgainUntilAfter} ${resendOtp} ${messages.useOtp.seconds}`
                      : messages.useOtp.resend}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )
      },
      id: 'otp',
      title: messages.useOtp.title,
      description: messages.useOtp.description,
      version: 1,
      icon: <IoTimerOutline className='text-2xl' />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <OtpControl data={data} onChange={onChange} locale={locale} type='progressBar' buttonRef={buttonRef} />
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  return { Otp }
}
