import {app} from '../src/app';
import request from 'supertest';

describe('app', () => {
    beforeAll(() => {

    })
    it('should get index', async () => {
        const response = await request(app).get('/');
        expect(response.status).toEqual(200);
    })

    it('should query version', async () => {
        const response = await request(app).get('/graphql/version').query({
            query: `
            { version }
            `
        });
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({
            data: {
                version: '1.0.0'
            }
        });
    })
});