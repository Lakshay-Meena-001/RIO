import {
  searchYouTubeVideos,
  getYouTubeVideoDetails,
} from "../config/youtube.js";

const SEARCH_RESULTS_PER_QUERY = 8;

const normalizeText = (value = "") => {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokenize = (value = "") => {
  return normalizeText(value)
    .split(" ")
    .filter((word) => word.length >= 3);
};

const calculateRelevanceScore = ({
  title,
  description,
  topic,
}) => {
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);
  const topicWords = tokenize(topic);

  if (topicWords.length === 0) {
    return 0;
  }

  let score = 0;

  for (const word of topicWords) {
    if (normalizedTitle.includes(word)) {
      score += 5;
    }

    if (normalizedDescription.includes(word)) {
      score += 2;
    }
  }

  return score;
};

const calculateViewScore = (viewCount) => {
  if (viewCount > 10_000_000) {
    return 5;
  }

  if (viewCount > 1_000_000) {
    return 4;
  }

  if (viewCount > 100_000) {
    return 3;
  }

  if (viewCount > 10_000) {
    return 2;
  }

  if (viewCount > 1_000) {
    return 1;
  }

  return 0;
};

const calculateQualityScore = (video, topic) => {
  const title = video.snippet?.title || "";
  const description = video.snippet?.description || "";
  const viewCount = Number(video.statistics?.viewCount || 0);

  const relevanceScore = calculateRelevanceScore({
    title,
    description,
    topic,
  });

  const viewScore = calculateViewScore(viewCount);

  return relevanceScore + viewScore;
};

const parseDurationToMinutes = (duration) => {
  if (!duration || typeof duration !== "string") {
    return null;
  }

  const match = duration.match(
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/,
  );

  if (!match) {
    return null;
  }

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return Math.ceil(
    hours * 60 + minutes + seconds / 60,
  );
};

const buildVideoUrl = (videoId) => {
  if (!videoId) {
    return null;
  }

  return `https://www.youtube.com/watch?v=${videoId}`;
};

const rankVideos = (videos, topic) => {
  return videos
    .map((video) => ({
      video,
      score: calculateQualityScore(video, topic),
    }))
    .sort((a, b) => b.score - a.score);
};

export const findRelevantYouTubeVideos = async ({
  topic,
  maxResults = SEARCH_RESULTS_PER_QUERY,
}) => {
  if (!topic?.trim()) {
    return [];
  }

  const searchResults = await searchYouTubeVideos({
    query: topic,
    maxResults,
    order: "relevance",
  });

  if (!searchResults.length) {
    return [];
  }

  const videoIds = [
    ...new Set(
      searchResults
        .map((item) => item.id?.videoId)
        .filter(Boolean),
    ),
  ];

  if (!videoIds.length) {
    return [];
  }

  const videos = await getYouTubeVideoDetails(videoIds);

  if (!videos.length) {
    return [];
  }

  return rankVideos(videos, topic);
};

export const buildYouTubeResource = (
  video,
  { isPrimary = false, reason = null } = {},
) => {
  const videoId = video.id;

  if (!videoId) {
    return null;
  }

  const snippet = video.snippet || {};
  const statistics = video.statistics || {};
  const contentDetails = video.contentDetails || {};

  return {
    type: "youtube",

    title:
      snippet.title?.trim() ||
      "YouTube learning resource",

    url: buildVideoUrl(videoId),

    source:
      snippet.channelTitle?.trim() ||
      "YouTube",

    isPrimary,

    reason,

    publishedAt: snippet.publishedAt
      ? new Date(snippet.publishedAt)
      : null,

    durationMinutes: parseDurationToMinutes(
      contentDetails.duration,
    ),

    viewCount: Number(
      statistics.viewCount || 0,
    ),
  };
};