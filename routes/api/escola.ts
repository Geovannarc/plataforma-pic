import app = require("teem");
import Escola = require("../../models/escola");
import Usuario = require("../../models/usuario");

class EscolaApiRoute {

    public static async listar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		res.json(await Escola.listar());
	}

	@app.http.post()
	public static async criar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;

		const ret = await Escola.criar(req.body);

		if (typeof ret === "string")
			res.status(400);

		res.json(ret);
	}

	@app.http.post()
	public static async editar(req: app.Request, res: app.Response) {
		const u = await Usuario.cookie(req, res, true);
		if (!u)
			return;
		
		const erro = await Escola.editar(req.body);

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

		const erro = await Escola.excluir(id);

		if (erro) {
			res.status(400).json(erro);
			return;
		}

		res.sendStatus(204);
	}

}

export = EscolaApiRoute;
