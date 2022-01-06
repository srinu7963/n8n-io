import {
	INodeProperties,
} from 'n8n-workflow';

export const groupDescription: INodeProperties[] = [
	// ----------------------------------
	//           operations
	// ----------------------------------
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: [
					'group',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a group',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a group',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a group',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all groups',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a group',
			},
		],
		default: 'create',
	},

	// ----------------------------------
	//             fields
	// ----------------------------------
	{
		displayName: 'Group Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'group',
				],
			},
		},
	},
	{
		displayName: 'Group ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadGroups',
		},
		description: 'Group to update. Choose from the list or specify an ID using an <a href="https://docs.n8n.io/nodes/expressions.html#expressions">expression</a>.',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'group',
				],
				operation: [
					'update',
				],
			},
		},
	},
	{
		displayName: 'Group ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadGroups',
		},
		description: 'Group to delete. Choose from the list or specify an ID using an <a href="https://docs.n8n.io/nodes/expressions.html#expressions">expression</a>.',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'group',
				],
				operation: [
					'delete',
				],
			},
		},
	},
	{
		displayName: 'Group ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'loadGroups',
		},
		description: 'Group to retrieve. Choose from the list or specify an ID using an <a href="https://docs.n8n.io/nodes/expressions.html#expressions">expression</a>.',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [
					'group',
				],
				operation: [
					'get',
				],
			},
		},
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		displayOptions: {
			show: {
				resource: [
					'group',
				],
				operation: [
					'create',
				],
			},
		},
		default: {},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Notes',
				name: 'note',
				type: 'string',
				default: '',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		displayOptions: {
			show: {
				operation: [
					'update',
				],
				resource: [
					'group',
				],
			},
		},
		default: {},
		placeholder: 'Add Field',
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Group Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Notes',
				name: 'note',
				type: 'string',
				default: '',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
			},
		],
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: [
					'group',
				],
				operation: [
					'getAll',
				],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: [
					'group',
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
];
