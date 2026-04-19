import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';


const defaultTheme = createTheme({
    palette: {
        primary: {
            main: '#24232cff',
        },
        secondary: {
            main: '#52476dff',
        },
    },
});

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");

    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)


    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    React.useEffect(() => {
        // Load particles.js script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        script.async = true;
        script.onload = () => {
            // Initialize particles after script loads
            if (window.particlesJS) {
                window.particlesJS('particles-js', {
                    particles: {
                        number: { value: 80, density: { enable: true, value_area: 800 } },
                        color: { value: "#ffffff" },
                        opacity: { value: 0.5 },
                        size: { value: 3 },
                        line_linked: {
                            enable: true,
                            distance: 150,
                            color: "#ffffff",
                            opacity: 0.4,
                            width: 1
                        },
                        move: { enable: true, speed: 2 }
                    }
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup script on unmount
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                let result = await handleLogin(username, password)
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {
            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }


    return (
        <ThemeProvider theme={defaultTheme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f0f0f',
                    padding: 2,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <CssBaseline />
                
                {/* Particles Background */}
                <div 
                    id="particles-js" 
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        zIndex: 0
                    }}
                />

                <Paper
                    elevation={24}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: 450,
                        width: '100%',
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        position: 'relative',
                        zIndex: 10,
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                        <LockOutlinedIcon sx={{ fontSize: 32 }} />
                    </Avatar>

                    <Box sx={{ mt: 2, mb: 3, display: 'flex', gap: 1 }}>
                        <Button 
                            variant={formState === 0 ? "contained" : "outlined"} 
                            onClick={() => { setFormState(0) }}
                            sx={{ 
                                px: 4, 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '16px',
                            }}
                        >
                            Sign In
                        </Button>
                        <Button 
                            variant={formState === 1 ? "contained" : "outlined"} 
                            onClick={() => { setFormState(1) }}
                            sx={{ 
                                px: 4, 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '16px',
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>

                    <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                        {formState === 1 && (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="fullname"
                                label="Full Name"
                                name="fullname"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            value={username}
                            autoFocus={formState === 0}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            value={password}
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />

                        {error && (
                            <Box 
                                sx={{ 
                                    mt: 2, 
                                    p: 2, 
                                    bgcolor: '#fee2e2', 
                                    borderRadius: 2,
                                    color: '#dc2626',
                                    fontSize: '14px'
                                }}
                            >
                                {error}
                            </Box>
                        )}

                        <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            sx={{ 
                                mt: 3, 
                                mb: 2, 
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '16px',
                                fontWeight: 600,
                                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.6)',
                                }
                            }}
                            onClick={handleAuth}
                        >
                            {formState === 0 ? "Login" : "Register"}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
            />

        </ThemeProvider>
    )}