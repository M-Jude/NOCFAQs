import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [statsRes, sessionsRes] = await Promise.all([
        axios.get(`/api/sessions/stats?${params.toString()}`),
        axios.get(`/api/sessions?${params.toString()}&limit=20`)
      ]);

      setStats(statsRes.data);
      setSessions(sessionsRes.data.sessions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleFilter = () => {
    fetchData();
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'Active';
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
        Recent Sessions
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
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session._id}>
                <TableCell>{session.user?.fullName}</TableCell>
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
                  {session.logoutTime ? formatDateTime(session.logoutTime) : (
                    <Chip label="Active" size="small" color="success" />
                  )}
                </TableCell>
                <TableCell>{formatDuration(session.duration)}</TableCell>
                <TableCell>{session.ipAddress || '-'}</TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
