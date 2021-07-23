import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ApolloServer, gql } from "apollo-server-azure-functions";
import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.CosmosKey);

const typeDefs = gql`
    type VideoList {
        id: String
        meetingId: String!
        tenantId: String!
        videos: [Video]
    }

    type Video {
        id: String
        url: String!
        description: String!
        image: String
    }

    type Query {
        getVideosForMeeting(meetingId: String): VideoList
    }
`;

const resolvers = {
    Query: {
        async getVideosForMeeting(_, { meetingId }: { meetingId: string }) {
            let results = await client
                .database("links_db")
                .container("videos")
                .items.query({
                    query: "SELECT * FROM c WHERE c.meetingId = @meetingId",
                    parameters: [
                        {
                            name: "@meetingId",
                            value: meetingId
                        }
                    ]
                })
                .fetchAll();

            if (results.resources.length == 0) {
                return null;
            } else {
                const data = results.resources[0];

                //TODO: I don't know why I need to remove these private fileds.
                // In the documentation I used it does not state you have to
                // 
                data["_attanchments"] = null;
                data["_etag"] = null;
                data["_rid"] = null;
                data["_self"] = null;
                data["_ts"] = null;

                return data;
            }
        }
    }
};

const server = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    playground: process.env.NODE_ENV === "development", 
});

export default server.createHandler();