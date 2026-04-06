-- ═══════════════════════════════════════════════════
-- SMIT Portal — Full Migration
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Teachers table updates
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS course_id  UUID REFERENCES courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS campus     TEXT,
  ADD COLUMN IF NOT EXISTS slot_id    UUID; -- FK added after slots table created

-- 2. Slots table (class timings with seat capacity)
CREATE TABLE IF NOT EXISTS slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID REFERENCES teachers(id) ON DELETE CASCADE,
  course_id   UUID REFERENCES courses(id)  ON DELETE CASCADE,
  campus      TEXT NOT NULL,
  timing      TEXT NOT NULL,           -- e.g. "Mon/Wed  9:00 AM – 11:00 AM"
  total_seats INT  NOT NULL DEFAULT 30,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add slot_id FK to teachers (after slots table exists)
ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES slots(id) ON DELETE SET NULL;

-- 4. Enrollments updates
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot_id    UUID REFERENCES slots(id)    ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS slot       TEXT;

-- 5. allow_retest on entry_test_results
ALTER TABLE entry_test_results
  ADD COLUMN IF NOT EXISTS allow_retest BOOLEAN DEFAULT FALSE;

-- 6. assignment_submissions — add grade/feedback columns for teacher
ALTER TABLE assignment_submissions
  ADD COLUMN IF NOT EXISTS grade    TEXT,
  ADD COLUMN IF NOT EXISTS feedback TEXT,
  ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ;

-- 7. Campuses table
CREATE TABLE IF NOT EXISTS campuses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  city       TEXT,
  address    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Seed campuses
INSERT INTO campuses (name, city) VALUES
  ('Aliabad Female Campus',  'Karachi'),
  ('Gulshan Campus',         'Karachi'),
  ('Korangi Campus',         'Karachi'),
  ('Malir Campus',           'Karachi'),
  ('North Karachi Campus',   'Karachi'),
  ('Johar Town Campus',      'Lahore'),
  ('Gulberg Campus',         'Lahore'),
  ('F-10 Campus',            'Islamabad'),
  ('G-11 Campus',            'Islamabad'),
  ('Saddar Campus',          'Rawalpindi'),
  ('Hayatabad Campus',       'Peshawar')
ON CONFLICT DO NOTHING;

-- 9. Disable RLS
ALTER TABLE teachers              DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments           DISABLE ROW LEVEL SECURITY;
ALTER TABLE students              DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses               DISABLE ROW LEVEL SECURITY;
ALTER TABLE slots                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE campuses              DISABLE ROW LEVEL SECURITY;
ALTER TABLE entry_test_results    DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Entry Test Questions (10 General IT MCQs)
-- ─────────────────────────────────────────────
INSERT INTO entry_test_questions (question, option_a, option_b, option_c, option_d, correct_option) VALUES
('What does CPU stand for?','Central Processing Unit','Central Program Utility','Computer Personal Unit','Core Processing Unit','a'),
('Which of the following is an example of an Operating System?','Microsoft Word','Google Chrome','Windows 11','Adobe Photoshop','c'),
('What does HTML stand for?','Hyper Text Markup Language','High Transfer Markup Language','Hyper Transfer Mode Language','Home Tool Markup Language','a'),
('Which device is used to connect a computer to the internet via a phone line?','Router','Switch','Modem','Hub','c'),
('What is the full form of RAM?','Read Access Memory','Random Access Memory','Rapid Access Module','Read And Modify','b'),
('Which programming language is known as the backbone of the web?','Python','Java','JavaScript','C++','c'),
('What does "www" stand for in a website URL?','World Wide Web','World Web Work','Wide World Web','Web World Wide','a'),
('Which of the following is NOT a web browser?','Google Chrome','Mozilla Firefox','Microsoft Excel','Safari','c'),
('What is the purpose of a firewall in a computer network?','Speed up internet connection','Block unauthorized access','Store data permanently','Compress files','b'),
('Which file extension is used for a Python script?','.java','.html','.py','.cpp','c')
ON CONFLICT DO NOTHING;

