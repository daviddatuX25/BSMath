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

-- Sample Programs
INSERT INTO `programs` (`name`, `code`, `description`, `status`, `created_by`) VALUES
('Bachelor of Science in Mathematics', 'BSMATH', 'Four-year undergraduate program in Mathematics', 'active', 1),
('Master of Science in Mathematics', 'MSMATH', 'Two-year graduate program in Mathematics', 'active', 1),
('Doctor of Philosophy in Mathematics', 'PHDMATH', 'Doctoral program in Mathematics', 'active', 1);

-- --------------------------------------------------------

-- Sample Announcements
INSERT INTO `announcements` (`title`, `content`, `status`, `priority`, `author_id`, `approved_by`) VALUES
('Enrollment for AY 2026-2027 Now Open', 'The department announces the opening of enrollment for the Academic Year 2026-2027. Please visit the registrar for details.', 'approved', 'high', 1, 2),
('Mathematics Competition 2026', 'The annual mathematics competition will be held on May 15, 2026 at the Main Auditorium.', 'approved', 'normal', 1, 2),
('New Faculty Joining This Semester', 'We welcome three new faculty members joining our department this semester.', 'pending', 'low', 3, NULL);

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
('announcement', 'New announcement posted: Enrollment for AY 2026-2027 Now Open', 1, 'announcements', 1),
('program', 'Program updated: Bachelor of Science in Mathematics', 1, 'programs', 1),
('event', 'New event created: Mathematics Workshop', 3, 'events', 2),
('faculty', 'New faculty added: Dr. Pedro Reyes', 1, 'faculty', 3),
('gallery', 'Gallery image uploaded: Department Team Photo 2026', 1, 'gallery', 1);
