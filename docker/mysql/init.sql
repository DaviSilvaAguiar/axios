-- Permite que o usuário da app crie e gerencie os bancos de tenant (axios_*)
GRANT ALL PRIVILEGES ON `axios\_%`.* TO 'axios'@'%';
FLUSH PRIVILEGES;
