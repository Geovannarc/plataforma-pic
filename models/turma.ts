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

interface SituacaoAtividadeTurmaProfessor {
	nome: string;
	serie: number;
	sala: string;
	idturma: number;
	aprovadas: number;
	qtdeatividades: number;
	qtdeliberadas: number;
	qtdealunos: number;
	total: number;
	faltantes: number;
	percliberadas: number;
	percaprovadas: number;
	percfaltantes: number;
}

interface SituacaoProfessor {
	qtdealunos: number;
	qtdeturmas: number;
	situacao: SituacaoAtividadeTurmaProfessor[];
}

interface SituacaoAluno {
	nome: string;
	serie: number;
	sala: string;
	idturma: number;
	idlivro: number;
	capitulos: number;
	livro: string;
	aprovadas: number;
	qtdeatividades: number;
	qtdeliberadas: number;
	faltantes: number;
	percliberadas: number;
	percaprovadas: number;
	percfaltantes: number;
	percrealizadastotal: number;
}

interface SituacaoAtividadesAluno {
	turma: string;
	atividade: string;
	capitulo: number;
	idsecao: number;
	aprovado: number;
	conclusao: string;
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

	public static async situacaoPorProfessor(ano: number, idprofessor: number): Promise<SituacaoProfessor> {
		return app.sql.connect(async (sql) => {
			const situacao: SituacaoAtividadeTurmaProfessor[] = await sql.query(`
		select t.nome, t.serie, t.sala, atividadesaprovadas.idturma, atividadesaprovadas.aprovadas,
			atividadesporturma.qtde qtdeatividades,
			atividadesliberadasporturma.qtde qtdeliberadas,
			alunosporturma.qtde qtdealunos,
			atividadesporturma.qtde * alunosporturma.qtde total,
			(atividadesporturma.qtde * alunosporturma.qtde) - atividadesaprovadas.aprovadas faltantes
		from
		(
			select t.id idturma, count(tua.id) aprovadas
			from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 1
			inner join turma_usuario ta on ta.idturma = t.id and ta.professor = 0
			left join turma_usuario_atividade tua on tua.idturma_usuario = ta.id and tua.aprovado = 1
			where t.ano = ?
			group by t.id
		) atividadesaprovadas
		inner join
		(
			select t.id idturma, count(*) qtde
			from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 1
			inner join atividade a on a.idlivro = t.idlivro
			where t.ano = ?
			group by t.id
		) atividadesporturma on atividadesporturma.idturma = atividadesaprovadas.idturma
		inner join
		(
			select t.id idturma, count(*) qtde
			from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 1
			inner join turma_usuario ta on ta.idturma = t.id and ta.professor = 0
			where t.ano = ?
			group by t.id
		) alunosporturma on alunosporturma.idturma = atividadesaprovadas.idturma
		inner join
		(
			select t.id idturma, count(tal.id) qtde
			from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 1
			left join turma_atividade_liberada tal on tal.idturma = tu.idturma
			where t.ano = ?
			group by t.id
		) atividadesliberadasporturma on atividadesliberadasporturma.idturma = atividadesaprovadas.idturma
		inner join turma t on t.id = atividadesaprovadas.idturma
		`, [idprofessor, ano, idprofessor, ano, idprofessor, ano, idprofessor, ano]) || [];

			let qtdealunos = 0;
			for (let i = situacao.length - 1; i >= 0; i--) {
				qtdealunos += situacao[i].qtdealunos;
				if (situacao[i].total) {
					situacao[i].percaprovadas = Math.round(100 * situacao[i].aprovadas / situacao[i].total);
					situacao[i].percfaltantes = 100 - situacao[i].percaprovadas;
				} else {
					situacao[i].percaprovadas = 0;
					situacao[i].percfaltantes = 0;
				}

				if (situacao[i].qtdeatividades) {
					situacao[i].percliberadas = Math.round(100 * situacao[i].qtdeliberadas / situacao[i].qtdeatividades);
				} else {
					situacao[i].percliberadas = 0;
				}
			}

			return {
				qtdeturmas: situacao.length,
				qtdealunos,
				situacao
			};
		});
	}

	public static async situacaoPorAluno(ano: number, idaluno: number): Promise<SituacaoAluno> {
		return app.sql.connect(async (sql) => {
			const situacao: SituacaoAluno[] = await sql.query(`
		select t.nome, t.serie, t.sala, t.idlivro, livro.capitulos, livro.nome livro, atividadesaprovadas.idturma, atividadesaprovadas.aprovadas,
			livro.atividades qtdeatividades,
			atividadesliberadasporturma.qtde qtdeliberadas,
			atividadesliberadasporturma.qtde - atividadesaprovadas.aprovadas faltantes
		from
		(
			select t.id idturma, count(tua.id) aprovadas
			from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 0
			left join turma_usuario_atividade tua on tua.idturma_usuario = tu.id and tua.aprovado = 1
			where t.ano = ?
			group by t.id
		) atividadesaprovadas
		inner join
		(
			select t.id idturma, count(tal.id) qtde
			from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 0
			left join turma_atividade_liberada tal on tal.idturma = tu.idturma
			where t.ano = ?
			group by t.id
		) atividadesliberadasporturma on atividadesliberadasporturma.idturma = atividadesaprovadas.idturma
		inner join turma t on t.id = atividadesaprovadas.idturma
		inner join livro on t.idlivro = livro.id
`, [idaluno, ano, idaluno, ano]) || [];

			for (let i = situacao.length - 1; i >= 0; i--) {
				situacao[i].percliberadas = Math.round(100 * situacao[i].qtdeliberadas / situacao[i].qtdeatividades);
				situacao[i].percaprovadas = Math.round(100 * situacao[i].aprovadas / situacao[i].qtdeliberadas);
				situacao[i].percfaltantes = 100 - situacao[i].percaprovadas;
				situacao[i].percrealizadastotal = Math.round(100 * situacao[i].aprovadas / situacao[i].qtdeatividades);
			}

			return situacao[0] || null;
		});
	}

	public static async situacaoPorAlunoPorCapitulo(ano: number, idaluno: number): Promise<SituacaoAluno> {
		return app.sql.connect(async (sql) => {
			const turma_livros: any[] = await sql.query(`
			select t.id, t.nome, t.serie, t.sala, t.idlivro, livro.capitulos, livro.nome livro, tu.id idturma_usuario
			from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 0 
			inner join livro on t.idlivro = livro.id
			where t.ano = ?
`, [idaluno, ano]);

			if (!turma_livros || !turma_livros.length)
				return null;

			const turma_livro = turma_livros[0];

			turma_livro.detalhes = await sql.query(`
			select c.capitulo, min(c.atividades) atividades, count(tu.id) aprovadas
			from capitulo c
			inner join atividade a on a.idlivro = c.idlivro and a.capitulo = c.capitulo
			left join turma_usuario_atividade tu on tu.idturma_usuario = ? and tu.idatividade = a.id and tu.aprovado = 1
			where c.idlivro = ?
			group by c.capitulo
			order by c.capitulo
`, [turma_livro.idturma_usuario, turma_livro.idlivro]) || [];

			return turma_livro;
		});
	}

	public static async notasAluno(idaluno: number, ano: number): Promise<SituacaoAtividadesAluno[]>{
		return app.sql.connect(async (sql) => {
			const situacao:SituacaoAtividadesAluno[] = await sql.query(`select turma.nome turma, atividade.nome atividade, atividade.capitulo, atividade.idsecao, turma_usuario_atividade.aprovado, turma_usuario_atividade.conclusao
			from
			turma_usuario
			inner join
			usuario on turma_usuario.idusuario = usuario.id
			inner join
			turma_usuario_atividade on turma_usuario.id = turma_usuario_atividade.idturma_usuario
			inner join
			atividade on turma_usuario_atividade.idatividade = atividade.id
			inner join
			turma on turma_usuario.idturma = turma.id
			where
			turma_usuario.idusuario = ? and turma.ano = ?`,[idaluno, ano]);
			return situacao;
		})
	}
};

export = Turma;
