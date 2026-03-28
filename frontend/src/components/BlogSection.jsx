import React from 'react';
import { Box, Grid, Typography, Card, CardContent, CardMedia, Button } from '@mui/material';
import { motion } from 'framer-motion';

const blogs = [
  {
    image: '/blog1.jpg',
    title: '5 Tips for Smart Online Shopping',
    desc: 'Discover how to save money and shop safely with these essential online shopping tips.',
    link: '#'
  },
  {
    image: '/blog2.jpg',
    title: 'Latest Fashion Trends 2024',
    desc: 'Stay ahead of the curve with our guide to the hottest fashion trends this year.',
    link: '#'
  },
  {
    image: '/blog3.jpg',
    title: 'How to Choose the Best Gadgets',
    desc: 'A quick guide to picking the right gadgets for your needs and budget.',
    link: '#'
  },
];

const BlogSection = () => (
  <Box sx={{ my: 6 }}>
    <Typography variant="h4" fontWeight={800} textAlign="center" mb={3} sx={{
      background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      Latest Blogs
    </Typography>
    <Grid container spacing={3} justifyContent="center">
      {blogs.map((blog, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(107,70,193,0.18)' }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ borderRadius: 18, overflow: 'hidden', background: '#fff' }}
          >
            <Card sx={{ borderRadius: 3, background: 'transparent', boxShadow: 'none', height: '100%' }}>
              <CardMedia
                component="img"
                height="180"
                image={blog.image}
                alt={blog.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>{blog.title}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>{blog.desc}</Typography>
                <Button variant="outlined" href={blog.link} sx={{ borderRadius: 2, textTransform: 'none' }}>Read More</Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default BlogSection;
