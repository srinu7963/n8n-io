/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-cycle */
import express = require('express');
import { getConnection, In } from 'typeorm';
import { UserSettings, Credentials } from 'n8n-core';
import { INodeCredentialTestResult } from 'n8n-workflow';

import {
	CredentialsHelper,
	Db,
	GenericHelpers,
	ICredentialsDb,
	ICredentialsResponse,
	whereClause,
	ResponseHelper,
} from '..';

import { RESPONSE_ERROR_MESSAGES } from '../constants';
import { CredentialsEntity } from '../databases/entities/CredentialsEntity';
import { SharedCredentials } from '../databases/entities/SharedCredentials';
import { validateEntity } from '../GenericHelpers';
import type { CredentialRequest } from '../requests';
import config = require('../../config');
import { externalHooks } from '../Server';

export const credentialsController = express.Router();

/**
 * GET /credentials
 */
credentialsController.get(
	'/',
	ResponseHelper.send(async (req: CredentialRequest.GetAll): Promise<ICredentialsResponse[]> => {
		let credentials: ICredentialsDb[] = [];

		const filter = req.query.filter ? (JSON.parse(req.query.filter) as Record<string, string>) : {};

		if (req.user.globalRole.name === 'owner') {
			credentials = await Db.collections.Credentials!.find({
				select: ['id', 'name', 'type', 'nodesAccess', 'createdAt', 'updatedAt'],
				where: filter,
			});
		} else {
			const shared = await Db.collections.SharedCredentials!.find({
				where: whereClause({
					user: req.user,
					entityType: 'credentials',
				}),
			});

			if (!shared.length) return [];

			credentials = await Db.collections.Credentials!.find({
				select: ['id', 'name', 'type', 'nodesAccess', 'createdAt', 'updatedAt'],
				where: {
					id: In(shared.map(({ credentialId }) => credentialId)),
					...filter,
				},
			});
		}

		return credentials.map((credential) => {
			// eslint-disable-next-line no-param-reassign
			credential.id = credential.id.toString();
			return credential as ICredentialsResponse;
		});
	}),
);

/**
 * GET /credentials/new
 *
 * Generate a unique credential name.
 */
credentialsController.get(
	'/new',
	ResponseHelper.send(async (req: CredentialRequest.NewName): Promise<{ name: string }> => {
		const { name: newName } = req.query;

		return GenericHelpers.generateUniqueName(
			newName ?? config.get('credentials.defaultName'),
			'credentials',
		);
	}),
);

/**
 * POST /credentials/test
 *
 * Test if a credential is valid.
 */
credentialsController.post(
	'/test',
	ResponseHelper.send(async (req: CredentialRequest.Test): Promise<INodeCredentialTestResult> => {
		const { credentials, nodeToTestWith } = req.body;

		const encryptionKey = await UserSettings.getEncryptionKey();

		if (!encryptionKey) {
			return {
				status: 'Error',
				message: RESPONSE_ERROR_MESSAGES.NO_ENCRYPTION_KEY,
			};
		}

		const helper = new CredentialsHelper(encryptionKey);

		return helper.testCredentials(req.user, credentials.type, credentials, nodeToTestWith);
	}),
);

/**
 * POST /credentials
 */
credentialsController.post(
	'/',
	ResponseHelper.send(async (req: CredentialRequest.Create) => {
		delete req.body.id; // delete if sent

		const newCredential = new CredentialsEntity();

		Object.assign(newCredential, req.body);

		await validateEntity(newCredential);

		// Add the added date for node access permissions
		for (const nodeAccess of newCredential.nodesAccess) {
			nodeAccess.date = new Date();
		}

		const encryptionKey = await UserSettings.getEncryptionKey();

		if (!encryptionKey) {
			throw new ResponseHelper.ResponseError(
				RESPONSE_ERROR_MESSAGES.NO_ENCRYPTION_KEY,
				undefined,
				500,
			);
		}

		// Encrypt the data
		const coreCredential = new Credentials(
			{ id: null, name: newCredential.name },
			newCredential.type,
			newCredential.nodesAccess,
		);

		// @ts-ignore
		coreCredential.setData(newCredential.data, encryptionKey);

		const encryptedData = coreCredential.getDataToSave() as ICredentialsDb;

		Object.assign(newCredential, encryptedData);

		await externalHooks.run('credentials.create', [encryptedData]);

		const role = await Db.collections.Role!.findOneOrFail({
			name: 'owner',
			scope: 'credential',
		});

		const { id, ...rest } = await Db.transaction(async (transactionManager) => {
			const savedCredential = await transactionManager.save<CredentialsEntity>(newCredential);

			savedCredential.data = newCredential.data;

			const newSharedCredential = new SharedCredentials();

			Object.assign(newSharedCredential, {
				role,
				user: req.user,
				credentials: savedCredential,
			});

			await transactionManager.save<SharedCredentials>(newSharedCredential);

			return savedCredential;
		});

		return { id: id.toString(), ...rest };
	}),
);

/**
 * DELETE /credentials/:id
 */
credentialsController.delete(
	'/:id',
	ResponseHelper.send(async (req: CredentialRequest.Delete) => {
		const { id: credentialId } = req.params;

		const shared = await Db.collections.SharedCredentials!.findOne({
			relations: ['credentials'],
			where: whereClause({
				user: req.user,
				entityType: 'credentials',
				entityId: credentialId,
			}),
		});

		if (!shared) {
			throw new ResponseHelper.ResponseError(
				`Credential with ID "${credentialId}" could not be found to be deleted.`,
				undefined,
				404,
			);
		}

		await externalHooks.run('credentials.delete', [credentialId]);

		await Db.collections.Credentials!.remove(shared.credentials);

		return true;
	}),
);

/**
 * PATCH /credentials/:id
 */
credentialsController.patch(
	'/:id',
	ResponseHelper.send(async (req: CredentialRequest.Update): Promise<ICredentialsResponse> => {
		const { id: credentialId } = req.params;

		const updateData = new CredentialsEntity();
		Object.assign(updateData, req.body);

		await validateEntity(updateData);

		const shared = await Db.collections.SharedCredentials!.findOne({
			relations: ['credentials'],
			where: whereClause({
				user: req.user,
				entityType: 'credentials',
				entityId: credentialId,
			}),
		});

		if (!shared) {
			throw new ResponseHelper.ResponseError(
				`Credential with ID "${credentialId}" could not be found to be updated.`,
				undefined,
				404,
			);
		}

		const { credentials: credential } = shared;

		// Add the date for newly added node access permissions
		for (const nodeAccess of updateData.nodesAccess) {
			if (!nodeAccess.date) {
				nodeAccess.date = new Date();
			}
		}

		const encryptionKey = await UserSettings.getEncryptionKey();

		if (!encryptionKey) {
			throw new ResponseHelper.ResponseError(
				RESPONSE_ERROR_MESSAGES.NO_ENCRYPTION_KEY,
				undefined,
				500,
			);
		}

		const coreCredential = new Credentials(
			{ id: credential.id.toString(), name: credential.name },
			credential.type,
			credential.nodesAccess,
			credential.data,
		);

		const decryptedData = coreCredential.getData(encryptionKey);

		// Do not overwrite the oauth data else data like the access or refresh token would get lost
		// everytime anybody changes anything on the credentials even if it is just the name.
		if (decryptedData.oauthTokenData) {
			// @ts-ignore
			updateData.data.oauthTokenData = decryptedData.oauthTokenData;
		}

		// Encrypt the data
		const credentials = new Credentials(
			{ id: credentialId, name: updateData.name },
			updateData.type,
			updateData.nodesAccess,
		);

		// @ts-ignore
		credentials.setData(updateData.data, encryptionKey);

		const newCredentialData = credentials.getDataToSave() as ICredentialsDb;

		// Add special database related data
		newCredentialData.updatedAt = new Date();

		await externalHooks.run('credentials.update', [newCredentialData]);

		// Update the credentials in DB
		await Db.collections.Credentials!.update(credentialId, newCredentialData);

		// We sadly get nothing back from "update". Neither if it updated a record
		// nor the new value. So query now the updated entry.
		const responseData = await Db.collections.Credentials!.findOne(credentialId);

		if (responseData === undefined) {
			throw new ResponseHelper.ResponseError(
				`Credential ID "${credentialId}" could not be found to be updated.`,
				undefined,
				404,
			);
		}

		// Remove the encrypted data as it is not needed in the frontend
		const { id, data, ...rest } = responseData;

		return {
			id: id.toString(),
			...rest,
		};
	}),
);

/**
 * GET /credentials/:id
 */
credentialsController.get(
	'/:id',
	ResponseHelper.send(async (req: CredentialRequest.Get) => {
		const { id: credentialId } = req.params;

		const shared = await Db.collections.SharedCredentials!.findOne({
			relations: ['credentials'],
			where: whereClause({
				user: req.user,
				entityType: 'credentials',
				entityId: credentialId,
			}),
		});

		if (!shared) {
			throw new ResponseHelper.ResponseError(
				`Credentials with ID "${credentialId}" could not be found.`,
				undefined,
				404,
			);
		}

		const { credentials: credential } = shared;

		if (req.query.includeData !== 'true') {
			const { data, id, ...rest } = credential;

			return {
				id: id.toString(),
				...rest,
			};
		}

		const { data, id, ...rest } = credential;

		const encryptionKey = await UserSettings.getEncryptionKey();

		if (!encryptionKey) {
			throw new ResponseHelper.ResponseError(
				RESPONSE_ERROR_MESSAGES.NO_ENCRYPTION_KEY,
				undefined,
				500,
			);
		}

		const coreCredential = new Credentials(
			{ id: credential.id.toString(), name: credential.name },
			credential.type,
			credential.nodesAccess,
			credential.data,
		);

		return {
			id: id.toString(),
			data: coreCredential.getData(encryptionKey),
			...rest,
		};
	}),
);
