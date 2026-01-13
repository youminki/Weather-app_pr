import districtsData from "@shared/assets/korea_districts.json";

// The new JSON is a string array: ["서울특별시", "서울특별시-종로구", ...]
export type District = string;

export const searchDistricts = async (query: string): Promise<District[]> => {
  if (!query) return [];

  const lowerQuery = query.toLowerCase();

  // Filter matches
  // Limit to 20 results for performance
  const matches = (districtsData as string[])
    .filter((district) => district.toLowerCase().includes(lowerQuery))
    .slice(0, 20);

  return matches;
};
