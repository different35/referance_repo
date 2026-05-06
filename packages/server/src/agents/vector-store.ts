export interface CampaignMemory {
  id: string;
  name: string;
  description: string;
  performance: {
    ctr: number;
    conversion_rate: number;
    roi: number;
  };
  keywords: string[];
  metadata: Record<string, unknown>;
}

// Placeholder for ChromaDB integration
// In production, integrate actual ChromaDB client
const campaignStore = new Map<string, CampaignMemory>();

export async function initializeVectorStore() {
  console.log("✅ Vector store initialized");
  return true;
}

export async function getVectorStore() {
  return true;
}

export async function storeCampaignMemory(
  campaign: CampaignMemory
): Promise<void> {
  campaignStore.set(campaign.id, campaign);
  console.log(`📚 Campaign "${campaign.name}" stored in vector DB`);
}

export async function searchSimilarCampaigns(
  query: string,
  topK: number = 3
): Promise<CampaignMemory[]> {
  const queryLower = query.toLowerCase();
  const results = Array.from(campaignStore.values())
    .filter(
      (c) =>
        c.name.toLowerCase().includes(queryLower) ||
        c.description.toLowerCase().includes(queryLower) ||
        c.keywords.some((k) => k.toLowerCase().includes(queryLower))
    )
    .slice(0, topK);

  return results;
}

export async function getAllCampaignMemories(): Promise<CampaignMemory[]> {
  return Array.from(campaignStore.values());
}
