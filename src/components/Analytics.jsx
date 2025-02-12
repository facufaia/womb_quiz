import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
// import { mockResults } from "../data/mockResults";
import { supabase } from "../lib/supabase";

export default function Analytics({ initialResults }) {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [results, setResults] = useState(initialResults);
  const totalResponses = results ? results.length : 0;
  const categoryCounts = results
    ? results.reduce((acc, result) => {
        acc[result.category] = (acc[result.category] || 0) + 1;
        return acc;
      }, {})
    : {};

  // Calcular estadísticas basadas en result.category
  // const categoryCounts = results.reduce((acc, result) => {
  //   acc[result.category] = (acc[result.category] || 0) + 1;
  //   return acc;
  // }, {});

  async function fetchResults() {
    try {
      const response = await fetch("/analytics", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const { results: newResults } = await response.json();
      setResults(newResults);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  }

  useEffect(() => {
    // Recargar datos periódicamente
    const interval = setInterval(fetchResults, 30000); // cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-power-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-HVFlorentino text-golden-600 mb-8">
          Womb Quiz Analytics
        </h1>
        {/* Stats Cards */}
        {results && (
          <>
            <StatCard
              title="Total"
              value={totalResponses}
              className="bg-power-800 mb-6 bg-rich_black-100/40"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StatCard
                title="HOT Wombs"
                value={categoryCounts["HOT"] || 0}
                className="bg-clay-600"
              />
              <StatCard
                title="DAMP Wombs"
                value={categoryCounts["DAMP"] || 0}
                className="bg-blush-700/90"
              />
              <StatCard
                title="STUCK Wombs"
                value={categoryCounts["STUCK"] || 0}
                className="bg-blush-900/60"
              />
              <StatCard
                title="COLD Wombs"
                value={categoryCounts["COLD"] || 0}
                className="bg-sky-800/60"
              />
            </div>
            {/* Category Distribution & Timeline Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <CategoryChart data={categoryCounts} />
              <TimelineChart data={results} />
            </div>
            {/* Results Table */}
            <div className="bg-power-800 rounded-lg p-6 shadow-lg mb-8">
              <h2 className="text-2xl font-HVFlorentino text-golden-600 mb-4">
                Recent Results
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-power-700">
                      <th className="py-2 px-4 text-left text-golden-500">
                        Date
                      </th>
                      <th className="py-2 px-4 text-left text-golden-500">
                        Name
                      </th>
                      <th className="py-2 px-4 text-left text-golden-500">
                        Email
                      </th>
                      <th className="py-2 px-4 text-left text-golden-500">
                        Category
                      </th>
                      <th className="py-2 px-4 text-left text-golden-500">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={index}
                        className="border-b border-power-700 hover:bg-power-700/50 cursor-pointer"
                        onClick={() => setSelectedProfile(result)}
                      >
                        <td className="py-2 px-4 text-cloud-100">
                          {result.created_at
                            ? result.created_at.substring(0, 10)
                            : "N/A"}
                        </td>
                        <td className="py-2 px-4 text-cloud-100">
                          {result.name}
                        </td>
                        <td className="py-2 px-4 text-cloud-100">
                          {result.email}
                        </td>
                        <td className="py-2 px-4 text-cloud-100">
                          {result.category}
                        </td>
                        <td className="py-2 px-4 text-cloud-100">
                          {result.scores[result.category]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Detailed Responses for selected profile */}
            {selectedProfile && (
              <div className="bg-power-800 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-HVFlorentino text-golden-600">
                    Detailed Responses for {selectedProfile.name} (
                    {selectedProfile.email})
                  </h2>
                  <button
                    className="bg-power-500 px-4 py-2 rounded hover:bg-power-600 transition-colors"
                    onClick={() => setSelectedProfile(null)}
                  >
                    Close
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-power-700">
                        <th className="py-2 px-4 text-left text-golden-500">
                          Category
                        </th>
                        <th className="py-2 px-4 text-left text-golden-500">
                          Question
                        </th>
                        <th className="py-2 px-4 text-left text-golden-500">
                          Answer
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(selectedProfile.answers)
                        .sort((a, b) =>
                          a[1].category.localeCompare(b[1].category)
                        )
                        .map(([key, answerObj]) => (
                          <tr
                            key={key}
                            className="border-b border-power-700/50 hover:bg-power-700/30"
                          >
                            <td className="py-2 px-4 font-medium">
                              {answerObj.category}
                            </td>
                            <td className="py-2 px-4 text-cloud-100">
                              {answerObj.question}
                            </td>
                            <td
                              className={`py-2 px-4 ${
                                answerObj.answer === 2
                                  ? "text-cloud-100"
                                  : answerObj.answer === 1
                                  ? "text-clay-300"
                                  : "text-clay-500"
                              }`}
                            >
                              {answerObj.answer === 0
                                ? "NO"
                                : answerObj.answer === 1
                                ? "Does not Apply"
                                : "YES"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Stats Card Component
function StatCard({ title, value, className = "" }) {
  return (
    <div className={`rounded-lg p-6 shadow-lg ${className}`}>
      <h3 className="text-golden-500 text-lg font-HVFlorentino mb-2">
        {title}
      </h3>
      <p className="text-3xl text-cloud-100 font-bold">{value}</p>
    </div>
  );
}

// Category Chart Component
function CategoryChart({ data }) {
  const chartData = [
    { name: "HOT", value: data["HOT"] || 0 },
    { name: "COLD", value: data["COLD"] || 0 },
    { name: "DAMP", value: data["DAMP"] || 0 },
    { name: "STUCK", value: data["STUCK"] || 0 },
  ];

  return (
    <div className="bg-power-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-HVFlorentino text-golden-600 mb-4">
        Category Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#44304D" />
          <XAxis dataKey="name" tick={{ fill: "#E8E4E2" }} stroke="#E8E4E2" />
          <YAxis tick={{ fill: "#E8E4E2" }} stroke="#E8E4E2" />
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: "#44304D",
              border: "none",
              borderRadius: "4px",
              color: "#E8E4E2",
            }}
          />
          <Bar
            dataKey="value"
            fill="#F0B651"
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Timeline Chart Component
function TimelineChart({ data }) {
  const timelineData = data
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((result) => ({
      date: result.created_at.substring(0, 10),
      score: result.scores[result.category],
      category: result.category,
      name: result.name,
    }));

  return (
    <div className="bg-power-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-2xl font-HVFlorentino text-golden-600 mb-4">
        Results Timeline
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={timelineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#44304D" />
          <XAxis dataKey="date" tick={{ fill: "#E8E4E2" }} stroke="#E8E4E2" />
          <YAxis tick={{ fill: "#E8E4E2" }} stroke="#E8E4E2" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#44304D",
              border: "none",
              borderRadius: "4px",
              color: "#E8E4E2",
            }}
            formatter={(value, name, props) => [
              `Score: ${value}`,
              `${props.payload.name} - ${props.payload.category}`,
            ]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#F0B651"
            strokeWidth={2}
            dot={{ fill: "#F0B651" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
