import { useState, useEffect } from 'react';
import {
  FormControl,
  FormControlLabel,
  Switch,
  TextField,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  InputAdornment,
  IconButton,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  Select,
  InputLabel,
  FormHelperText,
  Button,
  Grid
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import IconifyIcon from 'src/Components/icon';

const DynamicTableControl = ({ data, onChange, title, locale, buttonRef }) => {
  const [expanded, setExpanded] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [columnsInput, setColumnsInput] = useState(data?.columns?.join(', ') || '');
  const [rowsInput, setRowsInput] = useState(data?.rows?.join(', ') || '');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectableRows, setSelectableRows] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectionStep, setSelectionStep] = useState(1); // 1: select columns, 2: select rows

  useEffect(() => {
    // Initialize selections from data
    if (data?.selections) {
      const cells = [];
      Object.entries(data.selections).forEach(([key, checked]) => {
        if (checked) {
          const [rowIdx, colIdx] = key.split('-').map(Number);
          cells.push({ row: data.rows[rowIdx], column: data.columns[colIdx] });
        }
      });
      setSelectedCells(cells);
    }
  }, [data]);

  // Handle accordion expansion
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Handle text field changes
  const handleTextChange = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Handle boolean changes
  const handleBooleanChange = (field) => (event) => {
    onChange({
      ...data,
      [field]: event.target.checked
    });
  };

  // Handle color change
  const handleColorChange = (color) => {
    onChange({
      ...data,
      checkColor: color
    });
  };

  // Parse comma-separated string into array of items
  const parseItems = (str) => {
    if (!str) return [];

    return str.split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  // Update columns data when input changes
  const handleColumnsChange = (e) => {
    const inputValue = e.target.value;
    setColumnsInput(inputValue);

    const columnsArray = parseItems(inputValue);
    onChange({
      ...data,
      columns: columnsArray
    });
  };

  // Update rows data when input changes
  const handleRowsChange = (e) => {
    const inputValue = e.target.value;
    setRowsInput(inputValue);

    const rowsArray = parseItems(inputValue);
    onChange({
      ...data,
      rows: rowsArray
    });
  };

  // Handle column selection for step 1
  const handleColumnSelection = (selected) => {
    setSelectedColumns(selected);
    setSelectionStep(2);
  };

  // Handle row selection for step 2
  const handleRowSelection = (selected) => {
    const newSelectedCells = [...selectedCells];

    // Add new selections
    selected.forEach(row => {
      selectedColumns.forEach(column => {
        const exists = newSelectedCells.some(cell =>
          cell.row === row && cell.column === column
        );
        if (!exists) {
          newSelectedCells.push({ row, column });
        }
      });
    });

    setSelectedCells(newSelectedCells);
    updateTableSelections(newSelectedCells);
    setSelectionStep(1);
  };

  // Update the table selections data structure
  const updateTableSelections = (cells) => {
    const newSelections = {};

    cells.forEach(cell => {
      const rowIndex = data.rows.indexOf(cell.row);
      const colIndex = data.columns.indexOf(cell.column);
      if (rowIndex !== -1 && colIndex !== -1) {
        newSelections[`${rowIndex}-${colIndex}`] = true;
      }
    });

    onChange({
      ...data,
      selections: newSelections
    });
  };

  // Remove a specific cell selection
  const removeCellSelection = (row, column) => {
    const updated = selectedCells.filter(cell =>
      !(cell.row === row && cell.column === column)
    );
    setSelectedCells(updated);
    updateTableSelections(updated);
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedCells([]);
    onChange({
      ...data,
      selections: {}
    });
  };

  return (
    <div className="p-4">
      <Typography className='text-black' variant="h6" gutterBottom>
        {title} {locale === 'ar' ? 'الإعدادات' : 'Settings'}
      </Typography>

      <Accordion
        expanded={expanded === 'panel1'}
        onChange={handleAccordionChange('panel1')}
      >
        <AccordionSummary
          expandIcon={<IconifyIcon icon="mdi:chevron-down" />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>{locale === 'ar' ? 'الإعدادات العامة' : 'General Settings'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={locale === 'ar' ? 'عنوان الجدول (عربي)' : 'Table Title (Arabic)'}
              variant="outlined"
              fullWidth
              value={data?.title_ar || ''}
              onChange={(e) => handleTextChange('title_ar', e.target.value)}
            />

            <TextField
              label={locale === 'ar' ? 'عنوان الجدول (إنجليزي)' : 'Table Title (English)'}
              variant="outlined"
              fullWidth
              value={data?.title_en || ''}
              onChange={(e) => handleTextChange('title_en', e.target.value)}
            />

            <TextField
              label={locale === 'ar' ? 'تسمية الزاوية' : 'Corner Label'}
              variant="outlined"
              fullWidth
              value={data?.cornerLabel || ''}
              onChange={(e) => handleTextChange('cornerLabel', e.target.value)}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={data?.showSummary || false}
                  onChange={handleBooleanChange('showSummary')}
                />
              }
              label={locale === 'ar' ? 'إظهار الملخص' : 'Show Summary'}
            />

            {data?.showSummary && (
              <>
                <TextField
                  label={locale === 'ar' ? 'عنوان الملخص (عربي)' : 'Summary Title (Arabic)'}
                  variant="outlined"
                  fullWidth
                  value={data?.summaryTitle_ar || ''}
                  onChange={(e) => handleTextChange('summaryTitle_ar', e.target.value)}
                />

                <TextField
                  label={locale === 'ar' ? 'عنوان الملخص (إنجليزي)' : 'Summary Title (English)'}
                  variant="outlined"
                  fullWidth
                  value={data?.summaryTitle_en || ''}
                  onChange={(e) => handleTextChange('summaryTitle_en', e.target.value)}
                />
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'panel2'}
        onChange={handleAccordionChange('panel2')}
      >
        <AccordionSummary
          expandIcon={<IconifyIcon icon="mdi:chevron-down" />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>{locale === 'ar' ? 'تخصيص المظهر' : 'Appearance'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={locale === 'ar' ? 'لون علامة الصح' : 'Check Color'}
              variant="outlined"
              fullWidth
              value={data?.checkColor || '#10B981'}
              onChange={(e) => handleTextChange('checkColor', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      size="small"
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: data?.checkColor || '#10B981',
                          borderRadius: '4px'
                        }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {showColorPicker && (
              <Box sx={{ position: 'relative', zIndex: 1000 }}>
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={() => setShowColorPicker(false)} />
                <Box sx={{ position: 'absolute', top: 0, left: 0 }}>
                  <HexColorPicker
                    color={data?.checkColor || '#10B981'}
                    onChange={handleColorChange}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'panel3'}
        onChange={handleAccordionChange('panel3')}
      >
        <AccordionSummary
          expandIcon={<IconifyIcon icon="mdi:chevron-down" />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography>{locale === 'ar' ? 'ضبط الأعمدة المسبق' : 'Preset Columns'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {locale === 'ar'
                ? 'أدخل الأعمدة المسبقة مفصولة بفواصل (،)'
                : 'Enter preset columns separated by commas'}
            </Typography>

            <TextField
              label={locale === 'ar' ? 'الأعمدة المسبقة' : 'Preset Columns'}
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={columnsInput}
              onChange={handleColumnsChange}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'panel4'}
        onChange={handleAccordionChange('panel4')}
      >
        <AccordionSummary
          expandIcon={<IconifyIcon icon="mdi:chevron-down" />}
          aria-controls="panel4a-content"
          id="panel4a-header"
        >
          <Typography>{locale === 'ar' ? 'ضبط الصفوف المسبق' : 'Preset Rows'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {locale === 'ar'
                ? 'أدخل الصفوف المسبقة مفصولة بفواصل (،)'
                : 'Enter preset rows separated by commas'}
            </Typography>

            <TextField
              label={locale === 'ar' ? 'الصفوف المسبقة' : 'Preset Rows'}
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={rowsInput}
              onChange={handleRowsChange}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === 'panel5'}
        onChange={handleAccordionChange('panel5')}
      >
        <AccordionSummary
          expandIcon={<IconifyIcon icon="mdi:chevron-down" />}
          aria-controls="panel5a-content"
          id="panel5a-header"
        >
          <Typography>{locale === 'ar' ? 'تحديد الخانات' : 'Select Cells'}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {selectionStep === 1 && (
              <>
                <Typography variant="subtitle1">
                  {locale === 'ar' ? 'الخطوة 1: اختر الأعمدة' : 'Step 1: Select Columns'}
                </Typography>
                {data?.columns?.length > 0 ? (
                  <FormControl fullWidth>
                    <InputLabel>{locale === 'ar' ? 'اختر الأعمدة' : 'Select Columns'}</InputLabel>
                    <Select
                      multiple
                      value={selectedColumns}
                      onChange={(e) => setSelectedColumns(e.target.value)}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {data.columns.map((column) => (
                        <MenuItem key={column} value={column}>
                          <Checkbox checked={selectedColumns.includes(column)} />
                          <ListItemText primary={column} />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {locale === 'ar'
                        ? 'اختر الأعمدة التي تريد تحديد الخانات فيها'
                        : 'Select columns where you want to check cells'}
                    </FormHelperText>
                  </FormControl>
                ) : (
                  <Typography color="text.secondary">
                    {locale === 'ar'
                      ? 'لا توجد أعمدة محددة بعد'
                      : 'No columns defined yet'}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  onClick={() => setSelectionStep(2)}
                  disabled={selectedColumns.length === 0}
                  sx={{ mt: 2 }}
                >
                  {locale === 'ar' ? 'التالي' : 'Next'}
                </Button>
              </>
            )}

            {selectionStep === 2 && (
              <>
                <Typography className='text-black' variant="subtitle1">
                  {locale === 'ar'
                    ? `الخطوة 2: اختر الصفوف في الأعمدة المحددة (${selectedColumns.join(', ')})`
                    : `Step 2: Select Rows in chosen columns (${selectedColumns.join(', ')})`}
                </Typography>
                {data?.rows?.length > 0 ? (
                  <FormControl fullWidth>
                    <InputLabel>{locale === 'ar' ? 'اختر الصفوف' : 'Select Rows'}</InputLabel>
                    <Select
                      multiple
                      value={selectableRows}
                      onChange={(e) => setSelectableRows(e.target.value)}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {data.rows.map((row) => (
                        <MenuItem key={row} value={row}>
                          <Checkbox checked={selectableRows.includes(row)} />
                          <ListItemText primary={row} />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {locale === 'ar'
                        ? 'اختر الصفوف التي تريد تحديدها في الأعمدة المختارة'
                        : 'Select rows to check in the chosen columns'}
                    </FormHelperText>
                  </FormControl>
                ) : (
                  <Typography className='text-black'>
                    {locale === 'ar'
                      ? 'لا توجد صفوف محددة بعد'
                      : 'No rows defined yet'}
                  </Typography>
                )}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item>
                    <Button
                      variant="outlined"
                      onClick={() => setSelectionStep(1)}
                    >
                      {locale === 'ar' ? 'رجوع' : 'Back'}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={() => handleRowSelection(selectableRows)}
                      disabled={selectableRows.length === 0}
                    >
                      {locale === 'ar' ? 'تأكيد' : 'Confirm'}
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}

            {selectedCells.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography className='text-black' variant="subtitle1">
                  {locale === 'ar' ? 'الخانات المحددة' : 'Selected Cells'}
                </Typography>
                <List dense>
                  {selectedCells.map((cell, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${cell.column} - ${cell.row}`}
                        primaryTypographyProps={{
                          style: locale === 'ar' ? { textAlign: 'right' } : {}
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => removeCellSelection(cell.row, cell.column)}
                        >
                          <IconifyIcon icon="mdi:delete" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearSelections}
                  startIcon={<IconifyIcon icon="mdi:delete" />}
                >
                  {locale === 'ar' ? 'مسح الكل' : 'Clear All'}
                </Button>
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default DynamicTableControl;
