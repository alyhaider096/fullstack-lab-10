SELECT version();

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

SELECT * FROM courses ORDER BY title;
SELECT * FROM courses WHERE credit_hours >= 3 ORDER BY title;

UPDATE courses SET title = 'Database Management Systems' WHERE code = 'CS301';
SELECT * FROM courses WHERE code = 'CS301';

INSERT INTO courses (code, title, credit_hours)
VALUES ('TMP999', 'Temporary Course', 1)
ON CONFLICT (code) DO NOTHING;
DELETE FROM courses WHERE code = 'TMP999';
SELECT * FROM courses ORDER BY title;

SELECT credit_hours, COUNT(*) AS course_count
FROM courses GROUP BY credit_hours ORDER BY credit_hours;

-- Catch the expected CHECK violation so the rest of the script can complete.
DO $$
BEGIN
  INSERT INTO courses (code, title, credit_hours)
  VALUES ('BAD999', 'Invalid Course', 9);
EXCEPTION WHEN check_violation THEN
  RAISE NOTICE 'CHECK constraint correctly rejected 9 credit hours';
END $$;
