
const getApiKey = () => {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "YOUTUBE_API_KEY is not configured.",
    );
  }

  return apiKey;
};

const getApiUrl = () => {
  const apiUrl = process.env.YOUTUBE_API_URL;

  if (!apiUrl) {
    throw new Error(
      "YOUTUBE_API_URL is not configured.",
    );
  }

  return apiUrl;
};

const youtubeRequest = async (endpoint, params) => {
  const query = new URLSearchParams({
    ...params,
    key: getApiKey(),
  });

  const response = await fetch(
    `${getApiUrl()}/${endpoint}?${query.toString()}`,
  );

  if (!response.ok) {
    let details = null;

    try {
      details = await response.json();
    } catch {
      details = null;
    }

    console.error("YouTube API request failed:", {
      endpoint,
      status: response.status,
      reason:
        details?.error?.message ||
        "Unknown YouTube API error.",
    });

    throw new Error(
      `YouTube API request failed with status ${response.status}.`,
    );
  }

  return response.json();
};

export const searchYouTubeVideos = async ({
  query,
  maxResults = 10,
  publishedAfter,
  order = "relevance",
}) => {
  if (!query?.trim()) {
    return [];
  }

  const safeMaxResults = Math.min(
    Math.max(Number(maxResults) || 1, 1),
    50,
  );

  const params = {
    part: "snippet",
    q: query.trim(),
    type: "video",
    maxResults: String(safeMaxResults),
    order,
    regionCode: "IN",
    relevanceLanguage: "en",
    safeSearch: "moderate",
  };

  if (publishedAfter) {
    params.publishedAfter = publishedAfter;
  }

  try {
    const data = await youtubeRequest(
      "search",
      params,
    );

    return data?.items || [];
  } catch (error) {
    console.error("YouTube video search failed:", {
      message: error.message,
    });

    return [];
  }
};

export const getYouTubeVideoDetails = async (
  videoIds,
) => {
  if (
    !Array.isArray(videoIds) ||
    videoIds.length === 0
  ) {
    return [];
  }

  const uniqueVideoIds = [
    ...new Set(
      videoIds
        .filter(Boolean)
        .map((id) => String(id).trim()),
    ),
  ];

  if (uniqueVideoIds.length === 0) {
    return [];
  }

  try {
    const data = await youtubeRequest(
      "videos",
      {
        part:
          "snippet,statistics,contentDetails",
        id: uniqueVideoIds.join(","),
      },
    );

    return data?.items || [];
  } catch (error) {
    console.error(
      "YouTube video details request failed:",
      {
        message: error.message,
      },
    );

    return [];
  }
};
