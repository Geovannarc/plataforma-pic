import app = require("teem");
import appsettings = require("../appsettings");
import Escola = require("../models/escola");
import Atividade = require("../models/atividade");
import Usuario = require("../models/usuario");
import Secao = require("../models/secao");

class AtividadeRoute {
	public static async criar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin) {
			res.redirect(app.root + "/acesso");
		} else {
			res.render("atividade/editar", {
				titulo: "Criar atividade",
				textoSubmit: "Criar",
				usuario: u,
				item: null,
                lista: await Secao.listar()
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
					titulo: "Editar atividade",
					usuario: u,
					item,
                    lista: await Secao.listar()
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
				titulo: "Gerenciar atividades",
				datatables: true,
				usuario: u,
				lista: await Atividade.listar()
			});
	}

    public static async aula(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else{
            let id = parseInt(req.query["id"] as string);
			res.render("atividade/aula", {
				layout: "layout-sem-form",
				titulo: "",
				datatables: true,
				usuario: u,
                id: id,
				lista: await Atividade.listarDeatividade(id)
			});
        }
	}

	public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("atividade/index", {
				layout: "layout-sem-form",
				titulo: "Minhas atividades",
				datatables: true,
				usuario: u,
				lista: await Atividade.listarCombo()
			});
	}
}

export = AtividadeRoute;
