import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  TextField,
  InputAdornment,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';

const Questions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchQuestions();
  }, [searchParams]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      
      if (searchParams.get('search')) {
        params.append('search', searchParams.get('search'));
      }
      if (searchParams.get('category')) {
        params.append('category', searchParams.get('category'));
      }

      const response = await axios.get(`/api/questions?${params.toString()}`);
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set('search', search);
      } else {
        params.delete('search');
      }
      params.delete('category');
      setSearchParams(params);
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    params.delete('search');
    setSearchParams(params);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      network: '#2196f3',
      server: '#4caf50',
      security: '#f44336',
      database: '#9c27b0',
      application: '#ff9800',
      hardware: '#607d8b',
      software: '#00bcd4',
      other: '#795548'
    };
    return colors[cat] || '#757575';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Frequently Asked Questions
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search solutions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="network">Network</MenuItem>
            <MenuItem value="server">Server</MenuItem>
            <MenuItem value="security">Security</MenuItem>
            <MenuItem value="database">Database</MenuItem>
            <MenuItem value="application">Application</MenuItem>
            <MenuItem value="hardware">Hardware</MenuItem>
            <MenuItem value="software">Software</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : questions.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 4 }}>
          No questions found. Try adjusting your search.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {questions.map((q) => (
              <Grid item xs={12} sm={6} md={4} key={q._id}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/questions/${q._id}`)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip 
                          label={q.category} 
                          size="small" 
                          sx={{ 
                            bgcolor: getCategoryColor(q.category),
                            color: 'white',
                            textTransform: 'capitalize'
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <ViewIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">{q.views}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" gutterBottom sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {q.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {q.question}
                      </Typography>
                      {q.tags && q.tags.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {q.tags.slice(0, 3).map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" variant="outlined" />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Questions;
