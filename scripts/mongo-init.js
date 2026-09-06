// MongoDB initialization script for development
db = db.getSiblingDB('rentalhub-dev');

// Create a user for the rentalhub database
db.createUser({
  user: 'rentalhub',
  pwd: 'rentalhub123',
  roles: [
    {
      role: 'readWrite',
      db: 'rentalhub-dev'
    }
  ]
});

console.log('✅ Created rentalhub user for development database');