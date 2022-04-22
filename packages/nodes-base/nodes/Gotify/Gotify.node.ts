import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	gotifyApiRequest,
	gotifyApiRequestAllItems,
} from './GenericFunctions';

export class Gotify implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Gotify',
		name: 'gotify',
		icon: 'file:gotify.png',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Gotify API',
		defaults: {
			name: 'Gotify',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'gotifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Message',
						value: 'message',
					},
				],
				default: 'message',
				description: 'The resource to operate on.',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'message',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
					},
					{
						name: 'Delete',
						value: 'delete',
					},
					{
						name: 'Get All',
						value: 'getAll',
					},
				],
				default: 'create',
				description: 'The resource to operate on.',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'message',
						],
						operation: [
							'create',
						],
					},
				},
				default: '',
				description: `The message. Markdown (excluding html) is allowed.`,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						resource: [
							'message',
						],
						operation: [
							'create',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Priority',
						name: 'priority',
						type: 'number',
						default: 1,
						description: 'The priority of the message.',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: `The title of the message.`,
					},
				],
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'message',
						],
						operation: [
							'delete',
						],
					},
				},
				default: '',
				description: `The message id.`,
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [
							'message',
						],
						operation: [
							'getAll',
						],
					},
				},
				default: false,
				description: 'If all results should be returned or only up to a given limit.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 20,
				displayOptions: {
					show: {
						resource: [
							'message',
						],
						operation: [
							'getAll',
						],
						returnAll: [
							false,
						],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const length = (items.length as unknown) as number;
		const qs: IDataObject = {};
		let responseData;
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		for (let i = 0; i < length; i++) {
			try {
				if (resource === 'message') {
					if (operation === 'create') {

						const message = this.getNodeParameter('message', i);

						const additionalFields = this.getNodeParameter('additionalFields', i);

						const body: IDataObject = {
							message,
						};

						Object.assign(body, additionalFields);

						responseData = await gotifyApiRequest.call(
							this,
							'POST',
							`/message`,
							body,
						);
					}
					if (operation === 'delete') {
						const messageId = this.getNodeParameter('messageId', i);

						responseData = await gotifyApiRequest.call(
							this,
							'DELETE',
							`/message/${messageId}`,
						);
						responseData = { success: true };
					}

					if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i);

						if (returnAll) {
							responseData = await gotifyApiRequestAllItems.call(
								this,
								'messages',
								'GET',
								'/message',
								{},
								qs,
							);

						} else {
							qs.limit = this.getNodeParameter('limit', i);
							responseData = await gotifyApiRequest.call(
								this,
								'GET',
								`/message`,
								{},
								qs,
							);
							responseData = responseData.messages;
						}
					}
				}
				if (Array.isArray(responseData)) {
					returnData.push.apply(returnData, responseData as IDataObject[]);
				} else if (responseData !== undefined) {
					returnData.push(responseData as IDataObject);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: error.message });
					continue;
				}
				throw error;
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	}
}
