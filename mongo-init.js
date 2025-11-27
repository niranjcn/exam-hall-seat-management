// MongoDB initialization script
db = db.getSiblingDB('examhall');

// Create collections
db.createCollection('halls');
db.createCollection('seats');

// Create indexes
db.halls.createIndex({ "created_at": -1 });
db.seats.createIndex({ "hall_id": 1, "row_number": 1, "column_number": 1, "seat_number": 1 });
db.seats.createIndex({ "hall_id": 1, "is_assigned": 1 });

print('Database initialized successfully');
