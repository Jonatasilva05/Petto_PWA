-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 19/05/2026 às 04:00
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `petto_pwa`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamentos`
--

CREATE TABLE `agendamentos` (
  `id_agendamento` int(11) NOT NULL,
  `id_pet` int(11) NOT NULL,
  `id_veterinario` int(11) NOT NULL,
  `data_hora` datetime NOT NULL,
  `status` varchar(20) DEFAULT 'agendado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `medicamentos`
--

CREATE TABLE `medicamentos` (
  `id_medicamento` int(11) NOT NULL,
  `id_dataset` varchar(100) DEFAULT NULL,
  `id_pet` int(11) NOT NULL,
  `nome_medicamento` varchar(100) NOT NULL,
  `data_aplicacao` date DEFAULT NULL,
  `data_desconhecida` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `medicamentos`
--

INSERT INTO `medicamentos` (`id_medicamento`, `id_dataset`, `id_pet`, `nome_medicamento`, `data_aplicacao`, `data_desconhecida`) VALUES
(1, NULL, 54, 'Vermífugo (Remédio para Verme - Comprimido Oral)', NULL, 1),
(2, NULL, 59, 'Vermífugo (Remédio para Verme - Injetável)', NULL, 0),
(3, NULL, 59, 'Vermífugo (Remédio para Verme - Comprimido Oral)', NULL, 0),
(16, 'vermifugo_oral_cao_gato', 103, 'Vermífugo (Comprimido Oral)', NULL, 0),
(17, 'antipulgas_carrapatos_cao_gato', 104, 'Antipulgas e Carrapatos (Oral/Tópico)', NULL, 0),
(18, 'vermifugo_oral_cao_gato', 105, 'Vermífugo (Comprimido Oral)', NULL, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `pets`
--

CREATE TABLE `pets` (
  `id_pet` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `especie` varchar(50) DEFAULT NULL,
  `raca` varchar(50) DEFAULT NULL,
  `idade_valor` int(11) DEFAULT NULL,
  `idade_unidade` varchar(10) DEFAULT 'anos',
  `idade_meses` int(11) DEFAULT NULL,
  `idade_dias` int(11) DEFAULT NULL,
  `peso` float DEFAULT NULL,
  `sexo` char(1) DEFAULT NULL,
  `cor` varchar(50) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `id_veterinario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `pets`
--

INSERT INTO `pets` (`id_pet`, `nome`, `id_usuario`, `especie`, `raca`, `idade_valor`, `idade_unidade`, `idade_meses`, `idade_dias`, `peso`, `sexo`, `cor`, `data_nascimento`, `foto_url`, `id_veterinario`) VALUES
(50, 'Rex', 63, 'Cachorro', 'Pastor Alemão', 5, 'anos', NULL, NULL, 30, 'M', 'Preto e Bege', NULL, NULL, 65),
(51, 'Thor', 64, 'Cachorro', 'Bulldog Francês', 4, 'anos', NULL, NULL, 12, 'M', 'Creme', NULL, NULL, 67),
(54, 'Caramelo ', NULL, 'cachorro', 'chow_chow', 2, 'meses', NULL, NULL, NULL, 'M', 'Caramelo ', NULL, NULL, NULL),
(56, 'Caraca', NULL, 'tartaruga', 'jabuti_piranga', 15, 'anos', NULL, NULL, 15, 'M', 'Verde', NULL, NULL, NULL),
(59, 'Caramelo ', NULL, 'cachorro', 'chow_chow', 2, 'meses', NULL, NULL, NULL, 'M', 'Caramelado', NULL, NULL, NULL),
(73, 'Urso ', NULL, 'cachorro', 'vira_lata', NULL, NULL, NULL, NULL, 7, 'M', 'Caramelo', '2025-05-22', NULL, NULL),
(79, 'Rex', 85, 'cachorro', 'vira_lata', NULL, NULL, NULL, NULL, 5, 'M', 'branco', '2010-10-02', NULL, NULL),
(80, 'Tico', 86, 'gato', 'vira_lata', NULL, NULL, NULL, NULL, 5, 'M', 'Laranja', '2020-05-10', NULL, NULL),
(101, 'Tico', 95, 'gato', 'vira_lata', 3, 'anos', NULL, NULL, 4, 'M', 'Laranja', NULL, NULL, NULL),
(102, 'Tico', 95, 'gato', 'vira_lata', 5, 'anos', NULL, NULL, 5, 'M', 'Laranja', NULL, '/uploads/2830654321c2326824b58e198e1f675b.jpeg', NULL),
(103, 'Luna', 96, 'cachorro', 'vira_lata', 6, 'anos', 1, NULL, NULL, 'F', NULL, NULL, NULL, NULL),
(104, 'Sara', 97, 'cachorro', 'dachshund', NULL, NULL, NULL, NULL, NULL, 'F', 'Branca', '2003-03-11', '/uploads/ecb927684e6a7b49311a04bd166ccdc7.jpeg', NULL),
(105, 'Gaia', 98, 'gato', 'sem_raca_definida', 7, 'meses', NULL, NULL, NULL, 'F', 'Cinza', NULL, NULL, NULL),
(120, 'Test', 102, 'réptil 🦎', 'Dragão Barbudo (Bearded Dragon)', NULL, 'anos', NULL, NULL, 3, 'M', 'Caramelo', '2026-05-05', '/uploads/1779111607640_143.jpeg', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `prontuario`
--

CREATE TABLE `prontuario` (
  `id` int(11) NOT NULL,
  `id_pet` int(11) DEFAULT NULL,
  `id_veterinario` int(11) DEFAULT NULL,
  `data_consulta` date NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `tratamento` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `senha` varchar(255) DEFAULT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `pet_primario` varchar(100) DEFAULT NULL COMMENT 'Resposta para a pergunta: nome do primeiro pet',
  `cor_favorita` varchar(100) DEFAULT NULL COMMENT 'Resposta para a pergunta: cor favorita',
  `role` varchar(20) NOT NULL DEFAULT 'tutor',
  `cpf` varchar(14) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `senha`, `nome`, `telefone`, `endereco`, `foto_url`, `pet_primario`, `cor_favorita`, `role`, `cpf`) VALUES
(62, 'admin@petto.com', '$2y$10$rTMhQ3aGT6HiLzv4L/EpOOBbYAsoqZ1ywF2j.BMvASqWR6WnLNMru', 'Admin', '(11) 90000-0000', 'São Paulo/SP', NULL, NULL, NULL, 'tutor', NULL),
(63, 'joao.silva@gmail.com', '$2y$10$EDtGQWCxvtXwZkbgnEVXo.mCOOUQ2Tk9xgo/e30Qsv2KCNPNkDQvC', 'João Silva', '(21) 91234-5678', 'Rua das Flores, 23 - Taquaritinga/SP', NULL, NULL, NULL, 'tutor', NULL),
(64, 'maria.costa@gmail.com', '$2y$10$isP.6FgvgXNZpVkdan4tnuWqfaks0GaMX9wvObZRAKGuTr6i5WhkK', 'Maria Costa', '(16) 98765-4321', 'Avenida Brasil, 456 - Matão/SP', NULL, NULL, NULL, 'tutor', NULL),
(82, 'davisilva016y@gmail.com', '$2b$10$7N38aKAOhBdppHobNcqlbuZkX5bAfUgmI3vIrTV9VcUYH0mjcB36S', 'Davi ', NULL, NULL, NULL, 'CARAMELO ', 'Preto ', 'tutor', NULL),
(83, 'morafabiana564@gmail.com', '$2b$10$71S4mo64JZfWUuXOnKeJV.2dLE50PN2PwPFNdXY57n.iWCd3.5woi', 'Fabiana ', NULL, NULL, NULL, 'Bethoven', 'Azul', 'tutor', NULL),
(84, 'jhon@gmail.com', '$2b$10$tDY.AcUnElLX7iMehTwMyuUxV0tEK7cIknEI7mMXjyWjN2dfnswbO', 'Jonatas', '16999888005', 'R. José Mendes Ferreira Júnior, 214', NULL, 'Tigre', 'Azul', 'tutor', '00099107007'),
(85, 'maicon354@gmail.com', '$2b$10$xLr92btjIlqzoCBWPfZxsOMSttKaFYrOvcuLaD4POBzhWJ391ul3y', 'Maicon', NULL, NULL, NULL, 'rex', 'azul', 'tutor', NULL),
(86, 'stefanistraccini@gmail.com', '$2b$10$4yna7UzPShQtBzUUbUEDoeeHei.ild6CyqvAhID8rorquoTmJ2Kwy', 'Stefani', NULL, NULL, NULL, 'Tico', 'Rosa', 'tutor', NULL),
(95, 'stefanistraccini93@gmail.com', '$2b$10$OxxgaMavHj.6KyBcfJAP4O7GYZQJbK6h/YE2Kb3uRGcsQ8o2zln1i', 'Stefani straccini', NULL, NULL, NULL, 'Tico', 'Pink', 'tutor', NULL),
(96, 'thais.casagrande@fatectq.edu.br', '$2b$10$ceFfEdqDOr7791i1mbWPXOjrLbUsLCVkPbvmNQZKS08Dj6p.AVxoW', 'Thais', NULL, NULL, '/uploads/a56fc66edd924f22e3fcfb8ada5f4003.jpeg', 'Luna', 'Amarelo', 'veterinario', NULL),
(97, 'sabrinarodriguesjesus4@gmail.com', '$2b$10$jE6SvLo83yayhsLVGV45F.OJrWd09ha.FRHBJS6/73OKCNRMpGUhi', 'Sabrina', NULL, NULL, '/uploads/df40833bdd3d6b18c97902712d5b49e0.jpeg', 'Theo', 'Azul', 'tutor', NULL),
(98, 'bea@gmail.com', '$2b$10$lyBq0kFfS0R3hYARNjVwdePmBQc7rcXW0bJPiyz7c.ROfkecIJ/aC', 'Beatriz Silva', NULL, NULL, NULL, 'Gaia', 'Roxo', 'tutor', NULL),
(101, 'maicon129@gmail.com', '$2b$10$8cXjEjnr40UD8GdQokdJE..VZzn0QMsHpcPMy7TULcWf7XkcbAwxm', 'Maicon Pivetta', NULL, NULL, NULL, 'Bolinha', 'Azul', 'tutor', NULL),
(102, 'jonatasmoraes05@gmail.com', '$2b$10$3p0UybJRHei2oTa1UbP6l.Hy0PYlOsYUX2nq51j2BCj3MNjVaLxS.', 'Jônatas', NULL, NULL, NULL, 'Jonatas Silva', 'azul', 'tutor', NULL),
(105, 'testando@gmail.com', '$2b$10$a8KF4jLwfugb69w6wD8ss.6Rd5UA7gz2N4p5NaA9ni5GSWnC3/OBy', 'Teste', NULL, NULL, NULL, 'Tigre', 'Azul', 'tutor', NULL),
(106, 'vet@gmail.com', '$2b$10$B.7dfbOEwZ3quEFFm0Xn3e2uAgkdUrfiX3sG.j0Njhtuh2XK3tpv2', 'Vet', NULL, NULL, NULL, 'Tigre', 'Azul', 'veterinario', '46935923077'),
(107, 'davisilva16y@gmail.com', '$2b$10$yV1H/0/y.nqUsTWioAJLWuZ/MRuS.5SQQKDZiQ0UwrRnZJUL1pdcW', 'Davi Silva', NULL, NULL, NULL, 'Caramelo', 'Preto', 'tutor', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `vacinas`
--

CREATE TABLE `vacinas` (
  `id_vacina` int(11) NOT NULL,
  `id_dataset` varchar(100) DEFAULT NULL,
  `nome` varchar(100) NOT NULL,
  `data_aplicacao` date DEFAULT NULL,
  `proxima_aplicacao` date NOT NULL,
  `data_desconhecida` tinyint(1) DEFAULT 0,
  `id_pet` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `vacinas`
--

INSERT INTO `vacinas` (`id_vacina`, `id_dataset`, `nome`, `data_aplicacao`, `proxima_aplicacao`, `data_desconhecida`, `id_pet`) VALUES
(4, NULL, 'V10', '2025-06-26', '2026-06-26', 0, 50),
(5, NULL, 'Antirrábica', '2025-06-21', '2026-06-21', 0, 51),
(13, NULL, 'Polivalente V8 ou V10 (Cinomose, Parvovirose, etc.)', NULL, '0000-00-00', 0, 73),
(15, NULL, 'Leucemia Felina (FeLV)', '2021-06-22', '0000-00-00', 0, 80),
(22, 'vacina_v10_cao', 'Polivalente V8 ou V10 (Cinomose, Parvovirose, etc.)', NULL, '0000-00-00', 1, 103),
(23, 'vacina_rabica_cao_gato', 'Antirrábica (Raiva)', NULL, '0000-00-00', 0, 104);

-- --------------------------------------------------------

--
-- Estrutura para tabela `veterinarios`
--

CREATE TABLE `veterinarios` (
  `id_veterinario` int(11) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `nome_clinica` varchar(150) DEFAULT NULL,
  `tempo_experiencia` varchar(50) DEFAULT NULL,
  `telefone` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `endereco` varchar(100) DEFAULT NULL,
  `cep_clinica` varchar(10) DEFAULT NULL,
  `bairro_clinica` varchar(100) DEFAULT NULL,
  `numero_clinica` varchar(20) DEFAULT NULL,
  `cpf` varchar(15) DEFAULT NULL,
  `crmv` varchar(30) NOT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `veterinarios`
--

INSERT INTO `veterinarios` (`id_veterinario`, `nome`, `nome_clinica`, `tempo_experiencia`, `telefone`, `email`, `endereco`, `cep_clinica`, `bairro_clinica`, `numero_clinica`, `cpf`, `crmv`, `user_id`) VALUES
(63, 'Dr. Lucas Oliveira', NULL, NULL, '(16) 98765-4321', 'lucas.oliveira@gmail.com', 'Flares, 723 - Taquaritinga/SP', NULL, NULL, NULL, '123.456.789-00', '12345-SP', NULL),
(64, 'Dra. Ana Souza', NULL, NULL, '(16) 99876-5432', 'ana.souza@gmail.com', 'Avenida Brasil, 456 - Matão/SP', NULL, NULL, NULL, '987.654.321-99', '67891-SP', NULL),
(65, 'Dr. Pedro Silva', NULL, NULL, '(16) 91234-5678', 'pedro.silva@gmail.com', 'Rua Acácias, 789 - Araraquara/SP', NULL, NULL, NULL, '456.789.123-22', '54321-SP', NULL),
(66, 'Dra. Mariana Costa', NULL, NULL, '(16) 93456-7890', 'marianacosta@gmail.com', 'Alameda, 101 - Taquaritinga/SP', NULL, NULL, NULL, '789.123.456-33', '17223-SP', NULL),
(67, 'Dr. Carlos Pereira', NULL, NULL, '(16) 94567-8901', 'carlos.pereira@gmail.com', 'Travessa, 55 - Taquaritinga/SP', NULL, NULL, NULL, '321.654.987-44', '33445-SP', NULL);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD PRIMARY KEY (`id_agendamento`),
  ADD KEY `id_pet` (`id_pet`),
  ADD KEY `id_veterinario` (`id_veterinario`);

--
-- Índices de tabela `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD PRIMARY KEY (`id_medicamento`),
  ADD KEY `id_pet` (`id_pet`);

--
-- Índices de tabela `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`id_pet`),
  ADD KEY `idx_id_veterinario` (`id_veterinario`),
  ADD KEY `fk_usuario_pet` (`id_usuario`);

--
-- Índices de tabela `prontuario`
--
ALTER TABLE `prontuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_pet` (`id_pet`),
  ADD KEY `id_veterinario` (`id_veterinario`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `vacinas`
--
ALTER TABLE `vacinas`
  ADD PRIMARY KEY (`id_vacina`),
  ADD KEY `id_pet` (`id_pet`);

--
-- Índices de tabela `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD PRIMARY KEY (`id_veterinario`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agendamentos`
--
ALTER TABLE `agendamentos`
  MODIFY `id_agendamento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `medicamentos`
--
ALTER TABLE `medicamentos`
  MODIFY `id_medicamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de tabela `pets`
--
ALTER TABLE `pets`
  MODIFY `id_pet` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT de tabela `prontuario`
--
ALTER TABLE `prontuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT de tabela `vacinas`
--
ALTER TABLE `vacinas`
  MODIFY `id_vacina` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `veterinarios`
--
ALTER TABLE `veterinarios`
  MODIFY `id_veterinario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agendamentos`
--
ALTER TABLE `agendamentos`
  ADD CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`id_pet`) REFERENCES `pets` (`id_pet`) ON DELETE CASCADE,
  ADD CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`id_veterinario`) REFERENCES `veterinarios` (`id_veterinario`) ON DELETE CASCADE;

--
-- Restrições para tabelas `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD CONSTRAINT `medicamentos_ibfk_1` FOREIGN KEY (`id_pet`) REFERENCES `pets` (`id_pet`) ON DELETE CASCADE;

--
-- Restrições para tabelas `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `fk_usuario_pet` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_veterinario` FOREIGN KEY (`id_veterinario`) REFERENCES `veterinarios` (`id_veterinario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `prontuario`
--
ALTER TABLE `prontuario`
  ADD CONSTRAINT `prontuario_ibfk_1` FOREIGN KEY (`id_pet`) REFERENCES `pets` (`id_pet`) ON DELETE CASCADE,
  ADD CONSTRAINT `prontuario_ibfk_2` FOREIGN KEY (`id_veterinario`) REFERENCES `veterinarios` (`id_veterinario`);

--
-- Restrições para tabelas `vacinas`
--
ALTER TABLE `vacinas`
  ADD CONSTRAINT `vacinas_ibfk_1` FOREIGN KEY (`id_pet`) REFERENCES `pets` (`id_pet`) ON DELETE CASCADE;

--
-- Restrições para tabelas `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD CONSTRAINT `veterinarios_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
