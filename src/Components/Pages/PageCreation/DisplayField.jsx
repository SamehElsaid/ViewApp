/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { isPossiblePhoneNumber } from 'react-phone-number-input'
import { axiosGet, axiosPost } from 'src/Components/axiosCall'
import { Icon } from '@iconify/react'
import { FaEyeSlash } from 'react-icons/fa'
import NewElement from '../NewElement'
import { toast } from 'react-toastify'
import { VaildId } from 'src/Components/_Shared'
import { IoMdInformationCircleOutline } from 'react-icons/io'
import { formatDate } from '@fullcalendar/core'
import ViewInput from '../FiledesComponent/ViewInput'
import axios from 'axios'

export default function DisplayField({
  from,
  input,
  dirtyProps,
  data,
  handleSubmit,
  reload,
  refError,
  dataRef,
  errorView,
  disabledBtn,
  setLayout,
  setTriggerData,
  findError,
  readOnly,
  findValue,
  roles,
  layout,
  design,
  triggerData,
  isRedirect,
  setRedirect,
  isDisabled,
  hiddenLabel
}) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [dirty, setDirty] = useState(dirtyProps)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const { locale, messages } = useIntl()
  const [validations, setValidations] = useState({})
  const [selectedOptions, setSelectedOptions] = useState([])
  const [oldSelectedOptions, setOldSelectedOptions] = useState([])
  const xComponentProps = useMemo(() => input?.options?.uiSchema?.xComponentProps ?? {}, [input])
  const [fileName, setFile] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [regex, setRegex] = useState(roles?.regex?.regex)
  const [isDisable, setIsDisable] = useState(null)
  const [lastValue, setLastValue] = useState(null)

  useEffect(() => {
    if (isDisabled) {
      setIsDisable('disabled')
    }
  }, [isDisabled])

  useEffect(() => {
    if (!input) {
      setValue('')
      setFile('')
      setError(false)
      setDirty(false)
      setShowPassword(false)
      setValidations({})
    } else {
      if (input.type != 'new_element') {
        const dataValidations = {}
        input.validationData.forEach(item => {
          dataValidations[item.ruleType] = item.parameters
        })

        setValidations(dataValidations)
      }
    }
  }, [input])

  useEffect(() => {
    if (roles?.trigger?.typeOfValidation == 'filter' && !loading) {
      if (dataRef?.current?.[roles?.trigger?.selectedField] != undefined) {
        const FilterWithKey = roles?.trigger?.currentField == 'id' ? 'Id' : roles?.trigger?.currentField
        if (input?.kind == 'search' || input?.kind == 'checkbox') {
          setValue([])
        }
        setSelectedOptions(
          oldSelectedOptions.filter(ele => {
            if (roles?.trigger?.isEqual == 'equal') {
              return ele?.[FilterWithKey] == dataRef.current?.[roles?.trigger?.selectedField]
            } else {
              return ele?.[FilterWithKey] != dataRef.current?.[roles?.trigger?.selectedField]
            }
          })
        )
      }
    }

    // ! Start disable Control

    if (roles?.trigger?.typeOfValidation == 'disable' && !roles?.trigger?.mainValue && !loading) {
      if (dataRef?.current?.[roles?.trigger?.selectedField]?.length != 0) {
        setIsDisable('disabled')
      } else {
        setIsDisable(prev => {
          if (roles?.onMount?.type == 'hide') {
            return 'hidden'
          }

          return null
        })
      }
    }

    // ! Start enable Control
    if (roles?.trigger?.typeOfValidation == 'enable' && roles?.trigger?.mainValue && !loading) {
      if (input.fieldCategory == 'Basic') {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      setIsDisable(prev => {
                        if (roles?.onMount?.type == 'disable') {
                          return 'disabled'
                        }

                        return null
                      })
                    } else {
                      setIsDisable('enable')
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] == roles?.trigger?.mainValue) {
                      setIsDisable(prev => {
                        if (roles?.onMount?.type == 'disable') {
                          return 'disabled'
                        }

                        return null
                      })
                    } else {
                      setIsDisable('enable')
                    }
                  }
                }
              }
            })
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              setIsDisable(prev => {
                if (roles?.onMount?.type == 'disable') {
                  return 'disabled'
                }

                return null
              })
            } else {
              setIsDisable('enable')
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              setIsDisable(prev => {
                if (roles?.onMount?.type == 'disable') {
                  return 'disabled'
                }

                return null
              })
            } else {
              setIsDisable('enable')
            }
          }
        }
      } else {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      setIsDisable(prev => {
                        if (roles?.onMount?.type == 'disable') {
                          return 'disabled'
                        }

                        return null
                      })
                    } else {
                      setIsDisable('enable')
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] == roles?.trigger?.mainValue) {
                      setIsDisable(prev => {
                        if (roles?.onMount?.type == 'disable') {
                          return 'disabled'
                        }

                        return null
                      })
                    } else {
                      setIsDisable('enable')
                    }
                  }
                }
              }
            })
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              setIsDisable(prev => {
                if (roles?.onMount?.type == 'disable') {
                  return 'disabled'
                }

                return null
              })
            } else {
              setIsDisable('enable')
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              setIsDisable(prev => {
                if (roles?.onMount?.type == 'disable') {
                  return 'disabled'
                }

                return null
              })
            } else {
              setIsDisable('enable')
            }
          }
        }
      }
    }
    if (roles?.trigger?.typeOfValidation == 'enable' && !roles?.trigger?.mainValue && !loading) {
      if (dataRef?.current?.[roles?.trigger?.selectedField]?.length != 0) {
        setIsDisable('enable')
      } else {
        setIsDisable(prev => {
          if (roles?.onMount?.type == 'disable') {
            return 'disabled'
          }

          return null
        })
      }
    }
    if (roles?.trigger?.typeOfValidation == 'optional' && roles?.trigger?.mainValue && !loading) {
      if (input.fieldCategory == 'Basic') {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      if (!validations?.Required) {
                        setValidations(prev => ({ ...prev, Required: true }))
                      }
                    } else {
                      if (validations?.Required) {
                        setValidations(prev => {
                          const newPrev = { ...prev }
                          delete newPrev.Required

                          return newPrev
                        })
                      }
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] == roles?.trigger?.mainValue) {
                      if (!validations?.Required) {
                        setValidations(prev => ({ ...prev, Required: true }))
                      }
                    } else {
                      if (validations?.Required) {
                        setValidations(prev => {
                          const newPrev = { ...prev }
                          delete newPrev.Required

                          return newPrev
                        })
                      }
                    }
                  }
                }
              }
            })
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              if (!validations?.Required) {
                setValidations(prev => ({ ...prev, Required: true }))
              }
            } else {
              if (validations?.Required) {
                setValidations(prev => {
                  const newPrev = { ...prev }
                  delete newPrev.Required

                  return newPrev
                })
              }
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              if (validations?.Required) {
                setValidations(prev => {
                  const newPrev = { ...prev }
                  delete newPrev.Required

                  return newPrev
                })
              }
            } else {
              if (!validations?.Required) {
                setValidations(prev => ({ ...prev, Required: true }))
              }
            }
          }
        }
      } else {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      if (!validations?.Required) {
                        setValidations(prev => ({ ...prev, Required: true }))
                      }
                    } else {
                      if (validations?.Required) {
                        setValidations(prev => {
                          delete prev.Required

                          return prev
                        })
                      }
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] == roles?.trigger?.mainValue) {
                      if (validations?.Required) {
                        setValidations(prev => {
                          delete prev.Required

                          return prev
                        })
                      }
                    } else {
                      if (!validations?.Required) {
                        setValidations(prev => ({ ...prev, Required: true }))
                      }
                    }
                  }
                }
              }
            })
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              if (validations?.Required) {
                setValidations(prev => {
                  const newPrev = { ...prev }
                  delete newPrev.Required

                  return newPrev
                })
              }
            } else {
              if (!validations?.Required) {
                setValidations(prev => ({ ...prev, Required: true }))
              }
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              if (validations?.Required) {
                setValidations(prev => {
                  const newPrev = { ...prev }
                  delete newPrev.Required

                  return newPrev
                })
              }
            } else {
              if (!validations?.Required) {
                setValidations(prev => ({ ...prev, Required: true }))
              }
            }
          }
        }
      }
    }
    if (roles?.trigger?.typeOfValidation == 'optional' && !roles?.trigger?.mainValue && !loading) {
      if (dataRef?.current?.[roles?.trigger?.selectedField]?.length != 0) {
        setValidations(prev => {
          delete prev.Required

          return prev
        })
      } else {
        if (!validations?.Required) {
          setValidations(prev => ({ ...prev, Required: true }))
        }
      }
    }

    //  End enable Control

    // ! Start Empty Control
    if (roles?.trigger?.typeOfValidation == 'empty' && roles?.trigger?.mainValue && !loading) {
      if (input.fieldCategory == 'Basic') {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey] == roles?.trigger?.mainValue) {
                      setLastValue(true)
                      if (!lastValue) {
                        if (typeof value == 'object') {
                          setValue([])
                        } else {
                          setValue('')
                        }
                      }
                    } else {
                      setLastValue(false)
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      if (typeof value == 'object') {
                        setValue([])
                      } else {
                        setValue('')
                      }
                    }
                  }
                }
              } else {
                if (roles?.trigger.isEqual != 'equal') {
                  if (typeof value == 'object') {
                    setValue([])
                  } else {
                    setValue('')
                  }
                }
              }
            })
          } else {
            if (roles?.trigger.isEqual != 'equal') {
              if (typeof value == 'object') {
                setValue([])
              } else {
                setValue('')
              }
            }
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              setLastValue(true)
              if (!lastValue) {
                if (typeof value == 'object') {
                  setValue([])
                } else {
                  setValue('')
                }
              }
            } else {
              setLastValue(false)
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              if (typeof value == 'object') {
                setValue([])
              } else {
                setValue('')
              }
            }
          }
        }
      } else {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey] == roles?.trigger?.mainValue) {
                      setLastValue(true)
                      if (!lastValue) {
                        if (typeof value == 'object') {
                          setValue([])
                        } else {
                          setValue('')
                        }
                      }
                    } else {
                      setLastValue(false)
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      if (typeof value == 'object') {
                        setValue([])
                      } else {
                        setValue('')
                      }
                    }
                  }
                }
              } else {
                if (roles?.trigger.isEqual != 'equal') {
                  if (typeof value == 'object') {
                    setValue([])
                  } else {
                    setValue('')
                  }
                }
              }
            })
          } else {
            if (roles?.trigger.isEqual != 'equal') {
              if (typeof value == 'object') {
                setValue([])
              } else {
                setValue('')
              }
            }
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              setLastValue(true)
              if (!lastValue) {
                if (typeof value == 'object') {
                  setValue([])
                } else {
                  setValue('')
                }
              }
            } else {
              setLastValue(false)
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              if (typeof value == 'object') {
                setValue([])
              } else {
                setValue('')
              }
            }
          }
        }
      }
    }

    if (roles?.trigger?.typeOfValidation == 'empty' && !roles?.trigger?.mainValue && !loading) {
      setLastValue(dataRef?.current?.[roles?.trigger?.selectedField])
      if (dataRef?.current?.[roles?.trigger?.selectedField] != lastValue) {
        if (typeof value == 'object') {
          setValue([])
        } else {
          setValue('')
        }
      }
    }

    //  End Empty Control

    // ! Start hidden Control
    if (roles?.trigger?.typeOfValidation == 'hidden' && roles?.trigger?.mainValue && !loading) {
      if (input.fieldCategory == 'Basic' || input.type == 'new_element') {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      setIsDisable(null)
                    } else {
                      setIsDisable('hidden')
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] == roles?.trigger?.mainValue) {
                      setIsDisable(null)
                    } else {
                      setIsDisable('hidden')
                    }
                  }
                }
              }
            })
          } else {
            if (roles?.trigger?.isEqual != 'equal') {
              setIsDisable('hidden')
            }
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              setIsDisable(null)
            } else {
              setIsDisable('hidden')
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              setIsDisable('hidden')
            } else {
              setIsDisable(null)
            }
          }
        }
      } else {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      setIsDisable(null)
                    } else {
                      setIsDisable('hidden')
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] == roles?.trigger?.mainValue) {
                      setIsDisable(null)
                    } else {
                      setIsDisable('hidden')
                    }
                  }
                }
              }
            })
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              setIsDisable(null)
            } else {
              setIsDisable('hidden')
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              setIsDisable(null)
            } else {
              setIsDisable('hidden')
            }
          }
        }
      }
    }
    if (roles?.trigger?.typeOfValidation == 'hidden' && !roles?.trigger?.mainValue && !loading) {
      if (dataRef?.current?.[roles?.trigger?.selectedField]?.length != 0) {
        setIsDisable('hidden')
      } else {
        setIsDisable(prev => {
          if (roles?.onMount?.type == 'hide') {
            return 'hidden'
          }

          return null
        })
      }
    }

    //  End hidden Control

    // ! Start Visible Control
    if (roles?.trigger?.typeOfValidation == 'visible' && roles?.trigger?.mainValue && !loading) {
      if (input.fieldCategory == 'Basic') {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal ') {
                    if (data?.[roles?.trigger?.triggerKey].toLowerCase() == roles?.trigger?.mainValue.toLowerCase()) {
                      setIsDisable(null)
                    } else {
                      setIsDisable('hidden')
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      setIsDisable(null)
                    } else {
                      setIsDisable('hidden')
                    }
                  }
                }
              }
            })
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              setIsDisable(null)
            } else {
              setIsDisable('hidden')
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              setIsDisable(null)
            } else {
              setIsDisable('hidden')
            }
          }
        }
      } else {
        if (roles?.trigger?.parentKey) {
          if (dataRef?.current?.[roles?.trigger?.selectedField]) {
            axiosGet(
              `generic-entities/${roles?.trigger?.parentKey}/${dataRef?.current?.[roles?.trigger?.selectedField]}`
            ).then(res => {
              if (res.status) {
                const data = res.entities?.[0] ?? false
                if (data) {
                  if (roles?.trigger.isEqual == 'equal') {
                    if (data?.[roles?.trigger?.triggerKey].toLowerCase() == roles?.trigger?.mainValue.toLowerCase()) {
                      setIsDisable(null)
                    } else {
                      setIsDisable('hidden')
                    }
                  } else {
                    if (data?.[roles?.trigger?.triggerKey] != roles?.trigger?.mainValue) {
                      setIsDisable(null)
                    } else {
                      setIsDisable('hidden')
                    }
                  }
                }
              }
            })
          }
        } else {
          if (roles?.trigger.isEqual == 'equal') {
            if (dataRef?.current?.[roles?.trigger?.selectedField] == roles?.trigger?.mainValue) {
              setIsDisable(null)
            } else {
              setIsDisable('hidden')
            }
          } else {
            if (dataRef?.current?.[roles?.trigger?.selectedField] != roles?.trigger?.mainValue) {
              setIsDisable(null)
            } else {
              setIsDisable('hidden')
            }
          }
        }
      }
    }
    if (roles?.trigger?.typeOfValidation == 'visible' && !roles?.trigger?.mainValue && !loading) {
      if (dataRef?.current?.[roles?.trigger?.selectedField]?.length != 0) {
        setIsDisable('visible')
      } else {
        setIsDisable(prev => {
          if (roles?.onMount?.type == 'hide') {
            return 'hidden'
          }

          return null
        })
      }
    }

    // End Visible Control
  }, [roles, loading, triggerData])

  useEffect(() => {
    if (!roles?.event?.onUnmount) {
      return
    }

    if (roles?.event?.onUnmount == 'async function Action(e, args) {\n  // write your code here\n}') {
      return
    }

    const handleBeforeUnload = e => {
      e.preventDefault()

      const evaluatedFn = eval('(' + roles?.event?.onUnmount + ')')
      evaluatedFn(e)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [roles])

  useEffect(() => {
    console.log(findValue, 'findValue', input)

    const isDate = input?.type === 'date'
    const isSearchOrCheckbox = ['search', 'checkbox'].includes(input?.kind)

    if (findValue !== undefined && findValue !== null) {
      setValue(isDate ? new Date(findValue) : findValue)
    } else {
      if (isSearchOrCheckbox) setValue([])
      else if (isDate) setValue(new Date())
    }
  }, [input?.type, input?.kind, findValue])

  useEffect(() => {
    if (reload === 0) return

    const isSearchOrCheckbox = ['search', 'checkbox'].includes(input?.kind)

    setValue(isSearchOrCheckbox ? [] : '')
    setRegex('')
    setFile('')
    setError(false)
    setDirty(false)
    setShowPassword(false)
  }, [reload, input?.kind])

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        if (roles?.onMount?.type == 'disable') {
          setIsDisable('disabled')
        }
        if (roles?.onMount?.type == 'required') {
          setValidations(prev => ({ ...prev, Required: true }))
        }
        if (roles?.onMount?.type == 'enable') {
          setIsDisable('enable')
        }
        if (roles?.onMount?.type == 'hide') {
          setIsDisable('hidden')
        }
        if (roles?.onMount?.type == 'empty Data') {
          setIsDisable('null')
        }

        if (roles?.onMount?.value) {
          if (roles?.api_url) {
            setValue(roles?.apiKeyData)
          } else {
            setValue(roles?.onMount?.value)
          }
        }
      }, 0)
    }
  }, [roles?.onMount?.type, roles?.onMount?.value, loading])

  const onChange = (e, newValue) => {
    try {
      if (roles?.event?.onChange) {
        const evaluatedFn = eval('(' + roles.event.onChange + ')')

        evaluatedFn(e)
      }
    } catch {}

    setDirty(true)
    let isTypeNew = true

    if (input?.kind == 'search' || input?.kind == 'checkbox') {
      isTypeNew = false
    }
    if (input?.type == 'date') {
      isTypeNew = false
    }

    let newData = value
    if (input?.kind == 'search' || input?.kind == 'checkbox') {
      if (input.kind == 'search') {
        const maxLength = validations?.MaxLength?.maxLength ?? 9999999999
        if (newValue.length > +maxLength) {
          const newSelection = [...newValue.slice(0, maxLength - 1), newValue.at(-1)]

          setValue(newSelection)
          newData = newSelection
        } else {
          setValue(newValue)
          newData = newValue
        }
      } else {
        setValue(e.target.checked ? [...value, e.target.value] : value.filter(v => v != e.target.value))
        newData = e.target.checked ? [...value, e.target.value] : value.filter(v => v != e.target.value)
      }
    } else {
      if (input?.type == 'Date') {
        setValue(new Date(e))
      } else {
        input.type == 'Number' ? setValue(+e.target.value) : setValue(e.target.value)
      }
    }

    if (dirty) {
      if (validations.Required && e?.target?.value?.length == 0 && isTypeNew) {
        return setError(messages.required)
      }
      if (regex) {
        // Remove surrounding quotes if present
        const cleanedRegex = regex.replace(/^"(.*)"$/, '$1')
        const regexMatch = cleanedRegex.match(/^\/(.*)\/([gimuy]*)$/)
        if (!regexMatch) {
          console.error('Invalid regex format:', cleanedRegex)

          return
        }
        const [, pattern, flags] = regexMatch
        const regExp = new RegExp(pattern, flags)
        if (!regExp.test(e?.target?.value)) {
          return setError(locale == 'ar' ? roles?.regex?.message_ar : roles?.regex?.message_en)
        }
      }

      if (input.type == 'Phone' && validations.Required && e?.length == 0 && isTypeNew) {
        return setError(messages.required)
      }
      if (input.type == 'Phone' && !isPossiblePhoneNumber('+' + e?.target?.value ?? '')) {
        return setError(messages.Invalid_Phone)
      }

      if (validations.Required && newData.length == 0 && !isTypeNew) {
        return setError(messages.required)
      }

      if (input.type == 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e?.target?.value)) {
        return setError(messages.Invalid_Email)
      }

      if (
        input.type == 'URL' &&
        !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#?&//=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%._\+~#?&//=]*)$/i.test(
          e?.target?.value
        )
      ) {
        return setError(messages.Invalid_URL)
      }
      if (
        validations.MinLength &&
        e?.target?.value?.length != 0 &&
        e?.target?.value?.length < +validations?.MinLength?.minLength
      ) {
        return setError(messages.Min_Length + ' ' + +validations?.MinLength?.minLength)
      }

      if (
        validations.MaxLength &&
        e?.target?.value?.length != 0 &&
        e?.target?.value?.length > +validations?.MaxLength?.maxLength
      ) {
        return setError(messages.Max_Length + ' ' + +validations?.MaxLength?.maxLength)
      }

      setError(false)
    }
  }
  useEffect(() => {
    if (!input) return
    let errorWithoutDirty = []
    const errorMessages = []
    if (validations.Required && (value?.length == 0 || value == '')) {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.required)
    }

    if (input.type == 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value != '') {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Invalid_Email)
    }

    if (regex) {
      // Remove surrounding quotes if present
      const cleanedRegex = regex.replace(/^"(.*)"$/, '$1')
      const regexMatch = cleanedRegex.match(/^\/(.*)\/([gimuy]*)$/)
      if (!regexMatch) {
        console.error('Invalid regex format:', cleanedRegex)

        return
      }
      const [, pattern, flags] = regexMatch
      const regExp = new RegExp(pattern, flags)
      if (!regExp.test(value)) {
        errorWithoutDirty.push(true)
        errorMessages.push(locale == 'ar' ? roles?.regex?.message_ar : roles?.regex?.message_en)
      }
    }

    if (
      input.type == 'URL' &&
      !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#?&//=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%._\+~#?&//=]*)$/i.test(
        value
      ) &&
      value != ''
    ) {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Invalid_URL)
    }
    if (validations.MinLength && `${value}`.length != 0 && `${value}`.length < +validations?.MinLength?.minLength) {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Min_Length + ' ' + +validations?.MinLength?.minLength)
    }
    if (validations.MaxLength && `${value}`.length != 0 && `${value}`.length > +validations?.MaxLength?.maxLength) {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Max_Length + ' ' + +validations?.MaxLength?.maxLength)
    }
    if (input.type == 'Phone' && !isPossiblePhoneNumber('+' + value ?? '') && value != '') {
      errorWithoutDirty.push(true)
      errorMessages.push(messages.Invalid_Phone)
    }
    if (dataRef) {
      if (input.type == 'Date') {
        try {
          const lable = JSON.parse(input?.descriptionEn) ?? {
            format: 'yyyy-MM-dd',
            showTime: 'false'
          }

          dataRef.current[input.type == 'new_element' ? input.id : input.key] = value ?? formatDate(value, lable.format)
        } catch (error) {
          dataRef.current[input.type == 'new_element' ? input.id : input.key] = ''
        }
      } else {
        dataRef.current[input.type == 'new_element' ? input.id : input.key] = value
      }
      if (setTriggerData) {
        setTriggerData(prev => prev + 1)
      }
    }
    if (refError) {
      refError.current = {
        ...refError.current,
        [input.type == 'new_element' ? input.id : input.key]: errorWithoutDirty.includes(true) ? errorMessages : false
      }
    }
  }, [refError, input, value, dataRef, validations, setTriggerData])

  useEffect(() => {
    if (!input?.getDataForm) {
      setSelectedOptions([])
      setOldSelectedOptions([])
      setLoading(false)

      return
    }
    if (input?.getDataForm === 'collection') {
      axiosGet(`generic-entities/${input?.options?.source}`)
        .then(res => {
          if (res.status) {
            setSelectedOptions(res.entities)
            setOldSelectedOptions(res.entities)
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }

    if (input?.getDataForm === 'api') {
      const apiHeaders = input.apiHeaders ?? {}
      axios
        .get(input?.externalApi, {
          headers: input.apiHeaders
        })

        .then(res => {
          const selectData = res?.data?.data || res.result || res.data.result || res.data

          if (Array.isArray(selectData)) {
            setSelectedOptions(selectData)
            setOldSelectedOptions(selectData)
          }
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
    if (input?.getDataForm === 'static') {
      setSelectedOptions(input?.staticData)
      setOldSelectedOptions(input?.staticData)
    }
  }, [input])

  useEffect(() => {
    setTimeout(() => {
      if (layout && !loading) {
        if (mainRef.current) {
          setLayout(prev => {
            return prev.map(ele =>
              `${ele.i}` == `${input.id}`
                ? { ...ele, h: isDisable == 'hidden' && !readOnly ? 0 : mainRef.current.scrollHeight / 71 }
                : ele
            )
          })
        }
      }
    }, 100)
  }, [isDisable, readOnly, layout?.length, loading])

  const mainRef = useRef()

  const onChangeFile = async e => {
    const file = e.target.files[0]
    const size = roles?.size ? roles?.size * 1024 : 500 * 1024

    if (file?.size > size) {
      toast.error(locale == 'ar' ? `حجم الملف أكبر من ${size / 1024} كيلوبايت` : `File size exceeds ${size / 1024}KB`)

      return
    }
    if (roles?.event?.onChange) {
      try {
        const evaluatedFn = eval('(' + roles.event.onChange + ')')
        evaluatedFn(e)
      } catch {}
    }
    if (!file) {
      toast.error(locale == 'ar' ? 'لم يتم اختيار الملف' : 'No file selected')

      return
    }

    const isValid = input?.options?.uiSchema?.xComponentProps?.fileTypes?.some(type =>
      file.type.includes(type.replace('.', '/'))
    )

    if (isValid) {
      const file = event.target.files[0]
      const loading = toast.loading(locale == 'ar' ? 'جاري الرفع' : 'Uploading...')
      if (file) {
        axiosPost(
          'file/upload',
          'en',
          {
            file: file
          },
          true
        )
          .then(res => {
            if (res.status) {
              setFile(file.name)
              setValue(res.filePath.data)
            }
          })
          .finally(() => {
            toast.dismiss(loading)
          })
        event.target.value = ''
      }
    } else {
      setError('Invalid File Type')
      setValue('')
      setFile('')
    }

    e.target.value = ''
  }

  const handleDelete = e => {
    e.stopPropagation()
    setTimeout(() => {
      setValue('')
      setFile('')
    }, 0)
    if (validations.Required) {
      setError('Required')
    }
  }

  const label = hiddenLabel ? null : (
    <label htmlFor={input.key} style={{ textTransform: 'capitalize' }}>
      {locale == 'ar' ? input.nameAr : input.nameEn}
    </label>
  )

  const hoverText = roles?.hover?.hover_ar || roles?.hover?.hover_en
  const hintText = roles?.hint?.hint_ar || roles?.hint?.hint_en

  return (
    <div
      className={`reset ${isDisable == 'hidden' && !readOnly ? 'hidden' : ''} relative group w-full`}
      id={input.type == 'new_element' ? `s${input.id}` : VaildId(input.key.trim() + input.nameEn.trim())}
    >
      <style>{`#${input.type == 'new_element' ? `s${input.id}` : VaildId(input.key.trim() + input.nameEn.trim())} {
        ${input.kind == 'search' ? '' : design}
      }`}</style>
      {hoverText && (
        <div className='absolute bg-white w-full glass-effect z-10 start-0 border border-main-color border-dashed top-[calc(100%+5px)] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300'>
          <div className='arrow-up w-fit absolute top-[-8px] '></div>
          {hoverText}
        </div>
      )}
      <div ref={mainRef} id='parent-input'>
        <div className='flex gap-2 justify-between items-center mb-2'>
          <div className='flex gap-2 items-center'>
            {input.type != 'File' && label} <span className='text-xs text-red-500'>{validations.Required && '*'}</span>
          </div>
          {hintText && (
            <button
              type='button'
              className='text-lg relative bg-main-color hint-btn   rounded-full w-[35px] h-[35px] flex items-center justify-center cursor-pointer'
            >
              <Icon fontSize='1.25rem' icon='tabler:info-circle' className='text-white' />
              <div className='absolute glass-effect z-10 w-fit end-[0] top-[calc(100%+5px)] invisible  hint-text transition-all duration-300'>
                {hintText}
              </div>
            </button>
          )}
        </div>
        <div className='relative' style={{ display: 'flex' }}>
          {isDisable == 'hidden' && readOnly && (
            <div className='flex absolute inset-0 z-10 justify-center items-center text-sm text-white rounded-md bg-main-color/20'>
              <div className=' w-[30px] || h-[30px] || bg-main-color || rounded-full || flex || items-center || justify-center'>
                <FaEyeSlash />
              </div>
            </div>
          )}
          {input.type == 'new_element' ? (
            <NewElement
              handleSubmit={handleSubmit}
              isDisable={isDisable}
              readOnly={readOnly}
              onChangeData={onChange}
              data={data}
              disabledBtn={disabledBtn}
              input={input}
              roles={roles}
              onChangeEvent={roles?.event?.onChange}
              onBlur={roles?.event?.onBlur}
              value={value}
              setValue={setValue}
            />
          ) : (
            <ViewInput
              input={input}
              xComponentProps={xComponentProps}
              readOnly={readOnly}
              value={value}
              onBlur={roles?.event?.onBlur}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              onChange={onChange}
              from={from}
              setValue={setValue}
              roles={roles}
              onChangeFile={onChangeFile}
              isRedirect={isRedirect}
              setRedirect={setRedirect}
              fileName={fileName}
              locale={locale}
              findError={findError}
              selectedOptions={selectedOptions}
              isDisable={isDisable}
              placeholder={locale == 'ar' ? roles?.placeholder?.placeholder_ar : roles?.placeholder?.placeholder_en}
              errorView={errorView}
              handleDelete={handleDelete}
              error={error}
              setShowPassword={setShowPassword}
              showPassword={showPassword}
            />
          )}
        </div>
      </div>
      <div
        class={`${
          errorView || error ? 'opacity-100 visible' : 'opacity-0 invisible'
        } w-fit text-[#fb866e]   text-2xl end-[2px] bg-white z-10 mt-1 px-2 absolute top-[calc(50%+13px)] -translate-y-1/2 rounded-md transition-all duration-300`}
      >
        <IoMdInformationCircleOutline />
      </div>
      <div
        class={`${
          errorView || error ? 'opacity-100 visible' : 'opacity-0 invisible'
        } !text-sm bg-[#fb866e] text-white  z-10 w-fit end-[0] mt-1 px-2 absolute top-[100%] rounded-md transition-all duration-300`}
      >
        {errorView || error}
      </div>
    </div>
  )
}
