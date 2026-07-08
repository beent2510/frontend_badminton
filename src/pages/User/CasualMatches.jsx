import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Button, Chip, Divider, CircularProgress, Paper, LinearProgress
} from '@mui/material';
import { SportsTennis, LocationOn, AccessTime, People, Phone, Event } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../store/notificationSlice';
import casualMatchService from '../../services/casualMatchService';
import { useNavigate } from 'react-router-dom';

export default function CasualMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await casualMatchService.getAll();
      setMatches(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      dispatch(showNotification({ message: 'Không thể tải danh sách vãng lai', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleJoin = async (matchId) => {
    if (!isAuthenticated) {
      dispatch(showNotification({ message: 'Vui lòng đăng nhập để đăng ký tham gia!', severity: 'warning' }));
      return navigate('/login');
    }

    try {
      setActionLoading((prev) => ({ ...prev, [matchId]: true }));
      await casualMatchService.join(matchId);
      dispatch(showNotification({ message: 'Đăng ký tham gia thành công!', severity: 'success' }));
      fetchMatches();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể đăng ký';
      dispatch(showNotification({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const handleLeave = async (matchId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [matchId]: true }));
      await casualMatchService.leave(matchId);
      dispatch(showNotification({ message: 'Đã hủy đăng ký tham gia.', severity: 'success' }));
      fetchMatches();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể hủy đăng ký';
      dispatch(showNotification({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const isLessThan24Hours = (bookingDate, startTime) => {
    if (!bookingDate || !startTime) return false;
    const [year, month, day] = bookingDate.split('-').map(Number);
    const [hours, minutes] = startTime.split(':').map(Number);
    const playDate = new Date(year, month - 1, day, hours, minutes, 0);
    const now = new Date();
    return (playDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000;
  };

  const handleApprove = async (matchId, participantId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`approve-${participantId}`]: true }));
      const res = await casualMatchService.approveParticipant(matchId, participantId);
      dispatch(showNotification({ message: res.data?.message || 'Phê duyệt thành công!', severity: 'success' }));
      fetchMatches();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể phê duyệt';
      dispatch(showNotification({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`approve-${participantId}`]: false }));
    }
  };

  const handleReject = async (matchId, participantId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`reject-${participantId}`]: true }));
      const res = await casualMatchService.rejectParticipant(matchId, participantId);
      dispatch(showNotification({ message: res.data?.message || 'Đã từ chối yêu cầu.', severity: 'success' }));
      fetchMatches();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể từ chối';
      dispatch(showNotification({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`reject-${participantId}`]: false }));
    }
  };

  const handleAdjustPlayers = async (matchId, newNeeded) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`adjust-${matchId}`]: true }));
      const res = await casualMatchService.update(matchId, { needed_players: newNeeded });
      dispatch(showNotification({ message: res.data?.message || 'Đã điều chỉnh số lượng vãng lai!', severity: 'success' }));
      fetchMatches();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể điều chỉnh số lượng';
      dispatch(showNotification({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`adjust-${matchId}`]: false }));
    }
  };

  const handleCloseMatch = async (matchId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [`close-${matchId}`]: true }));
      await casualMatchService.update(matchId, { status: 'closed' });
      dispatch(showNotification({ message: 'Đã đóng tin tìm vãng lai thành công.', severity: 'success' }));
      fetchMatches();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Không thể đóng tin';
      dispatch(showNotification({ message: errMsg, severity: 'error' }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`close-${matchId}`]: false }));
    }
  };

  const isUserJoined = (match) => {
    if (!user) return false;
    return match.participants?.some((p) => p.user_id === user.id);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeStr) => {
    return timeStr ? timeStr.substring(0, 5) : '';
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: '#FFD600' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8, pt: 4, bgcolor: '#0a0a0a', minHeight: '90vh' }}>
      <Container maxWidth="lg">
        {/* Header Title */}
        <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
          <Box sx={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '100px', background: 'radial-gradient(circle, rgba(255,214,0,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, background: 'linear-gradient(135deg, #FFD600, #FFC000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', zIndex: 1, position: 'relative' }}>
            🐝 Giao Lưu Vãng Lai
          </Typography>
          <Typography variant="body1" sx={{ color: '#9a9a9a', maxWidth: 600, mx: 'auto', zIndex: 1, position: 'relative' }}>
            Tìm các nhóm chơi cần tuyển thêm thành viên hoặc đăng ký tham gia giao lưu vãng lai để cùng kết nối đam mê cầu lông!
          </Typography>
        </Box>

        {matches.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#111', border: '1px solid #2a2a2a', borderRadius: 4 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Hiện chưa có tin đăng vãng lai nào đang mở.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nếu bạn vừa đặt sân và cần tìm người chơi cùng, hãy tạo tin đăng tìm vãng lai ngay sau khi thanh toán thành công nhé!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {matches.map((match) => {
              const hostName = match.user?.name || 'Chủ sân';
              const hostPhone = match.user?.phone || 'Ẩn';
              const isHost = user && match.user_id === user.id;
              const joinedParticipant = match.participants?.find((p) => p.user_id === user?.id);
              const joined = !!joinedParticipant;
              const isApproved = joinedParticipant?.status === 'approved';
              const progressPercent = (match.registered_count / match.needed_players) * 100;
              const lessThan24Hours = isLessThan24Hours(match.booking_date, match.start_time);

              return (
                <Grid item xs={12} md={6} lg={4} key={match.id}>
                  <Card sx={{
                    height: '100%',
                    background: 'linear-gradient(145deg, #161616, #111)',
                    border: '1px solid #2a2a2a',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#FFD600',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(255, 214, 0, 0.15)'
                    }
                  }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                      {/* Branch & Court info */}
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFD600', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SportsTennis /> {match.court?.name || 'Sân cầu lông'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#9a9a9a' }}>
                        <LocationOn sx={{ fontSize: 18 }} />
                        <Typography variant="body2" noWrap>{match.branch?.name} - {match.branch?.address}</Typography>
                      </Box>

                      <Divider sx={{ borderColor: '#222', mb: 2 }} />

                      {/* Date & Time */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Event sx={{ color: '#FFD600', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(match.booking_date)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <AccessTime sx={{ color: '#FFD600', fontSize: 18 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatTime(match.start_time)} - {formatTime(match.end_time)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Progress needed players */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <People fontSize="small" /> Cần tuyển:
                          </Typography>
                          {isHost ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Button
                                size="small"
                                disabled={match.needed_players <= match.registered_count || actionLoading[`adjust-${match.id}`]}
                                onClick={() => handleAdjustPlayers(match.id, match.needed_players - 1)}
                                sx={{
                                  minWidth: 24,
                                  height: 24,
                                  p: 0,
                                  borderRadius: '50%',
                                  border: '1px solid rgba(255, 214, 0, 0.4)',
                                  color: '#FFD600',
                                  bgcolor: 'rgba(255,214,0,0.05)',
                                  '&:hover': { bgcolor: 'rgba(255,214,0,0.15)' },
                                  '&.Mui-disabled': { borderColor: '#333', color: '#555' }
                                }}
                              >
                                -
                              </Button>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFD600' }}>
                                {match.registered_count} / {match.needed_players} người
                              </Typography>
                              <Button
                                size="small"
                                disabled={actionLoading[`adjust-${match.id}`]}
                                onClick={() => handleAdjustPlayers(match.id, match.needed_players + 1)}
                                sx={{
                                  minWidth: 24,
                                  height: 24,
                                  p: 0,
                                  borderRadius: '50%',
                                  border: '1px solid rgba(255, 214, 0, 0.4)',
                                  color: '#FFD600',
                                  bgcolor: 'rgba(255,214,0,0.05)',
                                  '&:hover': { bgcolor: 'rgba(255,214,0,0.15)' }
                                }}
                              >
                                +
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFD600' }}>
                              {match.registered_count} / {match.needed_players} người
                            </Typography>
                          )}
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progressPercent}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#222',
                            '& .MuiLinearProgress-bar': { bgcolor: '#FFD600', borderRadius: 3 }
                          }}
                        />
                      </Box>

                      {/* Note */}
                      {match.note && (
                        <Box sx={{ bgcolor: 'rgba(255,214,0,0.05)', border: '1px dashed rgba(255,214,0,0.15)', borderRadius: 2, p: 1.5, mb: 3, flex: 1 }}>
                          <Typography variant="body2" sx={{ color: '#ccc', fontStyle: 'italic', lineHeight: 1.6 }}>
                            &ldquo;{match.note}&rdquo;
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ borderColor: '#222', my: 2 }} />

                      {/* Host Info */}
                      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#666' }}>Người đăng tin (Host)</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>{hostName}</Typography>
                        <Typography variant="body2" sx={{ color: '#9a9a9a', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone sx={{ fontSize: 14 }} /> SĐT: {hostPhone}
                        </Typography>
                      </Box>

                      {/* Participants list */}
                      {match.participants && match.participants.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="caption" sx={{ color: '#888', display: 'block', mb: 1, fontWeight: 600 }}>
                            Người chơi ({match.registered_count} / {match.needed_players} đã duyệt):
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {match.participants.map((p) => {
                              const pApproved = p.status === 'approved';
                              const showPhone = isHost || (user && p.user_id === user.id);
                              const displayName = showPhone ? `${p.name} (${p.phone})` : p.name;
                              return (
                                <Chip
                                  key={p.id}
                                  label={`${displayName}${pApproved ? '' : ' (Chờ duyệt)'}`}
                                  size="small"
                                  sx={{
                                    bgcolor: pApproved ? 'rgba(255, 214, 0, 0.1)' : 'rgba(255,255,255,0.03)',
                                    color: pApproved ? '#FFD600' : '#777',
                                    fontSize: '0.75rem',
                                    border: pApproved ? '1px solid rgba(255, 214, 0, 0.3)' : '1px dashed #333',
                                    '& .MuiChip-label': { px: 1 }
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      )}

                      {/* Action Button */}
                      {isHost ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button fullWidth disabled variant="outlined" sx={{ py: 1, borderColor: '#333 !important', color: '#888 !important', fontWeight: 700, flex: 1 }}>
                              CHỦ TIN ĐĂNG
                            </Button>
                            <Button
                              fullWidth
                              variant="outlined"
                              color="error"
                              onClick={() => handleCloseMatch(match.id)}
                              disabled={actionLoading[`close-${match.id}`]}
                              sx={{
                                py: 1,
                                fontWeight: 700,
                                flex: 1,
                                borderColor: '#d32f2f',
                                color: '#d32f2f',
                                '&:hover': {
                                  borderColor: '#c62828',
                                  bgcolor: 'rgba(211, 47, 47, 0.04)'
                                }
                              }}
                            >
                              {actionLoading[`close-${match.id}`] ? 'Đang đóng...' : 'ĐÓNG TIN ĐĂNG'}
                            </Button>
                          </Box>
                          
                          {/* Host Request Management Box */}
                          {match.participants && match.participants.filter(p => p.status === 'pending').length > 0 && (
                            <Box sx={{ mt: 1, p: 2, bgcolor: '#141414', border: '1px solid #2a2a2a', borderRadius: 2 }}>
                              <Typography variant="body2" sx={{ color: '#FFD600', fontWeight: 700, mb: 1.5, fontSize: '0.85rem' }}>
                                🔔 Yêu cầu tham gia chờ duyệt:
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {match.participants
                                  .filter(p => p.status === 'pending')
                                  .map((p) => (
                                    <Box
                                      key={p.id}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        bgcolor: '#1c1c1c',
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        border: '1px solid #333'
                                      }}
                                    >
                                      <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff', fontSize: '0.8rem' }}>
                                          {p.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#aaa', display: 'block' }}>
                                          SĐT: {p.phone}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() => handleApprove(match.id, p.id)}
                                          disabled={actionLoading[`approve-${p.id}`]}
                                          sx={{
                                            bgcolor: '#2e7d32',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            minWidth: '55px',
                                            px: 1,
                                            py: 0.5,
                                            '&:hover': { bgcolor: '#1b5e20' }
                                          }}
                                        >
                                          {actionLoading[`approve-${p.id}`] ? '...' : 'Duyệt'}
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() => handleReject(match.id, p.id)}
                                          disabled={actionLoading[`reject-${p.id}`]}
                                          sx={{
                                            bgcolor: '#d32f2f',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            minWidth: '55px',
                                            px: 1,
                                            py: 0.5,
                                            '&:hover': { bgcolor: '#c62828' }
                                          }}
                                        >
                                          {actionLoading[`reject-${p.id}`] ? '...' : 'Từ chối'}
                                        </Button>
                                      </Box>
                                    </Box>
                                  ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      ) : joined ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isApproved ? '#2e7d32' : '#ed6c02' }} />
                            <Typography variant="body2" sx={{ color: isApproved ? '#2e7d32' : '#ed6c02', fontWeight: 600 }}>
                              Trạng thái: {isApproved ? 'Đã được duyệt' : 'Chờ chủ sân duyệt'}
                            </Typography>
                          </Box>
                          {lessThan24Hours ? (
                            <Button
                              fullWidth
                              variant="outlined"
                              color="error"
                              disabled
                              sx={{
                                py: 1,
                                fontWeight: 700,
                                borderColor: '#333 !important',
                                color: '#666 !important',
                                '&.Mui-disabled': {
                                  borderColor: '#222',
                                  color: '#555'
                                }
                              }}
                            >
                              KHÔNG THỂ HỦY (DƯỚI 24H CHƠI)
                            </Button>
                          ) : (
                            <Button
                              fullWidth
                              variant="outlined"
                              color="error"
                              disabled={actionLoading[match.id]}
                              onClick={() => handleLeave(match.id)}
                              sx={{ py: 1, fontWeight: 700 }}
                            >
                              {actionLoading[match.id] ? 'Đang hủy...' : 'HỦY ĐĂNG KÝ'}
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={actionLoading[match.id] || match.registered_count >= match.needed_players}
                          onClick={() => handleJoin(match.id)}
                          sx={{
                            py: 1,
                            fontWeight: 700,
                            bgcolor: '#FFD600',
                            color: '#000',
                            '&:hover': { bgcolor: '#FFC000' },
                            '&.Mui-disabled': { bgcolor: '#333', color: '#666' }
                          }}
                        >
                          {actionLoading[match.id]
                            ? 'Đang đăng ký...'
                            : match.registered_count >= match.needed_players
                            ? 'SÂN ĐÃ ĐẦY'
                            : 'ĐĂNG KÝ THAM GIA'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
