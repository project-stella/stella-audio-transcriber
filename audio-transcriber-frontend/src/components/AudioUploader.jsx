import { useState } from 'react';
import axios from 'axios';
import {
    Box,
    CircularProgress,
    Typography,
    Button,
    Paper,
    Container,
    Snackbar,
    Alert,
    IconButton,
} from '@mui/material';
import { Upload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/ogg'];

const AudioUploader = () => {
    const [file, setFile] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
        },
        onDrop: (acceptedFiles, rejectedFiles) => {
            if (rejectedFiles.length > 0) {
                setError('Invalid file. Please upload a valid audio file (MP3, WAV, M4A, or OGG) under 10MB.');
                setOpenSnackbar(true);
                return;
            }

            const selectedFile = acceptedFiles[0];

            // Additional Validation
            if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
                setError('Unsupported file type. Please upload MP3, WAV, M4A, or OGG.');
                setOpenSnackbar(true);
                return;
            }

            if (selectedFile.size > MAX_FILE_SIZE) {
                setError('File is too large. Maximum size allowed is 10MB.');
                setOpenSnackbar(true);
                return;
            }

            setFile(selectedFile);
        },
    });

    const handleUpload = async () => {
        if (!file) {
            setError('Please select an audio file to upload.');
            setOpenSnackbar(true);
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8080/api/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setTranscription(response.data);
        } catch (err) {
            console.error('Error transcribing audio.', err);
            setError('An error occurred during transcription.');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="h3" gutterBottom>
                    Audio to Text Transcriber
                </Typography>
                <Paper
                    {...getRootProps()}
                    sx={{
                        p: 4,
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        cursor: 'pointer',
                        backgroundColor: 'background.paper',
                        '&:hover': {
                            borderColor: 'primary.main',
                        },
                    }}
                >
                    <input {...getInputProps()} />
                    <UploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Drag and drop an audio file here, or click to select a file
                    </Typography>
                    {file && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                    )}
                </Paper>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={loading || !file}
                    sx={{ mt: 3 }}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Transcribing...' : 'Upload and Transcribe'}
                </Button>
                {transcription && !loading && (
                    <Paper sx={{ mt: 4, p: 3, backgroundColor: 'background.paper' }}>
                        <Typography variant="h6" gutterBottom>
                            Transcription Result:
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {transcription}
                        </Typography>
                    </Paper>
                )}
            </Box>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="error"
                    action={
                        <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AudioUploader;