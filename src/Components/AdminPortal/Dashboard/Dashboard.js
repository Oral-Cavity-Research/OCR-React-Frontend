import { Paper, Typography, Grid } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import PieChart from "../../Dashboard/PieChart.js";
import Card from "../../Dashboard/FeaturedInfo.js";

const Dashboard = () => {
  const [data, setData] = useState([{ name: "no data", value: 0 }]);
  const [doctors, setDoctors] = useState(0);
  const [patients, setPatients] = useState(0);
  const [images, setImages] = useState(0);
  const userData = useSelector((state) => state.data);

  const getPercentages = (e) => {
    axios
      .get(`${process.env.REACT_APP_BE_URL}/dashboard/percentages/`, {
        headers: {
          Authorization: `Bearer ${userData.accessToken.token}`,
          email: userData.email,
        },
      })
      .then((response) => {
        // Format the data for recharts
        const formattedData = response.data.map((item) => {
          const [name, value] = item.split(": ");
          return { name, value: parseFloat(value.replace("%", "")) };
        });

        setData(formattedData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getTotals = (e) => {
    axios
      .get(`${process.env.REACT_APP_BE_URL}/dashboard/totals/`, {
        headers: {
          Authorization: `Bearer ${userData.accessToken.token}`,
          email: userData.email,
        },
      })
      .then((response) => {
        setDoctors(response.data.doctors);
        setPatients(response.data.patients);
        setImages(response.data.images);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    getPercentages();
    getTotals();
  }, []);
  return (
    <div className="inner_content">
      <div>
        <Box className="sticky">
          <Typography sx={{ fontWeight: 700 }} variant="h5">
            Dashboard
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="flex-end">
          <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
            <Paper
              style={{
                height: "90%",
                // display: "flex",
                // alignItems: "center",
                // justifyContent: "center",
              }}
              sx={{ p: 2, my: 2 }}
            >
              {" "}
              <PieChart title="Risk Habit" data={data} />
            </Paper>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            container
            direction="column"
            order={{ xs: 1, md: 2 }}
          >
            <Grid item>
              <Paper sx={{ my: 2 }}>
                {" "}
                <Card
                  icon="fa-solid fa-user-doctor"
                  title="Recruiters"
                  value={doctors}
                />
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ my: 2 }}>
                {" "}
                <Card
                  icon="fa-regular fa-user"
                  title="Patients"
                  value={patients}
                />
              </Paper>
            </Grid>
            <Grid item>
              <Paper sx={{ my: 2 }}>
                {" "}
                <Card icon="fa-solid fa-image" title="Images" value={images} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Dashboard;
