import React from "react";
import config from "../../config.json";
import dayjs from "dayjs";

import {
  Page,
  Text,
  Image,
  Line,
  Document,
  StyleSheet,
  View,
} from "@react-pdf/renderer";
const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  imageContainer: {
    margin: 5,
    width: "50%",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    // flexGrow: 1,
  },
  label: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "bold",
    color: "#00047A",
    fontFamily: "Times-Roman",
  },
  content: {
    margin: 5,
    fontSize: 14,
    justifyContent: "center",
    fontFamily: "Times-Roman",
  },
  reviews_container: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  reviewer_name: {
    margin: 5,
    fontWeight: "bold",
  },
  name: {
    fontSize: 20,
    fontFamily: "Times-Roman",
  },
});

const PDFFile = ({ data, duration, reviews }) => {
  const rows = [];
  for (let i = 0; i < data.images.length; i += 2) {
    const row = (
      <View key={i} style={styles.row}>
        <View style={styles.imageContainer}>
          <Image
            src={`${config["image_path"]}/${data.images[i].image_name}`}
            alt="Failed to Load"
            style={styles.image}
          />
        </View>
        {data.images[i + 1] && (
          <View style={styles.imageContainer}>
            <Image
              src={`${config["image_path"]}/${data.images[i + 1].image_name}`}
              alt="Failed to Load"
              style={styles.image}
            />
          </View>
        )}
      </View>
    );
    rows.push(row);
  }
  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.header} fixed>
          Teleconsultation Entry ({dayjs(data.start_time).format("DD/MM/YYYY")})
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <View>
            <Text style={styles.name}>
              {data.patient.patient_name} | {data.patient.patient_id}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {duration && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={styles.label}>Duration: </Text>
                <Text style={styles.content}>{duration}</Text>
              </View>
            )}
          </View>
        </View>
        {data.reviewers.length > 0 && (
          <View>
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <Line
                style={{ borderBottomWidth: 1, borderBottomColor: "black" }}
              />
            </View>

            <Text style={styles.label}>Reviewers:</Text>
            <View style={styles.text}>
              {data.reviewers.map((reviewer, index) => (
                <Text style={styles.content} key={index}>
                  {reviewer.username}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={{ marginTop: 10, marginBottom: 10 }}>
          <Line style={{ borderBottomWidth: 1, borderBottomColor: "black" }} />
        </View>

        {data.complaint && (
          <View>
            <Text style={styles.label}>Complaint:</Text>
            <View style={styles.text}>
              <Text style={styles.content}>{data.complaint}</Text>
            </View>
          </View>
        )}

        {data.current_habits.length > 0 && (
          <View>
            <Text style={styles.label}>Current Habits:</Text>
            <View style={styles.text}>
              {data.current_habits.map((habit, index) => (
                <Text style={styles.content} key={index}>
                  {habit.habit} ({habit.frequency})
                </Text>
              ))}
            </View>
          </View>
        )}

        {data.findings && (
          <View>
            <Text style={styles.label}>Findings:</Text>
            <View style={styles.text}>
              <Text style={styles.content}>{data.findings}</Text>
            </View>
          </View>
        )}

        {reviews.length > 0 && (
          <View>
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <Line
                style={{ borderBottomWidth: 1, borderBottomColor: "black" }}
              />
            </View>
            <Text style={styles.label}>Reviews:</Text>

            {reviews.map((review, index) => (
              <View style={styles.text} key={index}>
                <View style={styles.reviewer_name}>
                  <Text>by {review.reviewer_id.username} -</Text>
                </View>
                <View>
                  {review.provisional_diagnosis !== "" && (
                    <View>
                      <Text style={styles.content}>
                        Provisional Diagnosis: {review.provisional_diagnosis}
                      </Text>
                    </View>
                  )}
                  {review.management_suggestions !== "" && (
                    <View>
                      <Text style={styles.content}>
                        Management Suggestions : {review.management_suggestions}
                      </Text>
                    </View>
                  )}
                  {review.referral_suggestions !== "" && (
                    <View>
                      <Text style={styles.content}>
                        Referral Suggestions: {review.referral_suggestions}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {data.images.length > 0 && (
          <View>
            <View style={{ marginTop: 10, marginBottom: 10 }}>
              <Line
                style={{ borderBottomWidth: 1, borderBottomColor: "black" }}
              />
            </View>

            <Text style={styles.label}>Images:</Text>
            {rows}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default PDFFile;
