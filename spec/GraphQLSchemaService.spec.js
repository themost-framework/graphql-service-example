import {app as container} from '../src/app';
import { GraphQLSchemaService } from '../src/schema';
import request from 'supertest';

describe('GraphQLSchemaService', () => {
    beforeAll(() => {

    })
    it('should get schema', async () => {
        const app = container.get('ExpressDataApplication');
        const service = new GraphQLSchemaService(app)
        const schema = await service.getSchema();
        expect(schema).toBeTruthy();
    })
});