import { GraphQLSchemaService } from './schema';
import { getApplication } from '@themost/test';
import path from 'path';

// use @themost/test application
const app = getApplication();
/**
 * @type {import('@themost/express').ExpressDataApplication}
 */
const application = app.get('ExpressDataApplication');
// use graphQL service
application.useService(GraphQLSchemaService);
// 
application.container.next(app);

// // use graphql service
// app1.useService(GraphQLSchemaService);
app.use('/editor/', (req, res, next) => {
    res.render(path.resolve(__dirname, 'views/graphiql/index'));
})

export {
    app
}