import app = require("teem");
import Perfil = require("../enums/perfil");
import secoes = require("../models/secao");
import Turma = require("../models/turma");
import Usuario = require("../models/usuario");

class CapituloRoute {
    @app.route.methodName("atividade/:idlivro/:capitulo/:idatividade?")
	public static async atividade(req: app.Request, res: app.Response) {
		let u = await Usuario.cookie(req);
		if (!u){
			res.redirect(app.root + "/login");
        }else{
            const ano = (new Date()).getFullYear();
            const idlivro = parseInt(req.params["idlivro"] as string);
            const capitulo = parseInt(req.params["capitulo"] as string);
            const idatividade = parseInt(req.params["idatividade"] as string) || 0;
            const atividades = await Turma.atividadesDoCapituloCasoEstejaLiberadaParaAluno(ano, u.id, idlivro, capitulo, idatividade);
            if(atividades){
                res.render("capitulo/index", {
                    layout: "layout-externo-sem-card",
                    usuario: u,
                    atividade: atividades.idatividade,
                    livro: idlivro,
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
