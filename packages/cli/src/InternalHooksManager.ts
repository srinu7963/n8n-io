import type { INodeTypes } from 'n8n-workflow';
import { InternalHooksClass } from '@/InternalHooks';
import { Telemetry } from '@/telemetry';
import PostHogClient from './posthog';

export class InternalHooksManager {
	private static internalHooksInstance: InternalHooksClass;

	static getInstance(): InternalHooksClass {
		if (this.internalHooksInstance) {
			return this.internalHooksInstance;
		}

		throw new Error('InternalHooks not initialized');
	}

	static async init(instanceId: string, nodeTypes: INodeTypes, postHog: PostHogClient): Promise<InternalHooksClass> {
		if (!this.internalHooksInstance) {
			const telemetry = new Telemetry(instanceId, postHog);
			await telemetry.init();
			this.internalHooksInstance = new InternalHooksClass(telemetry, instanceId, nodeTypes);
		}

		return this.internalHooksInstance;
	}
}
