import app = require("teem");
import Perfil = require("../enums/perfil");
import { ids, lista } from "../models/perfil";
import Turma = require("../models/turma");
import Usuario = require("../models/usuario");

class IndexRoute {
	@app.http.hidden()
	private static async obterAnos(req: app.Request, res: app.Response, usuario: Usuario): Promise<{ ano: number, anos: number[] } | null> {
		const anos = await Turma.anosPorUsuario(usuario.id);
		if (!anos || !anos.length) {
			res.render("index/erro", { layout: "layout-externo", mensagem: "Não foram encontradas atribuições do usuário a turmas" });
			return null;
		}

		let ano = parseInt(req.query["ano"] as string) || (new Date()).getFullYear();
		let encontrado = false;
		for (let i = anos.length - 1; i >= 0; i--) {
			if (anos[i] === ano) {
				encontrado = true;
				break;
			}
		}
		if (!encontrado)
			ano = anos[anos.length - 1];

		return {
			ano,
			anos
		};
	}

	public static async index(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u) {
			res.redirect(app.root + "/login");
		} else {
			const anos = await IndexRoute.obterAnos(req, res, u);
			if (!anos)
				return;

			if (u.idperfil == Perfil.Professor || u.idperfil == Perfil.Administrador) {
				res.render("index/index", {
					layout: "layout-sem-form",
					titulo: "Dashboard",
					usuario: u,
					ano: anos.ano,
					anos: anos.anos,
					lista: await Turma.situacaoPorProfessor(anos.ano, u.id)
				});
			} else {
				const situacao = await Turma.situacaoPorAlunoPorCapitulo(anos.ano, u.id);
				if (!situacao) {
					res.render("index/erro", { layout: "layout-externo", mensagem: "Não foi encontrada uma matrícula em uma turma no ano de " + anos.ano });
				} else {
					res.render("index/menu", {
						layout: "layout-externo-sem-card",
						usuario: u,
						situacao,
						atividades: await Turma.notasAluno(anos.ano, u.id),
						liberadas: await Turma.liberadasPorTurma(anos.ano, u.id)
					});
				}
			}
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
		if (!u) {
			res.redirect(app.root + "/acesso");
		} else {
			const anos = await IndexRoute.obterAnos(req, res, u);
			if (!anos)
				return;

			if (u.idperfil == Perfil.Aluno) {
				const situacao = await Turma.situacaoPorAluno(anos.ano, u.id);
				if (!situacao) {
					res.render("index/erro", { layout: "layout-externo", mensagem: "Não foi encontrada uma matrícula em uma turma no ano de " + anos.ano });
				} else {
					res.render("index/notas", {
						layout: "layout-sem-form",
						titulo: "Notas",
						datatables: true,
						xlsx: true,
						usuario: u,
						ano: anos.ano,
						anos: anos.anos,
						notas: await Turma.notasAluno(anos.ano, u.id),
						situacao
					});
				}
			} else {
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
