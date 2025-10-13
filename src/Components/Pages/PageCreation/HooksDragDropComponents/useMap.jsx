import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  TextField,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  IconButton,
  Slider,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Grid,
  Collapse,
  Paper,
  CircularProgress
} from '@mui/material';
import { FaMapMarkerAlt, FaSearchLocation } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import IconifyIcon from 'src/Components/icon';
import { HexColorPicker } from 'react-colorful';

// Default center (Riyadh coordinates)
const defaultCenter = {
  lat: 24.7136,
  lng: 46.6753
};

// Libraries to load for Google Maps
const libraries = ['places', 'geometry'];

const MapRenderer = ({ data, onChange, locale }) => {
  const [center, setCenter] = useState(data?.center || defaultCenter);
  const [zoom, setZoom] = useState(data?.zoom || 10);
  const [markers, setMarkers] = useState(data?.markers || []);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);

  // Initialize from props
  useEffect(() => {
    if (data?.center) setCenter(data.center);
    if (data?.zoom) setZoom(data.zoom);
    if (data?.markers) setMarkers(data.markers);
  }, [data?.center, data?.zoom, data?.markers]);

  const handleMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMapLoading(false);
  }, []);

  const handleMapError = useCallback(() => {
    setMapError(locale === 'ar' ? 'خطأ في تحميل الخريطة' : 'Failed to load map');
    setMapLoading(false);
  }, [locale]);

  const onMapClick = useCallback((e) => {
    if (!data.allowMarkerAddition) return;

    const newMarker = {
      id: Date.now(),
      position: {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      },
      title: locale === 'ar' ? 'موقع جديد' : 'New location',
      color: data.markerColor || '#FF0000'
    };

    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);
    onChange({ ...data, markers: updatedMarkers });
  }, [data, markers, onChange, locale]);

  const onMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
  }, []);

  const removeMarker = useCallback((id) => {
    const updatedMarkers = markers.filter(marker => marker.id !== id);
    setMarkers(updatedMarkers);
    onChange({ ...data, markers: updatedMarkers });
    setSelectedMarker(null);
  }, [data, markers, onChange]);

  const updateMarkerTitle = useCallback((id, title) => {
    const updatedMarkers = markers.map(marker =>
      marker.id === id ? { ...marker, title } : marker
    );
    setMarkers(updatedMarkers);
    onChange({ ...data, markers: updatedMarkers });
  }, [data, markers, onChange]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    if (!window.google || !window.google.maps) {
      toast.error(locale === 'ar' ? 'لم يتم تحميل خدمة الخرائط بعد' : 'Maps service not loaded yet');
      setLoading(false);

      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setLoading(false);
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const newCenter = { lat: location.lat(), lng: location.lng() };

        setCenter(newCenter);
        setZoom(15);
        onChange({
          ...data,
          center: newCenter,
          zoom: 15
        });
      } else {
        toast.error(locale === 'ar' ? 'لم يتم العثور على الموقع' : 'Location not found');
      }
    });
  }, [data, locale, onChange, searchQuery]);

  const handleCoordinateChange = useCallback((field, value) => {
    const newCenter = { ...center, [field]: parseFloat(value) || 0 };
    setCenter(newCenter);
    onChange({ ...data, center: newCenter });

    if (mapRef.current) {
      mapRef.current.panTo(newCenter);
    }
  }, [center, data, onChange]);

  const handleZoomChange = useCallback((e, newValue) => {
    setZoom(newValue);
    onChange({ ...data, zoom: newValue });
  }, [data, onChange]);

  const mapContainerStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
  }), []);

  const mapOptions = useMemo(() => ({
    streetViewControl: data.showStreetView,
    mapTypeControl: data.showMapTypeControl,
    fullscreenControl: data.showFullscreenControl,
    mapTypeId: data.mapType || 'roadmap'
  }), [data.showStreetView, data.showMapTypeControl, data.showFullscreenControl, data.mapType]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {data?.title?.[locale] || (locale === 'ar' ? 'خريطة جوجل' : 'Google Map')}
        </Typography>
        {data.showSearch && (
          <Box sx={{ width: '50%' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === 'ar' ? 'ابحث عن موقع...' : 'Search for a location...'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSearch}
                      disabled={loading || !searchQuery.trim()}
                      size="small"
                    >
                      <FaSearchLocation />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Box>
        )}
      </Box>

      {data.showControls && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Latitude"
              type="number"
              size="small"
              fullWidth
              value={center.lat}
              onChange={(e) => handleCoordinateChange('lat', e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">°</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Longitude"
              type="number"
              size="small"
              fullWidth
              value={center.lng}
              onChange={(e) => handleCoordinateChange('lng', e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">°</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6}>
            <Typography variant="body2" gutterBottom>
              {locale === 'ar' ? 'التكبير' : 'Zoom'} ({zoom})
            </Typography>
            <Slider
              value={zoom}
              onChange={handleZoomChange}
              min={1}
              max={20}
              step={1}
              size="small"
            />
          </Grid>
        </Grid>
      )}

      <Box sx={{
        height: data.height || '400px',
        position: 'relative',
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden'
      }}>
        {mapError ? (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            flexDirection: 'column',
            gap: 2,
            p: 2,
            textAlign: 'center'
          }}>
            <Typography color="error">{mapError}</Typography>
            <Typography variant="body2">
              {locale === 'ar'
                ? 'تأكد من صحة مفتاح API وأنه مفعل لخدمة Google Maps JavaScript API'
                : 'Make sure your API key is valid and enabled for Google Maps JavaScript API'}
            </Typography>
          </Box>
        ) : (
          <>
            {mapLoading && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                position: 'absolute',
                width: '100%',
                zIndex: 1,
                backgroundColor: 'background.paper'
              }}>
                <CircularProgress />
              </Box>
            )}
            <LoadScript
              googleMapsApiKey={'AIzaSyCR1qW_1hqfH_YBA6HpUwPv_yOs7bnR_oQ'}
              libraries={libraries}
              onError={handleMapError}
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={zoom}
                onClick={onMapClick}
                onLoad={handleMapLoad}
                options={mapOptions}
              >
                {markers.map((marker) => (
                  <Marker
                    key={marker.id}
                    position={marker.position}
                    onClick={() => onMarkerClick(marker)}
                    icon={{
                      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${marker.color || data?.markerColor || '#FF0000'}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
                      )}`,
                      scaledSize: new window.google.maps.Size(30, 30)
                    }}
                  />
                ))}

                {selectedMarker && (
                  <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <Box sx={{ p: 1, minWidth: '200px' }}>
                      <TextField
                        value={selectedMarker.title}
                        onChange={(e) => updateMarkerTitle(selectedMarker.id, e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => removeMarker(selectedMarker.id)}
                        fullWidth
                      >
                        {locale === 'ar' ? 'حذف' : 'Delete'}
                      </Button>
                    </Box>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </>
        )}
      </Box>

      {data.showMarkersList && markers.length > 0 && (
        <Accordion defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<IconifyIcon icon="mdi:chevron-down" />}>
            <Typography>
              {locale === 'ar' ? 'المواقع المحددة' : 'Selected Locations'} ({markers.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {markers.map((marker) => (
                <ListItem key={marker.id}>
                  <ListItemText
                    primary={marker.title}
                    secondary={`Lat: ${marker.position.lat.toFixed(4)}, Lng: ${marker.position.lng.toFixed(4)}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeMarker(marker.id)}
                      size="small"
                    >
                      <IconifyIcon icon="mdi:delete" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

const MapControlPanel = ({ data, onChange, locale }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMarkerForm, setShowMarkerForm] = useState(false);

  const [newMarker, setNewMarker] = useState({
    name: '',
    lat: '',
    lng: ''
  });

  const handleTextChange = useCallback((field, value) => {
    onChange({ ...data, [field]: value });
  }, [data, onChange]);

  const handleBooleanChange = useCallback((field) => (e) => {
    onChange({ ...data, [field]: e.target.checked });
  }, [data, onChange]);

  const handleColorChange = useCallback((color) => {
    onChange({ ...data, markerColor: color });
  }, [data, onChange]);

  const handleSelectChange = useCallback((field) => (e) => {
    onChange({ ...data, [field]: e.target.value });
  }, [data, onChange]);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);

  const toggleMarkerForm = useCallback(() => {
    setShowMarkerForm(prev => !prev);
  }, []);

  const handleNewMarkerChange = useCallback((field, value) => {
    setNewMarker(prev => ({ ...prev, [field]: value }));
  }, []);

  const addMarkerManually = useCallback(() => {
    if (!newMarker.name || !newMarker.lat || !newMarker.lng) {
      toast.error(locale === 'ar' ? 'الرجاء إدخال جميع الحقول' : 'Please fill all fields');

      return;

    }

    const marker = {
      id: Date.now(),
      position: {
        lat: parseFloat(newMarker.lat),
        lng: parseFloat(newMarker.lng)
      },
      title: newMarker.name,
      color: data.markerColor || '#FF0000'
    };

    const updatedMarkers = [...data.markers, marker];
    onChange({ ...data, markers: updatedMarkers });
    setNewMarker({ name: '', lat: '', lng: '' });
    toast.success(locale === 'ar' ? 'تمت إضافة العلامة' : 'Marker added');
  }, [data, locale, newMarker.lat, newMarker.lng, newMarker.name, onChange]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {locale === 'ar' ? 'إعدادات الخريطة' : 'Map Settings'}
      </Typography>

      <Accordion expanded={showMarkerForm} onChange={toggleMarkerForm}>
        <AccordionSummary expandIcon={<IconifyIcon icon="mdi:chevron-down" />}>
          <Typography>
            {locale === 'ar' ? 'إضافة علامة يدويًا' : 'Add Marker Manually'}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label={locale === 'ar' ? 'اسم العلامة' : 'Marker Name'}
                value={newMarker.name}
                onChange={(e) => handleNewMarkerChange('name', e.target.value)}
                fullWidth
                size="small"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Latitude"
                type="number"
                value={newMarker.lat}
                onChange={(e) => handleNewMarkerChange('lat', e.target.value)}
                fullWidth
                size="small"
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">°</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Longitude"
                type="number"
                value={newMarker.lng}
                onChange={(e) => handleNewMarkerChange('lng', e.target.value)}
                fullWidth
                size="small"
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">°</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={addMarkerManually}
                disabled={!newMarker.name || !newMarker.lat || !newMarker.lng}
                size="small"
              >
                {locale === 'ar' ? 'إضافة علامة' : 'Add Marker'}
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label={locale === 'ar' ? 'العنوان العربي' : 'Title (Arabic)'}
            value={data?.title?.ar || ''}
            onChange={(e) => onChange({
              ...data,
              title: { ...data.title, ar: e.target.value }
            })}
            fullWidth
            size="small"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label={locale === 'ar' ? 'العنوان الإنجليزي' : 'Title (English)'}
            value={data?.title?.en || ''}
            onChange={(e) => onChange({
              ...data,
              title: { ...data.title, en: e.target.value }
            })}
            fullWidth
            size="small"
            margin="normal"
          />
        </Grid>
      </Grid>

      <Box sx={{ my: 2 }}>
        <Typography gutterBottom sx={{ mb: 1 }}>
          {locale === 'ar' ? 'لون العلامة' : 'Marker Color'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: data.markerColor || '#FF0000',
              '&:hover': { backgroundColor: data.markerColor || '#FF0000' }
            }}
          />
          <TextField
            value={data.markerColor || '#FF0000'}
            onChange={(e) => handleTextChange('markerColor', e.target.value)}
            size="small"
            sx={{ width: '120px' }}
          />
        </Box>
        <Collapse in={showColorPicker}>
          <Box sx={{ mt: 2 }}>
            <HexColorPicker
              color={data.markerColor || '#FF0000'}
              onChange={handleColorChange}
            />
          </Box>
        </Collapse>
      </Box>

      <Button
        onClick={toggleAdvanced}
        size="small"
        endIcon={<IconifyIcon icon={showAdvanced ? "mdi:chevron-up" : "mdi:chevron-down"} />}
        sx={{ mb: 2 }}
      >
        {showAdvanced ?
          (locale === 'ar' ? 'إخفاء الإعدادات المتقدمة' : 'Hide Advanced Settings') :
          (locale === 'ar' ? 'عرض الإعدادات المتقدمة' : 'Show Advanced Settings')}
      </Button>

      <Collapse in={showAdvanced}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label={locale === 'ar' ? 'مفتاح API' : 'API Key'}
              value={'AIzaSyCR1qW_1hqfH_YBA6HpUwPv_yOs7bnR_oQ'}
              onChange={(e) => handleTextChange('apiKey', e.target.value)}
              fullWidth
              size="small"
              margin="normal"
              helperText={locale === 'ar'
                ? 'مطلوب لعرض الخريطة'
                : 'Required to display the map'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label={locale === 'ar' ? 'العرض' : 'Width'}
              value={data?.width || '100%'}
              onChange={(e) => handleTextChange('width', e.target.value)}
              fullWidth
              size="small"
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label={locale === 'ar' ? 'الارتفاع' : 'Height'}
              value={data?.height || '400px'}
              onChange={(e) => handleTextChange('height', e.target.value)}
              fullWidth
              size="small"
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label={locale === 'ar' ? 'خط العرض الافتراضي' : 'Default Latitude'}
              type="number"
              value={data?.center?.lat || defaultCenter.lat}
              onChange={(e) => onChange({
                ...data,
                center: { ...data.center, lat: parseFloat(e.target.value) || 0 }
              })}
              fullWidth
              size="small"
              margin="normal"
              InputProps={{
                endAdornment: <InputAdornment position="end">°</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label={locale === 'ar' ? 'خط الطول الافتراضي' : 'Default Longitude'}
              type="number"
              value={data?.center?.lng || defaultCenter.lng}
              onChange={(e) => onChange({
                ...data,
                center: { ...data.center, lng: parseFloat(e.target.value) || 0 }
              })}
              fullWidth
              size="small"
              margin="normal"
              InputProps={{
                endAdornment: <InputAdornment position="end">°</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={data.allowMarkerAddition !== false}
                  onChange={handleBooleanChange('allowMarkerAddition')}
                  size="small"
                />
              }
              label={locale === 'ar' ? 'السماح بإضافة علامات' : 'Allow marker addition'}
              sx={{ mr: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={data.showSearch !== false}
                  onChange={handleBooleanChange('showSearch')}
                  size="small"
                />
              }
              label={locale === 'ar' ? 'عرض البحث' : 'Show search'}
              sx={{ mr: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={data.showMarkersList !== false}
                  onChange={handleBooleanChange('showMarkersList')}
                  size="small"
                />
              }
              label={locale === 'ar' ? 'عرض قائمة العلامات' : 'Show markers list'}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography gutterBottom sx={{ mt: 1 }}>
              {locale === 'ar' ? 'نوع الخريطة الافتراضي' : 'Default Map Type'}
            </Typography>
            <Select
              value={data.mapType || 'roadmap'}
              onChange={handleSelectChange('mapType')}
              fullWidth
              size="small"
            >
              <MenuItem value="roadmap">{locale === 'ar' ? 'خريطة الطرق' : 'Roadmap'}</MenuItem>
              <MenuItem value="satellite">{locale === 'ar' ? 'القمر الصناعي' : 'Satellite'}</MenuItem>
              <MenuItem value="hybrid">{locale === 'ar' ? 'هجين' : 'Hybrid'}</MenuItem>
              <MenuItem value="terrain">{locale === 'ar' ? 'التضاريس' : 'Terrain'}</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
};

export default function useGoogleMap({ locale, buttonRef }) {
  const GoogleMapComponent = useMemo(() => {
    return {
      Renderer: ({ data, onChange }) => (
        <MapRenderer data={data} onChange={onChange} locale={locale} />
      ),
      id: 'google-map',
      title: locale === 'ar' ? 'خريطة جوجل' : 'Google Map',
      description: locale === 'ar'
        ? 'مكون خريطة جوجل مع تحديد المواقع الديناميكي'
        : 'Interactive Google Map with location selection',
      version: 1,
      icon: <FaMapMarkerAlt className="text-2xl" />,
      controls: {
        type: 'custom',
        Component: ({ data, onChange }) => (
          <MapControlPanel data={data} onChange={onChange} locale={locale} buttonRef={buttonRef} />
        )
      },
      defaultData: {
        apiKey: 'AIzaSyCR1qW_1hqfH_YBA6HpUwPv_yOs7bnR_oQ',
        title: { ar: 'خريطة جوجل', en: 'Google Map' },
        center: defaultCenter,
        zoom: 10,
        width: '100%',
        height: '400px',
        markerColor: '#FF0000',
        allowMarkerAddition: true,
        showControls: true,
        showSearch: true,
        showMarkersList: true,
        showStreetView: true,
        showMapTypeControl: true,
        showFullscreenControl: true,
        mapType: 'roadmap',
        markers: []
      }
    };
  }, [locale, buttonRef]);

  return { GoogleMap: GoogleMapComponent };
}
