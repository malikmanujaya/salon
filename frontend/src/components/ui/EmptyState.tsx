import { Box, Typography } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 2, px: 2 }}>
      <Box sx={{ color: 'text.disabled', mb: 1.5, display: 'flex', justifyContent: 'center' }}>
        {icon ?? <InboxRoundedIcon sx={{ fontSize: 48 }} />}
      </Box>
      <Typography variant="subtitle1" fontWeight={700} color="text.secondary">
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 360, mx: 'auto' }}>
          {description}
        </Typography>
      ) : null}
    </Box>
  );
}
