import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Chip,
  Paper,
  Button,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`/api/questions/${id}`);
        setQuestion(response.data);
      } catch (error) {
        console.error('Error fetching question:', error);
        navigate('/questions');
      }
      setLoading(false);
    };

    fetchQuestion();
  }, [id, navigate]);

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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <Box>
      <Button 
        startIcon={<BackIcon />} 
        onClick={() => navigate('/questions')}
        sx={{ mb: 2 }}
      >
        Back to Questions
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Chip 
              label={question.category} 
              sx={{ 
                bgcolor: getCategoryColor(question.category),
                color: 'white',
                textTransform: 'capitalize',
                mb: 2
              }}
            />
            <Typography variant="h4" gutterBottom>
              {question.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
            <ViewIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{question.views} views</Typography>
          </Box>
        </Box>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Problem
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fff3e0' }}>
          <Typography variant="body1">
            {question.question}
          </Typography>
        </Paper>

        <Typography variant="h6" color="text.secondary" gutterBottom>
          Solution
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#e8f5e9' }}>
          <Typography 
            variant="body1" 
            component="pre"
            sx={{ 
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              m: 0
            }}
          >
            {question.solution}
          </Typography>
        </Paper>

        {question.tags && question.tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {question.tags.map((tag, idx) => (
                <Chip key={idx} label={tag} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
          <Typography variant="body2">
            Created: {formatDate(question.createdAt)}
          </Typography>
          {question.updatedAt && question.updatedAt !== question.createdAt && (
            <Typography variant="body2">
              Updated: {formatDate(question.updatedAt)}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default QuestionDetail;
