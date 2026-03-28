import React from 'react';
import { Stack, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// If you have a Lottie animation, you can import and use it here
// import Lottie from 'lottie-react';
// import successAnim from '../../../assets/success.json';

const confettiColors = ['#6B46C1', '#FFB6B9', '#4ade80', '#facc15', '#60a5fa'];

function Confetti() {
  // Simple animated confetti using framer-motion
  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 200, pointerEvents: 'none', zIndex: 1 }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -40, x: Math.random() * 400 - 200, opacity: 0.8, rotate: 0 }}
          animate={{ y: 200 + Math.random() * 40, x: Math.random() * 400 - 200, opacity: 0.9, rotate: 360 }}
          transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() * 1.5 }}
          style={{
            position: 'absolute',
            left: '50%',
            width: 14,
            height: 14,
            borderRadius: 4,
            background: confettiColors[i % confettiColors.length],
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
        />
      ))}
    </Box>
  );
}

const OrderSuccess = () => {
  return (
    <Stack width="100vw" height="100vh" justifyContent="center" alignItems="center" sx={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%)', position: 'relative', overflow: 'hidden' }}>
      <Confetti />
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
        style={{ zIndex: 2, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', position: 'relative' }}
      >
        <Stack
          sx={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            borderRadius: 6,
            p: 5,
            width: { xs: '95vw', sm: '400px' },
            boxShadow: '0 8px 32px rgba(107, 70, 193, 0.13)',
            alignItems: 'center',
            margin: 'auto',
            position: 'relative',
          }}
          spacing={4}
        >
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            {/* You can use Lottie here for a checkmark animation if you want */}
            <CheckCircleIcon sx={{ fontSize: 80, color: '#4ade80', mb: 1 }} />
          </motion.div>
          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              mb: 1,
              textAlign: 'center',
            }}
          >
            Order Placed!
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(0,0,0,0.7)', textAlign: 'center' }}>
            Thank you for shopping with us. Your order was placed successfully.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
              boxShadow: '0 4px 15px rgba(107, 70, 193, 0.13)',
              '&:hover': {
                background: 'linear-gradient(90deg, #5a3ba3, #ffb6b9)',
              },
            }}
          >
            Continue Shopping
          </Button>
        </Stack>
      </motion.div>
    </Stack>
  );
};

export default OrderSuccess;
