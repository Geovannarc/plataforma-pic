import app = require("teem");
import appsettings = require("../appsettings");
import Escola = require("../models/escola");
import Turma = require("../models/turma");
import Usuario = require("../models/usuario");

class TurmaRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			const hoje = new Date();

			res.render("turma/editar", {
				titulo: "Criar Turma",
				textoSubmit: "Criar",
				usuario: u,
				item: null,
				ano: hoje.getFullYear(),
				usuarios: await Usuario.listarCombo(),
				escolas: await Escola.listarCombo()
			});
		}
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Turma = null;
			if (isNaN(id) || !(item = await Turma.obter(id)))
				res.render("index/nao-encontrado", {
					layout: "layout-sem-form",
					usuario: u
				});
			else
				res.render("turma/editar", {
					titulo: "Editar Turma",
					usuario: u,
					item,
					usuarios: await Usuario.listarCombo(),
					escolas: await Escola.listarCombo()
				});
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("turma/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar Turmas",
				datatables: true,
				usuario: u,
				lista: await Turma.listar()
			});
	}

	public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("turma/index", {
				layout: "layout-sem-form",
				titulo: "Minhas Turmas",
				datatables: true,
				usuario: u,
				lista: await Turma.listarDeUsuario(u.id)
			});
	}
}

export = TurmaRoute;
