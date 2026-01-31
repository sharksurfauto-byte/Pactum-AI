import { EAS, SchemaRegistry } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

const EAS_CONTRACT_ADDRESS = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"; // Sepolia
const SCHEMA_ID = "0xb16fa048b0d597f5a821747eba2d9079916671d9e7cddfab63618bfb1f740150"; // Placeholder schema ID for Financial Advisory Record

export interface AttestationData {
    meetingId: string;
    topics: string[];
    source: string;
    confidence: number;
    checksum: string;
}

export const createAttestation = async (data: AttestationData) => {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.ankr.com/eth_sepolia");

    const privateKey = process.env.ATTESTER_PRIVATE_KEY;
    if (!privateKey) {
        console.warn("ATTESTER_PRIVATE_KEY not found in .env. Skipping on-chain attestation.");
        return null;
    }

    const signer = new ethers.Wallet(privateKey, provider);
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new (await import("@ethereum-attestation-service/eas-sdk")).SchemaEncoder(
        "string meetingId,string[] topics,string source,uint256 confidence,string checksum"
    );

    const encodedData = schemaEncoder.encodeData([
        { name: "meetingId", value: data.meetingId, type: "string" },
        { name: "topics", value: data.topics, type: "string[]" },
        { name: "source", value: data.source, type: "string" },
        { name: "confidence", value: Math.floor(data.confidence * 10000), type: "uint256" }, // Convert to basis points
        { name: "checksum", value: data.checksum, type: "string" },
    ]);

    const tx = await eas.attest({
        schema: SCHEMA_ID,
        data: {
            recipient: ethers.ZeroAddress,
            expirationTime: 0n,
            revocable: true,
            data: encodedData,
        },
    });

    const newAttestationUID = await tx.wait();
    return newAttestationUID;
};
