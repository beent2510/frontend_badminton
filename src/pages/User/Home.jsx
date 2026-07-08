import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, CardMedia, Chip, TextField, MenuItem, Container, CircularProgress } from '@mui/material';
import { LocationOn, Star, AccessTime, SportsTennis, FilterList, Search } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import courtService from '../../services/courtService';
import branchService from '../../services/branchService';

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 5; hour < 24; hour++) {
    const hStr = hour.toString().padStart(2, '0');
    options.push(`${hStr}:00`);
    options.push(`${hStr}:30`);
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courts, setCourts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: Chi nhánh, 1: Sân cầu lông

  // All branches for the select dropdown (always loaded, unfiltered)
  const [allBranches, setAllBranches] = useState([]);

  // Filters state (what is actually queried against the API)
  const [filters, setFilters] = useState({
    keyword: '',
    branch_id: 'all',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: ''
  });

  // Local state for the search bar inputs (only updates URL/query on search click)
  const [searchInputs, setSearchInputs] = useState({
    keyword: '',
    branch_id: 'all',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: ''
  });

  // Fetch all branches once on mount to populate the dropdown selection
  useEffect(() => {
    const fetchAllBranches = async () => {
      try {
        const res = await branchService.getAll({ per_page: 100 });
        setAllBranches(res.data.items || res.data.data || res.data);
      } catch (err) {
        console.error('Error fetching all branches:', err);
      }
    };
    fetchAllBranches();
  }, []);

  // Helper to push state changes to the URL parameters
  const updateURLWithFilters = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.keyword) params.set('keyword', newFilters.keyword.trim());
    if (newFilters.branch_id && newFilters.branch_id !== 'all') params.set('branch_id', newFilters.branch_id);
    if (newFilters.date) params.set('date', newFilters.date);
    if (newFilters.start_time) params.set('start_time', newFilters.start_time);
    if (newFilters.end_time) params.set('end_time', newFilters.end_time);

    navigate(`/?${params.toString()}`, { replace: true });
  };

  // Listen to URL search parameter changes and update filters state accordingly
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kw = params.get("keyword") || "";
    const date = params.get("date") || new Date().toISOString().split('T')[0];
    const start_time = params.get("start_time") || '';
    const end_time = params.get("end_time") || '';
    const branch_id = params.get("branch_id") || 'all';

    setFilters(prev => {
      // Avoid state updates if nothing changed to prevent duplicate requests/loops
      if (
        prev.keyword === kw &&
        prev.date === date &&
        prev.start_time === start_time &&
        prev.end_time === end_time &&
        prev.branch_id === branch_id
      ) {
        return prev;
      }

      const newFilters = {
        keyword: kw,
        date,
        start_time,
        end_time,
        branch_id
      };

      setSearchInputs(newFilters);
      return newFilters;
    });
  }, [location.search]);

  const fetchData = async (currentFilters = filters) => {
    try {
      setLoading(true);
      const apiFilters = { ...currentFilters };
      if (apiFilters.branch_id === 'all') {
        apiFilters.branch_id = '';
      }
      const [courtsRes, branchesRes] = await Promise.all([
        courtService.getAll({ ...apiFilters, per_page: 8 }),
        branchService.getAll({ ...apiFilters, per_page: 8 })
      ]);
      setCourts(courtsRes.data.items || courtsRes.data.data || courtsRes.data);
      setBranches(branchesRes.data.items || branchesRes.data.data || branchesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data automatically when filters change
  useEffect(() => {
    fetchData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = () => {
    updateURLWithFilters(searchInputs);
  };

  const handleClearFilters = () => {
    const cleared = {
      keyword: '',
      branch_id: 'all',
      date: new Date().toISOString().split('T')[0],
      start_time: '',
      end_time: ''
    };
    setSearchInputs(cleared);
    setFilters(cleared);
    navigate('/', { replace: true });
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative', bgcolor: '#0a0a0a', pt: 10, pb: 12, px: 2,
        overflow: 'hidden', textAlign: 'center',
        borderBottom: '1px solid #1e1e1e'
      }}>
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, bgcolor: 'rgba(255,214,0,0.05)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, bgcolor: 'rgba(255,214,0,0.03)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <Box sx={{ display: 'inline-block', p: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,214,0,0.3)', bgcolor: 'rgba(255,214,0,0.1)', color: '#FFD600', mb: 3, fontWeight: 600, fontSize: '0.85rem' }} className="fade-in-up">
          🌟 NỀN TẢNG ĐẶT SÂN HÀNG ĐẦU
        </Box>

        <Typography variant="h1" className="fade-in-up" sx={{ animationDelay: '0.1s', mb: 2, mx: 'auto', maxWidth: 800 }}>
          Trải nghiệm cầu lông <br />
          <span style={{
            background: 'linear-gradient(135deg, #FFD600, #FFC000)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>đỉnh cao</span> cùng Bee Court
        </Typography>

        <Typography variant="h6" className="fade-in-up" sx={{ animationDelay: '0.2s', color: '#9a9a9a', fontWeight: 400, mb: 6, mx: 'auto', maxWidth: 600 }}>
          Hệ thống đặt sân nhanh chóng, tiện lợi với hàng chục sân đạt chuẩn trải dài khắp các quận.
        </Typography>

        {/* Search Bar */}
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10 }} className="fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            sx={{
              p: 3, borderRadius: 4, bgcolor: 'rgba(22,22,22,0.85)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,214,0,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', gap: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#FFD600' }}>
                <FilterList fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>Tìm & Lọc Sân</Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth name="keyword" placeholder="Tên sân, địa chỉ, quận..." value={searchInputs.keyword} onChange={(e) => setSearchInputs(prev => ({ ...prev, keyword: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#111' } }} size="small"
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth select name="branch_id" label="Chi nhánh" value={searchInputs.branch_id} onChange={(e) => setSearchInputs(prev => ({ ...prev, branch_id: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#111' } }} size="small"
                >
                  <MenuItem value="all">Tất cả chi nhánh</MenuItem>
                  {allBranches.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth type="date" name="date" label="Ngày chơi" value={searchInputs.date} onChange={(e) => setSearchInputs(prev => ({ ...prev, date: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#111' } }} size="small" InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth select name="start_time" label="Từ giờ" value={searchInputs.start_time} onChange={(e) => setSearchInputs(prev => ({ ...prev, start_time: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#111' }, minWidth: 120 }} size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Bất kỳ</MenuItem>
                  {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth select name="end_time" label="Đến giờ" value={searchInputs.end_time} onChange={(e) => setSearchInputs(prev => ({ ...prev, end_time: e.target.value }))}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#111' }, minWidth: 120 }} size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Bất kỳ</MenuItem>
                  {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1 }}>
                <Button fullWidth type="button" variant="outlined" color="primary" onClick={handleClearFilters} sx={{ flex: 1 }}>
                  XÓA LỌC
                </Button>
                <Button fullWidth type="submit" variant="contained" color="primary" sx={{ flex: 2, display: 'flex', gap: 1 }}>
                  <Search fontSize="small" /> TÌM SÂN
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Main Content Sections */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        {/* Premium Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6, borderBottom: '1px solid #222' }}>
          <Button
            onClick={() => setActiveTab(0)}
            sx={{
              px: 4, py: 2, fontSize: '1.05rem', fontWeight: 700,
              color: activeTab === 0 ? '#FFD600' : '#888',
              borderBottom: activeTab === 0 ? '3px solid #FFD600' : '3px solid transparent',
              borderRadius: 0,
              '&:hover': { color: '#FFD600', bgcolor: 'transparent' },
              transition: 'all 0.3s'
            }}
          >
            Chi nhánh ({branches.length})
          </Button>
          <Button
            onClick={() => setActiveTab(1)}
            sx={{
              px: 4, py: 2, fontSize: '1.05rem', fontWeight: 700,
              color: activeTab === 1 ? '#FFD600' : '#888',
              borderBottom: activeTab === 1 ? '3px solid #FFD600' : '3px solid transparent',
              borderRadius: 0,
              '&:hover': { color: '#FFD600', bgcolor: 'transparent' },
              transition: 'all 0.3s'
            }}
          >
            Sân cầu lông ({courts.length})
          </Button>
        </Box>

        {activeTab === 0 ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h3">Danh sách chi nhánh</Typography>
                <Typography sx={{ color: '#9a9a9a' }}>Khám phá các chi nhánh cầu lông nổi bật trên hệ thống</Typography>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#FFD600' }} />
              </Box>
            ) : branches.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#111', borderRadius: 4, border: '1px dashed #2a2a2a' }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🏸</Typography>
                <Typography variant="h6" sx={{ color: '#9a9a9a' }}>Không có chi nhánh nào phù hợp</Typography>
                <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={handleClearFilters}>Tải lại dữ liệu</Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {branches.map((branch) => (
                  <Grid xs={12} sm={6} md={4} key={branch.id}>
                    <Card sx={{
                      height: '100%', display: 'flex', flexDirection: 'column',
                      transition: 'all 0.3s ease', cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-8px)', borderColor: 'rgba(255,214,0,0.5)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }
                    }} onClick={() => navigate(`/branches/${branch.id}?date=${filters.date}&start_time=${filters.start_time}&end_time=${filters.end_time}`)}>

                      <Box sx={{ position: 'relative', pt: '60%', bgcolor: '#1e1e1e' }}>
                        <CardMedia
                          component="img"
                          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          image={branch.image_url ? (branch.image_url.startsWith('http') ? branch.image_url : `http://localhost:8000/storage/${branch.image_url}`) : `https://placehold.co/400x240/1e1e1e/FFD600?text=${encodeURIComponent(branch.name)}`}
                          onError={(e) => { e.target.src = `https://placehold.co/400x240/1e1e1e/FFD600?text=${encodeURIComponent(branch.name)}`; }}
                          alt={branch.name}
                        />

                        {(() => {
                          const reviews = branch.reviews || [];
                          const avg = reviews.length > 0
                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                            : 'N/A';
                          return (
                            <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', px: 1.5, py: 0.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star sx={{ color: '#FFD600', fontSize: 16 }} />
                              <Typography variant="body2" fontWeight={700} color="#fff">{avg}</Typography>
                            </Box>
                          );
                        })()}
                      </Box>

                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {branch.name}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <LocationOn sx={{ color: '#FFD600', fontSize: 18, mt: '2px' }} />
                            <Typography variant="body2" sx={{ color: '#9a9a9a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {branch.address}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                              Liên hệ: {branch.phone_number}
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ mt: 'auto', py: 1, fontWeight: 700 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/branches/${branch.id}?date=${filters.date}&start_time=${filters.start_time}&end_time=${filters.end_time}`);
                          }}
                        >
                          XEM CÁC SÂN
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h3">Danh sách sân cầu lông</Typography>
                <Typography sx={{ color: '#9a9a9a' }}>Khám phá các sân cầu lông trống, đạt chuẩn chất lượng</Typography>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#FFD600' }} />
              </Box>
            ) : courts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#111', borderRadius: 4, border: '1px dashed #2a2a2a' }}>
                <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>🏸</Typography>
                <Typography variant="h6" sx={{ color: '#9a9a9a' }}>Không có sân cầu lông nào khả dụng</Typography>
                <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={handleClearFilters}>Tải lại dữ liệu</Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {courts.map((court) => (
                  <Grid xs={12} sm={6} md={4} key={court.id}>
                    <Card sx={{
                      height: '100%', display: 'flex', flexDirection: 'column',
                      transition: 'all 0.3s ease', cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-8px)', borderColor: 'rgba(255,214,0,0.5)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' }
                    }} onClick={() => navigate(`/courts/${court.id}?date=${filters.date}&start_time=${filters.start_time}&end_time=${filters.end_time}`)}>

                      <Box sx={{ position: 'relative', pt: '60%', bgcolor: '#1e1e1e' }}>
                        <CardMedia
                          component="img"
                          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          image={court.image_url ? (court.image_url.startsWith('http') ? court.image_url : `http://localhost:8000/storage/${court.image_url}`) : `https://placehold.co/400x240/1e1e1e/FFD600?text=${encodeURIComponent(court.name)}`}
                          onError={(e) => { e.target.src = `https://placehold.co/400x240/1e1e1e/FFD600?text=${encodeURIComponent(court.name)}`; }}
                          alt={court.name}
                        />

                      </Box>

                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                          {court.name}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <LocationOn sx={{ color: '#FFD600', fontSize: 18, mt: '2px' }} />
                            <Typography variant="body2" sx={{ color: '#9a9a9a', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {court.branch?.name || 'Chi nhánh'} - {court.branch?.address || court.address || 'Địa chỉ'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SportsTennis sx={{ color: '#FFD600', fontSize: 18 }} />
                            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                              Giá sân: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(court.price_per_hour)}/giờ
                            </Typography>
                          </Box>
                        </Box>

                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ mt: 'auto', py: 1, fontWeight: 700 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courts/${court.id}?date=${filters.date}&start_time=${filters.start_time}&end_time=${filters.end_time}`);
                          }}
                        >
                          ĐẶT SÂN NGAY
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
