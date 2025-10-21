import { InputAdornment, TextField } from '@mui/material'
import React, { useState, useRef } from 'react'
import { ChromePicker } from 'react-color'
import { FaPlus, FaMinus, FaTimes, FaUpload } from 'react-icons/fa'
import { useIntl } from 'react-intl'

const HeaderControl = ({ data = {}, onChange, locale, buttonRef }) => {
  const { messages } = useIntl()
  const [showColorPicker, setShowColorPicker] = useState(null)
  const [tempColors, setTempColors] = useState({})
  const fileInputRef = useRef(null)

  // Initialize default data if not provided
  const headerData = {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    paddingX: '16',
    paddingY: '12',
    showShadow: false,
    showSelector: false,
    selectorBgColor: '#f3f4f6',
    selectorTextColor: '#374151',
    selectorBorderColor: '#d1d5db',
    selectorFontWeight: 'normal',
    options: [],
    defaultOption: '',
    logoUrl: 'https://www.gahar.gov.eg/Front/images/logo.svg',
    logoHeight: '40px',
    logoAlt: 'Logo',
    logoText_en: 'Logo Here',
    logoText_ar: 'الشعار هنا',
    logoTextColor: '#000000',
    logoFile: null,
    logoFilePreview: '',
    showMobileMenu: false,
    mobileMenuColor: '#000000',
    mobileMenuBgColor: '#ffffff',
    rightLinks: [],
    rightLinksColor: '#374151',
    rightLinksFontWeight: 'normal',
    showRightButton: false,
    rightButtonText_en: 'Button',
    rightButtonText_ar: 'زر',
    rightButtonBgColor: '#4f46e5',
    rightButtonTextColor: '#ffffff',
    rightButtonBorder: 'none',
    rightButtonAction: 'link', // New property for button action type: 'link', 'alert', 'custom'
    rightButtonLink: '#', // New property for button link URL
    rightButtonAlertMessage: 'Button clicked!', // New property for alert message
    rightButtonId: 'header-right-button', // New property for button ID
    mobileMenuItems: [],
    mobileMenuItemColor: '#374151',
    mobileMenuItemFontWeight: 'normal',
    ...data
  }

  // Helper function to handle inputs

  const handleChange = (field, value) => {
    onChange({
      ...headerData,
      [field]: value
    })
  }

  // Handle checkbox changes
  const handleCheckboxChange = field => {
    handleChange(field, !headerData[field])
  }

  // Handle file upload for logo
  const handleLogoFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = event => {
        onChange({
          ...headerData,
          logoFile: file,
          logoFilePreview: event.target.result,
          logoUrl: '' // Clear the URL when uploading a file
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  // Remove uploaded logo
  const removeUploadedLogo = () => {
    onChange({
      ...headerData,
      logoFile: null,
      logoFilePreview: ''
    })
  }

  // Handle color picker
  const toggleColorPicker = field => {
    setShowColorPicker(showColorPicker === field ? null : field)
    if (showColorPicker !== field) {
      setTempColors({ ...tempColors, [field]: headerData[field] })
    }
  }

  // Handle color change
  const handleColorChange = (field, color) => {
    setTempColors({ ...tempColors, [field]: color.hex })
  }

  // Apply color change
  const applyColorChange = field => {
    handleChange(field, tempColors[field])
    setShowColorPicker(null)
  }

  // Add option to selector
  const addOption = () => {
    const newOption = {
      value: `option-${headerData.options.length + 1}`,
      label_en: 'New Option',
      label_ar: 'خيار جديد'
    }
    handleChange('options', [...headerData.options, newOption])
  }

  // Remove option from selector
  const removeOption = index => {
    const newOptions = [...headerData.options]
    newOptions.splice(index, 1)
    handleChange('options', newOptions)
  }

  // Handle option change
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...headerData.options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    handleChange('options', newOptions)
  }

  // Add link to right section
  const addRightLink = () => {
    const newLink = {
      url: '#',
      text_en: 'New Link',
      text_ar: 'رابط جديد'
    }
    handleChange('rightLinks', [...headerData.rightLinks, newLink])
  }

  // Remove link from right section
  const removeRightLink = index => {
    const newLinks = [...headerData.rightLinks]
    newLinks.splice(index, 1)
    handleChange('rightLinks', newLinks)
  }

  // Handle link change
  const handleLinkChange = (index, field, value) => {
    const newLinks = [...headerData.rightLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    handleChange('rightLinks', newLinks)
  }

  // Add mobile menu item
  const addMobileMenuItem = () => {
    const newItem = {
      url: '#',
      text_en: 'New Mobile Menu Item',
      text_ar: 'عنصر جديد في القائمة المتحركة'
    }
    handleChange('mobileMenuItems', [...headerData.mobileMenuItems, newItem])
  }

  // Remove mobile menu item
  const removeMobileMenuItem = index => {
    const newItems = [...headerData.mobileMenuItems]
    newItems.splice(index, 1)
    handleChange('mobileMenuItems', newItems)
  }

  // Handle mobile menu item change
  const handleMobileMenuItemChange = (index, field, value) => {
    const newItems = [...headerData.mobileMenuItems]
    newItems[index] = { ...newItems[index], [field]: value }
    handleChange('mobileMenuItems', newItems)
  }

  // Color picker component
  const ColorPickerControl = ({ label, field }) => (
    <div className='mb-3'>
      <label className='block mb-1 text-sm font-medium'>{label}</label>
      <div className='flex items-center'>
        <div
          className='w-8 h-8 border border-gray-300 cursor-pointer'
          style={{ backgroundColor: headerData[field] || '#ffffff' }}
          onClick={() => toggleColorPicker(field)}
        />
        <input
          type='text'
          value={headerData[field] || ''}
          onChange={e => handleChange(field, e.target.value)}
          className='p-1 ml-2 w-24 text-sm border border-gray-300'
        />
        {showColorPicker === field && (
          <div className='absolute z-10 mt-2'>
            <div className='fixed inset-0' onClick={() => setShowColorPicker(null)} />
            <div className='relative'>
              <ChromePicker
                color={tempColors[field] || headerData[field]}
                onChange={color => handleColorChange(field, color)}
              />
              <div className='flex justify-end mt-2'>
                <button
                  className='px-2 py-1 text-xs text-white bg-green-500 rounded'
                  onClick={() => applyColorChange(field)}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className='p-4 max-h-[60vh] overflow-y-auto'>
      <h3 className='mb-4 font-bold'>{messages.dialogs.headerConfiguration}</h3>

      {/* General Settings */}
      <div className='mb-6'>
        <h4 className='mb-2 font-semibold'>{messages.dialogs.generalSettings}</h4>

        <ColorPickerControl label={messages.dialogs.backgroundColor} field='backgroundColor' />

        <ColorPickerControl label={messages.dialogs.borderColor} field='borderColor' />

        <div className='mb-3'>
          <TextField
            fullWidth
            type='text'
            value={data.paddingX}
            onChange={e => handleChange('paddingX', e.target.value)}
            variant='filled'
            label={messages.dialogs.paddingX}
            InputProps={{
              endAdornment: <InputAdornment position='end'>px</InputAdornment>
            }}
          />
      
        </div>

        <div className='mb-3'>
          <TextField
            fullWidth
            type='text'
            value={data.paddingY}
            onChange={e => handleChange('paddingY', e.target.value)}
            variant='filled'
            label={messages.dialogs.paddingY}
            InputProps={{
              endAdornment: <InputAdornment position='end'>px</InputAdornment>
            }}
          />
          
        </div>

        <div className='mb-3'>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={headerData.showShadow}
              onChange={() => handleCheckboxChange('showShadow')}
              className='mr-2'
            />
            <span className='text-sm font-medium'>{messages.dialogs.showShadow}</span>
          </label>
        </div>
      </div>

      {/* Selector Settings */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-2'>
          <h4 className='font-semibold'>{messages.dialogs.selectorSettings}</h4>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={headerData.showSelector}
              onChange={() => handleCheckboxChange('showSelector')}
              className='mr-2'
            />
            <span className='text-sm font-medium'>{messages.dialogs.show}</span>
          </label>
        </div>

        {headerData.showSelector && (
          <>
            <ColorPickerControl label={messages.dialogs.selectorBgColor} field='selectorBgColor' />

            <ColorPickerControl label={messages.dialogs.selectorTextColor} field='selectorTextColor' />

            <ColorPickerControl label={messages.dialogs.selectorBorderColor} field='selectorBorderColor' />

            <div className='mb-3'>
              <label className='block mb-1 text-sm font-medium'>{messages.dialogs.selectorFontWeight}</label>
              <select
                value={headerData.selectorFontWeight}
                onChange={e => handleChange('selectorFontWeight', e.target.value)}
                className='p-1 w-full border border-gray-300'
              >
                <option value='normal'>Normal</option>
                <option value='bold'>Bold</option>
              </select>
            </div>

            <div className='mb-3'>
              <label className='block mb-1 text-sm font-medium'>{messages.dialogs.defaultOption}</label>
              <select
                value={headerData.defaultOption}
                onChange={e => handleChange('defaultOption', e.target.value)}
                className='p-1 w-full border border-gray-300'
              >
                <option value=''>None</option>
                {headerData.options.map((option, index) => (
                  <option key={index} value={option.value}>
                    {option?.[`label_${locale}`]}
                  </option>
                ))}
              </select>
            </div>

            <div className='mb-3'>
              <div className='flex justify-between items-center'>
                <label className='block text-sm font-medium'>{messages.dialogs.options}</label>
                <button
                  type='button'
                  onClick={addOption}
                  className='flex items-center p-1 text-white bg-blue-500 rounded'
                >
                  <FaPlus size={10} />
                </button>
              </div>

              {headerData.options.map((option, index) => (
                <div key={index} className='p-2 mt-2 rounded border border-gray-200'>
                  <div className='flex justify-between items-center mb-1'>
                    <span className='text-xs font-semibold'>Option {index + 1}</span>
                    <button
                      type='button'
                      onClick={() => removeOption(index)}
                      className='flex items-center p-1 text-white bg-red-500 rounded'
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>

                  <div className='mb-1'>
                    <input
                      type='text'
                      placeholder='Value'
                      value={option.value}
                      onChange={e => handleOptionChange(index, 'value', e.target.value)}
                      className='p-1 mb-1 w-full text-sm border border-gray-300'
                    />
                  </div>

                  <div className='mb-1'>
                    <input
                      type='text'
                      placeholder='English Label'
                      value={option.label_en}
                      onChange={e => handleOptionChange(index, 'label_en', e.target.value)}
                      className='p-1 mb-1 w-full text-sm border border-gray-300'
                    />
                  </div>

                  <div>
                    <input
                      type='text'
                      placeholder='Arabic Label'
                      value={option.label_ar}
                      onChange={e => handleOptionChange(index, 'label_ar', e.target.value)}
                      className='p-1 w-full text-sm border border-gray-300'
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Logo Settings */}
      <div className='mb-6'>
        <h4 className='mb-2 font-semibold'>{messages.dialogs.logoSettings}</h4>
      </div>

      {/* Mobile Menu Settings */}
      <div className='mb-6'>
        <div className='flex justify-between items-center mb-2'>
          <h4 className='font-semibold'>{messages.dialogs.mobileMenuSettings}</h4>
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={headerData.showMobileMenu}
              onChange={() => handleCheckboxChange('showMobileMenu')}
              className='mr-2'
            />
            <span className='text-sm font-medium'>{messages.dialogs.show}</span>
          </label>
        </div>

        {headerData.showMobileMenu && (
          <>
            <ColorPickerControl label={messages.dialogs.menuIconColor} field='mobileMenuColor' />

            <ColorPickerControl label={messages.dialogs.mobileMenuBgColor} field='mobileMenuBgColor' />

            <div className='mb-3'>
              <div className='flex justify-between items-center'>
                <label className='block text-sm font-medium'>{messages.dialogs.mobileMenuItems}</label>
                <button
                  type='button'
                  onClick={addMobileMenuItem}
                  className='flex items-center p-1 text-white bg-blue-500 rounded'
                >
                  <FaPlus size={10} />
                </button>
              </div>

              {headerData.mobileMenuItems.map((item, index) => (
                <div key={index} className='p-2 mt-2 rounded border border-gray-200'>
                  <div className='flex justify-between items-center mb-1'>
                    <span className='text-xs font-semibold'>Item {index + 1}</span>
                    <button
                      type='button'
                      onClick={() => removeMobileMenuItem(index)}
                      className='flex items-center p-1 text-white bg-red-500 rounded'
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>

                  <div className='mb-1'>
                    <input
                      type='text'
                      placeholder='URL'
                      value={item.url}
                      onChange={e => handleMobileMenuItemChange(index, 'url', e.target.value)}
                      className='p-1 mb-1 w-full text-sm border border-gray-300'
                    />
                  </div>

                  <div className='mb-1'>
                    <input
                      type='text'
                      placeholder='English Text'
                      value={item.text_en}
                      onChange={e => handleMobileMenuItemChange(index, 'text_en', e.target.value)}
                      className='p-1 mb-1 w-full text-sm border border-gray-300'
                    />
                  </div>

                  <div>
                    <input
                      type='text'
                      placeholder='Arabic Text'
                      value={item.text_ar}
                      onChange={e => handleMobileMenuItemChange(index, 'text_ar', e.target.value)}
                      className='p-1 w-full text-sm border border-gray-300'
                    />
                  </div>
                </div>
              ))}
            </div>

            <ColorPickerControl label={messages.dialogs.mobileMenuItemColor} field='mobileMenuItemColor' />

            <div className='mb-3'>
              <label className='block mb-1 text-sm font-medium'>{messages.dialogs.mobileMenuItemFontWeight}</label>
              <select
                value={headerData.mobileMenuItemFontWeight}
                onChange={e => handleChange('mobileMenuItemFontWeight', e.target.value)}
                className='p-1 w-full border border-gray-300'
              >
                <option value='normal'>Normal</option>
                <option value='bold'>Bold</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Right Section Settings */}
      <div className='mb-6'>
        <h4 className='mb-2 font-semibold'>{messages.dialogs.rightSectionSettings}</h4>

        <div className='mb-3'>
          <div className='flex justify-between items-center'>
            <label className='block text-sm font-medium'>{messages.dialogs.links}</label>
            <button
              type='button'
              onClick={addRightLink}
              className='flex items-center p-1 text-white bg-blue-500 rounded'
            >
              <FaPlus size={10} />
            </button>
          </div>

          {headerData.rightLinks.map((link, index) => (
            <div key={index} className='p-2 mt-2 rounded border border-gray-200'>
              <div className='flex justify-between items-center mb-1'>
                <span className='text-xs font-semibold'>Link {index + 1}</span>
                <button
                  type='button'
                  onClick={() => removeRightLink(index)}
                  className='flex items-center p-1 text-white bg-red-500 rounded'
                >
                  <FaTimes size={10} />
                </button>
              </div>

              <div className='mb-1'>
                <input
                  type='text'
                  placeholder='URL'
                  value={link.url}
                  onChange={e => handleLinkChange(index, 'url', e.target.value)}
                  className='p-1 mb-1 w-full text-sm border border-gray-300'
                />
              </div>

              <div className='mb-1'>
                <input
                  type='text'
                  placeholder='English Text'
                  value={link.text_en}
                  onChange={e => handleLinkChange(index, 'text_en', e.target.value)}
                  className='p-1 mb-1 w-full text-sm border border-gray-300'
                />
              </div>

              <div>
                <input
                  type='text'
                  placeholder='Arabic Text'
                  value={link.text_ar}
                  onChange={e => handleLinkChange(index, 'text_ar', e.target.value)}
                  className='p-1 w-full text-sm border border-gray-300'
                />
              </div>
            </div>
          ))}
        </div>

        <ColorPickerControl label={messages.dialogs.linksColor} field='rightLinksColor' />

        <div className='mb-3'>
          <label className='block mb-1 text-sm font-medium'>{messages.dialogs.linksFontWeight}</label>
          <select
            value={headerData.rightLinksFontWeight}
            onChange={e => handleChange('rightLinksFontWeight', e.target.value)}
            className='p-1 w-full border border-gray-300'
          >
            <option value='normal'>Normal</option>
            <option value='bold'>Bold</option>
          </select>
        </div>

        <div className='mb-3'>
          <div className='flex justify-between items-center mb-2'>
            <h4 className='font-semibold'>{messages.dialogs.rightButtonSettings}</h4>
            <label className='flex items-center'>
              <input
                type='checkbox'
                checked={headerData.showRightButton}
                onChange={() => handleCheckboxChange('showRightButton')}
                className='mr-2'
              />
              <span className='text-sm font-medium'>{messages.dialogs.show}</span>
            </label>
          </div>

          {headerData.showRightButton && (
            <>
              <div className='mb-3'>
                <label className='block mb-1 text-sm font-medium'>{messages.dialogs.buttonText}</label>
                <input
                  type='text'
                  value={headerData.rightButtonText_en}
                  onChange={e => handleChange('rightButtonText_en', e.target.value)}
                  className='p-1 w-full border border-gray-300'
                />
              </div>

              <div className='mb-3'>
                <label className='block mb-1 text-sm font-medium'>{messages.dialogs.buttonText}</label>
                <input
                  type='text'
                  value={headerData.rightButtonText_ar}
                  onChange={e => handleChange('rightButtonText_ar', e.target.value)}
                  className='p-1 w-full border border-gray-300'
                />
              </div>

              <div className='mb-3'>
                <label className='block mb-1 text-sm font-medium'>{messages.dialogs.buttonText}</label>
                <input
                  type='text'
                  value={headerData.rightButtonText_ar}
                  onChange={e => handleChange('rightButtonText_ar', e.target.value)}
                  className='p-1 w-full border border-gray-300'
                />
              </div>

              <ColorPickerControl label={messages.dialogs.buttonBgColor} field='rightButtonBgColor' />

              <ColorPickerControl label={messages.dialogs.buttonTextColor} field='rightButtonTextColor' />

              <div className='mb-3'>
                <label className='block mb-1 text-sm font-medium'>{messages.dialogs.buttonBorder}</label>
                <input
                  type='text'
                  value={headerData.rightButtonBorder}
                  onChange={e => handleChange('rightButtonBorder', e.target.value)}
                  className='p-1 w-full border border-gray-300'
                />
              </div>

              <div className='mb-3'>
                <label className='block mb-1 text-sm font-medium'>{messages.dialogs.buttonAction}</label>
                <select
                  value={headerData.rightButtonAction}
                  onChange={e => handleChange('rightButtonAction', e.target.value)}
                  className='p-1 w-full border border-gray-300'
                >
                  <option value='link'>Link</option>
                  <option value='alert'>Alert</option>
                  <option value='custom'>Custom</option>
                </select>
              </div>

              {headerData.rightButtonAction === 'link' && (
                <div className='mb-3'>
                  <label className='block mb-1 text-sm font-medium'>{messages.dialogs.buttonLink}</label>
                  <input
                    type='text'
                    value={headerData.rightButtonLink}
                    onChange={e => handleChange('rightButtonLink', e.target.value)}
                    className='p-1 w-full border border-gray-300'
                  />
                </div>
              )}

              {headerData.rightButtonAction === 'alert' && (
                <div className='mb-3'>
                  <label className='block mb-1 text-sm font-medium'>{messages.dialogs.alertMessage}</label>
                  <input
                    type='text'
                    value={headerData.rightButtonAlertMessage}
                    onChange={e => handleChange('rightButtonAlertMessage', e.target.value)}
                    className='p-1 w-full border border-gray-300'
                  />
                </div>
              )}

              <div className='mb-3'>
                <label className='block mb-1 text-sm font-medium'>{messages.dialogs.buttonId}</label>
                <input
                  type='text'
                  value={headerData.rightButtonId}
                  onChange={e => handleChange('rightButtonId', e.target.value)}
                  className='p-1 w-full border border-gray-300'
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeaderControl
