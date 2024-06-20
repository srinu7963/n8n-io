import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

import { configurePostgres } from '../transport';
import type { PostgresNodeCredentials } from '../helpers/interfaces';

export async function schemaSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const credentials = (await this.getCredentials('postgres')) as PostgresNodeCredentials;
	const options = { nodeVersion: this.getNode().typeVersion };

	const { db, sshClient } = await configurePostgres(credentials, options);

	try {
		const response = await db.any('SELECT schema_name FROM information_schema.schemata');

		return {
			results: response.map((schema) => ({
				name: schema.schema_name as string,
				value: schema.schema_name as string,
			})),
		};
	} catch (error) {
		throw error;
	} finally {
		if (sshClient) {
			sshClient.end();
		}
		if (!db.$pool.ending) await db.$pool.end();
	}
}
export async function tableSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const credentials = (await this.getCredentials('postgres')) as PostgresNodeCredentials;
	const options = { nodeVersion: this.getNode().typeVersion };

	const { db, sshClient } = await configurePostgres(credentials, options);

	const schema = this.getNodeParameter('schema', 0, {
		extractValue: true,
	}) as string;

	try {
		const response = await db.any(
			'SELECT table_name FROM information_schema.tables WHERE table_schema=$1',
			[schema],
		);

		return {
			results: response.map((table) => ({
				name: table.table_name as string,
				value: table.table_name as string,
			})),
		};
	} catch (error) {
		throw error;
	} finally {
		if (sshClient) {
			sshClient.end();
		}
		if (!db.$pool.ending) await db.$pool.end();
	}
}
