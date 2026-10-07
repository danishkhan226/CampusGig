import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Service from '../models/Service.js';
import { connectDB } from '../config/db.js';

const SAMPLE_USERS = [
  {
    name: 'Danish Khan',
    email: 'danish.khan@dtu.ac.in',
    password: 'Password@123',
    collegeName: 'Delhi Technological University',
    collegeEmail: 'danish.khan@dtu.ac.in',
    isVerifiedStudent: true,
    bio: 'Full-stack React & Node.js developer. Won Smart India Hackathon 2025. Built web apps for 15+ student startups.',
    skills: ['React.js', 'Node.js', 'Tailwind CSS', 'MongoDB', 'Next.js'],
    education: 'B.Tech Software Engineering, 4th Year',
    portfolioLinks: ['https://github.com/danishkhan', 'https://danish.dev'],
    profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    totalReviews: 24,
    completedOrders: 28
  },
  {
    name: 'Ananya Verma',
    email: 'ananya.v@iitd.ac.in',
    password: 'Password@123',
    collegeName: 'IIT Delhi',
    collegeEmail: 'ananya.v@iitd.ac.in',
    isVerifiedStudent: true,
    bio: 'UI/UX Designer specializing in Figma design systems, mobile app wireframes, and SaaS interfaces.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Wireframing', 'Prototyping'],
    education: 'B.Des Design, 3rd Year',
    portfolioLinks: ['https://behance.net/ananyaverma', 'https://ananya.design'],
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 5.0,
    totalReviews: 19,
    completedOrders: 22
  },
  {
    name: 'Rahul Nair',
    email: 'rahul.nair@bits-pilani.ac.in',
    password: 'Password@123',
    collegeName: 'BITS Pilani',
    collegeEmail: 'rahul.nair@bits-pilani.ac.in',
    isVerifiedStudent: true,
    bio: 'Python, ML, and Data Analysis specialist. Experienced with pandas, PyTorch, statistical modelling, and research paper summaries.',
    skills: ['Python', 'Data Analysis', 'Machine Learning', 'Pandas', 'SQL'],
    education: 'M.Sc (Tech) Computer Science, 2nd Year',
    portfolioLinks: ['https://github.com/rahulnair-ds'],
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    totalReviews: 12,
    completedOrders: 15
  },
  {
    name: 'Sneha Patel',
    email: 'sneha.patel@nitt.edu',
    password: 'Password@123',
    collegeName: 'NIT Trichy',
    collegeEmail: 'sneha.patel@nitt.edu',
    isVerifiedStudent: false,
    bio: 'Content writer and ATS-friendly resume creator. Helped 80+ seniors land placement interviews with polished resumes.',
    skills: ['Resume Design', 'Content Writing', 'Copywriting', 'Technical Writing'],
    education: 'B.Tech Electrical Engineering, Final Year',
    portfolioLinks: ['https://medium.com/@snehawrites'],
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    totalReviews: 31,
    completedOrders: 35
  },
  {
    name: 'Arjun Sen',
    email: 'arjun.sen@vit.ac.in',
    password: 'Password@123',
    collegeName: 'VIT Vellore',
    collegeEmail: 'arjun.sen@vit.ac.in',
    isVerifiedStudent: true,
    bio: 'Video editor and motion graphics creator for YouTube, Reels, and campus fest promotions using Premiere Pro & After Effects.',
    skills: ['Video Editing', 'Premiere Pro', 'After Effects', 'Reels Editing', 'Color Grading'],
    education: 'B.Tech Information Technology, 3rd Year',
    portfolioLinks: ['https://youtube.com/@arjunedits'],
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    totalReviews: 16,
    completedOrders: 18
  }
];

const SAMPLE_SERVICES = [
  {
    userEmail: 'danish.khan@dtu.ac.in',
    title: 'Modern Responsive React & Tailwind Website Development',
    description: 'I will build a high-performance, modern responsive website using React.js, Vite, and Tailwind CSS. Perfect for student portfolios, startup landing pages, hackathon submissions, and college club events. Includes clean modular code, responsive layout across mobile and desktop, fast load times, and deployment guidance on Vercel/Netlify.',
    category: 'Development',
    skills: ['React.js', 'Tailwind CSS', 'JavaScript', 'Responsive Design'],
    price: 999,
    deliveryDays: 3,
    images: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80'],
    requirements: 'Please provide wireframes or design references (Figma/images) and desired content or branding colors.',
    rating: 4.9,
    reviewCount: 24,
    ordersCount: 28
  },
  {
    userEmail: 'ananya.v@iitd.ac.in',
    title: 'Clean Figma UI/UX Design for Web and Mobile Apps',
    description: 'Transform your idea or project wireframes into an industry-grade, clean Figma UI design. Complete with modern typography, cohesive color palette, reusable component library, and interactive prototype ready for developers. Great for capstone projects, placement portfolios, and startup pitch decks.',
    category: 'Design',
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'Mobile App Design'],
    price: 799,
    deliveryDays: 2,
    images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80'],
    requirements: 'Describe your app idea, target users, core features, and any competitor apps you admire.',
    rating: 5.0,
    reviewCount: 19,
    ordersCount: 22
  },
  {
    userEmail: 'sneha.patel@nitt.edu',
    title: 'ATS-Friendly Placement Resume & LinkedIn Profile Overhaul',
    description: 'Get your resume redesigned and optimized to pass Applicant Tracking Systems (ATS) for campus placements and off-campus tech internships. Includes quantifiable bullet points, impactful action verbs, clean single-page format, and tailored advice for software engineering, product, or consulting roles.',
    category: 'Writing',
    skills: ['Resume Design', 'ATS Optimization', 'Content Writing', 'Career Guidance'],
    price: 499,
    deliveryDays: 1,
    images: ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80'],
    requirements: 'Please share your current resume draft or LinkedIn profile link and target job titles.',
    rating: 4.9,
    reviewCount: 31,
    ordersCount: 35
  },
  {
    userEmail: 'arjun.sen@vit.ac.in',
    title: 'Cinematic Video Editing for Reels, YouTube & College Events',
    description: 'Dynamic, fast-paced video editing with smooth transitions, trending audio synchronization, engaging subtitles/captions, sound design, and color grading. Ideal for college club fests, technical trailers, YouTube tutorials, and Instagram Reels.',
    category: 'Video',
    skills: ['Video Editing', 'Premiere Pro', 'Subtitles', 'Motion Graphics'],
    price: 650,
    deliveryDays: 2,
    images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'],
    requirements: 'Provide raw video footage via Google Drive / Dropbox link and your preferred audio track or style reference.',
    rating: 4.7,
    reviewCount: 16,
    ordersCount: 18
  },
  {
    userEmail: 'rahul.nair@bits-pilani.ac.in',
    title: 'Python Data Analysis & Jupyter Notebook Modeling',
    description: 'End-to-end data analysis, data cleaning, statistical modeling, and interactive visualization using Python, Pandas, Matplotlib, and Seaborn. Complete Jupyter Notebook with thoroughly documented code comments. Perfect for academic assignments, semester projects, and research studies.',
    category: 'Data',
    skills: ['Python', 'Pandas', 'Data Analysis', 'Jupyter', 'Data Visualization'],
    price: 1200,
    deliveryDays: 3,
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'],
    requirements: 'Please upload the dataset file (CSV/JSON/Excel) and exact project problem statement.',
    rating: 4.8,
    reviewCount: 12,
    ordersCount: 15
  },
  {
    userEmail: 'danish.khan@dtu.ac.in',
    title: 'Full-Stack MERN Application with REST APIs & Auth',
    description: 'Complete full-stack web application development using MongoDB, Express.js, React, and Node.js. Includes secure JWT authentication, CRUD functionality, clean database schemas, and responsive UI. Ideal for final year college capstone projects and production MVPs.',
    category: 'Development',
    skills: ['MERN Stack', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    price: 3499,
    deliveryDays: 5,
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'],
    requirements: 'Detailed project specification, expected features, and database requirements.',
    rating: 5.0,
    reviewCount: 8,
    ordersCount: 10
  },
  {
    userEmail: 'ananya.v@iitd.ac.in',
    title: 'Professional Pitch Deck & Seminar Presentation Design',
    description: 'Custom PowerPoint and Canva presentation design with clean graphics, charts, iconography, and structured storytelling. Turn boring bullet points into captivating visual slides for startup pitches, classroom seminars, and technical defense presentations.',
    category: 'Design',
    skills: ['Presentation Design', 'PowerPoint', 'Canva', 'Infographics'],
    price: 550,
    deliveryDays: 1,
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80'],
    requirements: 'Slide content outline or draft presentation, preferred color palette, and university/club logo if any.',
    rating: 4.9,
    reviewCount: 14,
    ordersCount: 16
  },
  {
    userEmail: 'rahul.nair@bits-pilani.ac.in',
    title: 'Programming Help & Debugging in Python, C++, and Java',
    description: 'One-on-one code review, bug fixing, algorithm optimization, and programming assistance in C++, Python, and Java. Step-by-step code explanation so you truly understand the logic for your lab exams and coding assignments.',
    category: 'Academic Projects',
    skills: ['C++', 'Python', 'Java', 'Data Structures', 'Debugging'],
    price: 450,
    deliveryDays: 1,
    images: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'],
    requirements: 'Problem statement, existing code repository/snippet, and compiler error messages.',
    rating: 4.8,
    reviewCount: 22,
    ordersCount: 25
  }
];

export async function seedMarketplace() {
  try {
    await connectDB();

    console.log('[Seed] Seeding sample student freelancers and marketplace gigs...');

    const userMap = {};

    for (const userData of SAMPLE_USERS) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`[Seed] Created user: ${user.name}`);
      } else {
        // Update user fields
        Object.assign(user, userData);
        await user.save();
      }
      userMap[userData.email] = user._id;
    }

    // Check existing services count
    const count = await Service.countDocuments();
    if (count === 0) {
      for (const serviceData of SAMPLE_SERVICES) {
        const sellerId = userMap[serviceData.userEmail];
        if (sellerId) {
          const { userEmail, ...rest } = serviceData;
          await Service.create({
            ...rest,
            sellerId
          });
          console.log(`[Seed] Created gig: ${serviceData.title.substring(0, 35)}...`);
        }
      }
      console.log('[Seed] Sample marketplace gigs seeded successfully!');
    } else {
      console.log(`[Seed] Marketplace already has ${count} services. Skipping gig creation.`);
    }

    console.log('[Seed] Done.');
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
  }
}

// Allow direct CLI execution: node src/utils/seedData.js
if (process.argv[1]?.endsWith('seedData.js')) {
  seedMarketplace().then(() => process.exit(0));
}
