import app = require("teem");
import Perfil = require("../enums/perfil");
import { ids, lista } from "../models/perfil";
import Turma = require("../models/turma");
import Usuario = require("../models/usuario");

class IndexRoute {
	public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
		if(u.idperfil == Perfil.Professor || u.idperfil == Perfil.Administrador){
			res.render("index/index", {
				layout: "layout-sem-form",
				titulo: "Dashboard",
				usuario: u,
				lista: await Turma.situacaoPorProfessor(2022, u.id)
			});
		}else{
			const ano = (new Date()).getFullYear();
			res.render("index/menu", {
				layout: "menu",
				titulo: " ",
				usuario: u,
				lista: await Turma.situacaoPorAlunoPorCapitulo(ano, u.id),
				atividades: await Turma.notasAluno(ano, u.id),
				liberadas: await Turma.liberadasPorTurma(ano, u.id)
			});
		}
	}

	public static async mensagens(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else
			res.render("index/mensagem", {
				layout: "layout-sem-form",
				titulo: "Mensagens",
				usuario: u
			});
	}

	public static async notas(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/acesso");
		else{
			if(u.idperfil == Perfil.Aluno){
				const ano = (new Date()).getFullYear();
				res.render("index/notas", {
					layout: "layout-sem-form",
					titulo: "Notas",
					datatables: true,
					usuario: u,
					notas: await Turma.notasAluno(ano, u.id),
					situacao: await Turma.situacaoPorAluno(ano, u.id)
				});
			}else{
				// @@@ relatório de notas do professor
				res.render("index/erro", { layout: "layout-externo", mensagem: "Não implementado", erro: "Não implementado" });
			}
		}
	}

	@app.http.all()
	public static async login(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			let mensagem: string = null;
	
			if (req.body.email || req.body.senha) {
				[mensagem, u] = await Usuario.efetuarLogin(req.body.email as string, req.body.senha as string, res);
				if (mensagem)
					res.render("index/login", {
						layout: "layout-externo",
						mensagem: mensagem
					});
				else
					res.redirect(app.root + "/");
			} else {
				res.render("index/login", {
					layout: "layout-externo",
					mensagem: null
				});
			}
		} else {
			res.redirect(app.root + "/");
		}
	}

	public static async acesso(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/login");
		else
			res.render("index/acesso", {
				layout: "layout-sem-form",
				titulo: "Sem Permissão",
				usuario: u
			});
	}

	public static async perfil(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u)
			res.redirect(app.root + "/");
		else
			res.render("index/perfil", {
				titulo: "Meu Perfil",
				usuario: u
			});
	}

	public static async logout(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (u)
			await Usuario.efetuarLogout(u, res);
		res.redirect(app.root + "/");
	}
}

export = IndexRoute;
