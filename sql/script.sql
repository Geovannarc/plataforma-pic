CREATE DATABASE IF NOT EXISTS sistemax DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;
USE sistemax;

-- DROP TABLE IF EXISTS perfil;
CREATE TABLE perfil (
  id int NOT NULL,
  nome varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY nome_UN (nome)
);

-- Manter sincronizado com enums/perfil.ts e models/perfil.ts
INSERT INTO perfil (id, nome) VALUES (1, 'Administrador'), (2, 'Professor'), (3, 'Aluno');

CREATE TABLE usuario (
  id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL,
  nome varchar(100) NOT NULL,
  idperfil int NOT NULL,
  senha varchar(100) NOT NULL,
  token char(32) DEFAULT NULL,
  exclusao datetime NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY usuario_email_UN (email),
  KEY usuario_exclusao_IX (exclusao),
  KEY usuario_idperfil_FK_IX (idperfil),
  CONSTRAINT usuario_idperfil_FK FOREIGN KEY (idperfil) REFERENCES perfil (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO usuario (email, nome, idperfil, senha, token, criacao) VALUES ('admin@portalsistemax.com.br', 'Administrador', 1, 'NsSzgX9AXd2G85aiCOrUwAFkiEHrHYljYWpJBCfqOvKr:WD+jsEW/Dswcivs42EZBZREfm+4WaPcZHRPG5LJpD8yr', NULL, NOW());

CREATE TABLE escola (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  contato varchar(100) NOT NULL,
  exclusao datetime NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY escola_nome_UN (nome),
  KEY escola_exclusao_IX (exclusao)
);

-- SCRIPT DE ATIVIDADES

CREATE TABLE secao (
  id int NOT NULL,
  nome varchar(30) NOT NULL,
  PRIMARY KEY (id)
);

-- Manter sincronizado com enums/secao.ts e models/secao.ts
INSERT INTO secao (id, nome) VALUES (1, 'EXPLORANDO IDEIAS'), (2, 'APRENDENDO'), (3, 'ATIVIDADES'), (4, 'CONECTANDO'), (5, 'VAMOS JOGAR');

CREATE TABLE livro (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE atividade (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  url varchar(100) NOT NULL,
  idlivro int NOT NULL,
  capitulo int NOT NULL,
  idsecao int NOT NULL,
  ordem int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY atividade_idlivro_idsecao_UN (idlivro, idsecao),
  KEY atividade_idsecao_IX (idsecao),
  CONSTRAINT atividade_idlivro_FK FOREIGN KEY (idlivro) REFERENCES livro (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT atividade_idsecao_FK FOREIGN KEY (idsecao) REFERENCES secao (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE TABLE turma (
  id int NOT NULL AUTO_INCREMENT,
  idescola int NOT NULL,
  ano smallint NOT NULL,
  serie smallint NOT NULL,
  nome varchar(100) NOT NULL,
  sala varchar(100) NOT NULL,
  idlivro int NOT NULL,
  exclusao datetime NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  KEY turma_ano_idescola_exclusao_IX (ano, idescola, exclusao),
  KEY turma_ano_exclusao_IX (ano, exclusao),
  KEY turma_idescola_exclusao_IX (idescola, exclusao),
  KEY turma_exclusao_IX (exclusao),
  CONSTRAINT turma_idescola_FK FOREIGN KEY (idescola) REFERENCES escola (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT turma_idlivro_FK FOREIGN KEY (idlivro) REFERENCES livro (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
);

CREATE TABLE turma_usuario (
  id int NOT NULL AUTO_INCREMENT,
  idturma int NOT NULL,
  idusuario int NOT NULL,
  professor tinyint NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY turma_usuario_idturma_idusuario_UN (idturma, idusuario),
  KEY turma_usuario_idusuario_IX (idusuario),
  CONSTRAINT turma_usuario_idturma_FK FOREIGN KEY (idturma) REFERENCES turma (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT turma_usuario_idusuario_FK FOREIGN KEY (idusuario) REFERENCES usuario (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE turma_atividade_liberada (
  id int NOT NULL AUTO_INCREMENT,
  idturma int NOT NULL,
  idatividade int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY turma_atividade_idturma_idatividade_UN (idturma, idatividade),
  KEY turma_atividade_idatividade_IX (idatividade),
  CONSTRAINT turma_atividade_idturma_FK FOREIGN KEY (idturma) REFERENCES turma (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT turma_atividade_idatividade_FK FOREIGN KEY (idatividade) REFERENCES atividade (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE turma_atividade_usuario (
  id int NOT NULL AUTO_INCREMENT,
  idturma_atividade int NOT NULL,
  idusuario int NOT NULL,
  nota int NOT NULL,
  conclusao datetime NULL,
  PRIMARY KEY (id),
  UNIQUE KEY turma_atividade_usuario_idturma_atividade_idusuario_UN (idturma_atividade, idusuario),
  KEY turma_atividade_usuario_idturma_atividade_idusuario_IX (idturma_atividade, idusuario),
  KEY turma_atividade_usuario_idusuario_IX (idusuario),
  CONSTRAINT turma_atividade_usuario_idturma_atividade_FK FOREIGN KEY (idturma_atividade) REFERENCES turma_atividade (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT turma_atividade_usuario_idusuario_FK FOREIGN KEY (idusuario) REFERENCES usuario (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE turma_atividade_usuario_tentativa (
  id int NOT NULL AUTO_INCREMENT,
  idturma_atividade_usuario int NOT NULL,
  nota int NOT NULL,
  data datetime NOT NULL,
  PRIMARY KEY (id),
  KEY turma_atividade_usuario_tentativa_idturma_atividade_usuario_IX (idturma_atividade_usuario),
  CONSTRAINT turma_atividade_usuario_tentativa_idturma_atividade_usuario_FK FOREIGN KEY (idturma_atividade_usuario) REFERENCES turma_atividade_usuario (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- select conclusao from turma_atividade_usuario where idturma_atividade = xxx and idusuario = yyy
