import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { EmptyState } from './EmptyState';
import { palette } from '@/theme/palette';

export type AppTableColumn<Row extends { id: string }> = {
  id: keyof Row | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  /** Read cell value or custom render */
  render?: (row: Row) => React.ReactNode;
};

export type AppDataTableProps<Row extends { id: string }> = {
  columns: AppTableColumn<Row>[];
  rows: Row[];
  /** Toolbar area above table (filters, primary action) */
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onEdit?: (row: Row) => void;
  onDelete?: (row: Row) => void;
  /** Hide action column when both handlers missing */
  showActions?: boolean;
};

export function AppDataTable<Row extends { id: string }>({
  columns,
  rows,
  toolbar,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Add a row or adjust filters to see data.',
  onEdit,
  onDelete,
  showActions = true,
}: AppDataTableProps<Row>) {
  const hasActions = showActions && (onEdit || onDelete);

  const cellValue = (row: Row, col: AppTableColumn<Row>) => {
    if (col.render) return col.render(row);
    const key = col.id as keyof Row;
    const v = row[key];
    if (v == null) return '—';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    return '—';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
        overflow: 'hidden',
      }}
    >
      {toolbar ? (
        <Box
          sx={{
            px: 2,
            py: 1.75,
            borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 1)}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
          }}
        >
          {toolbar}
        </Box>
      ) : null}
      <TableContainer sx={{ maxWidth: '100%' }}>
        <Table size="medium" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.id)}
                  align={col.align ?? 'left'}
                  sx={{
                    minWidth: col.minWidth,
                    fontWeight: 700,
                    bgcolor: alpha(palette.purple, 0.04),
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              {hasActions ? (
                <TableCell align="right" sx={{ width: 108, bgcolor: alpha(palette.purple, 0.04) }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing="0.06em">
                    Actions
                  </Typography>
                </TableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} sx={{ border: 0, py: 6 }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  {columns.map((col) => (
                    <TableCell key={String(col.id)} align={col.align ?? 'left'}>
                      {cellValue(row, col)}
                    </TableCell>
                  ))}
                  {hasActions ? (
                    <TableCell align="right">
                      {onEdit ? (
                        <IconButton size="small" aria-label="Edit" onClick={() => onEdit(row)} color="primary">
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                      {onDelete ? (
                        <IconButton size="small" aria-label="Delete" onClick={() => onDelete(row)} color="error">
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
