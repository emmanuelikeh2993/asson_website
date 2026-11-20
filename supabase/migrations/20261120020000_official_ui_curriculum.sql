-- ====================================================================
-- ASSON UI Student Platform — Official University of Ibadan Curriculum
-- Updates public.courses table with exact 100L and 200L course forms (2025/2026 session)
-- ====================================================================

-- 100 Level Courses
INSERT INTO public.courses (code, title, level, semester, units)
VALUES
  ('STA 111', 'Descriptive Statistics', '100', 1, 3),
  ('STA 112', 'Probability I', '100', 1, 3),
  ('STA 121', 'Statistical Inference I', '100', 2, 3),
  ('STA 122', 'Statistical Computing I', '100', 2, 3),
  ('MTH 101', 'Elementary Mathematics I (Algebra and Trigonometry)', '100', 1, 2),
  ('MTH 102', 'Elementary Mathematics II (Calculus)', '100', 2, 2),
  ('MTH 103', 'Elementary Mathematics III (Vectors, Geometry and Dynamics)', '100', 1, 2),
  ('COS 101', 'Introduction to Computing Sciences', '100', 1, 3),
  ('PHY 101', 'General Physics I', '100', 1, 2),
  ('PHY 102', 'General Physics II', '100', 2, 2),
  ('PHY 103', 'General Physics III', '100', 1, 2),
  ('GST 111', 'Communication in English I', '100', 1, 2),
  ('GST 112', 'Nigerian Peoples and Culture', '100', 2, 2),
  ('GES 107', 'Reproductive Health, STIs, Drugs and Mankind', '100', 1, 1),
  ('GES 108', 'Introduction to French', '100', 2, 1),
  ('MAT 142', 'Introduction to Actuarial Mathematics', '100', 2, 4),

-- 200 Level Courses
  ('STA 211', 'Probability II', '200', 1, 3),
  ('STA 219', 'Statistical Consulting', '200', 1, 2),
  ('STA 231', 'Statistical Computing II', '200', 1, 2),
  ('STA 202', 'Statistics for Physical Science & Engineering', '200', 1, 3),
  ('STA 212', 'Introduction to Social & Economic Statistics', '200', 2, 3),
  ('STA 221', 'Statistical Inference II', '200', 2, 3),
  ('STA 224', 'Introduction to Statistical Machine Learning', '200', 2, 2),
  ('STA 225', 'Data Visualization', '200', 2, 2),
  ('STA 299', 'Industrial Attachment', '200', 2, 3),
  ('MTH 204', 'Linear Algebra I', '200', 1, 2),
  ('MTH 207', 'Real Analysis I', '200', 1, 2),
  ('MTH 202', 'Elementary Differential Equations', '200', 2, 2),
  ('MTH 209', 'Introduction to Numerical Analysis', '200', 2, 2),
  ('COS 201', 'Computer Programming I', '200', 1, 3),
  ('ENT 211', 'Entrepreneurship and Innovation', '200', 1, 2),
  ('GST 212', 'Philosophy, Logic and Human Existence', '200', 2, 2),
  ('GES 201', 'Use of English II', '200', 1, 2),
  ('GES 103', 'Government, Society & the Economy', '200', 1, 1)
ON CONFLICT (code) DO UPDATE
SET title = EXCLUDED.title,
    level = EXCLUDED.level,
    semester = EXCLUDED.semester,
    units = EXCLUDED.units;
