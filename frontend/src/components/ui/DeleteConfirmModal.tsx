import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export type DeleteConfirmModalProps = {
  open: boolean;
  title?: string;
  /** e.g. booking name */
  entityLabel?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function DeleteConfirmModal({
  open,
  title = 'Delete this item?',
  entityLabel,
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          pr: 1,
        }}
      >
        <Box component="span" sx={{ flex: 1, minWidth: 0, pr: 1 }}>
          {title}
        </Box>
        <IconButton
          aria-label="Close dialog"
          onClick={onClose}
          disabled={loading}
          size="small"
          edge="end"
          sx={{ color: 'text.secondary', mt: -0.25, flexShrink: 0 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          {entityLabel ? (
            <>
              You are about to remove <strong>{entityLabel}</strong>. {description}
            </>
          ) : (
            description
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button onClick={() => void onConfirm()} color="error" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} color="inherit" /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
