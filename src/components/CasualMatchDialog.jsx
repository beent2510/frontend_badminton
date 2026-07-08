import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, CircularProgress
} from '@mui/material';
import { SportsTennis, People, EventNote } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showNotification } from '../store/notificationSlice';
import casualMatchService from '../services/casualMatchService';

export default function CasualMatchDialog({ open, onClose, booking }) {
  const [neededPlayers, setNeededPlayers] = useState(2);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  if (!booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (neededPlayers < 1) {
      return dispatch(showNotification({ message: 'Số lượng người chơi cần tìm tối thiểu là 1!', severity: 'warning' }));
    }

    try {
      setLoading(true);
      await casualMatchService.create({
        booking_id: booking.id,
        needed_players: neededPlayers,
        note
      });
      dispatch(showNotification({ message: 'Đăng tin tìm vãng lai thành công! Người chơi khác có thể tìm thấy tin của bạn ở mục Vãng lai.', severity: 'success' }));
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể đăng tin tìm vãng lai';
      dispatch(showNotification({ message: errMsg, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#111', border: '1px solid #2a2a2a', color: '#fff' } }}>
      <DialogTitle sx={{ fontWeight: 800, color: '#FFD600', borderBottom: '1px solid #222', pb: 2 }}>
        🐝 Đăng tin tìm vãng lai chơi cùng
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ color: '#9a9a9a', mb: 3 }}>
            Lịch đặt sân của bạn đã được xác nhận. Bạn muốn đăng tin để tìm thêm người chơi vãng lai tham gia cùng vào khung giờ này?
          </Typography>

          {/* Booking Summary Card */}
          <Box sx={{ bgcolor: '#1a1a1a', border: '1px solid #222', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#FFD600', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SportsTennis fontSize="small" /> Chi tiết đặt sân
            </Typography>
            <Typography variant="body2">
              Sân: <strong>{booking.court?.name || booking.items?.[0]?.court?.name || 'Sân cầu lông'}</strong>
            </Typography>
            <Typography variant="body2">
              Chi nhánh: {booking.court?.branch?.name || booking.items?.[0]?.court?.branch?.name || ''}
            </Typography>
            <Typography variant="body2">
              Thời gian: {booking.start_time || booking.items?.[0]?.start_time || ''} - {booking.end_time || booking.items?.[0]?.end_time || ''} ({booking.booking_date || booking.items?.[0]?.booking_date || ''})
            </Typography>
          </Box>

          <TextField
            fullWidth
            type="number"
            name="needed_players"
            label="Số lượng người cần tìm"
            value={neededPlayers}
            onChange={(e) => setNeededPlayers(parseInt(e.target.value) || '')}
            variant="outlined"
            margin="normal"
            slotProps={{
              input: {
                startAdornment: <People sx={{ color: '#666', mr: 1 }} />,
                min: 1
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': { bgcolor: '#1a1a1a', color: '#fff' },
              '& .MuiInputLabel-root': { color: '#666' }
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            name="note"
            label="Ghi chú (yêu cầu trình độ, chia sẻ chi phí...)"
            placeholder="Ví dụ: Cần tìm người chơi trình độ trung bình khá, giao lưu vui vẻ, chia tiền sân..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            variant="outlined"
            margin="normal"
            slotProps={{
              input: {
                startAdornment: <EventNote sx={{ color: '#666', mr: 1, mt: 1 }} />
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': { bgcolor: '#1a1a1a', color: '#fff' },
              '& .MuiInputLabel-root': { color: '#666' }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid #222', pt: 2 }}>
          <Button onClick={onClose} sx={{ color: '#9a9a9a', fontWeight: 600 }}>
            Bỏ qua
          </Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#FFD600', color: '#000', fontWeight: 700, '&:hover': { bgcolor: '#FFC000' } }}>
            {loading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : 'ĐĂNG TIN'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
