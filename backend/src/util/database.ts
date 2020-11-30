import { Pool, PoolClient } from "pg"

let dbPool: Pool | null = null

export const getConnection = async (): Promise<Pool> => {
	if (!dbPool) {
		dbPool = new Pool({
			host: process.env.DB_HOST || "localhost",
			port: parseInt(process.env.DB_PORT || "5432"),
			database: process.env.DB_DATABASE || "shopify_app",
			user: process.env.DB_USER || "postgres",
			password: process.env.DB_PASSWORD || "postgres",
			max: 20,
			connectionTimeoutMillis: 2000,
			idleTimeoutMillis: 30000
		})
	}
	return dbPool
}

export class WithTransaction {
	private client?: PoolClient

	getClient(): PoolClient {
		if (!this.client) throw "`this.client` should be defined"
		return this.client
	}

	async beginTransaction(): Promise<void> {
		const connection = await getConnection()
		this.client = await connection.connect()
		try {
			await this.client.query("BEGIN")
		} finally {
			this.client.release()
		}
	}

	async rollbackTransaction(): Promise<void> {
		const client = this.getClient()
		try {
			await client.query("ROLLBACK")
		} finally {
			client.release()
		}
	}

	async commitTransaction(): Promise<void> {
		const client = this.getClient()
		try {
			await client.query("COMMIT")
		} finally {
			client.release()
		}
	}
}
