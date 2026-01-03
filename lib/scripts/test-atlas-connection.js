// scripts/seed-atlas-data.js
import { MongoClient, ObjectId } from 'mongodb';

const uri = 'mongodb+srv://studyingalaxy123_db_user:2SeVY7ydsk7xeW7@online-quizzes-maker.cd0nedo.mongodb.net/online-quizzes?retryWrites=true&w=majority';

async function seedAtlasData() {
  console.log('Seeding MongoDB Atlas with sample data...');
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('online-quizzes');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    // await db.collection('quizzes').deleteMany({});
    // await db.collection('quiz_results').deleteMany({});
    
    // 1. Create a teacher user
    const teacherId = new ObjectId();
    await db.collection('users').insertOne({
      _id: teacherId,
      name: "Ms. Anderson",
      email: "teacher@example.com",
      role: "teacher",
      isValidated: true,
      createdAt: new Date(),
    });
    console.log('✅ Created teacher user');
    
    // 2. Create sample quizzes
    const quiz1Id = new ObjectId();
    const quiz2Id = new ObjectId();
    
    await db.collection('quizzes').insertMany([
      {
        _id: quiz1Id,
        title: "Mathematics Quiz - Algebra Basics",
        description: "Test your algebra skills with these fundamental questions",
        category: "Mathematics",
        teacherId: teacherId,
        questions: [
          {
            id: "q1",
            text: "Solve for x: 2x + 5 = 15",
            type: "multiple",
            options: ["x = 5", "x = 10", "x = 7.5", "x = 8"],
            correctAnswer: 0,
            points: 10,
          },
          {
            id: "q2",
            text: "What is (x + 3)(x - 3)?",
            type: "multiple",
            options: ["x² - 9", "x² + 9", "x² - 6x + 9", "x² + 6x + 9"],
            correctAnswer: 0,
            points: 10,
          },
        ],
        timeLimit: 30,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsed: new Date(),
      },
      {
        _id: quiz2Id,
        title: "Science Quiz - Physics Basics",
        description: "Basic physics concepts and principles",
        category: "Science",
        teacherId: teacherId,
        questions: [
          {
            id: "q1",
            text: "What is the unit of force?",
            type: "multiple",
            options: ["Newton", "Joule", "Watt", "Pascal"],
            correctAnswer: 0,
            points: 10,
          },
        ],
        timeLimit: 20,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsed: new Date(),
      }
    ]);
    console.log('✅ Created sample quizzes');
    
    // 3. Create sample students
    const students = [
      { _id: new ObjectId(), name: "Alex Johnson", email: "alex@student.com", role: "student" },
      { _id: new ObjectId(), name: "Maria Garcia", email: "maria@student.com", role: "student" },
      { _id: new ObjectId(), name: "David Smith", email: "david@student.com", role: "student" },
    ];
    
    await db.collection('users').insertMany(students);
    console.log('✅ Created sample students');
    
    // 4. Create sample quiz results
    const results = [];
    for (let i = 0; i < students.length; i++) {
      results.push({
        _id: new ObjectId(),
        quizId: quiz1Id,
        studentId: students[i]._id,
        studentName: students[i].name,
        score: Math.floor(Math.random() * 11) + 10, // 10-20
        totalQuestions: 20,
        percentage: Math.floor(Math.random() * 40) + 60, // 60-100
        timeSpent: Math.floor(Math.random() * 600) + 600, // 600-1200 seconds
        submittedAt: new Date(Date.now() - i * 86400000),
        createdAt: new Date(),
      });
    }
    
    await db.collection('quiz_results').insertMany(results);
    console.log('✅ Created sample quiz results');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Sample Data IDs:');
    console.log(`Teacher ID: ${teacherId}`);
    console.log(`Quiz 1 ID: ${quiz1Id}`);
    console.log(`Quiz 2 ID: ${quiz2Id}`);
    console.log('\n🔗 You can now:');
    console.log(`1. Visit: http://localhost:3000/teacher/quizzes`);
    console.log(`2. View results: http://localhost:3000/api/teacher/quizzes/${quiz1Id}/results`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  } finally {
    await client.close();
  }
}

seedAtlasData();