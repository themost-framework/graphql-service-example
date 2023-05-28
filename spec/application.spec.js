import {app} from '../src/app';
import request from 'supertest';

describe('app', () => {
    beforeAll(() => {

    })
    it('should get index', async () => {
        const response = await request(app).get('/');
        expect(response.status).toEqual(200);
    })
});