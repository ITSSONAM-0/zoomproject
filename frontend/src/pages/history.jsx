import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const history = await getHistoryOfUser();
                setMeetings(history || []);
            } catch (error) {
                console.error('Error fetching history:', error);
                setMeetings([]);
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown Date';
        
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch {
            return 'Invalid Date';
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '20px' }}>
                <IconButton onClick={() => navigate("/home")}>
                    <HomeIcon />
                </IconButton>
                <Typography>Loading history...</Typography>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <IconButton onClick={() => navigate("/home")}>
                <HomeIcon />
            </IconButton>
            
            <Typography variant="h5" gutterBottom>
                Meeting History
            </Typography>

            {meetings.length === 0 ? (
                <Typography variant="h6" color="textSecondary" style={{ textAlign: 'center', marginTop: '50px' }}>
                    No meeting history found
                </Typography>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {meetings.map((meeting, index) => (
                        // ✅ REMOVED UNNECESSARY FRAGMENT - Directly return Card
                        <Card key={meeting.meetingCode || index} variant="outlined" style={{ padding: '15px' }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    Code: {meeting.meetingCode || 'N/A'}
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    Date: {formatDate(meeting.date)}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button 
                                    size="small" 
                                    variant="contained"
                                    onClick={() => navigate(`/${meeting.meetingCode}`)}
                                >
                                    Join Again
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}