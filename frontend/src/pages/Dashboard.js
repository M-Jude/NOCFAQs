import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon,
  QuestionAnswer as QuestionIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalQuestions: 0, categories: [] });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/questions?limit=100');
        const questions = response.data.questions;
        
        const categoryCount = {};
        questions.forEach(q => {
          categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
        });

        setStats({
          totalQuestions: response.data.total,
          categories: Object.entries(categoryCount).map(([name, count]) => ({ name, count }))
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || searchTerm.length >= 2) {
      navigate(`/questions?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.fullName}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find solutions to common NOC problems
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search for solutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {/* <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <QuestionIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary">Total Solutions</Typography>
              </Box>
              <Typography variant="h3">{stats.totalQuestions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CategoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary">Categories</Typography>
              </Box>
              <Typography variant="h3">{stats.categories.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}

      <Typography variant="h5" gutterBottom>
        Browse by Category
      </Typography>
      <Grid container spacing={2}>
        {stats.categories.map((cat) => (
          <Grid item xs={6} sm={4} md={3} key={cat.name}>
            <Card>
              <CardActionArea onClick={() => navigate(`/questions?category=${cat.name}`)}>
                <CardContent>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {cat.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cat.count} questions
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label="View All FAQs" 
            onClick={() => navigate('/questions')} 
            clickable 
            color="primary"
          />
          <Chip 
            label="Most Recent" 
            onClick={() => navigate('/questions?sort=recent')} 
            clickable 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
