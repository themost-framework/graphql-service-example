import express from 'express';
import { createHandler } from 'graphql-http/lib/use/http';
import { schema } from './schema';
import { getApplication } from '@themost/test';
import path from 'path';

// use @themost/test application
const app = getApplication();

const handler = createHandler({ schema });
// add graphql handler
app.use('/graphql/', handler);

app.use('/query/', (req, res, next) => {
    return res.render(path.resolve(__dirname, 'views/query'))
});

export {
    app
}