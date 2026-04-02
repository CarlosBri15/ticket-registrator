describe('clientContainer', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('should throw if getApiClient is called before setApiClient', () => {
        let getApiClient: () => any;
        jest.isolateModules(() => {
            ({ getApiClient } = require('./clientContainer'));
        });
        expect(() => getApiClient()).toThrow('ApiClient not initialized');
    });

    it('should return the client after setApiClient', () => {
        let setApiClient: (c: any) => void;
        let getApiClient: () => any;
        jest.isolateModules(() => {
            ({ setApiClient, getApiClient } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn() };
        setApiClient(mockClient);
        expect(getApiClient()).toBe(mockClient);
    });

    it('should expose all api namespaces as functions', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
        setApiClient!(mockClient);
        expect(typeof api.auth).toBe('function');
        expect(typeof api.reports).toBe('function');
        expect(typeof api.tickets).toBe('function');
        expect(typeof api.users).toBe('function');
        expect(typeof api.departments).toBe('function');
        expect(typeof api.roles).toBe('function');
        expect(typeof api.organizations).toBe('function');
        expect(typeof api.permissions).toBe('function');
    });

    it('api.auth() should return authApi methods', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn() };
        setApiClient!(mockClient);
        const authMethods = api.auth();
        expect(typeof authMethods.login).toBe('function');
        expect(typeof authMethods.register).toBe('function');
        expect(typeof authMethods.getMe).toBe('function');
    });

    it('api.users() should return usersApi methods', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
        setApiClient!(mockClient);
        const methods = api.users();
        expect(typeof methods.getAll).toBe('function');
        expect(typeof methods.create).toBe('function');
        expect(typeof methods.update).toBe('function');
        expect(typeof methods.delete).toBe('function');
    });

    it('api.departments() should return departmentsApi methods', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
        setApiClient!(mockClient);
        const methods = api.departments();
        expect(typeof methods.getAll).toBe('function');
        expect(typeof methods.create).toBe('function');
        expect(typeof methods.update).toBe('function');
        expect(typeof methods.delete).toBe('function');
    });

    it('api.roles() should return rolesApi methods', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
        setApiClient!(mockClient);
        const methods = api.roles();
        expect(typeof methods.getSystem).toBe('function');
        expect(typeof methods.getByCompany).toBe('function');
        expect(typeof methods.create).toBe('function');
        expect(typeof methods.delete).toBe('function');
        expect(typeof methods.getRolePermissions).toBe('function');
    });

    it('api.organizations() should return organizationsApi methods', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
        setApiClient!(mockClient);
        const methods = api.organizations();
        expect(typeof methods.getAll).toBe('function');
        expect(typeof methods.onboard).toBe('function');
        expect(typeof methods.update).toBe('function');
        expect(typeof methods.delete).toBe('function');
    });

    it('api.permissions() should return permissionsApi methods', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn(), delete: jest.fn() };
        setApiClient!(mockClient);
        const methods = api.permissions();
        expect(typeof methods.getAll).toBe('function');
        expect(typeof methods.assignToRole).toBe('function');
        expect(typeof methods.unassignFromRole).toBe('function');
    });

    it('api.reports() should return reportsApi methods', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
        setApiClient(mockClient);
        const methods = api.reports();
        expect(typeof methods.getAll).toBe('function');
        expect(typeof methods.getOne).toBe('function');
        expect(typeof methods.create).toBe('function');
        expect(typeof methods.submit).toBe('function');
    });

    it('api.tickets() should return ticketsApi methods', () => {
        let setApiClient: (c: any) => void;
        let api: any;
        jest.isolateModules(() => {
            ({ setApiClient, api } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() };
        setApiClient(mockClient);
        const methods = api.tickets();
        expect(typeof methods.getByReport).toBe('function');
        expect(typeof methods.get).toBe('function');
        expect(typeof methods.update).toBe('function');
        expect(typeof methods.upload).toBe('function');
    });
});
