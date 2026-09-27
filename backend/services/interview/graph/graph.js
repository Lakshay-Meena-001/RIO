import { END, START, StateGraph } from "@langchain/langgraph";

import InterviewState from "./state.js";

import { interviewNode, feedbackNode, summaryNode } from "./nodes.js";

/*
 * ========================================================
 * START ROUTER
 * ========================================================
 *
 * Every HTTP request tells the graph what operation
 * needs to be performed.
 */
function startRouter(state) {
  switch (state.action) {
    case "start":
      return "interviewNode";

    case "submit-answer":
      return "feedbackNode";

    case "summary":
      return "summaryNode";

    default:
      return END;
  }
}

/*
 * ========================================================
 * INTERVIEW GRAPH
 * ========================================================
 */

const graph = new StateGraph(InterviewState)

  /*
   * Nodes
   */
  .addNode("interviewNode", interviewNode)

  .addNode("feedbackNode", feedbackNode)

  .addNode("summaryNode", summaryNode)

  /*
   * START → appropriate node
   */
  .addConditionalEdges(START, startRouter, {
    interviewNode: "interviewNode",

    feedbackNode: "feedbackNode",

    summaryNode: "summaryNode",

    [END]: END,
  })

  /*
   * Every operation ends after its job.
   */
  .addEdge("interviewNode", END)

  .addEdge("feedbackNode", END)

  .addEdge("summaryNode", END)

  /*
   * Compile graph.
   */
  .compile();

export default graph;
