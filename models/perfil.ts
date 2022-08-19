import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Perfil = require("../enums/perfil");

// Manter sincronizado com enums/perfil.ts e sql/script.sql
const perfis = new ListaNomeada([
	new ItemNomeado(Perfil.Administrador, "Administrador"),
	new ItemNomeado(Perfil.Professor, "Professor"),
	new ItemNomeado(Perfil.Aluno, "Aluno")
]);

export = perfis;
