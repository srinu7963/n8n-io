import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class UrlScanIoApi implements ICredentialType {
	name = 'urlScanIoApi';
	displayName = 'urlscan.io API';
	documentationUrl = 'urlScanIo';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
		},
	];
	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				'API-KEY': '={{$credentials.apiKey}}',
			},
		},
	} as IAuthenticateGeneric;

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://urlscan.io',
			url: '/user/quotas',
		},
	};
}
