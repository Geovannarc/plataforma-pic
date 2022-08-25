import app = require("teem");
import appsettings = require("../appsettings");
import Escola = require("../models/escola");
import Secao = require("../models/secao");
import Usuario = require("../models/usuario");

class SecaoRoute {
	
	public static async listar(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u || !u.admin)
			res.redirect(app.root + "/acesso");
		else
			res.render("secao/listar", {
				layout: "layout-tabela",
				titulo: "Gerenciar secaos",
				datatables: true,
				usuario: u,
				lista: await Secao.listar()
			});
	}
}

export = SecaoRoute;
