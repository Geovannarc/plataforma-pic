import app = require("teem");
import Turma = require("../../models/turma");
import Usuario = require("../../models/usuario");

class TurmaApiRoute {
	@app.http.post()
	public static async criar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const ret = await Turma.criar(req.body);

		if (typeof ret === "string")
			res.status(400);

		res.json(ret);
	}

	@app.http.post()
	public static async editar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const erro = await Turma.editar(req.body);

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

		const erro = await Turma.excluir(id);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}

	public static async situacaoPorProfessor(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res);
		if (!u)
			return;

		const ano = parseInt(req.query["ano"] as string);

		res.json(await Turma.situacaoPorProfessor(ano || (new Date()).getFullYear(), u.id));
	}

	public static async situacaoPorAluno(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res);
		if (!u)
			return;

		const ano = parseInt(req.query["ano"] as string);

		res.json(await Turma.situacaoPorAluno(ano || (new Date()).getFullYear(), u.id));
	}

	public static async notas(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res);
		if (!u)
			return;

		res.json(await Turma.notasAluno(u.id, 2022));
	}
}

export = TurmaApiRoute;
