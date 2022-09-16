import ItemNomeado = require("../data/itemNomeado");
import ListaNomeada = require("../data/listaNomeada");
import Livro = require("../enums/livro");

// Manter sincronizado com enums/livro.ts e sql/script.sql
const livros = new ListaNomeada([
	new ItemNomeado(Livro.VamosJogarXadrez, "Vamos Jogar Xadrez"),
	new ItemNomeado(Livro.DescobrindoOJogoDeXadrez, "Descobrindo O Jogo De Xadrez")
]);

export = livros;