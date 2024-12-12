import { QueryResult, QueryResultRow } from "@vercel/postgres";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

class MyPgClient {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async sql<T extends QueryResultRow>(
        queryTemplate: TemplateStringsArray, 
        ...values: (string | number | Date | null | undefined)[]
    ): Promise<QueryResult<T>> {

        const sqlString = queryTemplate.reduce(
            (acc, str, i) => acc + (i === 0 ? str : `$${i} ` + str),
            ''
        );

        try {
            const res: QueryResult<T> = await pool.query({ text: sqlString, values });
            return res as QueryResult<T>;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }   
}

const client = new MyPgClient(pool);

async function sql<T extends QueryResultRow>(
  queryTemplate: TemplateStringsArray,
    ...values: (string | number | Date | null | undefined)[]
): Promise<QueryResult<T>> {
  return client.sql(queryTemplate, ...values)
}

export { pool, sql, client };