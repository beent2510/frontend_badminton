import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, InputAdornment, Link as MuiLink } from '@mui/material';
import { Mail, VerifiedUser } from '@mui/icons-material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { showNotification } from '../../store/notificationSlice';
import authService from '../../services/authService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Resend code countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return dispatch(showNotification({ message: 'Không tìm thấy email cần xác thực!', severity: 'error' }));
    }
    if (code.length !== 6) {
      return dispatch(showNotification({ message: 'Vui lòng nhập mã OTP 6 chữ số!', severity: 'warning' }));
    }

    try {
      setLoading(true);
      await authService.verifyEmail({ email, code });
      dispatch(showNotification({ message: 'Xác thực email thành công! Bạn có thể đăng nhập.', severity: 'success' }));
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Xác thực thất bại';
      dispatch(showNotification({ message: errorMsg, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    if (!email) {
      return dispatch(showNotification({ message: 'Không tìm thấy email cần xác thực!', severity: 'error' }));
    }

    try {
      setResendLoading(true);
      await authService.resendVerification({ email });
      dispatch(showNotification({ message: 'Đã gửi lại mã OTP mới. Vui lòng kiểm tra email của bạn.', severity: 'success' }));
      setTimer(60);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Gửi lại mã thất bại';
      dispatch(showNotification({ message: errorMsg, severity: 'error' }));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, bgcolor: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,214,0,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,214,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <Container maxWidth="xs">
        <Box sx={{
          background: 'rgba(22, 22, 22, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid #2a2a2a',
          borderRadius: 4, p: 4, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1
        }}>
          <Typography variant="h3" sx={{ mb: 1, fontSize: '2.5rem' }}>🐝</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #FFD600, #FFC000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Xác thực tài khoản
          </Typography>
          <Typography variant="body2" sx={{ color: '#9a9a9a', mb: 3 }}>
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email của bạn
          </Typography>

          {email && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3, bgcolor: '#111', p: 1.5, borderRadius: 2, border: '1px solid #222' }}>
              <Mail sx={{ color: '#FFD600', fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{email}</Typography>
            </Box>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="code"
              placeholder="Nhập 6 chữ số OTP"
              variant="outlined"
              margin="normal"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              InputProps={{
                startAdornment: <InputAdornment position="start"><VerifiedUser sx={{ color: '#666' }}/></InputAdornment>,
                inputProps: { 
                  style: { 
                    textAlign: 'center', 
                    letterSpacing: code ? '8px' : 'normal', 
                    fontSize: '1.3rem', 
                    fontWeight: 700 
                  } 
                },
                sx: { bgcolor: '#111', borderRadius: 2 }
              }}
            />

            <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 3, py: 1.5, bgcolor: '#FFD600', color: '#000', fontWeight: 700, fontSize: '1rem', '&:hover': { bgcolor: '#FFC000' } }}>
              {loading ? 'Đang xác thực...' : 'XÁC THỰC'}
            </Button>
          </form>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#9a9a9a' }}>
              Không nhận được mã?{' '}
              {timer > 0 ? (
                <Typography component="span" variant="body2" sx={{ color: '#FFD600', fontWeight: 600 }}>
                  Gửi lại sau {timer}s
                </Typography>
              ) : (
                <MuiLink component="button" onClick={handleResend} disabled={resendLoading} sx={{ color: '#FFD600', fontWeight: 600, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', p: 0, verticalAlign: 'baseline', font: 'inherit' }}>
                  {resendLoading ? 'Đang gửi...' : 'Gửi lại mã'}
                </MuiLink>
              )}
            </Typography>

            <MuiLink component={Link} to="/login" sx={{ color: '#9a9a9a', fontSize: '0.85rem', mt: 1, textDecoration: 'none', '&:hover': { color: '#fff' } }}>
              Quay lại đăng nhập
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
