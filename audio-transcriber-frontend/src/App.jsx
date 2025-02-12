import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AudioUploader from './components/AudioUploader';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AudioUploader />
        </ThemeProvider>
    );
}

export default App;