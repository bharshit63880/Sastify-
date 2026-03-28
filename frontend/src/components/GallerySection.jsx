import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const images = [
  '/gallery1.jpg',
  '/gallery2.jpg',
  '/gallery3.jpg',
  '/gallery4.jpg',
  '/gallery5.jpg',
  '/gallery6.jpg',
];

const GallerySection = () => (
  <Box sx={{ my: 6, px: { xs: 1, sm: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
    <Typography variant="h4" fontWeight={800} textAlign="center" mb={3} sx={{
      background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      Gallery
    </Typography>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' },
        gap: 3,
        justifyItems: 'center',
        alignItems: 'stretch',
        width: '100%',
      }}
    >
      {images.map((img, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.07, boxShadow: '0 8px 32px 0 rgba(107,70,193,0.18)' }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', width: '100%' }}
        >
          <img src={img} alt={`gallery-${i}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
        </motion.div>
      ))}
    </Box>
  </Box>
);

export default GallerySection;
