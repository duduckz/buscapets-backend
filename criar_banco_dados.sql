-- ============================================
-- Script de Criação do Banco de Dados BuscaPet
-- ============================================
-- Execute este script no seu banco de dados MySQL
-- ============================================

-- Criar o banco de dados se não existir
CREATE DATABASE IF NOT EXISTS buscapet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE buscapet;

-- ============================================
-- Tabela de Usuários
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, -- Para armazenar o hash da senha (bcrypt)
    telefone VARCHAR(20),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    foto_perfil VARCHAR(255), -- Caminho/nome do arquivo da foto
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabela de Pets
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
    id_pet INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome VARCHAR(100),
    especie ENUM('Cachorro', 'Gato', 'Outro') NOT NULL,
    raca VARCHAR(100),
    idade INT,
    sexo ENUM('Macho', 'Fêmea') NOT NULL,
    porte ENUM('Pequeno', 'Médio', 'Grande'),
    cor VARCHAR(50),
    descricao TEXT,
    status ENUM('Perdido', 'Encontrado', 'Adoção') NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    foto_pet VARCHAR(255), -- Caminho/nome do arquivo da foto
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- ============================================
-- Tabela de Mensagens
-- ============================================
CREATE TABLE IF NOT EXISTS mensagens (
    id_mensagem INT AUTO_INCREMENT PRIMARY KEY,
    id_remetente INT NOT NULL,
    id_destinatario INT NOT NULL,
    id_pet INT, -- Opcional: para qual pet a mensagem se refere
    conteudo TEXT NOT NULL,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_remetente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_pet) REFERENCES pets(id_pet) ON DELETE SET NULL
);

-- ============================================
-- Tabela de Solicitações de Adoção
-- ============================================
CREATE TABLE IF NOT EXISTS adocoes (
    id_adocao INT AUTO_INCREMENT PRIMARY KEY,
    id_pet INT NOT NULL UNIQUE, -- Um pet só pode ter uma solicitação de adoção ativa por vez
    id_solicitante INT NOT NULL,
    status ENUM('Pendente', 'Aceita', 'Recusada') DEFAULT 'Pendente',
    data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pet) REFERENCES pets(id_pet) ON DELETE CASCADE,
    FOREIGN KEY (id_solicitante) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- ============================================
-- Índices para otimização de busca
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_pets_localizacao ON pets(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(id_remetente);
CREATE INDEX IF NOT EXISTS idx_mensagens_destinatario ON mensagens(id_destinatario);

-- ============================================
-- Fim do Script
-- ============================================

