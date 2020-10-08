import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodePropertyOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

import {
	apiRequest,
} from './GenericFunctions';

import {
	boardFields,
	boardOperations,
} from './BoardDescription';

import {
	cardFields,
	cardOperations,
} from './CardDescription';

import {
	cardCommentFields,
	cardCommentOperations,
} from './CardCommentDescription';

import {
	checklistFields,
	checklistOperations,
} from './ChecklistDescription';

import {
	listFields,
	listOperations,
} from './ListDescription';

// https://wekan.github.io/api/v4.41/

export class Wekan implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wekan',
		name: 'wekan',
		icon: 'file:wekan.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Open-Source kanban',
		defaults: {
			name: 'Wekan',
			color: '#006581',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'wekanApi',
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
						name: 'Board',
						value: 'board',
					},
					{
						name: 'Card',
						value: 'card',
					},
					{
						name: 'Card Comment',
						value: 'cardComment',
					},
					{
						name: 'Checklist',
						value: 'checklist',
					},
					{
						name: 'List',
						value: 'list',
					},
				],
				default: 'card',
				description: 'The resource to operate on.',
			},

			// ----------------------------------
			//         operations
			// ----------------------------------
			...boardOperations,
			...cardOperations,
			...cardCommentOperations,
			...checklistOperations,
			...listOperations,

			// ----------------------------------
			//         fields
			// ----------------------------------
			...boardFields,
			...cardFields,
			...cardCommentFields,
			...checklistFields,
			...listFields
		]
	};

	methods = {
		loadOptions: {
			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const users = await apiRequest.call(this, 'GET', 'users', {}, {});
				for (const user of users) {
					returnData.push({
						name: user.username,
						value: user._id,
					});
				}
				return returnData;
			},
			async getBoards(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const user = await apiRequest.call(this, 'GET', `user`, {}, {});
				const boards = await apiRequest.call(this, 'GET', `users/${user._id}/boards`, {}, {});
				for (const board of boards) {
					returnData.push({
						name: board.title,
						value: board._id,
					});
				}
				return returnData;
			},
			async getLists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boardId = this.getCurrentNodeParameter('boardId') as string;
				const lists = await apiRequest.call(this, 'GET', `boards/${boardId}/lists`, {}, {});
				for (const list of lists) {
					returnData.push({
						name: list.title,
						value: list._id,
					});
				}
				return returnData;
			},
			async getSwimlanes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boardId = this.getCurrentNodeParameter('boardId') as string;
				const swimlanes = await apiRequest.call(this, 'GET', `boards/${boardId}/swimlanes`, {}, {});
				for (const swimlane of swimlanes) {
					returnData.push({
						name: swimlane.title,
						value: swimlane._id,
					});
				}
				return returnData;
			},
			async getCards(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boardId = this.getCurrentNodeParameter('boardId') as string;
				const listId = this.getCurrentNodeParameter('listId') as string;
				const cards = await apiRequest.call(this, 'GET', `boards/${boardId}/lists/${listId}/cards`, {}, {});
				for (const card of cards) {
					returnData.push({
						name: card.title,
						value: card._id,
					});
				}
				return returnData;
			},
			async getChecklists(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boardId = this.getCurrentNodeParameter('boardId') as string;
				const cardId = this.getCurrentNodeParameter('cardId') as string;
				const checklists = await apiRequest.call(this, 'GET', `boards/${boardId}/cards/${cardId}/checklists`, {}, {});
				for (const checklist of checklists) {
					returnData.push({
						name: checklist.title,
						value: checklist._id,
					});
				}
				return returnData;
			},
			async getChecklistItems(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boardId = this.getCurrentNodeParameter('boardId') as string;
				const cardId = this.getCurrentNodeParameter('cardId') as string;
				const checklistId = this.getCurrentNodeParameter('checklistId') as string;
				const checklist = await apiRequest.call(this, 'GET', `boards/${boardId}/cards/${cardId}/checklists/${checklistId}`, {}, {});
				for (const item of checklist.items) {
					returnData.push({
						name: item.title,
						value: item._id,
					});
				}
				return returnData;
			},
			async getComments(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const boardId = this.getCurrentNodeParameter('boardId') as string;
				const cardId = this.getCurrentNodeParameter('cardId') as string;
				const comments = await apiRequest.call(this, 'GET', `boards/${boardId}/cards/${cardId}/comments`, {}, {});
				for (const comment of comments) {
					returnData.push({
						name: comment.comment,
						value: comment._id,
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		const operation = this.getNodeParameter('operation', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;

		// For Post
		let body: IDataObject;
		// For Query string
		let qs: IDataObject;

		let requestMethod: string;
		let endpoint: string;

		for (let i = 0; i < items.length; i++) {
			requestMethod = 'GET';
			endpoint = '';
			body = {};
			qs = {};

			if (resource === 'board') {

				if (operation === 'create') {
					// ----------------------------------
					//         create
					// ----------------------------------

					requestMethod = 'POST';
					endpoint = 'boards';

					body.title = this.getNodeParameter('title', i) as string;
					body.owner = this.getNodeParameter('owner', i) as string;

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					Object.assign(body, additionalFields);

				} else if (operation === 'delete') {
					// ----------------------------------
					//         delete
					// ----------------------------------

					requestMethod = 'DELETE';

					const boardId = this.getNodeParameter('boardId', i) as string;

					endpoint = `boards/${boardId}`;

				} else if (operation === 'get') {
					// ----------------------------------
					//         get
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;

					endpoint = `boards/${boardId}`;

				} else if (operation === 'getAll') {
					// ----------------------------------
					//         getAll
					// ----------------------------------

					requestMethod = 'GET';

					const IdUser = this.getNodeParameter('IdUser', i) as string;

					endpoint = `users/${IdUser}/boards`;

				} else {
					throw new Error(`The operation "${operation}" is not known!`);
				}

			} else if (resource === 'card') {

				if (operation === 'create') {
					// ----------------------------------
					//         create
					// ----------------------------------

					requestMethod = 'POST';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const listId = this.getNodeParameter('listId', i) as string;

					endpoint = `boards/${boardId}/lists/${listId}/cards`;

					body.title = this.getNodeParameter('title', i) as string;
					body.swimlaneId = this.getNodeParameter('swimlaneId', i) as string;
					body.authorId = this.getNodeParameter('authorId', i) as string;

					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					Object.assign(body, additionalFields);

				} else if (operation === 'delete') {
					// ----------------------------------
					//         delete
					// ----------------------------------

					requestMethod = 'DELETE';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const listId = this.getNodeParameter('listId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;

					endpoint = `boards/${boardId}/lists/${listId}/cards/${cardId}`;

				} else if (operation === 'get') {
					// ----------------------------------
					//         get
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const listId = this.getNodeParameter('listId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;

					endpoint = `boards/${boardId}/lists/${listId}/cards/${cardId}`;

				} else if (operation === 'getAll') {
					// ----------------------------------
					//         getAll
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const fromObject = this.getNodeParameter('fromObject', i) as string;

					if (fromObject === 'list') {
						const listId = this.getNodeParameter('listId', i) as string;

						endpoint = `boards/${boardId}/lists/${listId}/cards`;
					}

					if (fromObject === 'swimlane') {
						const swimlaneId = this.getNodeParameter('swimlaneId', i) as string;

						endpoint = `boards/${boardId}/swimlanes/${swimlaneId}/cards`;
					}

				} else if (operation === 'update') {
					// ----------------------------------
					//         update
					// ----------------------------------

					requestMethod = 'PUT';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const listId = this.getNodeParameter('listId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;

					endpoint = `boards/${boardId}/lists/${listId}/cards/${cardId}`;

					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
					Object.assign(body, updateFields);

				} else {
					throw new Error(`The operation "${operation}" is not known!`);
				}

			} else if (resource === 'cardComment') {

				if (operation === 'create') {
					// ----------------------------------
					//         create
					// ----------------------------------

					requestMethod = 'POST';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/comments`;

					body.authorId = this.getNodeParameter('authorId', i) as string;
					body.comment = this.getNodeParameter('comment', i) as string;

				} else if (operation === 'delete') {
					// ----------------------------------
					//         delete
					// ----------------------------------

					requestMethod = 'DELETE';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;
					const commentId = this.getNodeParameter('commentId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/comments/${commentId}`;

				} else if (operation === 'get') {
					// ----------------------------------
					//         get
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;
					const commentId = this.getNodeParameter('commentId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/comments/${commentId}`;

				} else if (operation === 'getAll') {
					// ----------------------------------
					//         getAll
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/comments`;

				} else {
					throw new Error(`The operation "${operation}" is not known!`);
				}

			} else if (resource === 'list') {

				if (operation === 'create') {
					// ----------------------------------
					//         create
					// ----------------------------------

					requestMethod = 'POST';

					const boardId = this.getNodeParameter('boardId', i) as string;

					endpoint = `boards/${boardId}/lists`;

					body.title = this.getNodeParameter('title', i) as string;

				} else if (operation === 'delete') {
					// ----------------------------------
					//         delete
					// ----------------------------------

					requestMethod = 'DELETE';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const listId = this.getNodeParameter('listId', i) as string;

					endpoint = `boards/${boardId}/lists/${listId}`;
					
				} else if (operation === 'get') {
					// ----------------------------------
					//         get
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const listId = this.getNodeParameter('listId', i) as string;

					endpoint = `boards/${boardId}/lists/${listId}`;

				} else if (operation === 'getAll') {
					// ----------------------------------
					//         getAll
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;

					endpoint = `boards/${boardId}/lists`;

				} else {
					throw new Error(`The operation "${operation}" is not known!`);
				}

			} else if (resource === 'checklist') {

				if (operation === 'create') {
					// ----------------------------------
					//         create
					// ----------------------------------

					requestMethod = 'POST';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/checklists`;

					body.title = this.getNodeParameter('title', i) as string;

					const itemValues = (this.getNodeParameter('items', i) as IDataObject).itemValues as IDataObject[];
					if (itemValues) {
						const items = [];
						for (const itemValue of itemValues) {
							const item = {
								title: itemValue.title as string,
								isFinished: itemValue.isFinished as boolean,
							};
							items.push(item);
						}
						body.items = items;
					}

				} else if (operation === 'delete') {
					// ----------------------------------
					//         delete
					// ----------------------------------

					requestMethod = 'DELETE';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;
					const checklistId = this.getNodeParameter('checklistId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/checklists/${checklistId}`;

				} else if (operation === 'get') {
					// ----------------------------------
					//         get
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;
					const checklistId = this.getNodeParameter('checklistId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/checklists/${checklistId}`;

				} else if (operation === 'getAll') {
					// ----------------------------------
					//         getAll
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/checklists`;

				} else if (operation === 'getCheckItem') {
					// ----------------------------------
					//         getCheckItem
					// ----------------------------------

					requestMethod = 'GET';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;
					const checklistId = this.getNodeParameter('checklistId', i) as string;
					const itemId = this.getNodeParameter('itemId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/${itemId}`;

				} else if (operation === 'deleteCheckItem') {
					// ----------------------------------
					//         deleteCheckItem
					// ----------------------------------

					requestMethod = 'DELETE';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;
					const checklistId = this.getNodeParameter('checklistId', i) as string;
					const itemId = this.getNodeParameter('itemId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/${itemId}`;

				} else if (operation === 'updateCheckItem') {
					// ----------------------------------
					//         updateCheckItem
					// ----------------------------------

					requestMethod = 'PUT';

					const boardId = this.getNodeParameter('boardId', i) as string;
					const cardId = this.getNodeParameter('cardId', i) as string;
					const checklistId = this.getNodeParameter('checklistId', i) as string;
					const itemId = this.getNodeParameter('itemId', i) as string;

					endpoint = `boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/${itemId}`;

					const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
					Object.assign(body, updateFields);

				} else {
					throw new Error(`The operation "${operation}" is not known!`);
				}

			} else {
				throw new Error(`The resource "${resource}" is not known!`);
			}

			const responseData = await apiRequest.call(this, requestMethod, endpoint, body, qs);

			if (Array.isArray(responseData)) {
				returnData.push.apply(returnData, responseData as IDataObject[]);
			} else {
				returnData.push(responseData as IDataObject);
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
