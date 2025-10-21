/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField
} from '@mui/material'
import { useIntl } from 'react-intl'
import { useState } from 'react'
import Collapse from '@kunukn/react-collapse'
import { cssToObject, DefaultStyle, objectToCss } from 'src/Components/_Shared'
import { Icon } from '@iconify/react'
import { UrlTranAr, UrlTranEn } from 'src/Components/axiosCall'
import toast from 'react-hot-toast'

export default function InputControl({ data, onChange, type }) {
  const { locale, messages } = useIntl()
  const [selected, setSelect] = useState('main')

  const Css = cssToObject(data.css || DefaultStyle(type))

  const getData = key => {
    const keys = key.split('.')

    let result = Css
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return ''
      }
    }

    return result
  }

  const UpdateData = (key, value) => {
    const Css = cssToObject(data.css || DefaultStyle(type))

    const keys = key.split('.')

    let current = Css
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {}
      }
      current = current[k]
    }

    current[keys[keys.length - 1]] = value

    onChange({ ...data, css: objectToCss(Css).replaceAll('NaN', '') })
  }

  return (
    <div>
      <div className='flex || items-center || justify-center mb-4'>
        <ButtonGroup variant='outlined' color='primary'>
          <Button
            onClick={() => {
              setSelect('main')
            }}
            variant={selected === 'main' ? 'contained' : 'outlined'}
          >
            {messages.dialogs.main}
          </Button>
          <Button
            variant={selected === 'style' ? 'contained' : 'outlined'}
            onClick={() => {
              setSelect('style')
            }}
          >
            {messages.dialogs.style}
          </Button>
          <Button
            onClick={() => {
              setSelect('roles')
            }}
            variant={selected === 'roles' ? 'contained' : 'outlined'}
          >
            {messages.dialogs.roles}
          </Button>
        </ButtonGroup>
      </div>{' '}
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selected === 'main')}>
        {!type && (
          <TextField
            fullWidth
            type='text'
            value={data.type || 'text'}
            onChange={e => onChange({ ...data, type: e.target.value })}
            variant='filled'
            label={messages.dialogs.type}
            select
          >
            <MenuItem value='text'>Text</MenuItem>
            <MenuItem value='number'>Number</MenuItem>
            <MenuItem value='email'>Email</MenuItem>
            <MenuItem value='password'>Password</MenuItem>
            <MenuItem value='tel'>Tel</MenuItem>
            <MenuItem value='url'>Url</MenuItem>
          </TextField>
        )}
        {type === 'date' && (
          <>
            <TextField
              fullWidth
              type='text'
              value={data.format || 'MM/dd/yyyy'}
              onChange={e => onChange({ ...data, format: e.target.value })}
              variant='filled'
              label={messages.dialogs.format}
              placeholder='MM/dd/yyyy h:mm aa'
            ></TextField>
            <TextField
              fullWidth
              type='text'
              value={data.showTime || 'false'}
              onChange={e => onChange({ ...data, showTime: e.target.value })}
              variant='filled'
              label={messages.dialogs.time}
              placeholder='true'
              select
            >
              <MenuItem value='true'>{messages.dialogs.show}</MenuItem>
              <MenuItem value='false'>{messages.dialogs.hide}</MenuItem>
            </TextField>
          </>
        )}
        <TextField
          fullWidth
          type='text'
          value={data.key}
          onChange={e => onChange({ ...data, key: e.target.value })}
          variant='filled'
          label={messages.dialogs.key}
        />
        <TextField
          fullWidth
          type='text'
          value={data.labelAr}
          onChange={e => onChange({ ...data, labelAr: e.target.value })}
          variant='filled'
          label={messages.dialogs.labelAr}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position='end'
                type='button'
                onClick={async () => {
                  const loading = toast.loading(messages.dialogs.translating)
                  const res = await UrlTranAr(data.labelAr)
                  onChange({ ...data, labelEn: res })
                  toast.dismiss(loading)
                }}
              >
                <IconButton edge='end' onMouseDown={e => e.preventDefault()}>
                  <Icon fontSize='1.25rem' icon={'material-symbols:g-translate'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextField
          fullWidth
          type='text'
          value={data.labelEn}
          onChange={e => onChange({ ...data, labelEn: e.target.value })}
          variant='filled'
          label={messages.dialogs.labelEn}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position='end'
                type='button'
                onClick={async () => {
                  const loading = toast.loading(messages.dialogs.translating)
                  const res = await UrlTranEn(data.labelEn)
                  onChange({ ...data, labelAr: res })
                  toast.dismiss(loading)
                }}
              >
                <IconButton edge='end' onMouseDown={e => e.preventDefault()}>
                  <Icon fontSize='1.25rem' icon={'material-symbols:g-translate'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          fullWidth
          type='text'
          value={data.placeholderAr}
          onChange={e => onChange({ ...data, placeholderAr: e.target.value })}
          variant='filled'
          label={messages.dialogs.placeholderAr}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position='end'
                type='button'
                onClick={async () => {
                  const loading = toast.loading(messages.dialogs.translating)
                  const res = await UrlTranAr(data.placeholderAr)
                  onChange({ ...data, placeholderEn: res })
                  toast.dismiss(loading)
                }}
              >
                <IconButton edge='end' onMouseDown={e => e.preventDefault()}>
                  <Icon fontSize='1.25rem' icon={'material-symbols:g-translate'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextField
          fullWidth
          type='text'
          value={data.placeholderEn}
          onChange={e => onChange({ ...data, placeholderEn: e.target.value })}
          variant='filled'
          label={messages.dialogs.placeholderEn}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position='end'
                type='button'
                onClick={async () => {
                  const loading = toast.loading(messages.dialogs.translating)
                  const res = await UrlTranEn(data.placeholderEn)
                  onChange({ ...data, placeholderAr: res })
                  toast.dismiss(loading)
                }}
              >
                <IconButton edge='end' onMouseDown={e => e.preventDefault()}>
                  <Icon fontSize='1.25rem' icon={'material-symbols:g-translate'} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        {type === 'textarea' && (
          <TextField
            fullWidth
            type='number'
            value={data.rows || 5}
            onChange={e => onChange({ ...data, rows: e.target.value })}
            variant='filled'
            label={messages.dialogs.rows}
          />
        )}
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selected === 'style')}>
        <TextField
          fullWidth
          type='number'
          value={getData(type === 'textarea' ? 'textarea.width.value' : 'input.width.value') || ''}
          onChange={e => UpdateData(type === 'textarea' ? 'textarea.width.value' : 'input.width.value', e.target.value)}
          variant='filled'
          label={messages.dialogs.width}
          disabled={
            getData(type === 'textarea' ? 'textarea.width.unit' : 'input.width.unit') === 'Max-Content' ||
            getData(type === 'textarea' ? 'textarea.width.unit' : 'input.width.unit') === 'Min-Content' ||
            getData(type === 'textarea' ? 'textarea.width.unit' : 'input.width.unit') === 'Fit-Content' ||
            getData(type === 'textarea' ? 'textarea.width.unit' : 'input.width.unit') === 'Auto' ||
            !getData(type === 'textarea' ? 'textarea.width.unit' : 'input.width.unit')
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Select
                  value={getData(type === 'textarea' ? 'textarea.width.unit' : 'input.width.unit') || '%'} // الافتراضي px
                  onChange={e =>
                    UpdateData(type === 'textarea' ? 'textarea.width.unit' : 'input.width.unit', e.target.value)
                  }
                  displayEmpty
                  variant='standard'
                >
                  <MenuItem value='px'>PX</MenuItem>
                  <MenuItem value='%'>%</MenuItem>
                  <MenuItem value='EM'>EM</MenuItem>
                  <MenuItem value='VW'>VW</MenuItem>
                  <MenuItem value='Max-Content'>Max-Content</MenuItem>
                  <MenuItem value='Min-Content'>Min-Content</MenuItem>
                  <MenuItem value='Fit-Content'>Fit-Content</MenuItem>
                  <MenuItem value='Auto'>Auto</MenuItem>
                </Select>
                {/* <FormControl>
              </FormControl> */}
              </InputAdornment>
            )
          }}
        />
        <div className='mt-1'></div>
        <TextField
          fullWidth
          type='number'
          value={getData(type === 'textarea' ? 'textarea.height.value' : 'input.height.value') || ''}
          onChange={e =>
            UpdateData(type === 'textarea' ? 'textarea.height.value' : 'input.height.value', e.target.value)
          }
          variant='filled'
          label={messages.dialogs.height}
          disabled={
            getData(type === 'textarea' ? 'textarea.height.unit' : 'input.height.unit') === 'Max-Content' ||
            getData(type === 'textarea' ? 'textarea.height.unit' : 'input.height.unit') === 'Min-Content' ||
            getData(type === 'textarea' ? 'textarea.height.unit' : 'input.height.unit') === 'Fit-Content' ||
            getData(type === 'textarea' ? 'textarea.height.unit' : 'input.height.unit') === 'Auto' ||
            !getData(type === 'textarea' ? 'textarea.height.unit' : 'input.height.unit')
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Select
                  value={getData(type === 'textarea' ? 'textarea.height.unit' : 'input.height.unit') || 'Auto'} // الافتراضي px
                  onChange={e =>
                    UpdateData(type === 'textarea' ? 'textarea.height.unit' : 'input.height.unit', e.target.value)
                  }
                  displayEmpty
                  variant='standard'
                >
                  <MenuItem value='px'>PX</MenuItem>
                  <MenuItem value='%'>%</MenuItem>
                  <MenuItem value='EM'>EM</MenuItem>
                  <MenuItem value='VW'>VW</MenuItem>
                  <MenuItem value='Max-Content'>Max-Content</MenuItem>
                  <MenuItem value='Min-Content'>Min-Content</MenuItem>
                  <MenuItem value='Fit-Content'>Fit-Content</MenuItem>
                  <MenuItem value='Auto'>Auto</MenuItem>
                </Select>
              </InputAdornment>
            )
          }}
        />
        <div className='mt-1'></div>
        <TextField
          fullWidth
          type='number'
          value={getData(type === 'textarea' ? 'textarea.margin-top.value' : 'input.margin-top.value') || ''}
          onChange={e =>
            UpdateData(type === 'textarea' ? 'textarea.margin-top.value' : 'input.margin-top.value', e.target.value)
          }
          variant='filled'
          label={messages.dialogs.marginTop}
          disabled={
            getData(type === 'textarea' ? 'textarea.margin-top.unit' : 'input.margin-top.unit') === 'Max-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-top.unit' : 'input.margin-top.unit') === 'Min-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-top.unit' : 'input.margin-top.unit') === 'Fit-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-top.unit' : 'input.margin-top.unit') === 'Auto' ||
            !getData(type === 'textarea' ? 'textarea.margin-top.unit' : 'input.margin-top.unit')
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Select
                  value={getData(type === 'textarea' ? 'textarea.margin-top.unit' : 'input.margin-top.unit') || 'Auto'} // الافتراضي px
                  onChange={e =>
                    UpdateData(
                      type === 'textarea' ? 'textarea.margin-top.unit' : 'input.margin-top.unit',
                      e.target.value
                    )
                  }
                  displayEmpty
                  variant='standard'
                >
                  <MenuItem value='px'>PX</MenuItem>
                  <MenuItem value='%'>%</MenuItem>
                  <MenuItem value='EM'>EM</MenuItem>
                  <MenuItem value='VW'>VW</MenuItem>
                  <MenuItem value='Max-Content'>Max-Content</MenuItem>
                  <MenuItem value='Min-Content'>Min-Content</MenuItem>
                  <MenuItem value='Fit-Content'>Fit-Content</MenuItem>
                  <MenuItem value='Auto'>Auto</MenuItem>
                </Select>
              </InputAdornment>
            )
          }}
        />
        <div className='mt-1'></div>
        <TextField
          fullWidth
          type='number'
          value={getData(type === 'textarea' ? 'textarea.margin-bottom.value' : 'input.margin-bottom.value') || ''}
          onChange={e =>
            UpdateData(
              type === 'textarea' ? 'textarea.margin-bottom.value' : 'input.margin-bottom.value',
              e.target.value
            )
          }
          variant='filled'
          label={messages.dialogs.marginBottom}
          disabled={
            getData(type === 'textarea' ? 'textarea.margin-bottom.unit' : 'input.margin-bottom.unit') ===
              'Max-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-bottom.unit' : 'input.margin-bottom.unit') ===
              'Min-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-bottom.unit' : 'input.margin-bottom.unit') ===
              'Fit-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-bottom.unit' : 'input.margin-bottom.unit') === 'Auto' ||
            !getData(type === 'textarea' ? 'textarea.margin-bottom.unit' : 'input.margin-bottom.unit')
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Select
                  value={
                    getData(type === 'textarea' ? 'textarea.margin-bottom.unit' : 'input.margin-bottom.unit') || 'Auto'
                  } // الافتراضي px
                  onChange={e =>
                    UpdateData(
                      type === 'textarea' ? 'textarea.margin-bottom.unit' : 'input.margin-bottom.unit',
                      e.target.value
                    )
                  }
                  displayEmpty
                  variant='standard'
                >
                  <MenuItem value='px'>PX</MenuItem>
                  <MenuItem value='%'>%</MenuItem>
                  <MenuItem value='EM'>EM</MenuItem>
                  <MenuItem value='VW'>VW</MenuItem>
                  <MenuItem value='Max-Content'>Max-Content</MenuItem>
                  <MenuItem value='Min-Content'>Min-Content</MenuItem>
                  <MenuItem value='Fit-Content'>Fit-Content</MenuItem>
                  <MenuItem value='Auto'>Auto</MenuItem>
                </Select>
              </InputAdornment>
            )
          }}
        />
        <div className='mt-1'></div>
        <TextField
          fullWidth
          type='number'
          value={
            getData(type === 'textarea' ? 'textarea.margin-inline-start.value' : 'input.margin-inline-start.value') ||
            ''
          }
          onChange={e =>
            UpdateData(
              type === 'textarea' ? 'textarea.margin-inline-start.value' : 'input.margin-inline-start.value',
              e.target.value
            )
          }
          variant='filled'
          label={messages.dialogs.marginLeft}
          disabled={
            getData(type === 'textarea' ? 'textarea.margin-inline-start.unit' : 'input.margin-inline-start.unit') ===
              'Max-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-inline-start.unit' : 'input.margin-inline-start.unit') ===
              'Min-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-inline-start.unit' : 'input.margin-inline-start.unit') ===
              'Fit-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-inline-start.unit' : 'input.margin-inline-start.unit') ===
              'Auto' ||
            !getData(type === 'textarea' ? 'textarea.margin-inline-start.unit' : 'input.margin-inline-start.unit')
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Select
                  value={
                    getData(
                      type === 'textarea' ? 'textarea.margin-inline-start.unit' : 'input.margin-inline-start.unit'
                    ) || 'Auto'
                  } // الافتراضي px
                  onChange={e =>
                    UpdateData(
                      type === 'textarea' ? 'textarea.margin-inline-start.unit' : 'input.margin-inline-start.unit',
                      e.target.value
                    )
                  }
                  displayEmpty
                  variant='standard'
                >
                  <MenuItem value='px'>PX</MenuItem>
                  <MenuItem value='%'>%</MenuItem>
                  <MenuItem value='EM'>EM</MenuItem>
                  <MenuItem value='VW'>VW</MenuItem>
                  <MenuItem value='Max-Content'>Max-Content</MenuItem>
                  <MenuItem value='Min-Content'>Min-Content</MenuItem>
                  <MenuItem value='Fit-Content'>Fit-Content</MenuItem>
                  <MenuItem value='Auto'>Auto</MenuItem>
                </Select>
              </InputAdornment>
            )
          }}
        />
        <div className='mt-1'></div>
        <TextField
          fullWidth
          type='number'
          value={
            getData(type === 'textarea' ? 'textarea.margin-inline-end.value' : 'input.margin-inline-end.value') || ''
          }
          onChange={e =>
            UpdateData(
              type === 'textarea' ? 'textarea.margin-inline-end.value' : 'input.margin-inline-end.value',
              e.target.value
            )
          }
          variant='filled'
          label={messages.dialogs.marginRight}
          disabled={
            getData(type === 'textarea' ? 'textarea.margin-inline-end.unit' : 'input.margin-inline-end.unit') ===
              'Max-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-inline-end.unit' : 'input.margin-inline-end.unit') ===
              'Min-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-inline-end.unit' : 'input.margin-inline-end.unit') ===
              'Fit-Content' ||
            getData(type === 'textarea' ? 'textarea.margin-inline-end.unit' : 'input.margin-inline-end.unit') ===
              'Auto' ||
            !getData(type === 'textarea' ? 'textarea.margin-inline-end.unit' : 'input.margin-inline-end.unit')
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Select
                  value={
                    getData(type === 'textarea' ? 'textarea.margin-inline-end.unit' : 'input.margin-inline-end.unit') ||
                    'Auto'
                  } // الافتراضي px
                  onChange={e =>
                    UpdateData(
                      type === 'textarea' ? 'textarea.margin-inline-end.unit' : 'input.margin-inline-end.unit',
                      e.target.value
                    )
                  }
                  displayEmpty
                  variant='standard'
                >
                  <MenuItem value='px'>PX</MenuItem>
                  <MenuItem value='%'>%</MenuItem>
                  <MenuItem value='EM'>EM</MenuItem>
                  <MenuItem value='VW'>VW</MenuItem>
                  <MenuItem value='Max-Content'>Max-Content</MenuItem>
                  <MenuItem value='Min-Content'>Min-Content</MenuItem>
                  <MenuItem value='Fit-Content'>Fit-Content</MenuItem>
                  <MenuItem value='Auto'>Auto</MenuItem>
                </Select>
              </InputAdornment>
            )
          }}
        />

        <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
          <TextField
            fullWidth
            type='color'
            defaultValue={
              getData(type === 'textarea' ? 'textarea.background-color.unit' : 'input.background-color.unit') ||
              '#575757'
            }
            onBlur={e =>
              UpdateData(
                type === 'textarea' ? 'textarea.background-color.unit' : 'input.background-color.unit',
                e.target.value
              )
            }
            label={messages.dialogs.backgroundColor}
            variant='filled'
          />
        </div>
        <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
          <TextField
            fullWidth
            type='color'
            defaultValue={getData(type === 'textarea' ? 'textarea.color.unit' : 'input.color.unit') || '#575757'}
            onBlur={e => UpdateData(type === 'textarea' ? 'textarea.color.unit' : 'input.color.unit', e.target.value)}
            label={messages.dialogs.color}
            variant='filled'
          />
        </div>
        <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
          <TextField
            fullWidth
            type='color'
            defaultValue={
              getData(type === 'textarea' ? 'textarea::placeholder.color.unit' : 'input::placeholder.color.unit') ||
              '#dfdfdf'
            }
            onBlur={e =>
              UpdateData(
                type === 'textarea' ? 'textarea::placeholder.color.unit' : 'input::placeholder.color.unit',
                e.target.value
              )
            }
            label={messages.dialogs.placeHolderColor}
            variant='filled'
          />
        </div>
        <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
          <TextField
            fullWidth
            type='color'
            defaultValue={
              getData(type === 'textarea' ? 'textarea.label.color.unit' : 'input.label.color.unit') || '#555'
            }
            onBlur={e =>
              UpdateData(type === 'textarea' ? 'textarea.label.color.unit' : 'input.label.color.unit', e.target.value)
            }
            label={messages.dialogs.labelColor}
            variant='filled'
          />
        </div>
        {type === 'date' && (
          <div className='bg-[#f0f0f0] p-2 mt-1 rounded-md cursor-pointer'>
            <TextField
              fullWidth
              type='color'
              defaultValue={getData('#calendar-icon.color.unit') || '#555'}
              onBlur={e => UpdateData('#calendar-icon.color.unit', e.target.value)}
              label={messages.dialogs.dateIconColor}
              variant='filled'
            />
          </div>
        )}
      </Collapse>
      <Collapse transition={`height 300ms cubic-bezier(.4, 0, .2, 1)`} isOpen={Boolean(selected === 'roles')}>
        <FormControlLabel
          control={
            <Checkbox
              checked={data.required}
              onChange={e =>
                onChange({
                  ...data,
                  required: e.target.checked
                })
              }
            />
          }
          label={messages.dialogs.required}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={data.unique}
              onChange={e =>
                onChange({
                  ...data,
                  unique: e.target.checked
                })
              }
            />
          }
          label={messages.dialogs.unique}
        />

        {data.type === 'number' && (
          <>
            <TextField
              label={messages.dialogs.minValue}
              type='number'
              fullWidth
              margin='normal'
              value={data.minValue}
              onChange={e =>
                onChange({
                  ...data,
                  minValue: e.target.value
                })
              }
            />
            <TextField
              label={messages.dialogs.maxValue}
              type='number'
              fullWidth
              margin='normal'
              value={data.maxValue}
              onChange={e =>
                onChange({
                  ...data,
                  maxValue: e.target.value
                })
              }
            />
          </>
        )}

        {type !== 'date' && (
          <>
            <TextField
              label={messages.dialogs.minLength}
              type='number'
              fullWidth
              margin='normal'
              value={data.minLength}
              onChange={e =>
                onChange({
                  ...data,
                  minLength: e.target.value
                })
              }
            />
            <TextField
              label={messages.dialogs.maxLength}
              type='number'
              fullWidth
              margin='normal'
              value={data.maxLength}
              onChange={e =>
                onChange({
                  ...data,
                  maxLength: e.target.value
                })
              }
            />
            <TextField
              fullWidth
              type='text'
              defaultValue={data.regex}
              onBlur={e => onChange({ ...data, regex: e.target.value })}
              label={'Regex'}
              variant='filled'
            />
            <TextField
              fullWidth
              type='text'
              defaultValue={data.regexMessageAr}
              onBlur={e => onChange({ ...data, regexMessageAr: e.target.value })}
              label={messages.dialogs.regexMessageAr}
              variant='filled'
            />
            <TextField
              fullWidth
              type='text'
              defaultValue={data.regexMessageEn}
              onBlur={e => onChange({ ...data, regexMessageEn: e.target.value })}
              label={messages.dialogs.regexMessageEn}
              variant='filled'
            />
          </>
        )}
      </Collapse>
    </div>
  )
}
