require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const User = require('./models/User');
const FAQ = require('./models/FAQ');
const argon2 = require('argon2');

// Categories for IT quizzes
const categories = [
  {
    name: 'Programming',
    description: 'Topics related to programming languages, algorithms, and coding concepts'
  },
  {
    name: 'Networking',
    description: 'Topics related to computer networks, protocols, and network infrastructure'
  },
  {
    name: 'Security',
    description: 'Topics related to cybersecurity, encryption, and security best practices'
  },
  {
    name: 'Web Development',
    description: 'Topics related to web technologies, frontend and backend development'
  },
  {
    name: 'Database',
    description: 'Topics related to database systems, SQL, NoSQL, and data management'
  },
  {
    name: 'Operating Systems',
    description: 'Topics related to operating systems, system administration, and OS concepts'
  },
  {
    name: 'Hardware',
    description: 'Topics related to computer hardware, components, and architecture'
  },
  {
    name: 'Cloud Computing',
    description: 'Topics related to cloud services, deployment, and infrastructure as code'
  },
  {
    name: 'DevOps',
    description: 'Topics related to DevOps practices, CI/CD, and software deployment'
  },
  {
    name: 'Artificial Intelligence',
    description: 'Topics related to AI, machine learning, and data science'
  }
];

// FAQs for the platform
const faqs = [
  {
    question: 'How do I create a quiz?',
    answer: 'Log in to your account, navigate to the dashboard, and click on "Create Quiz" button. Follow the form to add questions, answers, and configure quiz settings.',
    category: 'General',
    isForAdmin: false
  },
  {
    question: 'Can I edit a quiz after publishing it?',
    answer: 'Currently, quizzes cannot be edited after they are published. Consider creating a draft first to review before publishing.',
    category: 'Quizzes',
    isForAdmin: false
  },
  {
    question: 'How does the multiplayer mode work?',
    answer: 'In multiplayer mode, users can join a quiz session using a shared code. All participants answer questions simultaneously, and results are shown in real-time.',
    category: 'Quizzes',
    isForAdmin: false
  },
  {
    question: 'Is there a limit to how many quizzes I can create?',
    answer: 'There is no limit to the number of quizzes you can create with your account.',
    category: 'Account',
    isForAdmin: false
  },
  {
    question: 'How can I delete my account?',
    answer: 'To delete your account, go to your profile settings and select "Delete Account". Note that this action is permanent and will remove all your quizzes and attempts.',
    category: 'Account',
    isForAdmin: false
  },
  {
    question: 'How do I manage user accounts as an admin?',
    answer: 'As an admin, you can access the Admin Dashboard from the navigation menu. From there, you can view all users, change roles, and delete accounts if necessary.',
    category: 'Admin',
    isForAdmin: true
  },
  {
    question: 'How do I create FAQ entries?',
    answer: 'As an admin, you can manage FAQs from the Admin Dashboard or the FAQ page. Look for the "Add FAQ" button to create new entries.',
    category: 'Admin',
    isForAdmin: true
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/it-quiz')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await FAQ.deleteMany({});
    
    // Don't delete users to prevent losing existing accounts
    // Instead, just check if admin exists

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created!`);

    // Create FAQs
    const createdFAQs = await FAQ.insertMany(faqs);
    console.log(`${createdFAQs.length} FAQs created!`);

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@itquiz.com' });
    
    if (!adminExists) {
      const hashedPassword = await argon2.hash('admin123');
      
      await User.create({
        email: 'admin@itquiz.com',
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Admin user created!');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();