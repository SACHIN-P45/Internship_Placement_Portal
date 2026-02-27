// Placement Head Controller — dashboard, analytics, job control, reports
// All endpoints require placementHead role authentication
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// ============================================================
// 1) DASHBOARD OVERVIEW
// GET /api/placement-head/dashboard
// Returns aggregate stats: total students, companies, jobs,
// selected students, highest salary, average salary
// ============================================================
exports.getDashboard = async (req, res) => {
    try {
        // Parallel queries for performance
        const [
            totalStudents,
            totalCompanies,
            totalJobs,
            activeJobs,
            salaryStats,
            totalSelected,
            recentSelections,
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'company' }),
            Job.countDocuments(),
            Job.countDocuments({ isActive: true }),
            // MongoDB aggregation: highest + average salary from selected applications
            Application.aggregate([
                { $match: { status: 'selected' } },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'jobData',
                    }
                },
                { $unwind: { path: '$jobData', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                {
                                    $divide: [
                                        {
                                            $cond: [
                                                { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                                { $multiply: ['$parsedPackage', 12] },
                                                '$parsedPackage'
                                            ]
                                        },
                                        100000]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                },
                { $match: { actualPackage: { $gt: 0 } } },
                {
                    $group: {
                        _id: null,
                        highestSalary: { $max: '$actualPackage' },
                        avgSalary: { $avg: '$actualPackage' },
                        totalSelected: { $sum: 1 },
                    },
                },
            ]),
            Application.countDocuments({ status: 'selected' }),
            // Recent 5 selections for quick view
            Application.find({ status: 'selected' })
                .sort({ updatedAt: -1 })
                .limit(5)
                .populate('student', 'name email department')
                .populate('job', 'title companyName package salary'),
        ]);

        const stats = salaryStats[0] || { highestSalary: 0, avgSalary: 0, totalSelected: 0 };

        res.json({
            totalStudents,
            totalCompanies,
            totalJobs,
            activeJobs,
            totalSelected,
            highestSalary: stats.highestSalary,
            avgSalary: Math.round(stats.avgSalary * 100) / 100 || 0,
            recentSelections,
        });
    } catch (error) {
        console.error('[PlacementHead] Dashboard error:', error.message);
        res.status(500).json({ message: 'Failed to load dashboard data' });
    }
};

// ============================================================
// 2) SELECTED STUDENTS
// GET /api/placement-head/selected-students
// Query: ?department=CSE&company=TechCorp&page=1&limit=20
// Returns all students with status 'selected'
// ============================================================
exports.getSelectedStudents = async (req, res) => {
    try {
        const { department, company, page = 1, limit = 20 } = req.query;

        // Build match filter
        const matchFilter = { status: 'selected' };

        // Build pipeline with lookups for filtering
        const pipeline = [
            { $match: matchFilter },
            // Lookup student data
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentData',
                },
            },
            { $unwind: '$studentData' },
            // Lookup job data
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobData',
                },
            },
            { $unwind: '$jobData' },
        ];

        // Filter by department if provided
        if (department) {
            pipeline.push({
                $match: { 'studentData.department': { $regex: department, $options: 'i' } },
            });
        }

        // Filter by company if provided
        if (company) {
            pipeline.push({
                $match: { 'jobData.companyName': { $regex: company, $options: 'i' } },
            });
        }

        // Filter by job type (internship vs job) if provided
        if (req.query.type) {
            pipeline.push({
                $match: { 'jobData.type': req.query.type },
            });
        }

        // Project clean output
        pipeline.push({
            $project: {
                _id: 1,
                status: 1,
                selectedPackage: 1,
                createdAt: 1,
                updatedAt: 1,
                student: {
                    _id: '$studentData._id',
                    name: '$studentData.name',
                    email: '$studentData.email',
                    department: '$studentData.department',
                    cgpa: '$studentData.cgpa',
                    phone: '$studentData.phone',
                },
                job: {
                    _id: '$jobData._id',
                    title: '$jobData.title',
                    companyName: '$jobData.companyName',
                    package: '$jobData.package',
                    salary: '$jobData.salary',
                    type: '$jobData.type',
                    location: '$jobData.location',
                },
            },
        });

        // Sort by selection date (newest first)
        pipeline.push({ $sort: { updatedAt: -1 } });

        // Get total count before pagination
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await Application.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });

        const students = await Application.aggregate(pipeline);

        res.json({
            students,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error('[PlacementHead] Selected students error:', error.message);
        res.status(500).json({ message: 'Failed to fetch selected students' });
    }
};

// ============================================================
// 3) SALARY ANALYTICS
// GET /api/placement-head/salary-analytics
// Returns: highest salary, top 5 students, top company,
// department-wise breakdown
// ============================================================
exports.getSalaryAnalytics = async (req, res) => {
    try {
        const [
            // Top 5 highest salary students
            top5Students,
            // Company offering highest package (aggregation)
            topCompany,
            // Department-wise average salary
            deptSalary,
            // Overall stats
            overallStats,
        ] = await Promise.all([
            // Top 5 highest salary students
            Application.aggregate([
                { $match: { status: 'selected' } },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'jobData',
                    }
                },
                { $unwind: { path: '$jobData', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                {
                                    $divide: [
                                        {
                                            $cond: [
                                                { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                                { $multiply: ['$parsedPackage', 12] },
                                                '$parsedPackage'
                                            ]
                                        },
                                        100000]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                },
                { $match: { actualPackage: { $gt: 0 } } },
                { $sort: { actualPackage: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'student',
                        foreignField: '_id',
                        as: 'studentData',
                    }
                },
                { $unwind: { path: '$studentData', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        selectedPackage: '$actualPackage',
                        job: {
                            _id: '$jobData._id',
                            title: '$jobData.title',
                            companyName: '$jobData.companyName',
                            package: '$jobData.package',
                        },
                        student: {
                            _id: '$studentData._id',
                            name: '$studentData.name',
                            email: '$studentData.email',
                            department: '$studentData.department',
                            cgpa: '$studentData.cgpa',
                        }
                    }
                }
            ]),

            // Aggregation: company with highest average package
            Application.aggregate([
                { $match: { status: 'selected' } },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'jobData',
                    },
                },
                { $unwind: '$jobData' },
                {
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                {
                                    $divide: [
                                        {
                                            $cond: [
                                                { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                                { $multiply: ['$parsedPackage', 12] },
                                                '$parsedPackage'
                                            ]
                                        },
                                        100000]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                },
                { $match: { actualPackage: { $gt: 0 } } },
                {
                    $group: {
                        _id: '$jobData.companyName',
                        avgPackage: { $avg: '$actualPackage' },
                        maxPackage: { $max: '$actualPackage' },
                        totalHired: { $sum: 1 },
                    },
                },
                { $sort: { maxPackage: -1 } },
                { $limit: 10 },
            ]),

            // Department-wise salary analysis
            Application.aggregate([
                { $match: { status: 'selected' } },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'jobData',
                    }
                },
                { $unwind: { path: '$jobData', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                {
                                    $divide: [
                                        {
                                            $cond: [
                                                { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                                { $multiply: ['$parsedPackage', 12] },
                                                '$parsedPackage'
                                            ]
                                        },
                                        100000]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                },
                { $match: { actualPackage: { $gt: 0 } } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'student',
                        foreignField: '_id',
                        as: 'studentData',
                    },
                },
                { $unwind: '$studentData' },
                {
                    $group: {
                        _id: '$studentData.department',
                        avgPackage: { $avg: '$actualPackage' },
                        maxPackage: { $max: '$actualPackage' },
                        minPackage: { $min: '$actualPackage' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { avgPackage: -1 } },
            ]),

            // Overall salary statistics
            Application.aggregate([
                { $match: { status: 'selected' } },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'jobData',
                    }
                },
                { $unwind: { path: '$jobData', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                {
                                    $divide: [
                                        {
                                            $cond: [
                                                { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                                { $multiply: ['$parsedPackage', 12] },
                                                '$parsedPackage'
                                            ]
                                        },
                                        100000]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                },
                { $match: { actualPackage: { $gt: 0 } } },
                {
                    $group: {
                        _id: null,
                        highest: { $max: '$actualPackage' },
                        lowest: { $min: '$actualPackage' },
                        average: { $avg: '$actualPackage' },
                        median: { $avg: '$actualPackage' }, // Approximation
                        total: { $sum: 1 },
                    },
                },
            ]),
        ]);

        res.json({
            overall: overallStats[0] || { highest: 0, lowest: 0, average: 0, total: 0 },
            top5Students,
            topCompanies: topCompany,
            departmentWise: deptSalary,
        });
    } catch (error) {
        console.error('[PlacementHead] Salary analytics error:', error.message);
        res.status(500).json({ message: 'Failed to fetch salary analytics' });
    }
};

// ============================================================
// 4) JOB CONTROL
// PUT /api/placement-head/job/:id/activate
// PUT /api/placement-head/job/:id/deactivate
// ============================================================
exports.activateJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { isActive: true },
            { new: true }
        );
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job activated successfully', job });
    } catch (error) {
        console.error('[PlacementHead] Activate job error:', error.message);
        res.status(500).json({ message: 'Failed to activate job' });
    }
};

exports.deactivateJob = async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json({ message: 'Job deactivated successfully', job });
    } catch (error) {
        console.error('[PlacementHead] Deactivate job error:', error.message);
        res.status(500).json({ message: 'Failed to deactivate job' });
    }
};

// ============================================================
// 5) DEPARTMENT STATS
// GET /api/placement-head/department-stats
// Aggregation: department-wise placement percentage
// ============================================================
exports.getDepartmentStats = async (req, res) => {
    try {
        // Get total students per department
        const deptStudents = await User.aggregate([
            { $match: { role: 'student', department: { $ne: '' } } },
            { $group: { _id: '$department', totalStudents: { $sum: 1 } } },
        ]);

        // Get placed students per department
        const deptPlaced = await Application.aggregate([
            { $match: { status: 'selected' } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentData',
                },
            },
            { $unwind: '$studentData' },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobData',
                }
            },
            { $unwind: { path: '$jobData', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    parsedPackage: {
                        $convert: {
                            input: {
                                $ifNull: [
                                    {
                                        $reduce: {
                                            input: {
                                                $regexFindAll: {
                                                    input: { $ifNull: ['$jobData.salary', '0'] },
                                                    regex: "[0-9]+"
                                                }
                                            },
                                            initialValue: "",
                                            in: { $concat: ["$$value", "$$this.match"] }
                                        }
                                    },
                                    "0"
                                ]
                            },
                            to: "double",
                            onError: 0,
                            onNull: 0
                        }
                    }
                }
            },
            {
                $addFields: {
                    finalPackageLPA: {
                        $cond: [
                            { $gt: ['$parsedPackage', 0] },
                            {
                                $divide: [
                                    {
                                        $cond: [
                                            { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                            { $multiply: ['$parsedPackage', 12] },
                                            '$parsedPackage'
                                        ]
                                    },
                                    100000]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    actualPackage: {
                        $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                    }
                }
            },
            {
                $group: {
                    _id: '$studentData.department',
                    placedCount: { $sum: 1 },
                    avgPackage: { $avg: '$actualPackage' },
                    maxPackage: { $max: '$actualPackage' },
                },
            },
        ]);

        // Merge the two datasets
        const placedMap = {};
        deptPlaced.forEach((d) => {
            placedMap[d._id] = d;
        });

        const stats = deptStudents.map((dept) => {
            const placed = placedMap[dept._id] || { placedCount: 0, avgPackage: 0, maxPackage: 0 };
            return {
                department: dept._id || 'Unspecified',
                totalStudents: dept.totalStudents,
                placedCount: placed.placedCount,
                placementPercentage: dept.totalStudents > 0
                    ? Math.round((placed.placedCount / dept.totalStudents) * 10000) / 100
                    : 0,
                avgPackage: Math.round(placed.avgPackage * 100) / 100 || 0,
                maxPackage: placed.maxPackage || 0,
            };
        });

        // Sort by placement percentage descending
        stats.sort((a, b) => b.placementPercentage - a.placementPercentage);

        res.json(stats);
    } catch (error) {
        console.error('[PlacementHead] Department stats error:', error.message);
        res.status(500).json({ message: 'Failed to fetch department stats' });
    }
};

// ============================================================
// 6) REPORTS
// GET /api/placement-head/reports
// Returns comprehensive placement report (JSON)
// ============================================================
exports.getReports = async (req, res) => {
    try {
        const [
            totalStudents,
            totalCompanies,
            totalJobs,
            totalApplications,
            statusBreakdown,
            deptStats,
            topCompanies,
            monthlyTrend,
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'company' }),
            Job.countDocuments(),
            Application.countDocuments(),

            // Application status breakdown
            Application.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),

            // Department-wise selections
            Application.aggregate([
                { $match: { status: 'selected' } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'student',
                        foreignField: '_id',
                        as: 'studentData',
                    },
                },
                { $unwind: '$studentData' },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'jobData',
                    }
                },
                { $unwind: { path: '$jobData', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                {
                                    $divide: [
                                        {
                                            $cond: [
                                                { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                                { $multiply: ['$parsedPackage', 12] },
                                                '$parsedPackage'
                                            ]
                                        },
                                        100000]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                },
                {
                    $group: {
                        _id: '$studentData.department',
                        count: { $sum: 1 },
                        avgPackage: { $avg: '$actualPackage' },
                    },
                },
                { $sort: { count: -1 } },
            ]),

            // Top hiring companies
            Application.aggregate([
                { $match: { status: 'selected' } },
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'jobData',
                    },
                },
                { $unwind: '$jobData' },
                {
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                {
                                    $divide: [
                                        {
                                            $cond: [
                                                { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                                { $multiply: ['$parsedPackage', 12] },
                                                '$parsedPackage'
                                            ]
                                        },
                                        100000]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                },
                {
                    $group: {
                        _id: '$jobData.companyName',
                        hiredCount: { $sum: 1 },
                        avgPackage: { $avg: '$actualPackage' },
                    },
                },
                { $sort: { hiredCount: -1 } },
                { $limit: 10 },
            ]),

            // Monthly selection trend (last 6 months)
            Application.aggregate([
                { $match: { status: 'selected' } },
                {
                    // Lookup job data to parse salary since selectedPackage is 0
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'jobData',
                    }
                },
                { $unwind: { path: '$jobData', preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        parsedPackage: {
                            $convert: {
                                input: {
                                    $ifNull: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $regexFindAll: {
                                                        input: { $ifNull: ['$jobData.salary', '0'] },
                                                        regex: "[0-9]+"
                                                    }
                                                },
                                                initialValue: "",
                                                in: { $concat: ["$$value", "$$this.match"] }
                                            }
                                        },
                                        "0"
                                    ]
                                },
                                to: "double",
                                onError: 0,
                                onNull: 0
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        finalPackageLPA: {
                            $cond: [
                                { $gt: ['$parsedPackage', 0] },
                                {
                                    $divide: [
                                        {
                                            $cond: [
                                                { $regexMatch: { input: { $toLower: { $ifNull: ['$jobData.salary', ''] } }, regex: 'month' } },
                                                { $multiply: ['$parsedPackage', 12] },
                                                '$parsedPackage'
                                            ]
                                        },
                                        100000]
                                },
                                0
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        actualPackage: {
                            $cond: [{ $gt: ['$selectedPackage', 0] }, '$selectedPackage', '$finalPackageLPA']
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$updatedAt' },
                            month: { $month: '$updatedAt' },
                        },
                        count: { $sum: 1 },
                        avgPackage: { $avg: '$actualPackage' },
                    },
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 6 },
            ]),
        ]);

        // Build status map
        const statusMap = {};
        statusBreakdown.forEach((s) => { statusMap[s._id] = s.count; });

        res.json({
            generatedAt: new Date().toISOString(),
            summary: {
                totalStudents,
                totalCompanies,
                totalJobs,
                totalApplications,
                totalSelected: statusMap.selected || 0,
                totalShortlisted: statusMap.shortlisted || 0,
                totalRejected: statusMap.rejected || 0,
                totalApplied: statusMap.applied || 0,
                selectionRate: totalApplications > 0
                    ? Math.round(((statusMap.selected || 0) / totalApplications) * 10000) / 100
                    : 0,
            },
            departmentWise: deptStats,
            topHiringCompanies: topCompanies,
            monthlyTrend,
        });
    } catch (error) {
        console.error('[PlacementHead] Reports error:', error.message);
        res.status(500).json({ message: 'Failed to generate report' });
    }
};

// ============================================================
// 7) ALL JOBS (for job control panel)
// GET /api/placement-head/jobs
// ============================================================
exports.getAllJobs = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;

        const total = await Job.countDocuments(filter);
        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('company', 'name companyName');

        res.json({
            jobs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        console.error('[PlacementHead] All jobs error:', error.message);
        res.status(500).json({ message: 'Failed to fetch jobs' });
    }
};
