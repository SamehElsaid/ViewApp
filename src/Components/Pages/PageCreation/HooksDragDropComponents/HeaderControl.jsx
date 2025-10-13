import React, { useState, useRef } from 'react';
import { ChromePicker } from 'react-color';
import { FaPlus, FaMinus, FaTimes, FaUpload } from 'react-icons/fa';

const HeaderControl = ({ data = {}, onChange, locale, buttonRef }) => {
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [tempColors, setTempColors] = useState({});
  const fileInputRef = useRef(null);

  // Initialize default data if not provided
  const headerData = {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    paddingX: '16px',
    paddingY: '12px',
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
  };
  console.log(headerData.logoFilePreview )

  // Helper function to handle inputs

  const handleChange = (field, value) => {
    onChange({
      ...headerData,
      [field]: value,
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    handleChange(field, !headerData[field]);
  };

  // Handle file upload for logo
const handleLogoFileChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange({
        ...headerData,
        logoFile: file,
        logoFilePreview: event.target.result,
        logoUrl: '' // Clear the URL when uploading a file
      });
    };
    reader.readAsDataURL(file);
  }
};

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Remove uploaded logo
  const removeUploadedLogo = () => {
    onChange({
      ...headerData,
      logoFile: null,
      logoFilePreview: ''
    });
  };

  // Handle color picker
  const toggleColorPicker = (field) => {
    setShowColorPicker(showColorPicker === field ? null : field);
    if (showColorPicker !== field) {
      setTempColors({ ...tempColors, [field]: headerData[field] });
    }
  };

  // Handle color change
  const handleColorChange = (field, color) => {
    setTempColors({ ...tempColors, [field]: color.hex });
  };

  // Apply color change
  const applyColorChange = (field) => {
    handleChange(field, tempColors[field]);
    setShowColorPicker(null);
  };

  // Add option to selector
  const addOption = () => {
    const newOption = {
      value: `option-${headerData.options.length + 1}`,
      label_en: 'New Option',
      label_ar: 'خيار جديد'
    };
    handleChange('options', [...headerData.options, newOption]);
  };

  // Remove option from selector
  const removeOption = (index) => {
    const newOptions = [...headerData.options];
    newOptions.splice(index, 1);
    handleChange('options', newOptions);
  };

  // Handle option change
  const handleOptionChange = (index, field, value) => {
    const newOptions = [...headerData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    handleChange('options', newOptions);
  };

  // Add link to right section
  const addRightLink = () => {
    const newLink = {
      url: '#',
      text_en: 'New Link',
      text_ar: 'رابط جديد'
    };
    handleChange('rightLinks', [...headerData.rightLinks, newLink]);
  };

  // Remove link from right section
  const removeRightLink = (index) => {
    const newLinks = [...headerData.rightLinks];
    newLinks.splice(index, 1);
    handleChange('rightLinks', newLinks);
  };

  // Handle link change
  const handleLinkChange = (index, field, value) => {
    const newLinks = [...headerData.rightLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    handleChange('rightLinks', newLinks);
  };

  // Add mobile menu item
  const addMobileMenuItem = () => {
    const newItem = {
      url: '#',
      text_en: 'New Mobile Menu Item',
      text_ar: 'عنصر جديد في القائمة المتحركة'
    };
    handleChange('mobileMenuItems', [...headerData.mobileMenuItems, newItem]);
  };

  // Remove mobile menu item
  const removeMobileMenuItem = (index) => {
    const newItems = [...headerData.mobileMenuItems];
    newItems.splice(index, 1);
    handleChange('mobileMenuItems', newItems);
  };

  // Handle mobile menu item change
  const handleMobileMenuItemChange = (index, field, value) => {
    const newItems = [...headerData.mobileMenuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    handleChange('mobileMenuItems', newItems);
  };

  // Color picker component
  const ColorPickerControl = ({ label, field }) => (
    <div className="mb-3">
      <label className="block mb-1 text-sm font-medium">{label}</label>
      <div className="flex items-center">
        <div
          className="w-8 h-8 border border-gray-300 cursor-pointer"
          style={{ backgroundColor: headerData[field] || '#ffffff' }}
          onClick={() => toggleColorPicker(field)}
        />
        <input
          type="text"
          value={headerData[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          className="p-1 ml-2 w-24 text-sm border border-gray-300"
        />
        {showColorPicker === field && (
          <div className="absolute z-10 mt-2">
            <div
              className="fixed inset-0"
              onClick={() => setShowColorPicker(null)}
            />
            <div className="relative">
              <ChromePicker
                color={tempColors[field] || headerData[field]}
                onChange={(color) => handleColorChange(field, color)}
              />
              <div className="flex justify-end mt-2">
                <button
                  className="px-2 py-1 text-xs text-white bg-green-500 rounded"
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
  );

  return (
    <div className="p-4 max-h-[60vh] overflow-y-auto">
      <h3 className="mb-4 font-bold">{locale === 'ar' ? 'تكوين الرأس' : 'Header Configuration'}</h3>

      {/* General Settings */}
      <div className="mb-6">
        <h4 className="mb-2 font-semibold">{locale === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</h4>

        <ColorPickerControl
          label={locale === 'ar' ? 'لون الخلفية' : 'Background Color'}
          field="backgroundColor"
        />

        <ColorPickerControl
          label={locale === 'ar' ? 'لون الحدود' : 'Border Color'}
          field="borderColor"
        />

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            {locale === 'ar' ? 'المساحة الداخلية (X)' : 'Padding X'}
          </label>
          <input
            type="text"
            value={headerData.paddingX}
            onChange={(e) => handleChange('paddingX', e.target.value)}
            className="p-1 w-full border border-gray-300"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            {locale === 'ar' ? 'المساحة الداخلية (Y)' : 'Padding Y'}
          </label>
          <input
            type="text"
            value={headerData.paddingY}
            onChange={(e) => handleChange('paddingY', e.target.value)}
            className="p-1 w-full border border-gray-300"
          />
        </div>

        <div className="mb-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={headerData.showShadow}
              onChange={() => handleCheckboxChange('showShadow')}
              className="mr-2"
            />
            <span className="text-sm font-medium">
              {locale === 'ar' ? 'إظهار الظل' : 'Show Shadow'}
            </span>
          </label>
        </div>
      </div>

      {/* Selector Settings */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">{locale === 'ar' ? 'إعدادات المحدد' : 'Selector Settings'}</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={headerData.showSelector}
              onChange={() => handleCheckboxChange('showSelector')}
              className="mr-2"
            />
            <span className="text-sm font-medium">
              {locale === 'ar' ? 'إظهار' : 'Show'}
            </span>
          </label>
        </div>

        {headerData.showSelector && (
          <>
            <ColorPickerControl
              label={locale === 'ar' ? 'لون خلفية المحدد' : 'Selector Background Color'}
              field="selectorBgColor"
            />

            <ColorPickerControl
              label={locale === 'ar' ? 'لون نص المحدد' : 'Selector Text Color'}
              field="selectorTextColor"
            />

            <ColorPickerControl
              label={locale === 'ar' ? 'لون حدود المحدد' : 'Selector Border Color'}
              field="selectorBorderColor"
            />

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">
                {locale === 'ar' ? 'وزن خط المحدد' : 'Selector Font Weight'}
              </label>
              <select
                value={headerData.selectorFontWeight}
                onChange={(e) => handleChange('selectorFontWeight', e.target.value)}
                className="p-1 w-full border border-gray-300"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">
                {locale === 'ar' ? 'الخيار الافتراضي' : 'Default Option'}
              </label>
              <select
                value={headerData.defaultOption}
                onChange={(e) => handleChange('defaultOption', e.target.value)}
                className="p-1 w-full border border-gray-300"
              >
                <option value="">None</option>
                {headerData.options.map((option, index) => (
                  <option key={index} value={option.value}>
                    {locale === 'ar' ? option.label_ar : option.label_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">
                  {locale === 'ar' ? 'الخيارات' : 'Options'}
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center p-1 text-white bg-blue-500 rounded"
                >
                  <FaPlus size={10} />
                </button>
              </div>

              {headerData.options.map((option, index) => (
                <div key={index} className="p-2 mt-2 rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold">Option {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="flex items-center p-1 text-white bg-red-500 rounded"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>

                  <div className="mb-1">
                    <input
                      type="text"
                      placeholder="Value"
                      value={option.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                      className="p-1 mb-1 w-full text-sm border border-gray-300"
                    />
                  </div>

                  <div className="mb-1">
                    <input
                      type="text"
                      placeholder="English Label"
                      value={option.label_en}
                      onChange={(e) => handleOptionChange(index, 'label_en', e.target.value)}
                      className="p-1 mb-1 w-full text-sm border border-gray-300"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Arabic Label"
                      value={option.label_ar}
                      onChange={(e) => handleOptionChange(index, 'label_ar', e.target.value)}
                      className="p-1 w-full text-sm border border-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Logo Settings */}
<div className="mb-6">
  <h4 className="mb-2 font-semibold">{locale === 'ar' ? 'إعدادات الشعار' : 'Logo Settings'}</h4>

  {/* Logo Upload Section */}
  {/* <div className="mb-3">
    <label className="block mb-1 text-sm font-medium">
      {locale === 'ar' ? 'تحميل الشعار' : 'Upload Logo'}
    </label>
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleLogoFileChange}
      accept="image/*"
      className="hidden"
    />
    <div className="flex flex-col items-center p-4 rounded border border-gray-300 border-dashed">
      {headerData.logoFilePreview ? (
        <div className="flex relative flex-col items-center w-full">
          <img
            src={headerData.logoFilePreview}
            alt="Logo Preview"
            className="object-contain mb-2 h-16"
          />
          <button
            type="button"
            onClick={removeUploadedLogo}
            className="px-2 py-1 text-xs text-white bg-red-500 rounded"
          >
            {locale === 'ar' ? 'إزالة' : 'Remove'}
          </button>
        </div>
      ) : headerData.logoUrl ? (
        <div className="flex relative flex-col items-center w-full">
          <img
            src={headerData.logoUrl}
            alt="Logo Preview"
            className="object-contain mb-2 h-16"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerFileInput}
          className="flex justify-center items-center p-2 w-full text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
        >
          <FaUpload className="mr-2" />
          {locale === 'ar' ? 'انقر لتحميل الشعار' : 'Click to upload logo'}
        </button>
      )}
    </div>
    <p className="mt-1 text-xs text-gray-500">
      {locale === 'ar'
        ? 'عند تحميل الشعار، سيتم تجاهل عنوان URL للشعار'
        : 'When uploading a logo, the logo URL will be ignored'}
    </p>
  </div> */}

  {/* Rest of your logo settings... */}
</div>

      {/* Mobile Menu Settings */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">{locale === 'ar' ? 'إعدادات القائمة المتحركة' : 'Mobile Menu Settings'}</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={headerData.showMobileMenu}
              onChange={() => handleCheckboxChange('showMobileMenu')}
              className="mr-2"
            />
            <span className="text-sm font-medium">
              {locale === 'ar' ? 'إظهار' : 'Show'}
            </span>
          </label>
        </div>

        {headerData.showMobileMenu && (
          <>
            <ColorPickerControl
              label={locale === 'ar' ? 'لون أيقونة القائمة' : 'Menu Icon Color'}
              field="mobileMenuColor"
            />

            <ColorPickerControl
              label={locale === 'ar' ? 'لون خلفية القائمة المتحركة' : 'Mobile Menu Background Color'}
              field="mobileMenuBgColor"
            />

            <div className="mb-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">
                  {locale === 'ar' ? 'عناصر القائمة المتحركة' : 'Mobile Menu Items'}
                </label>
                <button
                  type="button"
                  onClick={addMobileMenuItem}
                  className="flex items-center p-1 text-white bg-blue-500 rounded"
                >
                  <FaPlus size={10} />
                </button>
              </div>

              {headerData.mobileMenuItems.map((item, index) => (
                <div key={index} className="p-2 mt-2 rounded border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold">Item {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMobileMenuItem(index)}
                      className="flex items-center p-1 text-white bg-red-500 rounded"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>

                  <div className="mb-1">
                    <input
                      type="text"
                      placeholder="URL"
                      value={item.url}
                      onChange={(e) => handleMobileMenuItemChange(index, 'url', e.target.value)}
                      className="p-1 mb-1 w-full text-sm border border-gray-300"
                    />
                  </div>

                  <div className="mb-1">
                    <input
                      type="text"
                      placeholder="English Text"
                      value={item.text_en}
                      onChange={(e) => handleMobileMenuItemChange(index, 'text_en', e.target.value)}
                      className="p-1 mb-1 w-full text-sm border border-gray-300"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Arabic Text"
                      value={item.text_ar}
                      onChange={(e) => handleMobileMenuItemChange(index, 'text_ar', e.target.value)}
                      className="p-1 w-full text-sm border border-gray-300"
                    />
                  </div>
                </div>
              ))}
            </div>

            <ColorPickerControl
              label={locale === 'ar' ? 'لون عناصر القائمة المتحركة' : 'Mobile Menu Item Color'}
              field="mobileMenuItemColor"
            />

            <div className="mb-3">
              <label className="block mb-1 text-sm font-medium">
                {locale === 'ar' ? 'وزن خط عناصر القائمة المتحركة' : 'Mobile Menu Item Font Weight'}
              </label>
              <select
                value={headerData.mobileMenuItemFontWeight}
                onChange={(e) => handleChange('mobileMenuItemFontWeight', e.target.value)}
                className="p-1 w-full border border-gray-300"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Right Section Settings */}
      <div className="mb-6">
        <h4 className="mb-2 font-semibold">{locale === 'ar' ? 'إعدادات القسم الأيمن' : 'Right Section Settings'}</h4>

        <div className="mb-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium">
              {locale === 'ar' ? 'الروابط' : 'Links'}
            </label>
            <button
              type="button"
              onClick={addRightLink}
              className="flex items-center p-1 text-white bg-blue-500 rounded"
            >
              <FaPlus size={10} />
            </button>
          </div>

          {headerData.rightLinks.map((link, index) => (
            <div key={index} className="p-2 mt-2 rounded border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold">Link {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeRightLink(index)}
                  className="flex items-center p-1 text-white bg-red-500 rounded"
                >
                  <FaTimes size={10} />
                </button>
              </div>

              <div className="mb-1">
                <input
                  type="text"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                  className="p-1 mb-1 w-full text-sm border border-gray-300"
                />
              </div>

              <div className="mb-1">
                <input
                  type="text"
                  placeholder="English Text"
                  value={link.text_en}
                  onChange={(e) => handleLinkChange(index, 'text_en', e.target.value)}
                  className="p-1 mb-1 w-full text-sm border border-gray-300"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Arabic Text"
                  value={link.text_ar}
                  onChange={(e) => handleLinkChange(index, 'text_ar', e.target.value)}
                  className="p-1 w-full text-sm border border-gray-300"
                />
              </div>
            </div>
          ))}
        </div>

        <ColorPickerControl
          label={locale === 'ar' ? 'لون الروابط' : 'Links Color'}
          field="rightLinksColor"
        />

        <div className="mb-3">
          <label className="block mb-1 text-sm font-medium">
            {locale === 'ar' ? 'وزن خط الروابط' : 'Links Font Weight'}
          </label>
          <select
            value={headerData.rightLinksFontWeight}
            onChange={(e) => handleChange('rightLinksFontWeight', e.target.value)}
            className="p-1 w-full border border-gray-300"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>

        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">{locale === 'ar' ? 'إعدادات الزر الأيمن' : 'Right Button Settings'}</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={headerData.showRightButton}
                onChange={() => handleCheckboxChange('showRightButton')}
                className="mr-2"
              />
              <span className="text-sm font-medium">
                {locale === 'ar' ? 'إظهار' : 'Show'}
              </span>
            </label>
          </div>

          {headerData.showRightButton && (
            <>
              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium">
                  {locale === 'ar' ? 'نص الزر (الإنجليزية)' : 'Button Text (English)'}
                </label>
                <input
                  type="text"
                  value={headerData.rightButtonText_en}
                  onChange={(e) => handleChange('rightButtonText_en', e.target.value)}
                  className="p-1 w-full border border-gray-300"
                />
              </div>

              <div className="mb-3">
                <label className="block mb-1 text-sm font-medium">
                  {locale === 'ar' ? 'نص الزر (العربية)' : 'Button Text (Arabic)'}
                </label>
                <input
                  type="text"
                  value={headerData.rightButtonText_ar}
                  onChange={(e) => handleChange('rightButtonText_ar', e.target.value)}
                  className="p-1 w-full border border-gray-300"
                />
              </div>

              <div className="mb-3">
  <label className="block mb-1 text-sm font-medium">
    {locale === 'ar' ? 'نص الزر (العربية)' : 'Button Text (Arabic)'}
  </label>
  <input
    type="text"
    value={headerData.rightButtonText_ar}
    onChange={(e) => handleChange('rightButtonText_ar', e.target.value)}
    className="p-1 w-full border border-gray-300"
  />
</div>

<ColorPickerControl
  label={locale === 'ar' ? 'لون خلفية الزر' : 'Button Background Color'}
  field="rightButtonBgColor"
/>

<ColorPickerControl
  label={locale === 'ar' ? 'لون نص الزر' : 'Button Text Color'}
  field="rightButtonTextColor"
/>

<div className="mb-3">
  <label className="block mb-1 text-sm font-medium">
    {locale === 'ar' ? 'حدود الزر' : 'Button Border'}
  </label>
  <input
    type="text"
    value={headerData.rightButtonBorder}
    onChange={(e) => handleChange('rightButtonBorder', e.target.value)}
    className="p-1 w-full border border-gray-300"
  />
</div>

<div className="mb-3">
  <label className="block mb-1 text-sm font-medium">
    {locale === 'ar' ? 'إجراء الزر' : 'Button Action'}
  </label>
  <select
    value={headerData.rightButtonAction}
    onChange={(e) => handleChange('rightButtonAction', e.target.value)}
    className="p-1 w-full border border-gray-300"
  >
    <option value="link">Link</option>
    <option value="alert">Alert</option>
    <option value="custom">Custom</option>
  </select>
</div>

{headerData.rightButtonAction === 'link' && (
  <div className="mb-3">
    <label className="block mb-1 text-sm font-medium">
      {locale === 'ar' ? 'رابط الزر' : 'Button Link'}
    </label>
    <input
      type="text"
      value={headerData.rightButtonLink}
      onChange={(e) => handleChange('rightButtonLink', e.target.value)}
      className="p-1 w-full border border-gray-300"
    />
  </div>
)}

{headerData.rightButtonAction === 'alert' && (
  <div className="mb-3">
    <label className="block mb-1 text-sm font-medium">
      {locale === 'ar' ? 'رسالة التنبيه' : 'Alert Message'}
    </label>
    <input
      type="text"
      value={headerData.rightButtonAlertMessage}
      onChange={(e) => handleChange('rightButtonAlertMessage', e.target.value)}
      className="p-1 w-full border border-gray-300"
    />
  </div>
)}

<div className="mb-3">
  <label className="block mb-1 text-sm font-medium">
    {locale === 'ar' ? 'معرف الزر' : 'Button ID'}
  </label>
  <input
    type="text"
    value={headerData.rightButtonId}
    onChange={(e) => handleChange('rightButtonId', e.target.value)}
    className="p-1 w-full border border-gray-300"
  />
</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderControl;
