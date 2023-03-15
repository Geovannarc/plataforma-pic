import app = require("teem");
import appsettings = require("../appsettings");
import Escola = require("../models/escola");
import Atividade = require("../models/atividade");
import Usuario = require("../models/usuario");
import secoes = require("../models/secao");
import livros = require("../models/livro");

class AtividadeRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			res.render("atividade/editar", {
				titulo: "Criar Atividade",
				textoSubmit: "Criar",
				usuario: u,
				item: null,
				livros: livros.lista,
                secoes: secoes.lista
			});
		}
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Atividade = null;
			if (isNaN(id) || !(item = await Atividade.obter(id)))
				res.render("index/nao-encontrado", {
					layout: "layout-sem-form",
					usuario: u
				});
			else
				res.render("atividade/editar", {
					titulo: "Editar Atividade",
					usuario: u,
					item,
					livros: livros.lista,
					secoes: secoes.lista
				});
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("atividade/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar Atividades",
				datatables: true,
				usuario: u,
				lista: await Atividade.listar()
			});
	}
}

export = AtividadeRoute;
