import { Pool, PoolClient } from "pg"
import { databaseName, isDev } from "./constants"

let dbPool: Pool | null = null

export const getConnection = async (): Promise<Pool> => {
	if (!dbPool) {
		dbPool = new Pool({
			host: process.env.DB_HOST || "localhost",
			port: parseInt(process.env.DB_PORT || "5432"),
			database: databaseName,
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

	async initClient(): Promise<void> {
		const connection = await getConnection()
		this.client = await connection.connect()
	}

	releaseClient(): void {
		this.getClient().release()
	}

	async beginTransaction(): Promise<void> {
		const client = this.getClient()
		await client.query("BEGIN")
	}

	async rollbackTransaction(): Promise<void> {
		const client = this.getClient()
		await client.query("ROLLBACK")
	}

	async commitTransaction(): Promise<void> {
		const client = this.getClient()
		await client.query("COMMIT")
	}
}

export class DatabaseTestService {
	static async clearDatabase() {
		if (!isDev) throw "You can only clear the database in dev mode"
		if (databaseName.indexOf("test") == -1) {
			throw (
				"Clearing the database should only be used when running the test... " +
				"The database name needs to contains the word 'test'."
			)
		}

		const client: PoolClient = await (await getConnection()).connect()
		try {
			await client.query("DELETE FROM availability_periods")
			await client.query("DELETE FROM product_orders")
			await client.query("DELETE FROM shop_resources")
			await client.query("DELETE FROM access_tokens")
			await client.query("DELETE FROM shops")
		} finally {
			client.release()
		}
	}
}
