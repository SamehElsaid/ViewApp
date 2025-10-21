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
import { useIntl } from 'react-intl';

const DynamicTableControl = ({ data, onChange, title, locale }) => {
  const { messages } = useIntl()
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
        {title} {messages.dialogs.settings}
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
          <Typography>{messages.dialogs.generalSettings}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={messages.tableTitleInArabic}
              variant="outlined"
              fullWidth
              value={data?.title_ar || ''}
              onChange={(e) => handleTextChange('title_ar', e.target.value)}
            />

            <TextField
              label={messages.tableTitleInEnglish}
              variant="outlined"
              fullWidth
              value={data?.title_en || ''}
              onChange={(e) => handleTextChange('title_en', e.target.value)}
            />

            <TextField
              label={messages.dialogs.cornerLabel}
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
              label={messages.dialogs.showSummary}
            />

            {data?.showSummary && (
              <>
                <TextField
                  label={messages.dialogs.summaryTitle}
                  variant="outlined"
                  fullWidth
                  value={data?.summaryTitle_ar || ''}
                  onChange={(e) => handleTextChange('summaryTitle_ar', e.target.value)}
                />

                <TextField
                  label={messages.dialogs.summaryTitle}
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
          <Typography>{messages.dialogs.appearance}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={messages.dialogs.checkColor}
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
          <Typography>{messages.dialogs.presetColumns}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              { messages.dialogs.enterPresetColumns}
            </Typography>

            <TextField
              label={messages.dialogs.presetColumns}
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
            <Typography>{messages.dialogs.presetRows}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
                {messages.dialogs.enterPresetRows}
            </Typography>

            <TextField
              label={messages.dialogs.presetRows}
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
          <Typography>{messages.dialogs.selectCells}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {selectionStep === 1 && (
              <>
                <Typography variant="subtitle1">
                  {messages.dialogs.step1}
                </Typography>
                {data?.columns?.length > 0 ? (
                  <FormControl fullWidth>
                    <InputLabel>{messages.dialogs.selectColumns}</InputLabel>
                    <Select
                      multiple
                      variant='filled'
                      value={selectedColumns}
                      onChange={(e) => setSelectedColumns(e.target.value)}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {data.columns.map((column) => (
                        <MenuItem key={column} value={column}>
                          <Checkbox checked={selectedColumns.includes(column)} />
                          <ListItemText primary={column} className='!text-black' />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {messages.dialogs.selectColumnsHelperText}
                    </FormHelperText>
                  </FormControl>
                ) : (
                  <Typography color="text.secondary">
                    {messages.dialogs.noColumnsDefined}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  onClick={() => setSelectionStep(2)}
                  disabled={selectedColumns.length === 0}
                  sx={{ mt: 2 }}
                >
                  {messages.next}
                </Button>
              </>
            )}

            {selectionStep === 2 && (
              <>
                <Typography className='text-black' variant="subtitle1">
                  {messages.dialogs.step2} (${selectedColumns.join(', ')})
                </Typography>
                {data?.rows?.length > 0 ? (
                  <FormControl fullWidth>
                    <InputLabel>{messages.dialogs.selectRows}</InputLabel>
                    <Select
                      multiple
                      value={selectableRows}
                      onChange={(e) => setSelectableRows(e.target.value)}
                      renderValue={(selected) => selected.join(', ')}
                      variant='filled'
                    >
                      {data.rows.map((row) => (
                        <MenuItem key={row} value={row}>
                          <Checkbox checked={selectableRows.includes(row)} />
                          <ListItemText primary={row} className='!text-black' />
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {messages.dialogs.selectRowsHelperText}
                    </FormHelperText>
                  </FormControl>
                ) : (
                  <Typography className='text-black'>
                    {messages.dialogs.noRowsDefined}
                  </Typography>
                )}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item>
                    <Button
                      variant="outlined"
                      onClick={() => setSelectionStep(1)}
                    >
                      {messages.dialogs.back}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={() => handleRowSelection(selectableRows)}
                      disabled={selectableRows.length === 0}
                    >
                      {messages.dialogs.confirm}
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}

            {selectedCells.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography className='text-black' variant="subtitle1">
                  {messages.dialogs.selectedCells}
                </Typography>
                <List dense>
                  {selectedCells.map((cell, index) => (
                    <ListItem key={index}>
                      <ListItemText
                      className='!text-black'
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
                  {messages.dialogs.clearAll}
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
