-- BSMath Admin SPA Seed Data
-- 3 demo users with bcrypt-hashed passwords (password: password123)

-- --------------------------------------------------------

-- Users: admin, dean, program_head
-- Password for all: password123 (bcrypt hash)
INSERT INTO `users` (`email`, `password`, `name`, `role`) VALUES
('admin@bsmath.test', '$2y$10$G.k5EBLEMDhRJ2gQeH/w3u9NVCdZ7Shg9C5bbzTUeOSrmBgEP.Qvm', 'Admin User', 'admin'),
('dean@bsmath.test', '$2y$10$G.k5EBLEMDhRJ2gQeH/w3u9NVCdZ7Shg9C5bbzTUeOSrmBgEP.Qvm', 'Dean User', 'dean'),
('head@bsmath.test', '$2y$10$G.k5EBLEMDhRJ2gQeH/w3u9NVCdZ7Shg9C5bbzTUeOSrmBgEP.Qvm', 'Program Head User', 'program_head');

-- --------------------------------------------------------

-- Sample Programs (4 programs required for dashboard "Total Programs: 4")
INSERT INTO `programs` (`name`, `code`, `description`, `status`, `created_by`) VALUES
('Bachelor of Science in Mathematics', 'BSMATH', 'Core mathematics program covering calculus, algebra, and analysis.', 'active', 1),
('Applied Mathematics Track', 'APMATH', 'Focus on statistics, numerical methods, and mathematical modeling.', 'active', 1),
('Mathematics Education Track', 'MEDUMATH', 'Prepares students for teaching mathematics at secondary level.', 'active', 1),
('Pure Mathematics Track', 'PMATH', 'Advanced theoretical mathematics: topology, abstract algebra, real analysis.', 'active', 1);

-- --------------------------------------------------------

-- Phase 3 seed — Announcements
-- Two rows so the dashboard "Total Announcements" card is non-zero
-- and Phase 4 approval workflow has pending items to work with.
-- author_id = 1 (admin user) seeded in Phase 1.
INSERT INTO announcements (title, content, status, priority, author_id) VALUES
  ('Welcome to the new admin portal',
   'This is the admin portal for the BS Mathematics department. Use the sidebar to navigate modules.',
   'approved', 'normal', 1),
  ('Midterm exam schedule posted',
   'Midterm exams for all math sections begin next Monday. Check the Events tab for the full schedule.',
   'pending',  'high',   1);

-- Matching activity rows so the Recent Activities feed has content
INSERT INTO activities (user_id, type, description, entity_type, entity_id) VALUES
  (1, 'announcement', 'Created announcement: Welcome to the new admin portal', 'announcements', 1),
  (1, 'announcement', 'Created announcement: Midterm exam schedule posted',   'announcements', 2);

-- --------------------------------------------------------

-- Sample Events
INSERT INTO `events` (`title`, `description`, `event_date`, `event_time`, `location`, `status`, `author_id`, `approved_by`) VALUES
('Opening Ceremony', 'Welcome ceremony for the new academic year', '2026-06-01', '09:00:00', 'Main Auditorium', 'approved', 1, 2),
('Mathematics Workshop', 'Interactive workshop on problem-solving techniques', '2026-04-20', '13:00:00', 'Math Lab 101', 'pending', 3, NULL),
('Department Meeting', 'Quarterly department meeting for all faculty', '2026-05-01', '10:00:00', 'Conference Room A', 'approved', 2, 2);

-- --------------------------------------------------------

-- Sample News
INSERT INTO `news` (`title`, `content`, `status`, `author_id`) VALUES
('BSMath Students Win National Competition', 'Our students brought home the championship from the 2026 National Mathematics Competition.', 'published', 1),
('New Research Laboratory Opened', 'The department inaugurates a new research laboratory equipped with modern computing resources.', 'published', 1);

-- --------------------------------------------------------

-- Sample Gallery entries
INSERT INTO `gallery` (`title`, `image_url`, `description`, `uploaded_by`) VALUES
('Department Team Photo 2026', 'uploads/gallery/team_2026.jpg', 'Annual department team photo', 1),
('Workshop Session', 'uploads/gallery/workshop_2026.jpg', 'Students during the mathematics workshop', 3);

-- --------------------------------------------------------

-- Sample Faculty
INSERT INTO `faculty` (`name`, `email`, `position`, `department`, `specialization`, `status`, `created_by`) VALUES
('Dr. Juan Dela Cruz', 'juan.delacruz@bsmath.edu', 'Professor', 'Mathematics', 'Algebra', 'active', 1),
('Dr. Maria Santos', 'maria.santos@bsmath.edu', 'Associate Professor', 'Mathematics', 'Calculus', 'active', 1),
('Dr. Pedro Reyes', 'pedro.reyes@bsmath.edu', 'Assistant Professor', 'Mathematics', 'Geometry', 'active', 1);

-- --------------------------------------------------------

-- Sample Activities (recent activities feed)
INSERT INTO `activities` (`type`, `description`, `user_id`, `entity_type`, `entity_id`) VALUES
('program', 'Created program: Bachelor of Science in Mathematics', 1, 'programs', 1),
('program', 'Created program: Applied Mathematics Track', 1, 'programs', 2),
('program', 'Created program: Mathematics Education Track', 1, 'programs', 3),
('program', 'Created program: Pure Mathematics Track', 1, 'programs', 4),
('announcement', 'New announcement posted: Enrollment for AY 2026-2027 Now Open', 1, 'announcements', 1),
('event', 'New event created: Mathematics Workshop', 3, 'events', 2),
('faculty', 'New faculty added: Dr. Pedro Reyes', 1, 'faculty', 3),
('gallery', 'Gallery image uploaded: Department Team Photo 2026', 1, 'gallery', 1);

-- Seed gallery images (Phase 4 plan — requires users to be seeded first so id=1 exists)
INSERT INTO gallery (title, image_url, description, uploaded_by) VALUES
 ('Department Seminar 2026', 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600', 'Annual department seminar group photo.', 1),
 ('Math Competition Awards', 'https://images.unsplash.com/photo-1524178232363-01fb6b9b5a15?w=600', 'Students receiving their competition awards.', 1),
 ('Faculty Workshop', 'https://images.unsplash.com/photo-1577896851231-70ef188817e1?w=600', 'Professional development workshop for faculty.', 1);

-- Seed faculty members (Phase 4 plan — requires users to be seeded first so id=1 exists)
INSERT INTO faculty (name, email, position, department, specialization, image_url, status, created_by) VALUES
 ('Dr. Maria Santos', 'maria.santos@bsmath.test', 'Professor', 'Mathematics', 'Abstract Algebra, Number Theory', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', 'active', 1),
 ('Dr. Juan Cruz', 'juan.cruz@bsmath.test', 'Associate Professor', 'Applied Mathematics', 'Numerical Methods, Optimization', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', 'active', 1),
 ('Dr. Ana Reyes', 'ana.reyes@bsmath.test', 'Assistant Professor', 'Mathematics Education', 'Curriculum Development, Statistics', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200', 'active', 1),
 ('Prof. Carlos Lim', 'carlos.lim@bsmath.test', 'Instructor', 'Pure Mathematics', 'Real Analysis, Topology', NULL, 'active', 1);
