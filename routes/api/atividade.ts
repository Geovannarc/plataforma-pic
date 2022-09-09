import app = require("teem");
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
		const u = await Usuario.cookie(req, res, true);
		if (!u)
		 	return;

		if (!req.body) {
			res.status(400).json("Dados inválidos");
			return;
		}

		const erro = await Atividade.registrarTentativa(parseInt(req.body.idturma_atividade), u.id, parseInt(req.body.nota));

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}
}

export = AtividadeApiRoute;
