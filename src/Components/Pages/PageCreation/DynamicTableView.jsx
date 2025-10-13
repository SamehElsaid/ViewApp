import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function DynamicTableView({ data, onChange, readOnly, disabled, locale }) {
  // Get values from data or use defaults
  const columns = data?.columns || [];
  const rows = data?.rows || [];
  const selections = data?.selections || {};

  // Local state for input fields
  const [newColumnName, setNewColumnName] = useState('');
  const [newRowName, setNewRowName] = useState('');

  // Generate unique key for cell
  const cellKey = (rowIdx, colIdx) => `${rowIdx}-${colIdx}`;

  // Toggle cell selection
  const toggleCell = (rowIdx, colIdx) => {
    if (readOnly) return;

    const key = cellKey(rowIdx, colIdx);

    const newSelections = {
      ...selections,
      [key]: !selections[key]
    };

    onChange({
      ...data,
      selections: newSelections
    });
  };

  // Check if cell is selected
  const isCellSelected = (rowIdx, colIdx) => {
    const key = cellKey(rowIdx, colIdx);

    return selections[key] || false;
  };

  // Add new column
  const addColumn = () => {
    if (readOnly) return;

    if (newColumnName.trim()) {
      const newColumns = [...columns, newColumnName.trim()];
      onChange({
        ...data,
        columns: newColumns
      });
      setNewColumnName('');
    } else {
      toast.warning(locale === 'ar' ? 'يرجى إدخال اسم العمود' : 'Please enter a column name');
    }
  };

  // Add new row
  const addRow = () => {
    if (readOnly) return;

    if (newRowName.trim()) {
      const newRows = [...rows, newRowName.trim()];
      onChange({
        ...data,
        rows: newRows
      });
      setNewRowName('');
    } else {
      toast.warning(locale === 'ar' ? 'يرجى إدخال اسم الصف' : 'Please enter a row name');
    }
  };

  // Remove column
  const removeColumn = (index) => {
    if (readOnly) return;

    const newColumns = columns.filter((_, idx) => idx !== index);

    // Clean up selected cells related to this column
    const newSelections = {...selections};
    Object.keys(newSelections).forEach(key => {
      const [rowIdx, colIdx] = key.split('-').map(Number);
      if (colIdx === index) {
        delete newSelections[key];
      } else if (colIdx > index) {
        // Adjust keys for columns that move left
        const newKey = cellKey(rowIdx, colIdx - 1);
        newSelections[newKey] = newSelections[key];
        delete newSelections[key];
      }
    });

    onChange({
      ...data,
      columns: newColumns,
      selections: newSelections
    });
  };

  // Remove row
  const removeRow = (index) => {
    if (readOnly) return;

    const newRows = rows.filter((_, idx) => idx !== index);

    // Clean up selected cells related to this row
    const newSelections = {...selections};
    Object.keys(newSelections).forEach(key => {
      const [rowIdx, colIdx] = key.split('-').map(Number);
      if (rowIdx === index) {
        delete newSelections[key];
      } else if (rowIdx > index) {
        // Adjust keys for rows that move up
        const newKey = cellKey(rowIdx - 1, colIdx);
        newSelections[newKey] = newSelections[key];
        delete newSelections[key];
      }
    });

    onChange({
      ...data,
      rows: newRows,
      selections: newSelections
    });
  };

  // Handle keyboard events
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="flex flex-col p-4 mx-auto space-y-4 w-full rounded-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">
        {locale === 'ar' ? data?.title_ar || 'جدول ديناميكي' : data?.title_en || 'Dynamic Table'}
      </h2>

      {/* Controls for adding columns and rows */}
      {!readOnly && (
        <div className="flex flex-col gap-4 mb-4 md:flex-row">
          <div className="flex flex-1 items-center space-x-2">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addColumn)}
              placeholder={locale === 'ar' ? 'اسم العمود الجديد' : 'New column name'}
              className="flex-grow p-2 rounded border border-gray-300"
              disabled={disabled}
            />
            <button
              onClick={addColumn}
              className="flex items-center p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              disabled={disabled}
            >
              <FaPlus className="mr-1" /> {locale === 'ar' ? 'إضافة عمود' : 'Add Column'}
            </button>
          </div>

          <div className="flex flex-1 items-center space-x-2">
            <input
              type="text"
              value={newRowName}
              onChange={(e) => setNewRowName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addRow)}
              placeholder={locale === 'ar' ? 'اسم الصف الجديد' : 'New row name'}
              className="flex-grow p-2 rounded border border-gray-300"
              disabled={disabled}
            />
            <button
              onClick={addRow}
              className="flex items-center p-2 text-white bg-green-500 rounded hover:bg-green-600"
              disabled={disabled}
            >
              <FaPlus className="mr-1" /> {locale === 'ar' ? 'إضافة صف' : 'Add Row'}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {columns.length > 0 && rows.length > 0 ? (
          <table className="min-w-full border border-gray-300 border-collapse">
            <thead>
              <tr>
                <th className={`border border-gray-300 p-3 bg-gray-100 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                  {data?.cornerLabel || ''}
                </th>
                {columns.map((column, colIdx) => (
                  <th key={colIdx} className="p-3 bg-gray-100 border border-gray-300">
                    <div className="flex justify-between items-center">
                      <span>{column}</span>
                      {!readOnly && (
                        <button
                          onClick={() => removeColumn(colIdx)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          disabled={disabled}
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className={`border border-gray-300 p-3 bg-gray-50 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="flex justify-between items-center">
                      <span>{row}</span>
                      {!readOnly && (
                        <button
                          onClick={() => removeRow(rowIdx)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          disabled={disabled}
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  {columns.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className={`border border-gray-300 p-4 text-center ${!readOnly ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => toggleCell(rowIdx, colIdx)}
                    >
                      {isCellSelected(rowIdx, colIdx) ? (
                        <div className="flex justify-center">
                          <span
                            className="flex justify-center items-center w-6 h-6 text-white rounded-full"
                            style={{ backgroundColor: data?.checkColor || '#10B981' }}
                          >
                            <FaCheck size={12} />
                          </span>
                        </div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 text-center rounded border border-gray-300 border-dashed">
            {locale === 'ar'
              ? 'أضف أعمدة وصفوف لإنشاء الجدول'
              : 'Add columns and rows to create the table'}
          </div>
        )}
      </div>

      {/* Summary view */}
      {data?.showSummary && columns.length > 0 && rows.length > 0 && (
        <div className="p-4 mt-6 bg-gray-50 rounded-md border border-gray-300">
          <h3 className="mb-2 text-lg font-semibold">
            {locale === 'ar' ? data?.summaryTitle_ar || 'ملخص التخصيصات:' : data?.summaryTitle_en || 'Summary of Assignments:'}
          </h3>
          <ul className="space-y-1">
            {rows.map((row, rowIdx) => {
              const selectedColumns = columns.filter((_, colIdx) => isCellSelected(rowIdx, colIdx));

              return (
                <li key={rowIdx} className={locale === 'ar' ? 'text-right' : 'text-left'}>
                  <strong>{row}:</strong>{" "}
                  {selectedColumns.length > 0
                    ? selectedColumns.join(", ")
                    : (locale === 'ar' ? 'لا شيء' : 'None')}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
