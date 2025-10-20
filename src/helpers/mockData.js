// src/helpers/mockData.js
export function getPageData(page = 1, perPage = 6) {
    const allCourses = [{
            id: 1,
            thumbnail_url: '/img/course/course-1.webp',
            category: 'Web Development',
            price: 499000,
            title: 'Node.js for Beginners',
            short_desc: 'Learn how to build scalable web applications using Node.js and Express.',
        },
        {
            id: 2,
            thumbnail_url: '/img/course/course-2.webp',
            category: 'Frontend',
            price: 399000,
            title: 'Mastering ReactJS',
            short_desc: 'Understand React hooks, state management, and build interactive UIs.',
        },
        {
            id: 3,
            thumbnail_url: '/img/course/course-3.webp',
            category: 'Data Science',
            price: 599000,
            title: 'Python for Data Analysis',
            short_desc: 'Hands-on learning with Pandas, NumPy, and data visualization tools.',
        },
        {
            id: 4,
            thumbnail_url: '/img/course/course-2.webp',
            category: 'AI & Machine Learning',
            price: 799000,
            title: 'Machine Learning Essentials',
            short_desc: 'Get started with ML concepts, algorithms, and hands-on projects.',
        },
        {
            id: 5,
            thumbnail_url: '/img/course/course-3.webp',
            category: 'Backend',
            price: 459000,
            title: 'ExpressJS Deep Dive',
            short_desc: 'Advanced backend techniques with Express middleware and REST APIs.',
        },
        {
            id: 6,
            thumbnail_url: '/img/course/course-1.webp',
            category: 'Mobile Development',
            price: 699000,
            title: 'Flutter from Zero to Hero',
            short_desc: 'Learn to build beautiful mobile apps for iOS and Android.',
        },
        {
            id: 7,
            thumbnail_url: '/img/course/course-2.webp',
            category: 'Cybersecurity',
            price: 899000,
            title: 'Ethical Hacking Basics',
            short_desc: 'Introduction to penetration testing and network security.',
        },
        {
            id: 8,
            thumbnail_url: '/img/course/course-3.webp',
            category: 'UI/UX Design',
            price: 379000,
            title: 'Figma Essentials',
            short_desc: 'Learn to design modern user interfaces using Figma.',
        },
        {
            id: 9,
            thumbnail_url: '/img/course/course-2.webp',
            category: 'Database',
            price: 499000,
            title: 'Mastering SQL',
            short_desc: 'Learn to query, join, and manage relational databases efficiently.',
        },
        {
            id: 10,
            thumbnail_url: '/img/course/course-3.webp',
            category: 'DevOps',
            price: 849000,
            title: 'Docker & Kubernetes',
            short_desc: 'Learn to containerize applications and deploy with Kubernetes.',
        },
        {
            id: 11,
            thumbnail_url: '/img/course/course-1.webp',
            category: 'Cloud Computing',
            price: 999000,
            title: 'AWS Fundamentals',
            short_desc: 'Get started with AWS services, EC2, S3, and Lambda.',
        },
        {
            id: 12,
            thumbnail_url: '/img/course/course-1.webp',
            category: 'Game Development',
            price: 749000,
            title: 'Unity Game Developer',
            short_desc: 'Learn to build 2D/3D games with Unity and C#.',
        }
    ];

    const totalPages = Math.ceil(allCourses.length / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const courses = allCourses.slice(start, end);

    const pages = Array.from({ length: totalPages }, (_, i) => ({
        value: i + 1,
        isCurrent: i + 1 === page
    }));

    return {
        courses,
        pagination: {
            currentPage: page,
            totalPages,
            pages
        }
    };
}