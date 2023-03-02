import app = require("teem");
import Perfil = require("../enums/perfil");
import secoes = require("../models/secao");
import Turma = require("../models/turma");
import Usuario = require("../models/usuario");

class CapituloRoute {
    @app.route.methodName("atividade/:id/:l")
	public static async atividade(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u){
			res.redirect(app.root + "/login");
        }else{
            const ano = (new Date()).getFullYear();
            let atividade = parseInt(req.params["id"] as string);
            let livro = parseInt(req.params["l"] as string);
            const atividades = await Turma.atividadesDoCapituloCasoEstejaLiberadaParaAluno(ano, u.id, atividade, livro);
            if(atividades){
                res.render("capitulo/index", {
                    layout: "layout-externo-sem-card",
                    usuario: u,
                    atividade: atividade,
                    livro: livro,
                    lista: atividades.situacao,
                    liberadas: atividades.liberadas,
                    secoes: secoes.lista
                });
            }else{
                res.render("capitulo/erro", {
                    layout: "layout-sem-form",
                    titulo: "Não encontrado",
                    usuario: u
                });
            }
        }
	}
}

export = CapituloRoute;
