import 'dotenv/config';
import { PrismaClient, Status } from '@prisma/client';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeonHttp(connectionString, {});

const prisma = new PrismaClient({ adapter });

// Helper to get date N days ago
function daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(0, 0, 0, 0);
    return date;
}

// Helper to get date N days from now
function daysFromNow(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(0, 0, 0, 0);
    return date;
}

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.taskStatus.deleteMany({});
    await prisma.timeLog.deleteMany({});
    await prisma.task.deleteMany({});

    console.log('✅ Database cleared');

    // ============================================
    // MAKE HABIT TASKS
    // ============================================
    console.log('🟢 Creating Make Habit tasks...');

    // 1. Perfect Streak - Daily Exercise (30 days, 100% consistency)
    const exerciseHabit = await prisma.task.create({
        data: {
            title: 'Morning Exercise',
            type: 'habit',
            category: 'make_habit',
            repeatMode: 'daily',
            priority: 'high',
            amount: '30 minutes',
            estimate: 30,
            notes: 'Start day with exercise',
            startDate: daysAgo(30),
            createdAt: daysAgo(30),
        },
    });

    // Create perfect 30-day streak
    for (let i = 30; i >= 0; i--) {
        await prisma.taskStatus.create({
            data: {
                taskId: exerciseHabit.id,
                date: daysAgo(i),
                status: Status.SUCCESS,
                progressLevel: 4,
            },
        });
    }

    // 2. Broken Streak - Reading Habit (best streak: 20, current: 5)
    const readingHabit = await prisma.task.create({
        data: {
            title: 'Read 20 Pages',
            type: 'habit',
            category: 'make_habit',
            repeatMode: 'daily',
            priority: 'medium',
            amount: '20 pages',
            notes: 'Daily reading habit',
            startDate: daysAgo(60),
            createdAt: daysAgo(60),
        },
    });

    // Create pattern: 20-day streak, then gap, then 5-day current streak
    for (let i = 60; i >= 41; i--) {
        await prisma.taskStatus.create({
            data: {
                taskId: readingHabit.id,
                date: daysAgo(i),
                status: Status.SUCCESS,
                progressLevel: 4,
            },
        });
    }
    // Gap (days 40-6): mix of failures and successes
    for (let i = 40; i >= 6; i--) {
        const status = i % 3 === 0 ? Status.SUCCESS : i % 3 === 1 ? Status.HALF : Status.FAIL;
        const progress = i % 3 === 0 ? 4 : i % 3 === 1 ? 2 : 1;
        await prisma.taskStatus.create({
            data: {
                taskId: readingHabit.id,
                date: daysAgo(i),
                status,
                progressLevel: progress,
            },
        });
    }
    // Current 5-day streak
    for (let i = 5; i >= 0; i--) {
        await prisma.taskStatus.create({
            data: {
                taskId: readingHabit.id,
                date: daysAgo(i),
                status: Status.SUCCESS,
                progressLevel: 4,
            },
        });
    }

    // 3. Weekly Habit - Gym (Mon, Wed, Fri)
    const gymHabit = await prisma.task.create({
        data: {
            title: 'Gym Workout',
            type: 'habit',
            category: 'make_habit',
            repeatMode: 'weekly',
            weekdays: [1, 3, 5], // Mon, Wed, Fri
            priority: 'high',
            estimate: 60,
            notes: 'Strength training',
            startDate: daysAgo(21),
            createdAt: daysAgo(21),
        },
    });

    // Create statuses for gym days only (90% consistency)
    for (let i = 21; i >= 0; i--) {
        const date = daysAgo(i);
        const dayOfWeek = date.getDay();
        if ([1, 3, 5].includes(dayOfWeek)) {
            const status = i % 7 === 0 ? Status.FAIL : Status.SUCCESS;
            const progress = i % 7 === 0 ? 0 : 4;
            await prisma.taskStatus.create({
                data: {
                    taskId: gymHabit.id,
                    date,
                    status,
                    progressLevel: progress,
                },
            });
        }
    }

    // 4. Recent Habit - Meditation (started 7 days ago)
    const meditationHabit = await prisma.task.create({
        data: {
            title: 'Morning Meditation',
            type: 'habit',
            category: 'make_habit',
            repeatMode: 'daily',
            priority: 'medium',
            amount: '10 minutes',
            estimate: 10,
            startDate: daysAgo(7),
            createdAt: daysAgo(7),
        },
    });

    for (let i = 7; i >= 0; i--) {
        await prisma.taskStatus.create({
            data: {
                taskId: meditationHabit.id,
                date: daysAgo(i),
                status: Status.SUCCESS,
                progressLevel: 4,
            },
        });
    }

    // 5. Habit with Subtasks - LeetCode
    const leetcodeHabit = await prisma.task.create({
        data: {
            title: 'LeetCode Practice',
            type: 'subtask',
            category: 'make_habit',
            repeatMode: 'daily',
            priority: 'high',
            subtasks: [
                'Two Sum',
                'Reverse Linked List',
                'Valid Parentheses',
                'Merge Two Sorted Lists',
                'Maximum Subarray',
            ],
            notes: 'Minimum 2 problems per day',
            startDate: daysAgo(14),
            createdAt: daysAgo(14),
        },
    });

    for (let i = 14; i >= 0; i--) {
        const completed = i % 2 === 0 ? ['Two Sum', 'Valid Parentheses'] : ['Reverse Linked List'];
        await prisma.taskStatus.create({
            data: {
                taskId: leetcodeHabit.id,
                date: daysAgo(i),
                status: i % 2 === 0 ? Status.SUCCESS : Status.HALF,
                progressLevel: i % 2 === 0 ? 4 : 2,
                completedSubtasks: completed,
                dailySubtasks: ['Two Sum', 'Reverse Linked List', 'Valid Parentheses'],
            },
        });
    }

    // 6. 50% Completion Habit - Drink Water (to test yellow color)
    const waterHabit = await prisma.task.create({
        data: {
            title: 'Drink Water',
            type: 'habit',
            category: 'make_habit',
            repeatMode: 'daily',
            priority: 'medium',
            amount: '8 glasses',
            notes: 'Stay hydrated - aim for 50% completion daily',
            startDate: daysAgo(30),
            createdAt: daysAgo(30),
        },
    });

    // Create consistent 50% completion pattern (all yellow boxes)
    for (let i = 30; i >= 0; i--) {
        await prisma.taskStatus.create({
            data: {
                taskId: waterHabit.id,
                date: daysAgo(i),
                status: Status.HALF,
                progressLevel: 2, // 50% - should show yellow
            },
        });
    }

    // ============================================
    // BREAK HABIT TASKS
    // ============================================
    console.log('🔴 Creating Break Habit tasks...');

    // 1. No Social Media Scrolling (75% success rate)
    const socialMediaHabit = await prisma.task.create({
        data: {
            title: 'No Social Media Scrolling',
            type: 'habit',
            category: 'break_habit',
            repeatMode: 'daily',
            priority: 'high',
            notes: 'Avoid mindless scrolling',
            startDate: daysAgo(30),
            createdAt: daysAgo(30),
        },
    });

    for (let i = 30; i >= 0; i--) {
        const status = i % 4 === 0 ? Status.FAIL : Status.SUCCESS;
        const progress = i % 4 === 0 ? 1 : 4;
        await prisma.taskStatus.create({
            data: {
                taskId: socialMediaHabit.id,
                date: daysAgo(i),
                status,
                progressLevel: progress,
            },
        });
    }

    // 2. No Junk Food (improving trend)
    const junkFoodHabit = await prisma.task.create({
        data: {
            title: 'No Junk Food',
            type: 'habit',
            category: 'break_habit',
            repeatMode: 'daily',
            priority: 'medium',
            notes: 'Avoid processed foods and sweets',
            startDate: daysAgo(45),
            createdAt: daysAgo(45),
        },
    });

    // Improving pattern: 50% success early, 90% success recent
    for (let i = 45; i >= 15; i--) {
        const status = i % 2 === 0 ? Status.FAIL : Status.SUCCESS;
        const progress = i % 2 === 0 ? 1 : 4;
        await prisma.taskStatus.create({
            data: {
                taskId: junkFoodHabit.id,
                date: daysAgo(i),
                status,
                progressLevel: progress,
            },
        });
    }
    for (let i = 14; i >= 0; i--) {
        const status = i % 10 === 0 ? Status.FAIL : Status.SUCCESS;
        const progress = i % 10 === 0 ? 1 : 4;
        await prisma.taskStatus.create({
            data: {
                taskId: junkFoodHabit.id,
                date: daysAgo(i),
                status,
                progressLevel: progress,
            },
        });
    }

    // 3. No Late Night Gaming
    const gamingHabit = await prisma.task.create({
        data: {
            title: 'No Gaming After 10 PM',
            type: 'habit',
            category: 'break_habit',
            repeatMode: 'daily',
            priority: 'medium',
            notes: 'Better sleep hygiene',
            startDate: daysAgo(20),
            createdAt: daysAgo(20),
        },
    });

    for (let i = 20; i >= 0; i--) {
        const status = i % 3 === 0 ? Status.FAIL : i % 3 === 1 ? Status.HALF : Status.SUCCESS;
        const progress = i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 4;
        await prisma.taskStatus.create({
            data: {
                taskId: gamingHabit.id,
                date: daysAgo(i),
                status,
                progressLevel: progress,
            },
        });
    }

    // ============================================
    // PROFESSIONAL HABITS
    // ============================================
    console.log('💼 Creating Professional Habit tasks...');

    // 1. Daily Standup Notes
    const standupHabit = await prisma.task.create({
        data: {
            title: 'Write Standup Notes',
            type: 'habit',
            category: 'professional',
            repeatMode: 'weekly',
            weekdays: [1, 2, 3, 4, 5], // Weekdays
            priority: 'high',
            estimate: 10,
            notes: 'Document daily progress',
            startDate: daysAgo(30),
            createdAt: daysAgo(30),
        },
    });

    for (let i = 30; i >= 0; i--) {
        const date = daysAgo(i);
        const dayOfWeek = date.getDay();
        if ([1, 2, 3, 4, 5].includes(dayOfWeek)) {
            await prisma.taskStatus.create({
                data: {
                    taskId: standupHabit.id,
                    date,
                    status: Status.SUCCESS,
                    progressLevel: 4,
                },
            });
        }
    }

    // 2. Code Review (3 times per week)
    const codeReviewHabit = await prisma.task.create({
        data: {
            title: 'Review Team PRs',
            type: 'habit',
            category: 'professional',
            repeatMode: 'weekly',
            weekdays: [1, 3, 5],
            priority: 'high',
            amount: '3 PRs',
            notes: 'Help team with code reviews',
            startDate: daysAgo(21),
            createdAt: daysAgo(21),
        },
    });

    for (let i = 21; i >= 0; i--) {
        const date = daysAgo(i);
        const dayOfWeek = date.getDay();
        if ([1, 3, 5].includes(dayOfWeek)) {
            const status = i % 6 === 0 ? Status.HALF : Status.SUCCESS;
            const progress = i % 6 === 0 ? 2 : 4;
            await prisma.taskStatus.create({
                data: {
                    taskId: codeReviewHabit.id,
                    date,
                    status,
                    progressLevel: progress,
                },
            });
        }
    }

    // 3. Learning Time (with time logs)
    const learningHabit = await prisma.task.create({
        data: {
            title: 'Tech Learning',
            type: 'time',
            category: 'professional',
            repeatMode: 'daily',
            priority: 'medium',
            estimate: 60,
            notes: 'Learn new technologies',
            startDate: daysAgo(25),
            createdAt: daysAgo(25),
        },
    });

    for (let i = 25; i >= 0; i--) {
        const seconds = Math.floor(Math.random() * 3600) + 1800; // 30-90 minutes
        const progress = seconds >= 3600 ? 4 : seconds >= 2700 ? 3 : seconds >= 1800 ? 2 : 1;
        const status = seconds >= 3600 ? Status.SUCCESS : seconds >= 2700 ? Status.HALF : Status.FAIL;

        await prisma.timeLog.create({
            data: {
                taskId: learningHabit.id,
                date: daysAgo(i),
                seconds,
            },
        });

        await prisma.taskStatus.create({
            data: {
                taskId: learningHabit.id,
                date: daysAgo(i),
                status,
                progressLevel: progress,
            },
        });
    }

    // ============================================
    // REGULAR TASKS
    // ============================================
    console.log('📋 Creating Regular tasks...');

    // 1. One-time task (active)
    await prisma.task.create({
        data: {
            title: 'Prepare Presentation',
            type: 'task',
            category: 'task',
            repeatMode: 'none',
            priority: 'high',
            estimate: 120,
            notes: 'Q4 review presentation',
            startDate: daysAgo(2),
            endDate: daysFromNow(3),
            createdAt: daysAgo(2),
        },
    });

    // 2. Completed task
    const completedTask = await prisma.task.create({
        data: {
            title: 'Submit Expense Report',
            type: 'task',
            category: 'task',
            repeatMode: 'none',
            priority: 'medium',
            isCompleted: true,
            completedAt: daysAgo(3),
            startDate: daysAgo(7),
            endDate: daysAgo(3),
            createdAt: daysAgo(7),
        },
    });

    await prisma.taskStatus.create({
        data: {
            taskId: completedTask.id,
            date: daysAgo(3),
            status: Status.SUCCESS,
            progressLevel: 4,
        },
    });

    // 3. Archived task
    await prisma.task.create({
        data: {
            title: 'Old Project Documentation',
            type: 'task',
            category: 'task',
            repeatMode: 'none',
            priority: 'low',
            isArchived: true,
            isCompleted: true,
            completedAt: daysAgo(15),
            startDate: daysAgo(30),
            endDate: daysAgo(15),
            createdAt: daysAgo(30),
        },
    });

    // 4. Task with subtasks
    const projectTask = await prisma.task.create({
        data: {
            title: 'Refactor Authentication Module',
            type: 'subtask',
            category: 'task',
            repeatMode: 'none',
            priority: 'high',
            subtasks: [
                'Update login flow',
                'Add OAuth support',
                'Write tests',
                'Update documentation',
            ],
            estimate: 240,
            startDate: daysAgo(5),
            endDate: daysFromNow(7),
            createdAt: daysAgo(5),
        },
    });

    await prisma.taskStatus.create({
        data: {
            taskId: projectTask.id,
            date: daysAgo(1),
            status: Status.HALF,
            progressLevel: 2,
            completedSubtasks: ['Update login flow', 'Add OAuth support'],
            dailySubtasks: ['Update login flow', 'Add OAuth support', 'Write tests', 'Update documentation'],
        },
    });

    // 5. Recurring weekly task
    const weeklyMeeting = await prisma.task.create({
        data: {
            title: 'Team Sync Meeting',
            type: 'task',
            category: 'task',
            repeatMode: 'weekly',
            weekdays: [1], // Monday
            priority: 'medium',
            estimate: 30,
            startDate: daysAgo(14),
            createdAt: daysAgo(14),
        },
    });

    for (let i = 14; i >= 0; i--) {
        const date = daysAgo(i);
        if (date.getDay() === 1) {
            await prisma.taskStatus.create({
                data: {
                    taskId: weeklyMeeting.id,
                    date,
                    status: Status.SUCCESS,
                    progressLevel: 4,
                },
            });
        }
    }

    console.log('✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Make Habit tasks: 6');
    console.log('   - Break Habit tasks: 3');
    console.log('   - Professional tasks: 3');
    console.log('   - Regular tasks: 5');
    console.log('   - Total tasks: 17');
    console.log('\n🎯 Test scenarios included:');
    console.log('   ✓ Perfect streaks (100% consistency)');
    console.log('   ✓ Broken streaks with recovery');
    console.log('   ✓ Weekly habits (specific days)');
    console.log('   ✓ Recent vs long-term habits');
    console.log('   ✓ Tasks with subtasks');
    console.log('   ✓ Time-based tasks with logs');
    console.log('   ✓ Completed and archived tasks');
    console.log('   ✓ Various progress levels');
    console.log('   ✓ Improving and declining trends');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
