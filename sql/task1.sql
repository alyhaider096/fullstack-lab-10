CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    credit_hours INTEGER CHECK (credit_hours BETWEEN 1 AND 4)
);

INSERT INTO courses (code, title, credit_hours) VALUES
('CS101', 'Programming Fundamentals', 4),
('CS201', 'Data Structures', 4),
('CS301', 'Database Systems', 3),
('MATH101', 'Calculus I', 3),
('ENG101', 'English Composition', 2)
ON CONFLICT (code) DO NOTHING;

SELECT * FROM courses ORDER BY id;
