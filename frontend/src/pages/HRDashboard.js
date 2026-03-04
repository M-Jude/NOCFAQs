import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  People as PeopleIcon,
  Timer as TimerIcon,
  Assessment as StatsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const HRDashboard = () => {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [statsRes, sessionsRes] = await Promise.all([
        axios.get(`/api/sessions/stats?${params.toString()}`),
        axios.get(`/api/sessions?${params.toString()}&limit=50`)
      ]);

      setStats(statsRes.data.stats);
      setSessions(sessionsRes.data.sessions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
    // Refresh sessions every 30 seconds to update active session durations
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleFilter = () => {
    fetchData();
  };

  // Format duration - handles both session objects and plain numbers
  const formatDuration = (sessionOrNumber) => {
    // Check if it's a session object (has logoutTime property) or a number
    if (sessionOrNumber && typeof sessionOrNumber === 'object' && sessionOrNumber.hasOwnProperty('logoutTime')) {
      const session = sessionOrNumber;
      if (!session.logoutTime) {
        // Active session - show current running duration
        const currentDuration = session.currentDuration || Math.round((new Date() - new Date(session.loginTime)) / 60000);
        if (currentDuration < 1) return '< 1m';
        const hours = Math.floor(currentDuration / 60);
        const mins = currentDuration % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      }
      // Completed session - show actual duration
      const minutes = session.duration || 0;
      if (minutes === 0) return '0m';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    // It's a number (plain duration value)
    const minutes = sessionOrNumber || 0;
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#f44336',
      hr: '#9c27b0',
      noc_engineer: '#2196f3'
    };
    return colors[role] || '#757575';
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Session Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Track user login activity and system usage
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button 
          variant="contained" 
          onClick={handleFilter}
          startIcon={<RefreshIcon />}
        >
          Apply Filter
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary">Total Sessions</Typography>
                </Box>
                <Typography variant="h3">{stats.totalSessions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary">Active Users</Typography>
                </Box>
                <Typography variant="h3">{stats.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimerIcon color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary">Avg. Duration</Typography>
                </Box>
                <Typography variant="h3">{formatDuration(stats.averageDuration)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {stats && stats.mostActiveUsers && stats.mostActiveUsers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Most Active Users
          </Typography>
          <Grid container spacing={2}>
            {stats.mostActiveUsers.map((user, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{user.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.department}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Chip 
                        label={`${user.sessionCount} sessions`} 
                        size="small" 
                        color="primary"
                      />
                      <Typography variant="body2">
                        {formatDuration(user.totalDuration)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Typography variant="h5" gutterBottom>
        Session History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Login Time</TableCell>
              <TableCell>Logout Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow 
                key={session._id}
                sx={{ 
                  backgroundColor: !session.logoutTime ? 'rgba(76, 175, 80, 0.08)' : 'inherit',
                  '&:hover': { backgroundColor: !session.logoutTime ? 'rgba(76, 175, 80, 0.12)' : 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={!session.logoutTime ? 600 : 400}>
                    {session.user?.fullName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.user?.username}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={session.user?.role} 
                    size="small"
                    sx={{ 
                      bgcolor: getRoleColor(session.user?.role),
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </TableCell>
                <TableCell>{session.user?.department || '-'}</TableCell>
                <TableCell>{formatDateTime(session.loginTime)}</TableCell>
                <TableCell>
                  {session.logoutTime ? (
                    formatDateTime(session.logoutTime)
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontWeight={!session.logoutTime ? 600 : 400}
                    color={!session.logoutTime ? 'success.main' : 'text.primary'}
                  >
                    {formatDuration(session)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {!session.logoutTime ? (
                    <Chip 
                      label="Active" 
                      size="small" 
                      color="success" 
                      icon={<TimerIcon />}
                    />
                  ) : (
                    <Chip 
                      label="Completed" 
                      size="small" 
                      color="default" 
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>{session.ipAddress || '-'}</TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No sessions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default HRDashboard;
