import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Secao = require("../enums/secao");

// Manter sincronizado com enums/secao.ts e sql/script.sql
const secoes = new ListaNomeada([
	new ItemNomeado(Secao.ExplorandoIdeias, "EXPLORANDO IDEIAS"),
	new ItemNomeado(Secao.Aprendendo, "APRENDENDO"),
	new ItemNomeado(Secao.Atividades, "ATIVIDADES"),
	new ItemNomeado(Secao.Conectando, "CONECTANDO"),
	new ItemNomeado(Secao.VamosJogar, "VAMOS JOGAR")
]);

export = secoes;
