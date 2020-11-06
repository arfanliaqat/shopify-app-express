import { Pool } from "pg"

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
