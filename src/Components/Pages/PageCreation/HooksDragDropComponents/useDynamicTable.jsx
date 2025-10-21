import { useMemo } from 'react';
import { FaTable } from 'react-icons/fa';
import DynamicTableControl from '../DynamicTableControl';
import DynamicTableView from '../DynamicTableView';
import { useIntl } from 'react-intl';

export default function useDynamicTable({ locale, buttonRef, advancedEdit }) {
  const { messages } = useIntl()
  
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
      id: messages.dialogs.dynamicTable,
      title: messages.dialogs.dynamicTable,
      description: messages.dialogs.dynamicTableDescription,
      version: 1,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <DynamicTableControl 
            title={messages.dialogs.dynamicTable} 
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
  }, [advancedEdit, locale, buttonRef, messages]); // Fixed: added buttonRef to dependencies array

  return { dynamicTable };
}