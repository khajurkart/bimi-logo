# backend/schema.py
from ariadne import gql, QueryType, make_executable_schema

type_defs = gql("""
    type Query {
        hello: String!
    }
""")

query = QueryType()

@query.field("hello")
def resolve_hello(_, info):
    return "Hello world!"

schema = make_executable_schema(type_defs, query)