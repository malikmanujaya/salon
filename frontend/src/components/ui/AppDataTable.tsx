import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Checkbox,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { palette } from '@/theme/palette';

export type AppTableColumn<Row extends { id: string | number }> = {
  id: keyof Row | string;
  label: string;
  minWidth?: number;
  width?: number | string;
  align?: 'left' | 'right' | 'center';
  render?: (row: Row) => ReactNode;
};

export type AppTableFilterTab = {
  label: string;
  value: string | number;
};

export type AppDataTableProps<Row extends { id: string | number }> = {
  columns: AppTableColumn<Row>[];
  rows: Row[];
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onEdit?: (row: Row) => void;
  onDelete?: (row: Row) => void;
  showActions?: boolean;
  onRowClick?: (row: Row) => void;
  id?: string;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  clientSearch?: boolean;
  onRefresh?: () => void;
  selectable?: boolean;
  onDeleteSelected?: (selectedIds: Array<string | number>) => void;
  filterTabs?: AppTableFilterTab[];
  activeFilterTab?: string | number;
  onFilterTabChange?: (value: string | number) => void;
  viewToggle?: ReactNode;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
};

export function AppDataTable<Row extends { id: string | number }>({
  columns,
  rows,
  toolbar,
  emptyTitle = 'No records',
  emptyDescription = 'No records to display.',
  onEdit,
  onDelete,
  showActions = true,
  onRowClick,
  id,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchQuery: controlledSearchQuery,
  onSearch,
  clientSearch = true,
  onRefresh,
  selectable = false,
  onDeleteSelected,
  filterTabs,
  activeFilterTab,
  onFilterTabChange,
  viewToggle,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
  onRowsPerPageChange,
  total,
  page: controlledPage,
  onPageChange,
}: AppDataTableProps<Row>) {
  const hasActions = showActions && (onEdit || onDelete);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [internalPage, setInternalPage] = useState(1);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchExpandedRef = useRef(false);

  const page = controlledPage ?? internalPage;
  const setPage =
    controlledPage !== undefined ? (next: number) => onPageChange?.(next) : setInternalPage;

  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  const setSearchQuery =
    controlledSearchQuery !== undefined
      ? (next: string) => onSearch?.(next)
      : setInternalSearchQuery;

  useEffect(() => {
    if (searchQuery || searchExpandedRef.current) {
      setSearchExpanded(true);
    }
  }, [rows, searchQuery]);

  useEffect(() => {
    if (selectedRows.size === 0) return;
    const ids = new Set(rows.map((row) => row.id));
    const valid = Array.from(selectedRows).filter((rowId) => ids.has(rowId));
    if (valid.length !== selectedRows.size) {
      setSelectedRows(new Set(valid));
    }
  }, [rows, selectedRows]);

  const cellValue = (row: Row, col: AppTableColumn<Row>) => {
    if (col.render) return col.render(row);
    const key = col.id as keyof Row;
    const value = row[key];
    if (value == null) return '—';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '—';
  };

  const filteredRows = useMemo(() => {
    if (!clientSearch) return rows;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((col) => {
        if (col.render) return false;
        const key = col.id as keyof Row;
        const value = row[key];
        if (value == null) return false;
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return String(value).toLowerCase().includes(q);
        }
        return false;
      }),
    );
  }, [rows, searchQuery, columns, clientSearch]);

  const totalCount = total ?? filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / rowsPerPage));

  useEffect(() => {
    // Avoid clamping while loading: server `total` can be missing for one render (e.g. paginated React Query gap),
    // which would make totalPages=1 and incorrectly reset a valid page>1.
    if (loading) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages, loading]);

  const paginatedRows =
    total !== undefined
      ? filteredRows
      : filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const isAllSelected = paginatedRows.length > 0 && paginatedRows.every((row) => selectedRows.has(row.id));
  const isSomeSelected = paginatedRows.some((row) => selectedRows.has(row.id)) && !isAllSelected;

  const handleDeleteSelected = () => {
    if (!onDeleteSelected || selectedRows.size === 0) return;
    onDeleteSelected(Array.from(selectedRows));
  };

  return (
    <Paper
      id={id ? `${id}-table` : undefined}
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(palette.purpleDark, 0.22)}`,
        background: `linear-gradient(180deg, ${palette.white} 0%, ${alpha(palette.ivory, 0.72)} 100%)`,
        boxShadow: `0 10px 28px -20px ${alpha(palette.purpleDeep, 0.35)}, 0 1px 0 ${alpha(palette.purpleDeep, 0.04)} inset`,
      }}
    >
      <Box
        id={id ? `${id}-table-header` : undefined}
        sx={{
          borderBottom: `1px solid ${alpha(palette.purpleDark, 0.22)}`,
          px: { xs: 2, md: 3 },
          py: 2,
          background: `linear-gradient(180deg, ${alpha(palette.ivory, 0.95)} 0%, ${alpha(palette.roseLight, 0.42)} 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minHeight: 32 }}>
              {filterTabs?.map((tab) => {
                const active = activeFilterTab === tab.value;
                return (
                  <Box
                    key={tab.value}
                    component="button"
                    type="button"
                    onClick={() => onFilterTabChange?.(tab.value)}
                    sx={{
                      px: 1.5,
                      py: 0.85,
                      border: 'none',
                      bgcolor: 'transparent',
                      color: active ? palette.purple : alpha(palette.purpleDeep, 0.62),
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderBottom: `2px solid ${active ? palette.purple : 'transparent'}`,
                      transition: 'all 120ms ease',
                      '&:hover': { color: palette.purpleDark },
                    }}
                  >
                    {tab.label}
                  </Box>
                );
              })}
              {toolbar}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              {viewToggle}
              {searchable ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Collapse in={searchExpanded} orientation="horizontal">
                    {searchExpanded ? (
                      <TextField
                        size="small"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setPage(1);
                        }}
                        autoFocus
                        sx={{ width: 240 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRoundedIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: searchQuery ? (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  searchExpandedRef.current = true;
                                  setSearchQuery('');
                                }}
                              >
                                <CloseRoundedIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ) : undefined,
                        }}
                      />
                    ) : null}
                  </Collapse>
                  {!searchExpanded ? (
                    <Tooltip title="Search">
                      <IconButton
                        onClick={() => {
                          searchExpandedRef.current = true;
                          setSearchExpanded(true);
                        }}
                        size="small"
                        sx={{
                          color: alpha(palette.purpleDeep, 0.62),
                          border: `1px solid ${alpha(palette.purpleDark, 0.2)}`,
                          bgcolor: alpha(palette.white, 0.86),
                          '&:hover': {
                            color: palette.purpleDark,
                            bgcolor: alpha(palette.roseLight, 0.55),
                          },
                        }}
                      >
                        <SearchRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  ) : !searchQuery ? (
                    <Tooltip title="Close search">
                      <IconButton
                        onClick={() => {
                          searchExpandedRef.current = false;
                          setSearchExpanded(false);
                          setSearchQuery('');
                        }}
                        size="small"
                        sx={{
                          color: alpha(palette.purpleDeep, 0.62),
                          border: `1px solid ${alpha(palette.purpleDark, 0.2)}`,
                          bgcolor: alpha(palette.white, 0.86),
                          '&:hover': {
                            color: palette.purpleDark,
                            bgcolor: alpha(palette.roseLight, 0.55),
                          },
                        }}
                      >
                        <CloseRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Box>
              ) : null}

              {onRefresh ? (
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={() => {
                      setSelectedRows(new Set());
                      onRefresh();
                    }}
                    size="small"
                    sx={{
                      color: alpha(palette.purpleDeep, 0.62),
                      border: `1px solid ${alpha(palette.purpleDark, 0.2)}`,
                      bgcolor: alpha(palette.white, 0.86),
                      '&:hover': {
                        color: palette.purpleDark,
                        bgcolor: alpha(palette.roseLight, 0.55),
                      },
                    }}
                  >
                    <RefreshRoundedIcon />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Box>
          </Box>

          {selectable && selectedRows.size > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {selectedRows.size} selected
              </Typography>
              <Tooltip title="Delete selected">
                <IconButton onClick={handleDeleteSelected} size="small" color="error">
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null}
        </Box>
      </Box>

      <TableContainer
        id={id ? `${id}-table-container` : undefined}
        sx={{
          maxHeight: 600,
          width: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { height: 8, width: 8 },
          '&::-webkit-scrollbar-track': { background: alpha(palette.rose, 0.45), borderRadius: 8 },
          '&::-webkit-scrollbar-thumb': { background: alpha(palette.purpleDark, 0.3), borderRadius: 8 },
          '&::-webkit-scrollbar-thumb:hover': { background: alpha(palette.purpleDark, 0.44) },
        }}
      >
        <Table stickyHeader sx={{ width: '100%', tableLayout: 'auto' }}>
          <TableHead>
            <TableRow>
              {selectable ? (
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 52,
                    bgcolor: alpha(palette.roseLight, 0.38),
                    borderBottom: `2px solid ${alpha(palette.purpleDark, 0.28)}`,
                  }}
                >
                  <Checkbox
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedRows(new Set(paginatedRows.map((row) => row.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                  />
                </TableCell>
              ) : null}

              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align ?? 'left'}
                  sx={{
                    minWidth: column.minWidth,
                    width: column.width,
                    bgcolor: alpha(palette.roseLight, 0.38),
                    color: alpha(palette.purpleDeep, 0.84),
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderBottom: `2px solid ${alpha(palette.purpleDark, 0.28)}`,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}

              {hasActions ? (
                <TableCell
                  align="center"
                  sx={{
                    width: 108,
                    bgcolor: alpha(palette.roseLight, 0.38),
                    color: alpha(palette.purpleDeep, 0.84),
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderBottom: `2px solid ${alpha(palette.purpleDark, 0.28)}`,
                  }}
                >
                  Actions
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)}
                  sx={{ py: 8 }}
                >
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={columns.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)}
                  sx={{ py: 9 }}
                >
                  <Typography variant="h4" sx={{ opacity: 0.25, mb: 1 }}>
                    📋
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {emptyTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {emptyDescription}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, index) => {
                const selected = selectedRows.has(row.id);
                return (
                  <TableRow
                    key={String(row.id)}
                    hover
                    selected={selected}
                    onClick={() => {
                      if (!selectable) onRowClick?.(row);
                    }}
                    sx={{
                      cursor: !selectable && onRowClick ? 'pointer' : 'default',
                      bgcolor: index % 2 === 0 ? alpha(palette.white, 0.96) : alpha(palette.ivory, 0.68),
                      '&:hover': { bgcolor: alpha(palette.roseLight, 0.5) },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    {selectable ? (
                      <TableCell padding="checkbox" sx={{ borderBottom: `1px solid ${alpha(palette.purpleDark, 0.14)}` }}>
                        <Checkbox
                          checked={selected}
                          onChange={() => {
                            setSelectedRows((prev) => {
                              const next = new Set(prev);
                              if (next.has(row.id)) next.delete(row.id);
                              else next.add(row.id);
                              return next;
                            });
                          }}
                        />
                      </TableCell>
                    ) : null}

                    {columns.map((column) => (
                      <TableCell
                        key={String(column.id)}
                        align={column.align ?? 'left'}
                        sx={{
                          borderBottom: `1px solid ${alpha(palette.purpleDark, 0.14)}`,
                          color: alpha(palette.purpleDeep, 0.86),
                        }}
                      >
                        {cellValue(row, column)}
                      </TableCell>
                    ))}

                    {hasActions ? (
                      <TableCell align="center" sx={{ borderBottom: `1px solid ${alpha(palette.purpleDark, 0.14)}` }}>
                        {onEdit ? (
                          <IconButton
                            size="small"
                            aria-label="Edit"
                            color="primary"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEdit(row);
                            }}
                            sx={{
                              bgcolor: alpha(palette.orchidLight, 0.3),
                              '&:hover': {
                                bgcolor: alpha(palette.orchid, 0.35),
                              },
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                        {onDelete ? (
                          <IconButton
                            size="small"
                            aria-label="Delete"
                            color="error"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDelete(row);
                            }}
                            sx={{
                              ml: 0.5,
                              bgcolor: alpha(palette.rose, 0.45),
                              '&:hover': {
                                bgcolor: alpha(palette.roseDark, 0.24),
                              },
                            }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        id={id ? `${id}-table-pagination` : undefined}
        sx={{
          borderTop: `1px solid ${alpha(palette.purpleDark, 0.2)}`,
          px: { xs: 2, md: 3 },
          py: 1.5,
          bgcolor: alpha(palette.ivory, 0.8),
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: alpha(palette.purpleDeep, 0.76) }} fontWeight={600}>
            Rows per page:
          </Typography>
          <TextField
            select
            size="small"
            value={rowsPerPage}
            onChange={(event) => {
              const next = Number(event.target.value);
              setRowsPerPage(next);
              setPage(1);
              onRowsPerPageChange?.(next);
            }}
            sx={{
              minWidth: 80,
              '& .MuiOutlinedInput-root': {
                bgcolor: alpha(palette.white, 0.88),
                '& fieldset': {
                  borderColor: alpha(palette.purpleDark, 0.26),
                },
                '&:hover fieldset': {
                  borderColor: alpha(palette.purpleDark, 0.4),
                },
              },
            }}
          >
            {rowsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" sx={{ color: alpha(palette.purpleDeep, 0.68), whiteSpace: 'nowrap' }}>
            {totalCount > 0
              ? `${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalCount)} of ${totalCount}`
              : '0 of 0'}
          </Typography>
        </Box>

        {totalPages > 1 ? (
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_event, next) => setPage(next)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        ) : null}
      </Box>
    </Paper>
  );
}

export const TableAvatar = ({
  src,
  alt,
  name,
}: {
  src?: string;
  alt: string;
  name: string;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
    <Avatar
      src={src}
      alt={alt}
      sx={{
        width: 36,
        height: 36,
        bgcolor: alpha(palette.purple, 0.85),
        color: 'white',
        fontWeight: 700,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
    <Typography variant="body2" fontWeight={600}>
      {name}
    </Typography>
  </Box>
);
