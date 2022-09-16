import app = require("teem");

interface Atividade {
	id: number;
	nome: string;
	url: string;
	idsecao: number;
}

class Atividade {

	public static registrarTentativa(idturma_atividade: number, id: number, nota: number) {
		return app.sql.connect(async (sql) => {

			await sql.query("update turma_atividade_usuario set conclusao = ?, nota = ? where id = ?", [idturma_atividade, nota, id]);

				if (!sql.affectedRows)
					return "atividade não encontrada";
				return null;
		})
	}

	public static listarDeatividade(id: number): Promise<Atividade[]> {
		return app.sql.connect(async (sql) => {
			// @@@
			return (await sql.query("select id, nome, url, idsecao from atividade where id = ?", [id])) || [];
		});
	}

	public static async listar(): Promise<Atividade[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, nome, url, idsecao from atividade")) || [];
		});
	}

	public static async listarCombo(): Promise<Atividade[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select id, url from atividade order by id desc")) || [];
		});
	}

	public static obter(id: number): Promise<Atividade> {
		return app.sql.connect(async (sql) => {
			const lista: Atividade[] = await sql.query("select id, nome, url, idsecao from atividade where id = ?", [id]);

			const atividade = (lista && lista[0]) || null;

			return atividade;
		});
	}


	public static async criar(atividade: Atividade): Promise<string | null> {

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("insert into atividade (nome, url, idsecao) values (?, ?, ?)", [atividade.nome, atividade.url, atividade.idsecao]);

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Já existe uma atividade com este nome";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async editar(atividade: Atividade): Promise<string> {

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("update atividade set nome = ?, url = ?, idsecao = ? where id = ?", [atividade.nome, atividade.url, atividade.idsecao, atividade.id]);

				if (!sql.affectedRows)
					return "atividade não encontrada";
				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "atividade não encontrada";
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
			await sql.query("delete from atividade where id = ?",  [id]);

			return (sql.affectedRows ? null : "atividade não encontrada");
		});
	}
};

export = Atividade;
