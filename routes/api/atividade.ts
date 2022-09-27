import app = require("teem");
import Perfil = require("../../enums/perfil");
import Atividade = require("../../models/atividade");
import Usuario = require("../../models/usuario");

class AtividadeApiRoute {
	@app.http.post()
	public static async criar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const ret = await Atividade.criar(req.body);

		if (typeof ret === "string")
			res.status(400);

		res.json(ret);
	}

	@app.http.post()
	public static async editar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const erro = await Atividade.editar(req.body);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}

	@app.http.delete()
	public static async excluir(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const id = parseInt(req.query["id"] as string);

		if (isNaN(id)) {
			res.status(400).json("Id inválido");
			return;
		}

		const erro = await Atividade.excluir(id);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}

	@app.http.post()
	public static async registrarTentativa(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res);
		if (!u)
		 	return;

		if (!req.body) {
			res.status(400).json("Dados inválidos");
			return;
		}

		const erro = await Atividade.registrarTentativa(parseInt(req.body.idturma), u.id, parseInt(req.body.idatividade), parseInt(req.body.nota));

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}

	@app.http.post()
	public static async liberar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res);
		if (!u)
			return;

		if (u.idperfil === Perfil.Aluno) {
			res.status(403).json("Não permitido");
			return;
		}

		if (!req.body) {
			res.status(400).json("Dados inválidos");
			return;
		}

		const erro = await Atividade.liberar(parseInt(req.body.idatividade), parseInt(req.body.idturma), u.id, u.admin);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}

	@app.http.delete()
	public static async bloquear(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res);
		if (!u)
			return;

		if (u.idperfil === Perfil.Aluno) {
			res.status(403).json("Não permitido");
			return;
		}

		const erro = await Atividade.bloquear(parseInt(req.query["idatividade"] as string), parseInt(req.query["idturma"] as string), u.id, u.admin);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}
}

export = AtividadeApiRoute;
