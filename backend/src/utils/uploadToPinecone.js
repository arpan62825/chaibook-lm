import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const indexName = "chaibook-index";

export const uploadToPinecone = async (records) => {
  try {
    const indexes = await pc.listIndexes();
    const existingIndex = indexes.indexes?.find(
      (index) => index.name === indexName
    );

    let host = existingIndex?.host;

    if (!existingIndex) {
      const indexModel = await pc.createIndexForModel({
        name: indexName,
        cloud: "aws",
        region: "us-east-1",
        embed: {
          model: "llama-text-embed-v2",
          fieldMap: { text: "chunk_text" },
        },
        waitUntilReady: true,
      });
      host = indexModel.host;
    }

    const index = pc.index(indexName, host);
    await index.upsertRecords({ records });
  } catch (error) {
    console.error(
      `An error occurred while uploading to Pinecone: ${error.message}`
    );
    throw error;
  }
};

