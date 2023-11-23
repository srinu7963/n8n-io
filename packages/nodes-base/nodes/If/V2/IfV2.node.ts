import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeBaseDescription,
	INodeTypeDescription,
} from 'n8n-workflow';

export class IfV2 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			version: 2,
			defaults: {
				name: 'If',
				color: '#408000',
			},
			inputs: ['main'],
			outputs: ['main', 'main'],
			outputNames: ['true', 'false'],
			properties: [
				{
					displayName: 'Conditions',
					name: 'conditions',
					placeholder: 'Add Condition',
					type: 'filter',
					default: {},
					typeOptions: {
						filter: {
							caseSensitive: '={{$parameter.options.caseSensitive}}',
							typeValidation: '={{$parameter.options.looseTypeValidation ? "loose" : "strict"}}',
						},
					},
				},
				{
					displayName: 'Options',
					name: 'options',
					type: 'collection',
					placeholder: 'Add option',
					default: {},
					options: [
						{
							displayName: 'Ignore Case',
							description: 'Whether to ignore letter case when evaluating conditions',
							name: 'caseSensitive',
							type: 'boolean',
							default: true,
						},
						{
							displayName: 'Less Strict Type Validation',
							description: 'Whether to try casting value types based on the selected operator',
							name: 'looseTypeValidation',
							type: 'boolean',
							default: true,
						},
					],
				},
			],
		};
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const trueItems: INodeExecutionData[] = [];
		const falseItems: INodeExecutionData[] = [];

		this.getInputData().forEach((item, itemIndex) => {
			try {
				const pass = this.getNodeParameter('conditions', itemIndex, false, {
					extractValue: true,
				});

				if (item.pairedItem === undefined) {
					item.pairedItem = { item: itemIndex };
				}

				if (pass) {
					trueItems.push(item);
				} else {
					falseItems.push(item);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					falseItems.push(item);
				} else {
					throw error;
				}
			}
		});

		return [trueItems, falseItems];
	}
}
