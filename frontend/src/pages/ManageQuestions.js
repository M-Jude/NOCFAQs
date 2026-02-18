import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';

const ManageQuestions = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    solution: '',
    category: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
    if (searchParams.get('action') === 'create') {
      handleOpenDialog();
    }
  }, [searchParams]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/questions?limit=100');
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
    setLoading(false);
  };

  const handleOpenDialog = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        title: question.title,
        question: question.question,
        solution: question.solution,
        category: question.category,
        tags: question.tags?.join(', ') || ''
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        title: '',
        question: '',
        solution: '',
        category: '',
        tags: ''
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setError('');
    if (searchParams.get('action')) {
      navigate('/manage-questions');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.question || !formData.solution || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingQuestion) {
        await axios.put(`/api/questions/${editingQuestion._id}`, payload);
        setSuccess('Question updated successfully');
      } else {
        await axios.post('/api/questions', payload);
        setSuccess('Question created successfully');
      }

      fetchQuestions();
      handleCloseDialog();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/questions/${deleteConfirm}`);
      setSuccess('Question deleted successfully');
      setDeleteConfirm(null);
      fetchQuestions();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Manage Questions
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Question
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((q) => (
              <TableRow key={q._id}>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {q.title}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={q.category} 
                    size="small"
                    sx={{ 
                      bgcolor: getCategoryColor(q.category),
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </TableCell>
                <TableCell>{q.views}</TableCell>
                <TableCell>
                  {new Date(q.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/questions/${q._id}`)} size="small">
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDialog(q)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setDeleteConfirm(q._id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {questions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No questions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Problem/Question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
            />
            <TextField
              label="Solution"
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              fullWidth
              required
              multiline
              rows={4}
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
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
            <TextField
              label="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              fullWidth
              placeholder="e.g., vpn, connection, network"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingQuestion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this question? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageQuestions;
