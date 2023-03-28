import React from "react";
import "./piechart.css";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { schemeCategory10 } from "d3-scale-chromatic";

// dummy data and colors
// const data = [
//   { name: "Group A", value: 400 },
//   { name: "Group B", value: 300 },
//   { name: "Group C", value: 300 },
//   { name: "Group D", value: 200 },
//   { name: "Group E", value: 100 },
// ];

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "red"];

// generate 10 different colors
const COLORS = schemeCategory10;

// title, data,
export default function Piechart({ title, data }) {
    
  const CustomTooltip = ({ active, payload }) => {
    if (active) {
      return (
        <div className="tooltip">
          <p>
            {payload[0].name} : {Math.round(payload[0].value) + "%"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart">
      <div className="chartTitle">
        <h3>{title}</h3>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            // label={(entry) => entry.name}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Legend
          // align="right"
          // verticalAlign="middle"
          // layout="vertical"
          />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
