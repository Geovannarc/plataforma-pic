import app = require("teem");
import appsettings = require("../appsettings");
import DataUtil = require("../utils/dataUtil");
import TimeStamp = require("../utils/timeStamp");

interface TurmaUsuario {
	id: number;
	idturma: number;
	idusuario: number;
	professor: number;
}

interface Turma {
	id: number;
	idescola: number;
	ano: number;
	serie: number;
	nome: string;
	sala: string;
	exclusao?: string | null;
	criacao: string;
	idlivro: number;
	usuarios?: any[];
	idsusuario?: number[];
	professores?: number[];
}

class Turma {
	private static validar(turma: Turma): string | null {
		if (!turma)
			return "Dados inválidos";

		turma.id = parseInt(turma.id as any);

		turma.idescola = parseInt(turma.idescola as any);
		if (isNaN(turma.idescola))
			return "Escola inválida";

		turma.ano = parseInt(turma.ano as any);
		if (isNaN(turma.ano) || turma.ano < 2000 || turma.ano > 9999)
			return "Ano inválido";

		turma.serie = parseInt(turma.serie as any);
		if (isNaN(turma.serie) || turma.serie < 1 || turma.serie > 5)
			return "Série inválida";

		turma.nome = (turma.nome || "").normalize().trim();
		if (!turma.nome || turma.nome.length > 100)
			return "Nome inválido";

		turma.sala = (turma.sala || "").normalize().trim();
		if (!turma.sala || turma.sala.length > 100)
			return "Sala inválida";

		if (!turma.idsusuario)
			turma.idsusuario = [];

		if (!Array.isArray(turma.idsusuario))
			turma.idsusuario = [turma.idsusuario as any];

		if (!turma.professores)
			turma.professores = [];

		if (!Array.isArray(turma.professores))
			turma.professores = [turma.professores as any];

		if (turma.idsusuario.length !== turma.professores.length)
			return "Quantidade inválida de usuários/professores";

		for (let i = turma.idsusuario.length - 1; i >= 0; i--) {
			if (isNaN(turma.idsusuario[i] = parseInt(turma.idsusuario[i] as any)))
				return "Id de usuário inválido";

			turma.professores[i] = (turma.professores[i] == 1 ? 1 : 0);
		}

		return null;
	}

	public static listar(): Promise<Turma[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select t.id, t.ano, t.serie, t.nome, t.idlivro, t.sala, e.nome escola from turma t inner join escola e on e.id = t.idescola where t.exclusao is null")) || [];
		});
	}

	public static listarDeUsuario(idusuario: number): Promise<Turma[]> {
		return app.sql.connect(async (sql) => {
			// @@@
			return (await sql.query("select d.id, d.ano, d.serie, d.nome, d.sala, du.professor, date_format(d.criacao, '%d/%m/%Y') criacao from turma_usuario du inner join turma d on d.id = du.idturma where du.idusuario = ? and d.exclusao is null order by d.ano desc, d.nome asc", [idusuario])) || [];
		});
	}

	public static listarAtividades(idturma: number): Promise<Turma[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select a.id, a.capitulo, a.idsecao, a.nome, a.url, al.id idliberacao from turma t inner join atividade a on a.idlivro = t.idlivro left join turma_atividade_liberada al on al.idturma = t.id and al.idatividade = a.id where t.id = ? order by a.capitulo, a.idsecao", [idturma])) || [];
		});
	}

	public static obter(id: number): Promise<Turma> {
		return app.sql.connect(async (sql) => {
			const lista: Turma[] = await sql.query("select id, idescola, idlivro, ano, serie, nome, sala from turma where id = ? and exclusao is null", [id]);

			const turma = (lista && lista[0]) || null;

			if (turma)
				turma.usuarios = (await sql.query("select u.nome, tu.idusuario, tu.professor from turma_usuario tu inner join usuario u on u.id = tu.idusuario where tu.idturma = ? order by u.nome asc", [id])) || [];

			return turma;
		});
	}

	public static async criar(turma: Turma): Promise<string | number> {
		const res = Turma.validar(turma);
		if (res)
			return res;

		return app.sql.connect(async (sql) => {
			try {
				await sql.beginTransaction();

				await sql.query("insert into turma (idescola, ano, serie, nome, sala, idlivro, criacao) values (?, ?, ?, ?, ?, ?, ?)", [turma.idescola, turma.ano, turma.serie, turma.nome, turma.sala, turma.idlivro, DataUtil.horarioDeBrasiliaISOComHorario()]);
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

			try {
				turma.id = await sql.scalar("select last_insert_id()");

				if (turma.idsusuario && turma.professores) {
					for (let i = turma.idsusuario.length - 1; i >= 0; i--)
						await sql.query("insert into turma_usuario (idturma, idusuario, professor) values (?, ?, ?)", [turma.id, turma.idsusuario[i], turma.professores[i]]);
				}

				await sql.commit();

				return turma.id;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Usuários repetidos na turma";
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "Usuário não encontrado";
						default:
							throw e;
					}
				} else {
					throw e;
				}
			}
		});
	}

	public static async editar(turma: Turma): Promise<string> {
		const res = Turma.validar(turma);
		if (res)
			return res;

		return app.sql.connect(async (sql) => {
			try {
				await sql.beginTransaction();

				await sql.query("update turma set idescola = ?, ano = ?, serie = ?, nome = ?, sala = ? where id = ? and exclusao is null", [turma.idescola, turma.ano, turma.serie, turma.nome, turma.sala, turma.id]);

				if (!sql.affectedRows)
					return "Turma não encontrada";
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

			try {
				const antigos: TurmaUsuario[] = (await sql.query("select id, idusuario, professor from turma_usuario where idturma = ?", [turma.id])) || []
				const atualizar: TurmaUsuario[] = [];
				const novos: TurmaUsuario[] = [];

				if (turma.idsusuario && turma.professores) {
					for (let i = turma.idsusuario.length - 1; i >= 0; i--)
						novos.push({
							id: 0,
							idturma: turma.id,
							idusuario: turma.idsusuario[i],
							professor: turma.professores[i]
						});
				}

				for (let i = antigos.length - 1; i >= 0; i--) {
					const antigo = antigos[i];

					for (let j = novos.length - 1; j >= 0; j--) {
						const novo = novos[j];
						if (antigo.idusuario === novo.idusuario) {
							antigos.splice(i, 1);
							novos.splice(j, 1);
							if (antigo.professor !== novo.professor) {
								antigo.professor = novo.professor;
								atualizar.push(antigo);
							}
							break;
						}
					}
				}

				// Tenta reaproveitar os id's antigos se precisar adicionar algo novo
				for (let i = novos.length - 1; i >= 0; i--) {
					if (!antigos.length)
						break;

					const antigo = antigos.pop();
					antigo.idusuario = novos[i].idusuario;
					antigo.professor = novos[i].professor;

					atualizar.push(antigo);

					novos.splice(i, 1);
				}

				for (let i = antigos.length - 1; i >= 0; i--)
					await sql.query("delete from turma_usuario where id = ?", [antigos[i].id]);

				for (let i = atualizar.length - 1; i >= 0; i--)
					await sql.query("update turma_usuario set idusuario = ?, professor = ? where id = ?", [atualizar[i].idusuario, atualizar[i].professor, atualizar[i].id]);

				for (let i = novos.length - 1; i >= 0; i--)
					await sql.query("insert into turma_usuario (idturma, idusuario, professor) values (?, ?, ?)", [novos[i].idturma, novos[i].idusuario, novos[i].professor]);

				await sql.commit();

				return null;
			} catch (e) {
				if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
							return "Usuários repetidos na turma";
						case "ER_NO_REFERENCED_ROW":
						case "ER_NO_REFERENCED_ROW_2":
							return "Usuário não encontrado";
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
			await sql.query("update turma set exclusao = ? where id = ? and exclusao is null", [DataUtil.horarioDeBrasiliaISOComHorario(), id]);

			return (sql.affectedRows ? null : "Turma não encontrada");
		});
	}

	public static async usuarioPodeAlterar(sql: app.Sql, id: number, idusuario: number, admin: boolean): Promise<boolean> {
		if (admin)
			return true;

		const professor = await sql.scalar("select professor from turma_usuario where idturma = ? and idusuario = ?", [id, idusuario]) as number | null;

		return !!professor;
	}
};

export = Turma;
