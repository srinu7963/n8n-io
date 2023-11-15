/* eslint-disable @typescript-eslint/naming-convention */
import type { FilterConditionValue, FilterOptionsValue } from 'n8n-workflow';
import type { FilterOperator, FilterOperatorGroup } from './types';

export const DEFAULT_MAX_CONDITIONS = 10;

export const DEFAULT_FILTER_OPTIONS: FilterOptionsValue = {
	caseSensitive: true,
	leftValue: '',
	typeValidation: 'strict',
};

export const OPERATORS_BY_ID = {
	'any:exists': {
		type: 'any',
		operation: 'exists',
		name: 'filter.operator.exists',
		singleValue: true,
	},
	'any:notExists': {
		type: 'any',
		operation: 'notExists',
		name: 'filter.operator.notExists',
		singleValue: true,
	},
	'string:equals': { type: 'string', operation: 'equals', name: 'filter.operator.equals' },
	'string:notEquals': { type: 'string', operation: 'notEquals', name: 'filter.operator.notEquals' },
	'string:contains': { type: 'string', operation: 'contains', name: 'filter.operator.contains' },
	'string:notContains': {
		type: 'string',
		operation: 'notContains',
		name: 'filter.operator.notContains',
	},
	'string:startsWith': {
		type: 'string',
		operation: 'startsWith',
		name: 'filter.operator.startsWith',
	},
	'string:notStartsWith': {
		type: 'string',
		operation: 'notStartsWith',
		name: 'filter.operator.notStartsWith',
	},
	'string:endsWith': { type: 'string', operation: 'endsWith', name: 'filter.operator.endsWith' },
	'string:notEndsWith': {
		type: 'string',
		operation: 'notEndsWith',
		name: 'filter.operator.notEndsWith',
	},
	'string:regex': { type: 'string', operation: 'regex', name: 'filter.operator.regex' },
	'string:notRegex': { type: 'string', operation: 'notRegex', name: 'filter.operator.notRegex' },
	'number:equals': { type: 'number', operation: 'equals', name: 'filter.operator.equals' },
	'number:notEquals': { type: 'number', operation: 'notEquals', name: 'filter.operator.notEquals' },
	'number:gt': { type: 'number', operation: 'gt', name: 'filter.operator.gt' },
	'number:lt': { type: 'number', operation: 'lt', name: 'filter.operator.lt' },
	'number:gte': { type: 'number', operation: 'gte', name: 'filter.operator.gte' },
	'number:lte': { type: 'number', operation: 'lte', name: 'filter.operator.lte' },
	'dateTime:equals': { type: 'dateTime', operation: 'equals', name: 'filter.operator.equals' },
	'dateTime:notEquals': {
		type: 'dateTime',
		operation: 'notEquals',
		name: 'filter.operator.notEquals',
	},
	'dateTime:after': { type: 'dateTime', operation: 'after', name: 'filter.operator.after' },
	'dateTime:before': { type: 'dateTime', operation: 'before', name: 'filter.operator.before' },
	'dateTime:afterOrEquals': {
		type: 'dateTime',
		operation: 'afterOrEquals',
		name: 'filter.operator.afterOrEquals',
	},
	'dateTime:beforeOrEquals': {
		type: 'dateTime',
		operation: 'beforeOrEquals',
		name: 'filter.operator.beforeOrEquals',
	},
	'boolean:true': {
		type: 'boolean',
		operation: 'true',
		name: 'filter.operator.true',
		singleValue: true,
	},
	'boolean:false': {
		type: 'boolean',
		operation: 'false',
		name: 'filter.operator.false',
		singleValue: true,
	},
	'boolean:equals': { type: 'boolean', operation: 'equals', name: 'filter.operator.equals' },
	'boolean:notEquals': {
		type: 'boolean',
		operation: 'notEquals',
		name: 'filter.operator.notEquals',
	},
	'array:contains': {
		type: 'array',
		operation: 'contains',
		name: 'filter.operator.contains',
		rightType: 'any',
	},
	'array:notContains': {
		type: 'array',
		operation: 'notContains',
		name: 'filter.operator.notContains',
		rightType: 'any',
	},
	'array:lengthEquals': {
		type: 'array',
		operation: 'lengthEquals',
		name: 'filter.operator.lengthEquals',
		rightType: 'number',
	},
	'array:lengthNotEquals': {
		type: 'array',
		operation: 'lengthNotEquals',
		name: 'filter.operator.lengthNotEquals',
		rightType: 'number',
	},
	'array:lengthGt': {
		type: 'array',
		operation: 'lengthGt',
		name: 'filter.operator.lengthGt',
		rightType: 'number',
	},
	'array:lengthLt': {
		type: 'array',
		operation: 'lengthLt',
		name: 'filter.operator.lengthLt',
		rightType: 'number',
	},
	'array:lengthGte': {
		type: 'array',
		operation: 'lengthGte',
		name: 'filter.operator.lengthGte',
		rightType: 'number',
	},
	'array:lengthLte': {
		type: 'array',
		operation: 'lengthLte',
		name: 'filter.operator.lengthLte',
		rightType: 'number',
	},
	'object:empty': {
		type: 'object',
		operation: 'empty',
		name: 'filter.operator.empty',
		singleValue: true,
	},
	'object:notEmpty': {
		type: 'object',
		operation: 'notEmpty',
		name: 'filter.operator.notEmpty',
		singleValue: true,
	},
} as const satisfies Record<string, FilterOperator>;

export const OPERATORS = Object.values(OPERATORS_BY_ID);

export type FilterOperatorId = keyof typeof OPERATORS_BY_ID;

export const DEFAULT_OPERATOR_VALUE: FilterConditionValue['operator'] =
	OPERATORS_BY_ID['string:equals'];

export const OPERATOR_GROUPS: FilterOperatorGroup[] = [
	{
		id: 'any',
		name: 'filter.operatorGroup.basic',
		children: OPERATORS.filter((operator) => operator.type === 'any'),
	},
	{
		id: 'string',
		name: 'filter.operatorGroup.string',
		icon: 'font',
		children: OPERATORS.filter((operator) => operator.type === 'string'),
	},
	{
		id: 'number',
		name: 'filter.operatorGroup.number',
		icon: 'hashtag',
		children: OPERATORS.filter((operator) => operator.type === 'number'),
	},
	{
		id: 'dateTime',
		name: 'filter.operatorGroup.date',
		icon: 'calendar',
		children: OPERATORS.filter((operator) => operator.type === 'dateTime'),
	},
	{
		id: 'boolean',
		name: 'filter.operatorGroup.boolean',
		icon: 'check-square',
		children: OPERATORS.filter((operator) => operator.type === 'boolean'),
	},
	{
		id: 'array',
		name: 'filter.operatorGroup.array',
		icon: 'list',
		children: OPERATORS.filter((operator) => operator.type === 'array'),
	},
	{
		id: 'object',
		name: 'filter.operatorGroup.object',
		icon: 'cube',
		children: OPERATORS.filter((operator) => operator.type === 'object'),
	},
];
