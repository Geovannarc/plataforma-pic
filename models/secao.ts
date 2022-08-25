import app = require("teem");

interface Secao {
	id: number;
	nome: string;
}

class Secao {


	public static async listar(): Promise<Secao[]> {
		let lista: Secao[] = null;

		await app.sql.connect(async (sql) => {
			lista = await sql.query("select id, nome from secao") ;
		});

		return (lista || []);
	}

	public static obter(id: number): Promise<Secao> {
		return app.sql.connect(async (sql) => {
			const lista: Secao[] = await sql.query("select id, nome from secao where id = ?", [id]);

			const secao = (lista && lista[0]) || null;

			return secao;
		});
	}

};

export = Secao;
