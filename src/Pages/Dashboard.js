import React, { useState, useEffect } from "react";
import axios from "axios";
import config from '../config.json';
import PieChart from "../Components/Dashboard/PieChart.js";

function Dasboard() {
  const [data, setData] = useState([{ name: "no data", value: 0 }]);



  const generateData = (e) => {
    axios
      .get(`${config['path']}/dashboard/percentages/`)
      .then((response) => {
        // Format the data for recharts
        const formattedData = response.data.map((item) => {
          const [name, value] = item.split(": ");
          return { name, value: parseFloat(value.replace("%", "")) };
        });
        console.log(formattedData);
        setData(formattedData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    generateData();
  }, []);
  return <div>

    <PieChart title="The title of the graph" data={data} />
  </div>;
}

export default Dasboard;
