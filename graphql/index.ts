import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ApolloServer, gql } from "apollo-server-azure-functions";
import { CosmosClient } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";

const client = new CosmosClient(process.env.CosmosKey);

const typeDefs = gql`

    input VideoListInput {
        meetingId: String
        tenantId: String
        videos: [VideoInput]
    }

    input VideoInput {
        url: String
        description: String!
        image: String
    }

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

    type Mutation {
        createVideoList(input: VideoListInput): String,
        updateVideoList(id: String, tenantId: String, data: VideoListInput): Boolean
        deleteVideoList(id: String, tenantId: String): Boolean
    }    

    type Query {
        getVideosForMeeting(meetingId: String): VideoList
    }
`;

const resolvers = {
    Mutation: {
        async createVideoList (_, {input}) {
            input["id"] = uuidv4();
            let response = await client.database("links_db").container("videos").items.create(input);

            if (response.statusCode == 201) {
                return input["id"];
            } else {
                return null;
            }
        },
        async updateVideoList (_, {id, tenantId, data}) {

            data["id"] = id;
            data["tenantId"] = tenantId;

            let item = await client.database("links_db").container("videos").item(id, tenantId);

            if (data["meedtingId"] == null) {
                data["meetingId"] = item["meetingId"];
            }

            if (data["videos"] == null) {
                data["videos"] = item["videos"];
            }

            let response = await item.replace(data);

            if (response.statusCode == 200) {
                return true;
            } else {
                return false;
            }
        },
        async deleteVideoList (_, {id, tenantId}) {
            let response = await client.database("links_db").container("videos").item(id,tenantId).delete();

            if (response.statusCode == 204) {
                return true;
            } else {
                return false;
            }
        },
    },
    Query: {
        async getVideosForMeeting(_, { meetingId }: { meetingId: string }) {

            if (meetingId === '') {
                return null;
            }
            
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