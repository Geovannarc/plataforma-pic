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

-- SCRIPT DE ATIVIDADES

CREATE TABLE secao (
  id int NOT NULL,
  nome varchar(30) NOT NULL,
  PRIMARY KEY (id)
);

-- Manter sincronizado com enums/secao.ts e models/secao.ts
INSERT INTO secao (id, nome) VALUES (1, 'EXPLORANDO IDEIAS'), (2, 'APRENDENDO'), (3, 'ATIVIDADE'), (4, 'CONECTANDO'), (5, 'VAMOS JOGAR');

CREATE TABLE livro (
  id int NOT NULL,
  nome varchar(100) NOT NULL,
  capitulos int NOT NULL,
  atividades int NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO livro (id, nome, capitulos, atividades) VALUES
(1, 'Vamos Jogar Xadrez', 5, 0),
(2, 'Descobrindo o Jogo de Xadrez', 6, 0);

CREATE TABLE capitulo (
  idlivro int NOT NULL,
  capitulo int NOT NULL,
  atividades int NOT NULL,
  nome varchar(30) NOT NULL,
  PRIMARY KEY (idlivro, capitulo),
  KEY capitulo_capitulo_IX (capitulo, idlivro),
  CONSTRAINT capitulo_idlivro_FK FOREIGN KEY (idlivro) REFERENCES livro (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO capitulo (idlivro, capitulo, atividades, nome) VALUES
(1, 1, 0, 'O Jogo de Xadrez'),
(1, 2, 0, 'As Peças I'),
(1, 3, 0, 'As Peças II'),
(1, 4, 0, 'Capítulo 1-4'),
(1, 5, 0, 'Capítulo 1-5'),
(2, 1, 0, 'Capítulo 2-1'),
(2, 2, 0, 'Capítulo 2-2'),
(2, 3, 0, 'Capítulo 2-3'),
(2, 4, 0, 'Capítulo 2-4'),
(2, 5, 0, 'Capítulo 2-5'),
(2, 6, 0, 'Capítulo 2-6');

CREATE TABLE atividade (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(100) NOT NULL,
  sufixo varchar(10) NOT NULL,
  idlivro int NOT NULL,
  capitulo int NOT NULL,
  idsecao int NOT NULL,
  ordem int NOT NULL,
  PRIMARY KEY (id),
  KEY atividade_idlivro_capitulo_idsecao_IX (idlivro, capitulo, idsecao),
  KEY atividade_idlivro_capitulo_ordem_IX (idlivro, capitulo, ordem),
  KEY atividade_idsecao_IX (idsecao),
  CONSTRAINT atividade_idlivro_FK FOREIGN KEY (idlivro) REFERENCES livro (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT atividade_idsecao_FK FOREIGN KEY (idsecao) REFERENCES secao (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

INSERT INTO atividade (nome, sufixo, idlivro, capitulo, idsecao, ordem) VALUES
-- Livro 1 - Capítulo 1
('', '', 1, 1, 1, 1), -- Explorando Ideias
('', '', 1, 1, 2, 2), -- Aprendendo
('', ' - 1', 1, 1, 3, 3), -- Atividade
('', ' - 2', 1, 1, 3, 4), -- Atividade
('', '', 1, 1, 4, 5), -- Conectando
('', '', 1, 1, 5, 6), -- Vamos Jogar
-- Livro 1 - Capítulo 2
('', '', 1, 2, 1, 1), -- Explorando Ideias
('', ' - 1', 1, 2, 2, 2), -- Aprendendo
('', ' - 1', 1, 2, 3, 3), -- Atividade
('', ' - 2', 1, 2, 3, 4), -- Atividade
('', ' - 3', 1, 2, 3, 5), -- Atividade
('', ' - 2', 1, 2, 2, 6), -- Aprendendo
('', ' - 4', 1, 2, 3, 7), -- Atividade
('', ' - 5', 1, 2, 3, 8), -- Atividade
('', '', 1, 2, 4, 9), -- Conectando
('', ' - 1', 1, 2, 5, 10), -- Vamos Jogar
('', ' - 2', 1, 2, 5, 11), -- Vamos Jogar
('', ' - 3', 1, 2, 5, 12); -- Vamos Jogar

UPDATE atividade a SET a.nome = CONCAT((SELECT nome FROM secao s WHERE s.id = a.idsecao), a.sufixo) WHERE a.id > 0;
UPDATE capitulo c SET c.atividades = (SELECT COUNT(id) FROM atividade a WHERE a.idlivro = c.idlivro AND a.capitulo = c.capitulo) WHERE c.idlivro > 0;
UPDATE livro l SET l.atividades = (SELECT SUM(atividades) FROM capitulo c WHERE c.idlivro = l.id) WHERE l.id > 0;

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
  idlivro int NOT NULL,
  exclusao datetime NULL,
  criacao datetime NOT NULL,
  PRIMARY KEY (id),
  KEY turma_ano_idescola_exclusao_IX (ano, idescola, exclusao),
  KEY turma_ano_exclusao_IX (ano, exclusao),
  KEY turma_idescola_exclusao_IX (idescola, exclusao),
  KEY turma_exclusao_IX (exclusao),
  CONSTRAINT turma_idescola_FK FOREIGN KEY (idescola) REFERENCES escola (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT turma_idlivro_FK FOREIGN KEY (idlivro) REFERENCES livro (id) ON DELETE RESTRICT ON UPDATE RESTRICT
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

CREATE TABLE turma_usuario_atividade (
  id int NOT NULL AUTO_INCREMENT,
  idturma_usuario int NOT NULL,
  idatividade int NOT NULL,
  nota int NOT NULL,
  aprovado tinyint NOT NULL,
  conclusao datetime NOT NULL,
  PRIMARY KEY (id),
  KEY turma_usuario_atividade_idturma_usuario_idatividade_aprovado_IX (idturma_usuario, idatividade, aprovado),
  KEY turma_usuario_atividade_idturma_usuario_aprovado_IX (idturma_usuario, aprovado),
  KEY turma_usuario_atividade_idatividade_IX (idatividade),
  CONSTRAINT turma_usuario_atividade_idturma_usuario_FK FOREIGN KEY (idturma_usuario) REFERENCES turma_usuario (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT turma_usuario_atividade_idatividade_FK FOREIGN KEY (idatividade) REFERENCES atividade (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE turma_atividade_liberada (
  id int NOT NULL AUTO_INCREMENT,
  idturma int NOT NULL,
  idatividade int NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY turma_atividade_liberada_idturma_idatividade_UN (idturma, idatividade),
  KEY turma_atividade_liberada_idatividade_IX (idatividade),
  CONSTRAINT turma_atividade_liberada_idturma_FK FOREIGN KEY (idturma) REFERENCES turma (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT turma_atividade_liberada_idatividade_FK FOREIGN KEY (idatividade) REFERENCES atividade (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

-- Teste inicial

INSERT INTO usuario (email, nome, idperfil, senha, token, criacao) VALUES ('professor1@portalsistemax.com.br', 'Professor 1', 2, 'NsSzgX9AXd2G85aiCOrUwAFkiEHrHYljYWpJBCfqOvKr:WD+jsEW/Dswcivs42EZBZREfm+4WaPcZHRPG5LJpD8yr', NULL, NOW());
INSERT INTO usuario (email, nome, idperfil, senha, token, criacao) VALUES ('professor2@portalsistemax.com.br', 'Professor 2', 2, 'NsSzgX9AXd2G85aiCOrUwAFkiEHrHYljYWpJBCfqOvKr:WD+jsEW/Dswcivs42EZBZREfm+4WaPcZHRPG5LJpD8yr', NULL, NOW());
INSERT INTO usuario (email, nome, idperfil, senha, token, criacao) VALUES ('aluno1@portalsistemax.com.br', 'Aluno 1', 3, 'NsSzgX9AXd2G85aiCOrUwAFkiEHrHYljYWpJBCfqOvKr:WD+jsEW/Dswcivs42EZBZREfm+4WaPcZHRPG5LJpD8yr', NULL, NOW());
INSERT INTO usuario (email, nome, idperfil, senha, token, criacao) VALUES ('aluno2@portalsistemax.com.br', 'Aluno 2', 3, 'NsSzgX9AXd2G85aiCOrUwAFkiEHrHYljYWpJBCfqOvKr:WD+jsEW/Dswcivs42EZBZREfm+4WaPcZHRPG5LJpD8yr', NULL, NOW());
INSERT INTO usuario (email, nome, idperfil, senha, token, criacao) VALUES ('aluno3@portalsistemax.com.br', 'Aluno 3', 3, 'NsSzgX9AXd2G85aiCOrUwAFkiEHrHYljYWpJBCfqOvKr:WD+jsEW/Dswcivs42EZBZREfm+4WaPcZHRPG5LJpD8yr', NULL, NOW());
INSERT INTO usuario (email, nome, idperfil, senha, token, criacao) VALUES ('aluno4@portalsistemax.com.br', 'Aluno 4', 3, 'NsSzgX9AXd2G85aiCOrUwAFkiEHrHYljYWpJBCfqOvKr:WD+jsEW/Dswcivs42EZBZREfm+4WaPcZHRPG5LJpD8yr', NULL, NOW());
INSERT INTO escola (nome, email, contato, criacao) VALUES ('Escola 1', 'email@escola1.com.br', 'Contato Escola 1', NOW());
INSERT INTO turma (idescola, ano, serie, nome, sala, idlivro, criacao) VALUES (1, 2023, 1, 'Turma 1A', 'Sala A', 1, NOW());
INSERT INTO turma (idescola, ano, serie, nome, sala, idlivro, criacao) VALUES (1, 2023, 1, 'Turma 1B', 'Sala B', 1, NOW());
