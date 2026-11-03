-- Standard Skills Seed
INSERT INTO skills (id, name, category) VALUES
    (gen_random_uuid(), 'Java', 'Backend'),
    (gen_random_uuid(), 'Spring Boot', 'Backend'),
    (gen_random_uuid(), 'PostgreSQL', 'Database'),
    (gen_random_uuid(), 'TypeScript', 'Frontend'),
    (gen_random_uuid(), 'React', 'Frontend'),
    (gen_random_uuid(), 'Node.js', 'Backend'),
    (gen_random_uuid(), 'Python', 'Backend'),
    (gen_random_uuid(), 'Docker', 'DevOps'),
    (gen_random_uuid(), 'Kubernetes', 'DevOps'),
    (gen_random_uuid(), 'AWS', 'Cloud'),
    (gen_random_uuid(), 'REST APIs', 'Backend'),
    (gen_random_uuid(), 'Tailwind CSS', 'Frontend'),
    (gen_random_uuid(), 'Git', 'Tools'),
    (gen_random_uuid(), 'CI/CD', 'DevOps'),
    (gen_random_uuid(), 'Microservices', 'Architecture'),
    (gen_random_uuid(), 'GraphQL', 'Backend')
ON CONFLICT (name) DO NOTHING;
