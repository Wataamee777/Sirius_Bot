import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: "mysql://root:RaXXkLQzB4Hb@tcp(mysql.siriusbot.svc.cluster.local:3306)/siriusbot?multiStatements=true",
	},
});
