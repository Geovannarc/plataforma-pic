
import app = require("teem");
import DataUtil = require("../utils/dataUtil");
import Turma = require("./turma");

interface Atividade {
	id: number;
	nome: string;
	sufixo: string;
	idlivro: number;
	capitulo: number;
	idsecao: number;
}

class Atividade {
	public static async registrarTentativa(idturma: number, idusuario: number, idatividade: number, nota: number, aprovado: number): Promise<string | null> {
		if (!idturma || !idusuario || !idatividade)
			return "Dados inválidos";

		if (isNaN(nota) || nota < 0 || nota > 100)
			return "Nota inválida";

		if (isNaN(aprovado) || aprovado < 0 || aprovado > 1)
			return "Aprovação inválida";

		return app.sql.connect(async (sql) => {
			const liberada = await sql.query("select a.idlivro, a.capitulo, a.ordem from turma_atividade_liberada tl inner join atividade a on a.id = tl.idatividade where tl.idturma = ? and tl.idatividade = ?", [idturma, idatividade]) as { idlivro: number, capitulo: number, ordem: number }[] | null;

			if (!liberada || !liberada.length)
				return "Atividade não encontrada ou ainda não liberada";

			const idturma_usuario = await sql.scalar("select id from turma_usuario where idturma = ? and idusuario = ?", [idturma, idusuario]) as number | null;

			if (!idturma_usuario)
				return "Turma ou aluno não encontrado";

			const maiorOrdemAprovadaDoCapitulo = (await sql.scalar("select a.ordem from turma_usuario_atividade ta inner join atividade a on a.id = ta.idatividade where ta.idturma_usuario = ? and ta.aprovado = 1 and a.idlivro = ? and a.capitulo = ? order by a.ordem desc limit 1", [idturma_usuario, liberada[0].idlivro, liberada[0].capitulo]) as number) || 0;

			if (liberada[0].ordem <= maiorOrdemAprovadaDoCapitulo)
				return "Atividade já foi concluída";

			if (liberada[0].ordem > (maiorOrdemAprovadaDoCapitulo + 1))
				return "Ainda existem atividades anteriores para serem concluídas";

			await sql.query("insert into turma_usuario_atividade (idturma_usuario, idatividade, nota, aprovado, conclusao) values (?, ?, ?, ?, ?)", [idturma_usuario, idatividade, nota, aprovado, DataUtil.horarioDeBrasiliaISOComHorario()]);

			return null;
		})
	}

	public static listarDeatividade(id: number): Promise<Atividade[]> {
		return app.sql.connect(async (sql) => {
			// @@@
			return (await sql.query("select id, nome, idsecao from atividade where id = ?", [id])) || [];
		});
	}

	public static async listar(): Promise<any[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select a.id, a.nome, l.nome nomelivro, a.idsecao, s.nome nomesecao, a.capitulo from atividade a inner join livro l on l.id = a.idlivro inner join secao s on s.id = a.idsecao")) || [];
		});
	}

	public static obter(id: number): Promise<Atividade> {
		return app.sql.connect(async (sql) => {
			const lista: Atividade[] = await sql.query("select id, nome, sufixo, idlivro, capitulo, idsecao from atividade where id = ?", [id]);

			const atividade = (lista && lista[0]) || null;

			return atividade;
		});
	}

	private static validar(atividade: Atividade, criacao: boolean): string {
		if (!atividade)
			return "Usuário inválido";

		atividade.id = parseInt(atividade.id as any);

		if (!criacao && isNaN(atividade.id))
			return "Id inválido";

		if ((atividade.sufixo = (atividade.sufixo || "").normalize().trim()).length > 10)
			return "Sufixo inválido";

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
				await sql.beginTransaction();

				await sql.query("insert into atividade (nome, sufixo, idlivro, capitulo, idsecao) values ('', ?, ?, ?, ?)", [atividade.sufixo, atividade.idlivro, atividade.capitulo, atividade.idsecao]);

				atividade.id = await sql.scalar("select last_insert_id()");
				await sql.query("update atividade a set a.nome = concat((select nome from secao s where s.id = a.idsecao), a.sufixo) where a.id = ?", atividade.id);

				await sql.commit();

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						//case "ER_DUP_ENTRY":
						//	return "Já existe uma atividade com essa combinação de livro / capítulo / seção";
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
				await sql.beginTransaction();

				await sql.query("update atividade set sufixo = ?, idlivro = ?, capitulo = ?, idsecao = ? where id = ?", [atividade.sufixo, atividade.idlivro, atividade.capitulo, atividade.idsecao, atividade.id]);

				if (!sql.affectedRows)
					return "Atividade não encontrada";

				await sql.query("update atividade a set a.nome = concat((select nome from secao s where s.id = a.idsecao), a.sufixo) where a.id = ?", atividade.id);

				await sql.commit();

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						//case "ER_DUP_ENTRY":
						//	return "Já existe uma atividade com essa combinação de livro / capítulo / seção";
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

	public static async pertenceATurma(sql: app.Sql, id: number, idturma: number): Promise<boolean> {
		const idturmaCheck = await sql.scalar("select t.id from turma t inner join atividade a on a.id = ? and a.idlivro = t.idlivro where t.id = ?", [id, idturma]) as number | null;

		return !!idturmaCheck;
	}

	public static async liberar(id: number, idturma: number, idusuario: number, admin: boolean): Promise<string | null> {
		if (!id || !idturma)
			return "Dados inválidos";

		return app.sql.connect(async (sql) => {
			try {
				if (!await Turma.usuarioPodeAlterar(sql, idturma, idusuario, admin))
					return "Sem permissão";

				if (!await Atividade.pertenceATurma(sql, id, idturma))
					return "Atividade não encontrada na turma";

				await sql.query("insert into turma_atividade_liberada (idatividade, idturma) values (?, ?)", [id, idturma]);

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

	public static async bloquear(id: number, idturma: number, idusuario: number, admin: boolean): Promise<string | null> {
		if (!id || !idturma)
			return "Dados inválidos";

		return app.sql.connect(async (sql) => {
			if (!await Turma.usuarioPodeAlterar(sql, idturma, idusuario, admin))
				return "Sem permissão";

			if (!await Atividade.pertenceATurma(sql, id, idturma))
				return "Atividade não encontrada na turma";

			await sql.query("delete from turma_atividade_liberada where idatividade = ? and idturma = ?", [id, idturma]);

			if (!sql.affectedRows)
				return "Atividade não encontrada ou já estava bloqueada";

			return null;
		});
	}
};

export = Atividade;