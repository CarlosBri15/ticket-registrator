describe('clientContainer', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('should throw if getApiClient is called before setApiClient', () => {
        let getApiClient: () => any;
        jest.isolateModules(() => {
            ({ getApiClient } = require('./clientContainer'));
        });
        expect(() => getApiClient!()).toThrow('ApiClient not initialized');
    });

    it('should return the client after setApiClient', () => {
        let setApiClient: (c: any) => void;
        let getApiClient: () => any;
        jest.isolateModules(() => {
            ({ setApiClient, getApiClient } = require('./clientContainer'));
        });
        const mockClient = { get: jest.fn() };
        setApiClient!(mockClient);
        expect(getApiClient!()).toBe(mockClient);
    });

    it('should expose api.auth, api.reports and api.tickets as functions', () => {
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
});
