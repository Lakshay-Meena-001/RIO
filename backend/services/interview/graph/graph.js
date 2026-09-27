import { END, START, StateGraph } from "@langchain/langgraph";
import InterviewState from "./state.js";

import {
  interviewNode,
  feedbackNode,
  summaryNode,
} from "./nodes.js";

function startRouter(state) {
  if (state.action === "start") {
    return "interviewNode";
  }

  if (state.action === "submit-answer") {
    return "feedbackNode";
  }

  if (state.action === "summary") {
    return "summaryNode";
  }

  return END;
}

const graph = new StateGraph(InterviewState)
  .addNode("interviewNode", interviewNode)
  .addNode("feedbackNode", feedbackNode)
  .addNode("summaryNode", summaryNode)

  .addConditionalEdges(START, startRouter, {
    interviewNode: "interviewNode",
    feedbackNode: "feedbackNode",
    summaryNode: "summaryNode",
    [END]: END,
  })

  .addEdge("interviewNode", END)
  .addEdge("feedbackNode", END)
  .addEdge("summaryNode", END)

  .compile();

export default graph;