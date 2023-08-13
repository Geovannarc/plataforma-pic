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

interface NotasAlunoPorProfessor{
	idturma: number;
	idusuario: number;
	idturma_usuario: number;
	idatividade: number;
	nota: number;
	aprovado: boolean;
	conclusao: string;
	nome: string;
	turma: string;
	sala: string
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

	public static listarDeUsuario(ano: number, idusuario: number): Promise<Turma[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select d.id, d.ano, d.serie, d.nome, d.sala, du.professor, date_format(d.criacao, '%d/%m/%Y') criacao from turma_usuario du inner join turma d on d.id = du.idturma where du.idusuario = ? and d.ano = ? and d.exclusao is null order by d.ano desc, d.nome asc", [idusuario, ano])) || [];
		});
	}

	public static listarAtividades(idturma: number): Promise<Turma[]> {
		return app.sql.connect(async (sql) => {
			return (await sql.query("select a.id, a.capitulo, a.idsecao, a.nome, al.id idliberacao from turma t inner join atividade a on a.idlivro = t.idlivro left join turma_atividade_liberada al on al.idturma = t.id and al.idatividade = a.id where t.id = ? order by a.capitulo, a.idsecao", [idturma])) || [];
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

	public static obterNotasAlunoPorProfessor(ano: number, idprofessor: number): Promise<NotasAlunoPorProfessor[]>{
		return app.sql.connect(async (sql) =>{
			const lista: NotasAlunoPorProfessor[] = await sql.query(`select tu.idturma, tu.idusuario, tu.id idturma_usuario, tua.idatividade, nota, aprovado, date_format(conclusao, '%d/%m/%Y') conclusao, u.nome, t.nome turma, t.sala,
			a.nome atividade, a.capitulo, a.idsecao, a.ordem 
			from turma_usuario tu
			inner join 
			(select ta.idturma from turma_usuario ta where ta.idusuario = ? and professor = 1) ts
			on ts.idturma = tu.idturma
			inner join turma t on t.id = tu.idturma
			left join turma_atividade_liberada tal on tal.idturma = t.id
			left join turma_usuario_atividade tua on tua.idturma_usuario = tu.id and tua.idatividade = tal.idatividade
			inner join usuario u on u.id = tu.idusuario
			inner join atividade a on a.id = tal.idatividade
			where tu.professor = 0 and t.ano = ?
			order by ts.idturma;`, [idprofessor, ano])

			return lista;
		} )
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

	public static async turmaDoAluno(ano: number, idaluno: number): Promise<number> {
		return app.sql.connect(async (sql) => {
			return await sql.scalar(`
			select t.id from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 0 
			where t.ano = ?
`, [idaluno, ano]) || 0;
		});
	}

	public static async livroDoAluno(ano: number, idaluno: number): Promise<number> {
		return app.sql.connect(async (sql) => {
			return await sql.scalar(`
			select t.idlivro
			from turma t
			inner join turma_usuario tu on tu.idturma = t.id and tu.idusuario = ? and tu.professor = 0 
			where t.ano = ?
`, [idaluno, ano]) || 0;
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

	let aprovadas = 0;
	let total = 0;
	for (let i = turma_livro.detalhes.length - 1; i >= 0; i--) {
		aprovadas += turma_livro.detalhes[i].aprovadas;
		total += turma_livro.detalhes[i].atividades
	}
	turma_livro.percaprovadas = Math.round((aprovadas/total)*100)
			return turma_livro;
		});
	}

	public static async notasAluno(ano: number, idaluno: number): Promise<SituacaoAtividadesAluno[]>{
		return app.sql.connect(async (sql) => {
			const situacao:SituacaoAtividadesAluno[] = await sql.query(`select turma.nome turma, atividade.nome atividade, atividade.capitulo, atividade.idsecao, turma_usuario_atividade.aprovado, date_format(turma_usuario_atividade.conclusao, '%d/%m/%Y %H:%i') conclusao
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

	public static async liberadasPorTurma(ano: number, idusuario: number): Promise<any[]>{
		return app.sql.connect(async (sql) => {
			const situacao = await sql.query(`SELECT idatividade, atividade.nome, atividade.capitulo, capitulo.nome nomecapitulo, idsecao
			FROM usuario
			INNER JOIN turma_usuario ON usuario.id = turma_usuario.idusuario
			INNER JOIN turma_atividade_liberada ON turma_atividade_liberada.idturma = turma_usuario.idturma
			INNER JOIN atividade ON atividade.id = turma_atividade_liberada.idatividade
            INNER JOIN turma ON turma.id = turma_atividade_liberada.idturma
			INNER JOIN livro ON livro.id = turma.idlivro
            INNER JOIN capitulo ON capitulo.capitulo = atividade.capitulo AND capitulo.idlivro = livro.id
			WHERE idusuario = ? AND turma.ano = ?`, [idusuario, ano])
			return situacao
		})
	}

	public static async atividadesDoCapituloCasoEstejaLiberadaParaAluno(ano: number, idusuario: number, idlivro: number, capitulo: number, idatividade?: number): Promise<{ situacao: SituacaoAluno, liberadas: any[], idatividade: number } | null> {
		const situacao = await Turma.situacaoPorAlunoPorCapitulo(ano, idusuario);

		if(situacao && idlivro == situacao.idlivro){
			if (!idatividade) {
				// Precisa pegar o idatividade da última atividade aprovada do livro/capítulo fornecidos
				await app.sql.connect(async (sql) => {
					const ultimaAtividadeAprovadaDoCapitulo = await sql.query("select a.id, a.ordem from turma_usuario_atividade ta inner join atividade a on a.id = ta.idatividade where ta.idturma_usuario = ? and ta.aprovado = 1 and a.idlivro = ? and a.capitulo = ? order by a.ordem desc limit 1", [(situacao as any).idturma_usuario, idlivro, capitulo]) as { id: number, ordem: number }[];
					if (!ultimaAtividadeAprovadaDoCapitulo || !ultimaAtividadeAprovadaDoCapitulo.length) {
						// Pega o id da primeira atividade desse livro/capítulo
						idatividade = (await sql.scalar("select id from atividade where idlivro = ? and capitulo = ? and ordem = 1", [idlivro, capitulo]) as number) || 0;
					} else {
						// Pega o id da próxima atividade a se feita pelo aluno nesse livro/capítulo
						idatividade = (await sql.scalar("select id from atividade where idlivro = ? and capitulo = ? and ordem = ?", [idlivro, capitulo, ultimaAtividadeAprovadaDoCapitulo[0].ordem + 1]) as number) || 0;
						if (!idatividade) {
							// Se não existir outra atividade para ser feita nesse livro/capítulo, exibe a última atividade feita
							idatividade = ultimaAtividadeAprovadaDoCapitulo[0].id;
						} else {
							// Apesar de existir uma próxima atividade a ser feita nesse livro/capítulo, confere se ela está
							// liberada (se não tiver, exibe a última atividade feita)
							const idturma_atividade_liberada = (await sql.scalar("select id from turma_atividade_liberada where idturma = ? and idatividade = ?", [(situacao as any).id, idatividade]) as number) || 0;
							if (!idturma_atividade_liberada)
								idatividade = ultimaAtividadeAprovadaDoCapitulo[0].id;
						}
					}
				});
			}

			const liberadas = await Turma.liberadasPorTurma(ano, idusuario);
            for(let i of liberadas){
                if(i.idatividade == idatividade){
					// Remove o que não for do capítulo da atividade liberada em questão
					for (let j = liberadas.length - 1; j >= 0; j--) {
						if (liberadas[j].capitulo !== i.capitulo)
							liberadas.splice(j, 1);
					}

					if (!(situacao as any).detalhes)
						return null;

					for (let j = (situacao as any).detalhes.length - 1; j >= 0; j--) {
						if ((situacao as any).detalhes[j].capitulo !== i.capitulo)
							(situacao as any).detalhes.splice(j, 1);
					}

					if (!(situacao as any).detalhes.length)
						return null;

					await app.sql.connect(async (sql) => {
						for (let j = liberadas.length - 1; j >= 0; j--)
							liberadas[j].aprovado = await sql.scalar("select aprovado from turma_usuario_atividade where idturma_usuario = ? and idatividade = ?", [(situacao as any).idturma_usuario, liberadas[j].idatividade]) || 0;
					});

					liberadas.sort((a, b) => (a.idatividade < b.idatividade ? -1 : 1));

					for (let j = 0; j < liberadas.length; j++) {
						if (liberadas[j].idatividade === idatividade) {
							// Só pode deixar prosseguir / considerar como liberada se o aluno
							// já concluiu a atividade anterior, ou se esse for a primeira
							if (j > 0 && !liberadas[j - 1].aprovado)
								return null;

							break;
						}
					}

					return {
						situacao,
						liberadas,
						idatividade
					};
                }
            }
        }
        return null;
    }

	public static async anosPorUsuario(idusuario: number): Promise<number[]> {
		return app.sql.connect(async (sql) => {
			const lista = await sql.query("select distinct t.ano from turma_usuario ta inner join turma t on t.id = ta.idturma where ta.idusuario = ? order by t.ano asc", [idusuario]) as { ano: number }[];

			if (!lista || !lista.length)
				return [];

			const anos: number[] = new Array(lista.length);
			for (let i = lista.length - 1; i >= 0; i--)
				anos[i] = lista[i].ano;

			return anos;
		});
	}

	public static async anosTratadosPorUsuario(req: app.Request, res: app.Response, idusuario: number): Promise<{ ano: number, lista: number[] } | null> {
		const anos = await Turma.anosPorUsuario(idusuario);
		if (!anos || !anos.length) {
			res.render("index/erro", { layout: "layout-externo", mensagem: "Não foram encontradas atribuições do usuário a turmas" });
			return null;
		}

		let ano = parseInt(req.query["ano"] as string) || (new Date()).getFullYear();
		let encontrado = false;
		for (let i = anos.length - 1; i >= 0; i--) {
			if (anos[i] === ano) {
				encontrado = true;
				break;
			}
		}
		if (!encontrado)
			ano = anos[anos.length - 1];

		return {
			ano,
			lista: anos
		};
	}
};

export = Turma;
