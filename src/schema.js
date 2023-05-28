import { ApplicationService } from '@themost/common';
import { ODataModelBuilder, EdmType } from '@themost/data';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLBoolean, GraphQLInt } from 'graphql';
import * as packageJson from '../package.json';
import { TraceUtils } from '@themost/common';
import { createHandler } from 'graphql-http/lib/use/http';

  /**
   * get GraphQLScalarType from EdmType
   * @param {string} edmType
   * @return 
   */
function getGraphQLTypeFromEdmType(edmType) {
  switch (edmType) {
    case EdmType.EdmBoolean:
      return GraphQLBoolean;

    case EdmType.EdmInt16:
    case EdmType.EdmInt32:
    case EdmType.EdmInt64:
    case EdmType.EdmSByte:
    case EdmType.EdmByte:
      return GraphQLInt;
    
    case EdmType.EdmDecimal:
    case EdmType.EdmDouble:
    case EdmType.EdmSingle:
      return GraphQLFloat;

    default:
      return GraphQLString
  }
}

class GraphQLSchemaService extends ApplicationService {
  constructor(app) {
    super(app);
    if (app && app.container) {
      // wait for service container
      app.container.subscribe((container) => {
        if (container != null) {
          // get graphql schema
          this.getSchema().then((schema) => {
              // create graphql handler
              const handler = createHandler({ schema });
              // use graphql
              container.use('/graphql/', handler);
          }).catch((err) => {
            TraceUtils.error('An error occured while getting GraphQL schema.');
            TraceUtils.error(err);
          });
        }
      });
    }
  }

  
  async getSchema() {
    
    /**
     * get builder
     * @type {ODataModelBuilder}
     */
    const builder = this.application.getService(ODataModelBuilder);
    const document = await builder.getEdm();
    // create a collection of GraphQLObjectType
    const types = [];
    for (const entityType of document.entityType) {
      types.push(new GraphQLObjectType({
        name: entityType.name,
        fields: {}
      }));
    }
    // enumerate graphql objects and add properties
    for (const objectType of types) {
      const entityType = document.entityType.find((x) => x.name === objectType.name);
      const fields = entityType.property.reduce((previous, current) => {
        let type;
        if (/^Edm\./.test(current.type)) {
          // get primitive type
          const GraphQLType = getGraphQLTypeFromEdmType(current.type);
          type = current.nullable ? GraphQLType : new GraphQLNonNull(GraphQLType)
        } else {
          // get type based on object type
          const GraphQLEntityType = types.find((x) => x.name === current.type)
          type = current.nullable ? GraphQLEntityType : new GraphQLNonNull(GraphQLEntityType)
        }
        // set field
        const args = [];
        previous[current.name] = {
          type,
          args
        };
        return previous;
      }, {});
      objectType._fields = fields;
    }
    const addFields = document.entityContainer.entitySet.reduce((previous, current) => {
      const name = current.name;
      const type = types.find((x) => x.name === current.entityType.name);
      const args = {};
      previous[name] = {
        type,
        resolve: () => {
          return [];
        }
      }
      return previous;
    }, {});

    const fields = Object.assign({
      Version: {
        type: GraphQLString,
        resolve: () => packageJson.version,
      },
    }, addFields);

    const name = 'Query';
    const query = new GraphQLObjectType({
      name,
      fields,
    });
    
    return new GraphQLSchema({
      query,
      types
    });
  }
}

export {
  GraphQLSchemaService
}