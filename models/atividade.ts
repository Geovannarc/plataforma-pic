
import app = require("teem");
import DataUtil = require("../utils/dataUtil");

interface Atividade {
	id: number;
	nome: string;
	url: string;
	idlivro: number;
	capitulo: number;
	idsecao: number;
}

class Atividade {
	public static async registrarTentativa(idturma: number, idusuario: number, idatividade: number, nota: number): Promise<string | null> {
		if (!idturma || !idusuario || !idatividade)
			return "Dados inválidos";

		if (isNaN(nota) || nota < 0 || nota > 100)
			return "Nota inválida";

		return app.sql.connect(async (sql) => {
			const liberada = await sql.scalar("select id from turma_atividade_liberada where idturma = ? and idatividade = ?", [idturma, idatividade]) as number | null;

			if (!liberada)
				return "Atividade não encontrada ou ainda não liberada";

			const idturma_usuario = await sql.scalar("select id from turma_usuario where idturma = ? and idusuario = ?", [idturma, idusuario]) as number | null;

			if (!idturma_usuario)
				return "Turma ou aluno não encontrado";

			await sql.query("insert into turma_usuario_atividade (idturma_usuario, idatividade, nota, conclusao) values (?, ?, ?, ?)", [idturma_usuario, idatividade, nota, DataUtil.horarioDeBrasiliaISOComHorario()]);

			return null;
		})
	}

	public static listarDeatividade(id: number): Promise<Atividade[]> {
		return app.sql.connect(async (sql) => {
			// @@@
			return (await sql.query("select id, nome, url, idsecao from atividade where id = ?", [id])) || [];
		});
	}

	public static async listar(): Promise<any[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select a.id, a.nome, a.url, l.nome nomelivro, a.idsecao, s.nome nomesecao, a.capitulo from atividade a inner join livro l on l.id = a.idlivro inner join secao s on s.id = a.idsecao")) || [];
		});
	}

	public static obter(id: number): Promise<Atividade> {
		return app.sql.connect(async (sql) => {
			const lista: Atividade[] = await sql.query("select id, nome, url, idlivro, capitulo, idsecao from atividade where id = ?", [id]);

			const atividade = (lista && lista[0]) || null;

			return atividade;
		});
	}

	private static async atividadePertenceATurma(sql: app.Sql, id: number, idturma: number): Promise<boolean> {
		// ver depois se a atividade pertence a turma (metodo separado para aproveitar)
		return false;
	}

	public static async liberar(id: number, idturma: number, idusuario: number, admin: boolean): Promise<string | null> {
		return app.sql.connect(async (sql) => {
			try {
				// validar se a atividade id tem idlivro igual ao idlivro da turma
				if(!admin){
					const professor = await validarProfessor(idturma, idusuario, admin);
					if(professor === 0){
						return "Sem permissão."
					}
				}
				
				await sql.query("insert into turma_atividade_liberada (idatividade, idturma) values (?, ?)", [id,idturma]);

				return null;
				
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Essa atividade já está liberada.";
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "Atividade ou turma não encontrada";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async bloquear(idatividade_liberada: number, idturma: number, idusuario: number, admin: boolean): Promise<string | null> {
		if (!idturma || !idusuario || !idatividade_liberada)
			return "Dados inválidos";
		return app.sql.connect(async (sql) => {
			if(!admin){
				const professor = await validarProfessor(idturma, idusuario, admin);
				if(professor === 0){
					return "Sem permissão."
				}
			}

			// @@@ validar se a atividade id tem idlivro igual ao idlivro da turma

			await sql.query("delete from turma_atividade_liberada where id = ?", [idatividade_liberada]);

			if (!sql.affectedRows)
				return "Atividade não encontrada ou já estava bloqueada";

			return null;
		});
	}

	private static validar(atividade: Atividade, criacao: boolean): string {
		if (!atividade)
			return "Usuário inválido";

		atividade.id = parseInt(atividade.id as any);

		if (!criacao && isNaN(atividade.id))
			return "Id inválido";

		if (!atividade.nome || !(atividade.nome = atividade.nome.normalize().trim()) || atividade.nome.length > 100)
			return "Nome inválido";

		if (!atividade.url || !(atividade.url = atividade.url.normalize().trim()) || atividade.url.length > 100)
			return "URL inválida";

		if (isNaN(atividade.idlivro = parseInt(atividade.idlivro as any)))
			return "Livro inválido";

		if (isNaN(atividade.capitulo = parseInt(atividade.capitulo as any)))
			return "Capítulo inválido";

		if (isNaN(atividade.idsecao = parseInt(atividade.idsecao as any)))
			return "Seção inválida";

		return null;
	}

	public static async criar(atividade: Atividade): Promise<string | null> {
		let res: string;
		if ((res = Atividade.validar(atividade, true)))
			return res;

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("insert into atividade (nome, url, idlivro, capitulo, idsecao) values (?, ?, ?, ?, ?)", [atividade.nome, atividade.url, atividade.idlivro, atividade.capitulo, atividade.idsecao]);

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Já existe uma atividade com essa combinação de livro / capítulo / seção";
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							res = "Livro ou seção não encontrada";
							break;
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
		let res: string;
		if ((res = Atividade.validar(atividade, false)))
			return res;

		return app.sql.connect(async (sql) => {
			try {
				await sql.query("update atividade set nome = ?, url = ?, idlivro = ?, capitulo = ?, idsecao = ? where id = ?", [atividade.nome, atividade.url, atividade.idlivro, atividade.capitulo, atividade.idsecao, atividade.id]);

				if (!sql.affectedRows)
					return "Atividade não encontrada";

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Já existe uma atividade com essa combinação de livro / capítulo / seção";
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							res = "Livro ou seção não encontrada";
							break;
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

			return (sql.affectedRows ? null : "Atividade não encontrada");
		});
	}
};

async function validarProfessor(idturma: number, idusuario: number, admin: boolean) {
	return app.sql.connect(async (sql) => {
		if (!admin) {
			const lista: number[] = await sql.query("select professor from turma_usuario where idturma = ? and idusuario = ?", [idturma, idusuario]);
			
			const professor = ((lista && lista[0]) || null);

			return professor;
		}
	});
}

export = Atividade;