import { useMemo } from 'react';
import { FaTable } from 'react-icons/fa';
import DynamicTableControl from '../DynamicTableControl';
import DynamicTableView from '../DynamicTableView';

export default function useDynamicTable({ locale, buttonRef, advancedEdit }) {
  const dynamicTable = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => {
        return (
          <DynamicTableView
            data={data}
            onChange={onChange}
            readOnly={!advancedEdit}
            disabled={!advancedEdit} // Fixed: changed !readOnly to !advancedEdit
            locale={locale}
          />
        );
      },
      id: locale === 'ar' ? 'جدول-ديناميكي' : 'dynamic-table',
      title: locale === 'ar' ? 'جدول ديناميكي' : 'Dynamic Table',
      description: 
        locale === 'ar' 
          ? 'يتيح للمستخدمين إنشاء جداول ديناميكية مع خانات اختيار للتحديد' 
          : 'Allows users to create dynamic tables with checkable cells for selection.',
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <DynamicTableControl 
            title={locale === 'ar' ? 'جدول ديناميكي' : 'Dynamic Table'} 
            type='dynamic-table' 
            onChange={onChange} 
            data={data} 
            buttonRef={buttonRef} 
            locale={locale}
          />
        )
      },
      icon: <FaTable className='text-2xl' />
    };
  }, [advancedEdit, locale, buttonRef]); // Fixed: added buttonRef to dependencies array

  return { dynamicTable };
}