import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  Box,
  Menu,
  MenuItem,
  Badge,
  Chip,
  Stack,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Menu as MenuIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Warning as WarningIcon,
  Clear as ClearIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useTodo } from '../context/TodoContext';
import { useFilteredTodos } from '../hooks/useFilteredTodos';
import SettingsDialog from './SettingsDialog';

const Header = () => {
  const {
    filter,
    searchTerm,
    sortBy,
    theme,
    setFilter,
    setSearchTerm,
    setSortBy,
    toggleTheme,
    clearCompleted,
  } = useTodo();
  
  const { stats } = useFilteredTodos();
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleSortMenuOpen = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleFilterSelect = (newFilter) => {
    setFilter(newFilter);
    setFilterMenuAnchor(null);
  };

  const handleSortSelect = (newSort) => {
    setSortBy(newSort);
    setSortMenuAnchor(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const getFilterDisplayName = (filterValue) => {
    const filterNames = {
      all: 'Todas',
      active: 'Pendientes',
      completed: 'Completadas',
      today: 'Hoy',
      week: 'Esta semana',
      overdue: 'Vencidas',
    };
    return filterNames[filterValue] || filterValue;
  };

  const getSortDisplayName = (sortValue) => {
    const sortNames = {
      createdAt: 'Fecha de creación',
      dueDate: 'Fecha de vencimiento',
      priority: 'Prioridad',
      alphabetical: 'Alfabético',
    };
    return sortNames[sortValue] || sortValue;
  };

  const filterOptions = [
    { value: 'all', label: 'Todas las tareas', icon: <RadioButtonUncheckedIcon />, count: stats.total },
    { value: 'active', label: 'Pendientes', icon: <RadioButtonUncheckedIcon />, count: stats.active },
    { value: 'completed', label: 'Completadas', icon: <CheckCircleIcon />, count: stats.completed },
    { value: 'today', label: 'Para hoy', icon: <TodayIcon /> },
    { value: 'week', label: 'Esta semana', icon: <DateRangeIcon /> },
    { value: 'overdue', label: 'Vencidas', icon: <WarningIcon />, count: stats.overdue },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'dueDate', label: 'Fecha de vencimiento' },
    { value: 'priority', label: 'Prioridad' },
    { value: 'alphabetical', label: 'Alfabético' },
  ];

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>

          {/* Logo + Nombre KambaLabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
            <Box
              component="img"
              src="/kambalabs-logo.svg"
              alt="KambaLabs Logo"
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                mr: 1.2,
                borderRadius: 2,
                boxShadow: 2,
                bgcolor: 'background.paper',
                p: 0.2,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: 1,
                whiteSpace: { xs: 'nowrap', sm: 'normal' },
                overflow: { xs: 'hidden', sm: 'visible' },
                textOverflow: { xs: 'ellipsis', sm: 'clip' },
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                maxWidth: { xs: 120, sm: 'none' },
                display: 'flex',
                alignItems: 'center',
                color: 'inherit',
              }}
            >
              KambaLabs
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Search */}
            <TextField
              size="small"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& input': {
                    color: 'white',
                  },
                },
              }}
              sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 200 }}
            />

            {/* Filter Button */}
            <IconButton color="inherit" onClick={handleFilterMenuOpen}>
              <Badge badgeContent={filter !== 'all' ? '•' : 0} color="secondary">
                <FilterListIcon />
              </Badge>
            </IconButton>

            {/* Sort Button */}
            <IconButton color="inherit" onClick={handleSortMenuOpen}>
              <SortIcon />
            </IconButton>

            {/* Settings Button */}
            <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>

            {/* Theme Toggle */}
            <IconButton color="inherit" onClick={toggleTheme}>
              {theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>

        {/* Filter Chips - Desktop */}
        <Box sx={{ px: 2, pb: 1, display: { xs: 'none', sm: 'block' } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`Filtro: ${getFilterDisplayName(filter)}`}
              color={filter !== 'all' ? 'secondary' : 'default'}
              variant={filter !== 'all' ? 'filled' : 'outlined'}
              size="small"
              onDelete={filter !== 'all' ? () => setFilter('all') : undefined}
            />
            <Chip
              label={`Orden: ${getSortDisplayName(sortBy)}`}
              variant="outlined"
              size="small"
            />
            {stats.completed > 0 && (
              <Chip
                label="Limpiar completadas"
                variant="outlined"
                size="small"
                onClick={clearCompleted}
                clickable
              />
            )}
          </Stack>
        </Box>
      </AppBar>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        {filterOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleFilterSelect(option.value)}
            selected={filter === option.value}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Box display="flex" alignItems="center" gap={1}>
                {option.icon}
                <Typography>{option.label}</Typography>
              </Box>
              {option.count !== undefined && (
                <Chip label={option.count} size="small" />
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSortSelect(option.value)}
            selected={sortBy === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
                <Box
                  component="img"
                  src="/kambalabs-logo.svg"
                  alt="KambaLabs Logo"
                  sx={{
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    mr: 1.2,
                    borderRadius: 2,
                    boxShadow: 2,
                    bgcolor: 'background.paper',
                    p: 0.2,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: 1,
                    whiteSpace: { xs: 'nowrap', sm: 'normal' },
                    overflow: { xs: 'hidden', sm: 'visible' },
                    textOverflow: { xs: 'ellipsis', sm: 'clip' },
                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                    maxWidth: { xs: 120, sm: 'none' },
                    display: 'flex',
                    alignItems: 'center',
                    color: 'inherit',
                  }}
                >
                  KambaLabs
                </Typography>
              </Box>
            </ListItem>
            <Divider />
            
            {/* Mobile Search */}
            <ListItem>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </ListItem>
            
            <Divider />
            
            {/* Filter Options */}
            {filterOptions.map((option) => (
              <ListItemButton
                key={option.value}
                selected={filter === option.value}
                onClick={() => {
                  handleFilterSelect(option.value);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>{option.icon}</ListItemIcon>
                <ListItemText primary={option.label} />
                {option.count !== undefined && (
                  <Chip label={option.count} size="small" />
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};

export default Header;
