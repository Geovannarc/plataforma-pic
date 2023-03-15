import app = require("teem");
import DataUtil = require("../utils/dataUtil");
import Validacao = require("../utils/validacao");

interface Escola {
	id: number;
	nome: string;
	email: string;
	contato: string;
	exclusao?: string | null;
	criacao: string;
}

class Escola {

	private static validar(escola: Escola): string {
		if (!escola)
			return "Dados inválidos";

		escola.id = parseInt(escola.id as any);

		escola.email = (escola.email || "").normalize().trim();
		if (!escola.email || escola.email.length > 100 || !Validacao.isEmail(escola.email))
			return "E-mail inválido";

		escola.nome = (escola.nome || "").normalize().trim();
		if (!escola.nome || escola.nome.length > 100)
			return "Nome inválido";

		escola.contato = (escola.contato || "").normalize().trim();
		if (!escola.contato || escola.contato.length > 100)
			return "Contato inválido";

		return null;
	}

	public static async listar(): Promise<Escola[]> {
		let lista: Escola[] = null;

		await app.sql.connect(async (sql) => {
			lista = await sql.query("select id, nome, email, contato, date_format(criacao, '%d/%m/%Y') criacao, date_format(exclusao, '%d/%m/%Y') exclusao from escola") ;
		});

		return (lista || []);
	}

	public static async listarCombo(): Promise<Escola[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, nome from escola order by nome asc")) || [];
		});
	}

	public static obter(id: number): Promise<Escola> {
		return app.sql.connect(async (sql) => {
			const lista: Escola[] = await sql.query("select id, nome, contato, email, criacao, exclusao from escola where id = ? and exclusao is null", [id]);

			const escola = (lista && lista[0]) || null;

			return escola;
		});
	}


	public static async criar(escola: Escola): Promise<string | null> {
		const res = Escola.validar(escola);
		if (res)
			return res;

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("insert into escola (nome, email, contato, criacao) values (?, ?, ?, ?)", [escola.nome, escola.email, escola.contato, DataUtil.horarioDeBrasiliaISOComHorario()]);

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Já existe uma escola com este nome";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async editar(escola: Escola): Promise<string> {
		const res = Escola.validar(escola);
		if (res)
			return res;

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("update escola set nome = ?, contato = ?, email = ? where id = ? and exclusao is null", [escola.nome, escola.contato, escola.email, escola.id]);

				if (!sql.affectedRows)
					return "Escola não encontrada";

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "Escola não encontrada";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async excluir(id: number): Promise<string> {
		return app.sql.connect(async (sql) => {
			await sql.query("update escola set exclusao = ? where id = ? and exclusao is null", [DataUtil.horarioDeBrasiliaISOComHorario(), id]);

			return (sql.affectedRows ? null : "Escola não encontrada");
		});
	}
};

export = Escola;
