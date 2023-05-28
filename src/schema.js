import { ApplicationService } from '@themost/common';
import { ODataModelBuilder, EdmType } from '@themost/data';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLFloat, GraphQLBoolean, GraphQLInt } from 'graphql';
import * as packageJson from '../package.json';
import { TraceUtils } from '@themost/common';

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
    const query = new GraphQLObjectType({
      name: 'Query',
      fields: {
        version: {
          type: GraphQLString,
          resolve: () => packageJson.version,
        },
      },
    });
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
      objectType.fields = entityType.property.reduce((previous, current) => {
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
        previous[current.name] = {
          type
        };
        return previous;
      }, {})
    }
    for (const entitySet of document.entityContainer.entitySet) {
      entitySet.entityType.property.reduce((previous, current) => {
        current.nullable
        const field = {
          type: current.nullable ? GraphQLString : new GraphQLNonNull(GraphQLString),
        }
      }, {})
    }

    return new GraphQLSchema({
      query,
      types
    });
  }
}

export {
  GraphQLSchemaService
}