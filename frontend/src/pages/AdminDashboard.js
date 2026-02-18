import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  Button
} from '@mui/material';
import { 
  QuestionAnswer as QuestionIcon,
  People as PeopleIcon,
  Assessment as SessionIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome, {user?.fullName}. Manage the NOC FAQs system.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardActionArea onClick={() => navigate('/manage-questions')}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <QuestionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6">Manage Questions</Typography>
                <Typography variant="body2" color="text.secondary">
                  Add, edit, or delete FAQ entries
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardActionArea onClick={() => navigate('/manage-users')}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <PeopleIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6">Manage Users</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create and manage user accounts
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardActionArea onClick={() => navigate('/hr-dashboard')}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <SessionIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6">Session Reports</Typography>
                <Typography variant="body2" color="text.secondary">
                  View user activity and usage stats
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardActionArea onClick={() => navigate('/questions')}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <QuestionIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6">View FAQs</Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse all FAQ entries
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/manage-questions?action=create')}
          >
            Add New Question
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/manage-users')}
          >
            Add New User
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
