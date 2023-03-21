import express from 'express'
import expGraphql from 'express-graphql'
import { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql'

const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J R. R. Tolkien' },
    { id: 3, name: 'Brent Week' }
]
const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the Ring', authorId: 2 },
    { id: 7, name: 'the Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 },

]

const app = express();

//Exemplo simples
// const graphqlSchema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: 'Helloworld',
//         fields: () => ({
//             message: {
//                 type: GraphQLString,
//                 resolve: () => 'Hello world'
//             }
//         })
//     })
// }) 
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: "This represent a author",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(BookType), resolve: (parent) => {
                return books.filter(book => book.authorId === parent.id)
            }
        }
    })
})
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: "This represent a book",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (parent) => {
                return authors.find(author => author.id === parent.authorId)
            }
        }
    })
})

const rootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of all books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'single author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all author',
            resolve: () => authors
        }
    })
})

const rootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: () => ({
        addBook: {
            type: BookType, description: 'Adding a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: BookType, description: 'Adding a author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        },
    })
})

const graphqlSchema = new GraphQLSchema({
    query: rootQueryType,
    mutation: rootMutationType
})

app.use('/graphql', expGraphql.graphqlHTTP({
    schema: graphqlSchema,
    graphiql: true
}))

app.listen(5000, () => {
    console.log('HTTP server runing')
})