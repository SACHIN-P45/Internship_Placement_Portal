// Seed script — creates sample admin, placementHead, students, company, jobs, and applications
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Existing data cleared.');

    // -------- Create Admin --------
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@portal.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin created: admin@portal.com / admin123');

    // -------- Create Placement Head --------
    const placementHead = await User.create({
      name: 'Dr. Placement Officer',
      email: 'placementhead@test.com',
      password: 'placement123',
      role: 'placementHead',
      department: 'Placement Cell',
    });
    console.log('Placement Head created: placementhead@test.com / placement123');

    // -------- Create Students --------
    const student1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@student.com',
      password: 'student123',
      role: 'student',
      department: 'Computer Science',
      cgpa: 8.5,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@student.com',
      password: 'student123',
      role: 'student',
      department: 'Information Technology',
      cgpa: 9.0,
      skills: ['Python', 'Django', 'Machine Learning', 'SQL'],
    });

    const student3 = await User.create({
      name: 'Amit Kumar',
      email: 'amit@student.com',
      password: 'student123',
      role: 'student',
      department: 'Electronics',
      cgpa: 7.8,
      skills: ['C++', 'Embedded Systems', 'IoT', 'Arduino'],
    });
    console.log('3 Students created');

    // -------- Create Companies --------
    const company1 = await User.create({
      name: 'TechCorp HR',
      email: 'hr@techcorp.com',
      password: 'company123',
      role: 'company',
      companyName: 'TechCorp Solutions',
      website: 'https://techcorp.example.com',
      description: 'A leading software development company specializing in web and mobile applications.',
      isApproved: true,
    });

    const company2 = await User.create({
      name: 'DataSoft HR',
      email: 'hr@datasoft.com',
      password: 'company123',
      role: 'company',
      companyName: 'DataSoft Analytics',
      website: 'https://datasoft.example.com',
      description: 'Data analytics and AI solutions provider.',
      isApproved: true,
    });

    // Pending company (not yet approved)
    await User.create({
      name: 'NewStartup HR',
      email: 'hr@newstartup.com',
      password: 'company123',
      role: 'company',
      companyName: 'NewStartup Inc.',
      website: 'https://newstartup.example.com',
      description: 'An innovative startup in the fintech space.',
      isApproved: false,
    });
    console.log('3 Companies created (2 approved, 1 pending)');

    // -------- Create Jobs --------
    const job1 = await Job.create({
      title: 'Full Stack Developer Intern',
      description:
        'Join our team as a Full Stack Developer Intern. You will work on building modern web applications using React, Node.js, and MongoDB. Great learning opportunity with mentorship from senior developers.',
      company: company1._id,
      companyName: 'TechCorp Solutions',
      type: 'internship',
      location: 'Bangalore',
      salary: '₹15,000/month',
      package: 1.8,
      skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      eligibilityCGPA: 7.0,
      deadline: new Date('2026-04-30'),
    });

    const job2 = await Job.create({
      title: 'Data Analyst',
      description:
        'We are looking for a Data Analyst to join our analytics team. The ideal candidate will have strong SQL skills and experience with Python for data analysis.',
      company: company2._id,
      companyName: 'DataSoft Analytics',
      type: 'job',
      location: 'Hyderabad',
      salary: '₹6,00,000/year',
      package: 6.0,
      skillsRequired: ['Python', 'SQL', 'Machine Learning', 'Tableau'],
      eligibilityCGPA: 8.0,
      deadline: new Date('2026-05-15'),
    });

    const job3 = await Job.create({
      title: 'Frontend Developer',
      description:
        'Looking for a skilled Frontend Developer proficient in React.js and modern CSS frameworks. You will be responsible for building responsive and performant user interfaces.',
      company: company1._id,
      companyName: 'TechCorp Solutions',
      type: 'job',
      location: 'Remote',
      salary: '₹8,00,000/year',
      package: 8.0,
      skillsRequired: ['React', 'Tailwind CSS', 'TypeScript', 'REST APIs'],
      eligibilityCGPA: 7.5,
      deadline: new Date('2026-06-01'),
    });

    const job4 = await Job.create({
      title: 'Machine Learning Intern',
      description:
        'Exciting opportunity to work on cutting-edge ML projects. You will be building and deploying machine learning models for real-world applications.',
      company: company2._id,
      companyName: 'DataSoft Analytics',
      type: 'internship',
      location: 'Pune',
      salary: '₹20,000/month',
      package: 2.4,
      skillsRequired: ['Python', 'TensorFlow', 'Machine Learning', 'Statistics'],
      eligibilityCGPA: 8.5,
      deadline: new Date('2026-04-15'),
    });
    console.log('4 Jobs created');

    // -------- Create Applications --------
    await Application.create({
      job: job1._id,
      student: student1._id,
      resume: '/uploads/sample-resume.pdf',
      status: 'shortlisted',
    });

    await Application.create({
      job: job2._id,
      student: student2._id,
      resume: '/uploads/sample-resume.pdf',
      status: 'selected',
      selectedPackage: 6.0,
    });

    await Application.create({
      job: job3._id,
      student: student1._id,
      resume: '/uploads/sample-resume.pdf',
      status: 'selected',
      selectedPackage: 8.0,
    });

    await Application.create({
      job: job1._id,
      student: student3._id,
      resume: '/uploads/sample-resume.pdf',
      status: 'applied',
    });

    await Application.create({
      job: job4._id,
      student: student2._id,
      resume: '/uploads/sample-resume.pdf',
      status: 'applied',
    });
    console.log('5 Applications created');

    console.log('\n========= SEED COMPLETE =========');
    console.log('Login Credentials:');
    console.log('  Admin:          admin@portal.com         / admin123');
    console.log('  Placement Head: placementhead@test.com   / placement123');
    console.log('  Student:        rahul@student.com        / student123');
    console.log('  Student:        priya@student.com        / student123');
    console.log('  Student:        amit@student.com         / student123');
    console.log('  Company:        hr@techcorp.com          / company123');
    console.log('  Company:        hr@datasoft.com          / company123');
    console.log('  Company (Pending): hr@newstartup.com     / company123');
    console.log('=================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
