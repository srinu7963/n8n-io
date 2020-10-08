import {
	INodeProperties,
} from 'n8n-workflow';

export const boardOperations = [
	// ----------------------------------
	//         board
	// ----------------------------------
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		displayOptions: {
			show: {
				resource: [
					'board',
				],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new board',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a board',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get the data of a board',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all user boards',
			},
		],
		default: 'create',
		description: 'The operation to perform.',
	}
] as INodeProperties[];

export const boardFields = [

	// ----------------------------------
	//         board:create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		placeholder: 'My board',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'board',
				],
			},
		},
		description: 'The title of the board',
	},
	{
		displayName: 'Owner',
		name: 'owner',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'board',
				],
			},
		},
		description: 'The user ID in Wekan',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				operation: [
					'create',
				],
				resource: [
					'board',
				],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Active',
				name: 'isActive',
				type: 'boolean',
				default: false,
				description: 'Set the board active.',
			},
			{
				displayName: 'Admin',
				name: 'isAdmin',
				type: 'boolean',
				default: false,
				description: 'Set the owner an admin of the board.',
			},
			{
				displayName: 'Color',
				name: 'color',
				type: 'options',
				options: [
					{value: 'white', name: 'White'},
					{value: 'green', name: 'Green'},
					{value: 'yellow', name: 'Yellow'},
					{value: 'orange', name: 'Orange'},
					{value: 'red', name: 'Red'},
					{value: 'purple', name: 'Purple'},
					{value: 'blue', name: 'Blue'},
					{value: 'sky', name: 'Sky'},
					{value: 'lime', name: 'Lime'},
					{value: 'pink', name: 'Pink'},
					{value: 'black', name: 'Black'},
					{value: 'silver', name: 'Silver'},
					{value: 'peachpuff', name: 'Peachpuff'},
					{value: 'crimson', name: 'Crimson'},
					{value: 'plum', name: 'Plum'},
					{value: 'darkgreen', name: 'Darkgreen'},
					{value: 'slateblue', name: 'Slateblue'},
					{value: 'magenta', name: 'Magenta'},
					{value: 'gold', name: 'Gold'},
					{value: 'navy', name: 'Navy'},
					{value: 'gray', name: 'Gray'},
					{value: 'saddlebrown', name: 'Saddlebrown'},
					{value: 'paleturquoise', name: 'Paleturquoise'},
					{value: 'mistyrose', name: 'Mistyrose'},
					{value: 'indigo', name: 'Indigo'},
				],
				default: '',
				description: 'The color of the board.',
			},
			{
				displayName: 'Comment only',
				name: 'isCommentOnly',
				type: 'boolean',
				default: false,
				description: 'Only enable comments.',
			},
			{
				displayName: 'No comments',
				name: 'isNoComments',
				type: 'boolean',
				default: false,
				description: 'Disable comments.',
			},
			{
				displayName: 'Permission',
				name: 'permission',
				type: 'options',
				options: [
					{
						name: 'Private',
						value: 'private',
					},
					{
						name: 'Public',
						value: 'public',
					},
				],
				default: 'private',
				description: 'Set the board permission.',
			},
			{
				displayName: 'Worker',
				name: 'isWorker',
				type: 'boolean',
				default: false,
				description: 'Only move cards, assign himself to card and comment.',
			},
		],
	},

	// ----------------------------------
	//         board:delete
	// ----------------------------------
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getBoards',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'delete',
				],
				resource: [
					'board',
				],
			},
		},
		description: 'The ID of the board to delete.',
	},

	// ----------------------------------
	//         board:get
	// ----------------------------------
	{
		displayName: 'Board ID',
		name: 'boardId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getBoards',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'get',
				],
				resource: [
					'board',
				],
			},
		},
		description: 'The ID of the board to get.',
	},

	// ----------------------------------
	//         board:getAll
	// ----------------------------------
	{
		displayName: 'User ID',
		name: 'IdUser',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: [
					'getAll',
				],
				resource: [
					'board',
				],
			},
		},
		description: 'The ID of the user that boards are attached.',
	},

] as INodeProperties[];
