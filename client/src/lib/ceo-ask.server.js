`// Mock CEO Ask Server
export const answerCeoQuestion = async (request, data) => {
  return {
    status: 200,
    answer: "Based on the dashboard metrics, the portfolio quality remains strong with 96% collection efficiency. The recent product mix shift towards MSME loans has positively impacted AUM. We are on track to meet the quarterly disbursement target.",
  };
};
