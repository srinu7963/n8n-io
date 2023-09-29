import Container from 'typedi';
import { RedisService } from './redis.service';
import type { RedisServicePubSubPublisher } from './redis/RedisServicePubSubPublisher';
import config from '@/config';

export abstract class OrchestrationService {
	protected initialized = false;

	redisPublisher: RedisServicePubSubPublisher;

	readonly redisService: RedisService;

	get isQueueMode(): boolean {
		return config.get('executions.mode') === 'queue';
	}

	get isMainInstance(): boolean {
		return config.get('generic.instanceType') === 'main';
	}

	constructor() {
		this.redisService = Container.get(RedisService);
	}

	async init() {
		await this.initPublisher();
		this.initialized = true;
	}

	async shutdown() {
		await this.redisPublisher?.destroy();
		this.initialized = false;
	}

	private async initPublisher() {
		this.redisPublisher = await this.redisService.getPubSubPublisher();
	}
}
