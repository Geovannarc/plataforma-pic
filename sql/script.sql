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

CREATE TABLE turma (
  id int NOT NULL AUTO_INCREMENT,
  idescola int NOT NULL,
  ano smallint NOT NULL,
  serie smallint NOT NULL,
  nome varchar(100) NOT NULL,
  sala varchar(100) NOT NULL,
  exclusao datetime NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  KEY turma_ano_idescola_exclusao_IX (ano, idescola, exclusao),
  KEY turma_ano_exclusao_IX (ano, exclusao),
  KEY turma_idescola_exclusao_IX (idescola, exclusao),
  KEY turma_exclusao_IX (exclusao),
  CONSTRAINT turma_idescola_FK FOREIGN KEY (idescola) REFERENCES escola (id) ON DELETE RESTRICT ON UPDATE RESTRICT
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

-- SCRIPT DE ATIVIDADES

CREATE TABLE secao (
	id int NOT NULL AUTO_INCREMENT,
  nome varchar(30),
  PRIMARY KEY (id)
);

CREATE TABLE atividade (
	id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  url varchar(100) NOT NULL,
  idsecao int NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT atividade_idsecao_FK FOREIGN KEY (idsecao) REFERENCES secao (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);
    

CREATE TABLE turma_atividade (
  id int NOT NULL AUTO_INCREMENT,
  idturma int NOT NULL,
  idatividade int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY turma_atividade_idturma_idatividade_UN (idturma, idatividade),
  KEY turma_atividade_idatividade_IX (idatividade),
  CONSTRAINT turma_atividade_idturma_FK FOREIGN KEY (idturma) REFERENCES turma (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT turma_atividade_idatividade_FK FOREIGN KEY (idatividade) REFERENCES atividade (id) ON DELETE CASCADE ON UPDATE RESTRICT
);