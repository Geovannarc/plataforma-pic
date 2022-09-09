import app = require("teem");
import appsettings = require("../appsettings");
import Escola = require("../models/escola");
import Usuario = require("../models/usuario");

class EscolaRoute {

	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			const hoje = new Date();

			res.render("escola/editar", {
				titulo: "Criar Escola",
				textoSubmit: "Criar",
				usuario: u,
				item: null,
				ano: hoje.getFullYear()
			});
		}
	}

	public static async editar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			let id = parseInt(req.query["id"] as string);
			let item: Escola = null;
			if (isNaN(id) || !(item = await Escola.obter(id)))
				res.render("index/nao-encontrado", {
					layout: "layout-sem-form",
					usuario: u
				});
			else
				res.render("escola/editar", {
					titulo: "Editar Escola",
					usuario: u,
					item
				});
		}
	}

	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("escola/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar Escolas",
				datatables: true,
				usuario: u,
				lista: await Escola.listar()
			});
	}

    public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else{
			res.render("escola/listar", {
				layout: "layout-sem-form",
				titulo: "Escolas",
				datatables: true,
				usuario: u,
				lista: await Escola.listar()
			});
        }
	}
}

export = EscolaRoute;
