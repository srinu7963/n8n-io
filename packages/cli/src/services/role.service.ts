import { Service } from 'typedi';
import { RoleRepository } from '@db/repositories/role.repository';
import { SharedWorkflowRepository } from '@db/repositories/sharedWorkflow.repository';
import { CacheService } from '@/services/cache/cache.service';
import type { RoleNames, RoleScopes } from '@db/entities/Role';
import { InvalidRoleError } from '@/errors/invalid-role.error';
import { isSharingEnabled } from '@/UserManagement/UserManagementHelper';

@Service()
export class RoleService {
	constructor(
		private roleRepository: RoleRepository,
		private sharedWorkflowRepository: SharedWorkflowRepository,
		private cacheService: CacheService,
	) {
		void this.populateCache();
	}

	async populateCache() {
		const allRoles = await this.roleRepository.find({});

		if (!allRoles) return;

		void this.cacheService.setMany(allRoles.map((r) => [r.cacheKey, r]));
	}

	async findCached(scope: RoleScopes, name: RoleNames) {
		const cacheKey = `role:${scope}:${name}`;

		const role = await this.cacheService.get(cacheKey, {
			refreshFn: async () => this.roleRepository.findRole(scope, name),
		});

		if (role) return role;

		if (!this.isValid(scope, name)) throw new InvalidRoleError(scope, name);

		const roleToSave = this.roleRepository.create({ scope, name });

		const savedRole = this.roleRepository.save(roleToSave);

		void this.cacheService.set(cacheKey, savedRole);

		return savedRole;
	}

	private roles: Array<{ name: RoleNames; scope: RoleScopes }> = [
		{ scope: 'global', name: 'owner' },
		{ scope: 'global', name: 'member' },
		{ scope: 'global', name: 'admin' },
		{ scope: 'workflow', name: 'owner' },
		{ scope: 'credential', name: 'owner' },
		{ scope: 'credential', name: 'user' },
		{ scope: 'workflow', name: 'editor' },
	];

	listRoles() {
		return this.roles;
	}

	private isValid(scope: RoleScopes, name: RoleNames) {
		return this.roles.some((r) => r.scope === scope && r.name === name);
	}

	async findGlobalOwnerRole() {
		return this.findCached('global', 'owner');
	}

	async findGlobalMemberRole() {
		return this.findCached('global', 'member');
	}

	async findGlobalAdminRole() {
		return this.findCached('global', 'admin');
	}

	async findWorkflowOwnerRole() {
		return this.findCached('workflow', 'owner');
	}

	async findWorkflowEditorRole() {
		return this.findCached('workflow', 'editor');
	}

	async findCredentialOwnerRole() {
		return this.findCached('credential', 'owner');
	}

	async findCredentialUserRole() {
		return this.findCached('credential', 'user');
	}

	async findRoleByUserAndWorkflow(userId: string, workflowId: string) {
		return this.sharedWorkflowRepository
			.findOne({
				where: { workflowId, userId },
				relations: ['role'],
			})
			.then((shared) => shared?.role);
	}

	async findCredentialOwnerRoleId() {
		return isSharingEnabled() ? undefined : (await this.findCredentialOwnerRole()).id;
	}
}
