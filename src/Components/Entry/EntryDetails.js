import React, { useEffect, useState } from "react";
import {
  Add,
  ArrowBack,
  ArrowLeft,
  AssignmentInd,
  Download,
  MoreVert,
  PictureAsPdf,
} from "@mui/icons-material";
import {
  Avatar,
  AvatarGroup,
  Paper,
  Tooltip,
  Typography,
  Stack,
  Box,
  Divider,
  Grid,
  Slide,
  Dialog,
  IconButton,
  Button,
  Table,
  TableRow,
  TableBody,
  Skeleton,
  ListItem,
  ListItemText,
  List,
  ListItemAvatar,
  Menu,
  MenuItem,
  ListItemIcon,
  TableContainer,
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { stringAvatar } from "../utils";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import NotificationBar from "../NotificationBar";
import AssigneeDropdown from "../AssigneeDropDown";
import { LoadingButton } from "@mui/lab";

import PDFFile from "../DownloadEntry/PDFFile";
import { PDFDownloadLink } from "@react-pdf/renderer";

function timeDuration(start, end) {
  try {
    const duration = (new Date(end) - new Date(start)) / (1000 * 60);
    return Math.round(duration) + " minutes";
  } catch (error) {
    return "";
  }
}

function realReportName(filename) {
  try {
    return filename.split("_").slice(3).join("_");
  } catch (error) {
    return "Test Report";
  }
}

const EntryDetails = () => {
  const [status, setStatus] = useState({
    msg: "",
    severity: "success",
    open: false,
  });
  const [anchorEl, setAnchorEl] = React.useState(null);
  const selectorData = useSelector((state) => state.data);
  const [userData, setUserData] = useState(selectorData);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removeReviewer, setRemoveReviewer] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [assignee, setAssignee] = useState(null);
  const [data, setData] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setAssignee(null);
  };

  const getReviews = () => {
    setLoadingReviews(true);
    axios
      .get(`${process.env.REACT_APP_BE_URL}/user/entry/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${userData.accessToken.token}`,
          email: userData.email,
        },
        withCredentials: true,
      })
      .then((res) => {
        setReviews(res.data);
        setLoadingReviews(false);
      })
      .catch((err) => {
        if (err.response) showMsg(err.response.data?.message, "error");
        else alert(err.message);
      });
  };

  const removeAssignee = (item) => {
    setRemoveReviewer(item);

    axios
      .post(
        `${process.env.REACT_APP_BE_URL}/user/entry/reviewer/remove/${id}`,
        { reviewer_id: item._id },
        {
          headers: {
            Authorization: `Bearer ${userData.accessToken.token}`,
            email: userData.email,
          },
          withCredentials: true,
        }
      )
      .then((res) => {
        loadData();
      })
      .catch((err) => {
        if (err.response) showMsg(err.response.data?.message, "error");
        else alert(err.message);
      })
      .finally(() => {
        setRemoveReviewer({});
      });
  };

  const addAssignee = () => {
    if (!assignee) {
      return;
    }

    const containsReviewer = data.reviewers?.some(
      (obj) => obj._id === assignee._id
    );
    if (containsReviewer) {
      showMsg("Reviewer assigned successfuly!", "success");
      return;
    }

    setSaving(true);

    axios
      .post(
        `${process.env.REACT_APP_BE_URL}/user/entry/reviewer/add/${id}`,
        { reviewer_id: assignee._id },
        {
          headers: {
            Authorization: `Bearer ${userData.accessToken.token}`,
            email: userData.email,
          },
          withCredentials: true,
        }
      )
      .then((res) => {
        showMsg("Reviewer assigned successfuly!", "success");
        loadData();
        setAssignee(null);
        handleDialogClose();
      })
      .catch((err) => {
        if (err.response) showMsg(err.response.data?.message, "error");
        else alert(err.message);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const loadData = () => {
    axios.get(`${process.env.REACT_APP_BE_URL}/user/entry/get/saved/${id}`, {
        headers: {
          Authorization: `Bearer ${userData.accessToken.token}`,
          email: userData.email,
        },
        withCredentials: true,
      })
      .then((res) => {
        setData(res.data);
        setLoading(false);
        markAsRead(res.data);
      })
      .catch((err) => {
        if (err.response) showMsg(err.response.data?.message, "error");
        else alert(err.message);
      });
  };

  const markAsRead = (data) => {
    if (!data.updated) return;

    axios
      .post(
        `${process.env.REACT_APP_BE_URL}/user/entry/open/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userData.accessToken.token}`,
            email: userData.email,
          },
          withCredentials: true,
        }
      )
      .then((res) => {})
      .catch((err) => {});
  };

  useEffect(() => {
    setLoading(true);
    loadData();
    getReviews();
  }, []);

  const showMsg = (msg, severity) => {
    setStatus({ msg, severity, open: true });
  };

  return (
    <div className="inner_content">
      <div>
        <div className="sticky">
          <Typography sx={{ fontWeight: 700 }} variant="h5">
            Tele Consultation Entry
          </Typography>
          <Button
            onClick={() => navigate(-1)}
            size="small"
            startIcon={<ArrowBack />}
            sx={{ p: 0 }}
          >
            Go Back
          </Button>
        </div>
        {loading && !data ? (
          <Paper sx={{ p: 2, my: 3 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ my: 3 }}
            >
              <Skeleton variant="rounded" width={60} height={60} />
              <Stack direction="column">
                <Skeleton
                  variant="text"
                  width={210}
                  sx={{ fontSize: "2rem" }}
                />
                <Skeleton variant="text" width={210} />
              </Stack>
            </Stack>
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={40} width={600} />
              <Skeleton variant="rounded" height={40} width={600} />
            </Stack>
          </Paper>
        ) : (
          <>
            <Paper sx={{ p: 3, my: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <AssignmentInd
                  sx={{ color: "orange", width: "60px", height: "60px" }}
                />
                <Stack direction="column">
                  <Tooltip
                    title="Go to patients profile"
                    arrow
                    placement="right"
                  >
                    <Typography
                      component={Link}
                      to={`/manage/my/patients/${data.patient?._id}`}
                      variant="h5"
                      color="Highlight"
                      sx={{ cursor: "pointer" }}
                    >
                      {data.patient?.patient_name}
                    </Typography>
                  </Tooltip>
                  <Typography color="GrayText">
                    {data.patient?.patient_id}
                  </Typography>
                </Stack>
                <Box flex={1}></Box>
                <IconButton
                  id="fade-button"
                  aria-controls={Boolean(anchorEl) ? "fade-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                  onClick={handleOpen}
                >
                  <MoreVert />
                </IconButton>
              </Stack>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                onClick={handleCloseMenu}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem>
                  <ListItemIcon>
                    <Download />
                  </ListItemIcon>
                  {/* <ListItemText>Download</ListItemText> */}
                  <PDFDownloadLink
                    document={
                      <PDFFile
                        data={data}
                        reviews={reviews}
                        duration={timeDuration(data.start_time, data.end_time)}

                      />
                    }
                    fileName={`${data.patient?.patient_name}.pdf`}
                  >
                    {({ loading }) =>
                      loading ? (
                        <ListItemText>Loading...</ListItemText> 
                      ) : (
                        <ListItemText>Download</ListItemText>
                      )
                    }
                  </PDFDownloadLink>
                </MenuItem>
              </Menu>

              <Divider sx={{ my: 1 }} />
              <Stack direction="column" spacing={1}>
                <Typography variant="body2">
                  Start Time:{" "}
                  {dayjs(data.start_time).format("DD/MM/YYYY HH:mm A")}
                </Typography>
                <Typography variant="body2">
                  Duration: {timeDuration(data.start_time, data.end_time)}
                </Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">Reviewers:</Typography>
              <AvatarGroup sx={{ width: "fit-content" }}>
                {data.reviewers?.map((reviewer, index) => {
                  return (
                    <Tooltip
                      title={reviewer.username}
                      placement="bottom-start"
                      arrow
                      key={index}
                    >
                      <Avatar {...stringAvatar(reviewer.username)} />
                    </Tooltip>
                  );
                })}

                <Avatar sx={{ bgcolor: "transparent" }}>
                  <IconButton onClick={() => setDialogOpen(true)}>
                    <Add />
                  </IconButton>
                </Avatar>
              </AvatarGroup>
            </Paper>
            <Paper sx={{ p: 2, my: 3 }}>
            <Typography p={1} mb={2} bgcolor={'#ececec'}>Findings</Typography>
              <Table sx={{ border: "1px solid lightgray" }}>
                <TableBody>
                  <TableRow>
                    <TableCell>Complaint:</TableCell>
                    <TableCell>{data.complaint}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Findings:</TableCell>
                    <TableCell>{data.findings}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Current Habits:</TableCell>
                    <TableCell>
                      <List>
                        {data.current_habits?.map((item, index) => {
                          return (
                            <ListItem key={index} disablePadding>
                              <ListItemText
                                primary={
                                  <Typography variant="body2">
                                    {item.habit}
                                  </Typography>
                                }
                                secondary={item.frequency}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
            <Paper sx={{ p: 2, my: 3 }}>
              <Typography p={1} mb={2} bgcolor={'#ececec'}>Oral Cavity Images</Typography>
              {data.images?.length === 0  && 
              <Typography sx={{ mb: 2 }} color="GrayText" variant="body2"> No Images were Added </Typography>
              }
              <Grid container spacing={2}>
                {data.images?.map((item, index) => (
                  <Grid item key={index} xs={4} md={3} lg={2}>
                    <div className="imageDiv">
                      <div className="grid_image">
                        <img
                          src={`${process.env.REACT_APP_IMAGE_PATH}/${item.image_name}`}
                          alt="Failed to Load"
                        />
                      </div>

                      <Stack
                        direction="column"
                        justifyContent="space-between"
                        alignItems="start"
                        px={1}
                      >
                      </Stack>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
            <Paper sx={{ p: 2, my: 3 }}>
            <Typography p={1} mb={2} bgcolor={'#ececec'}>Test Reports</Typography>
              {data.reports?.length === 0 &&
                <Typography color="GrayText" variant="body2">No Test Reports were Added</Typography>
              }

              {data.reports?.map((item, index) => {
                return (
                  <Stack
                    direction="row"
                    sx={{ my: 2 }}
                    alignItems="center"
                    spacing={2}
                    key={index}
                  >
                    <PictureAsPdf color="error" />
                    <Typography
                      sx={{ "&:hover": { color: "var(--primary-color)" } }}
                      variant="body2"
                    >
                      <a
                        href={`${process.env.REACT_APP_REPORT_PATH}/` + item.report_name}
                        target="_blank"
                      >
                        {realReportName(item.report_name)}
                      </a>
                    </Typography>
                  </Stack>
                );
              })}
            </Paper>
            <Paper sx={{ p: 2, my: 3 }}>
            <Typography p={1} mb={2} bgcolor={'#ececec'}>Reviews</Typography>
              {loadingReviews ? (
                <Typography variant="body2">Loading Reviews...</Typography>
              ) : reviews.length === 0 &&
              <Typography color="GrayText" variant="body2">No Reviews Yet</Typography>
              }
              <Stack direction="column" spacing={1}>
                {reviews.map((item, index) => {
                  return (
                    <Stack
                      direction="row"
                      key={index}
                      sx={{ background: "white", p: 1 }}
                    >
                      <Avatar {...stringAvatar(item.reviewer_id?.username)} />
                      <ArrowLeft />
                      <Box>
                        <Typography variant="body2">
                          <strong>{item.reviewer_id?.username}</strong> |{" "}
                          {item.reviewer_id?.reg_no}
                        </Typography>
                        <TableContainer>
                          <Table
                            sx={{
                              [`& .${tableCellClasses.root}`]: {
                                borderBottom: "none",
                              },
                            }}
                          >
                            <TableBody>
                              {item.provisional_diagnosis !== "" && (
                                <TableRow>
                                  <TableCell sx={{ py: 0 }}>
                                    Provisional Diagnosis
                                  </TableCell>
                                  <TableCell sx={{ py: 0 }}>
                                    {item.provisional_diagnosis}
                                  </TableCell>
                                </TableRow>
                              )}
                              {item.management_suggestions !== "" && (
                                <TableRow>
                                  <TableCell sx={{ py: 0 }}>
                                    Management Suggestions
                                  </TableCell>
                                  <TableCell sx={{ py: 0 }}>
                                    {item.management_suggestions}
                                  </TableCell>
                                </TableRow>
                              )}
                              {item.referral_suggestions !== "" && (
                                <TableRow>
                                  <TableCell sx={{ py: 0 }}>
                                    Referral Suggestions
                                  </TableCell>
                                  <TableCell sx={{ py: 0 }}>
                                    {item.referral_suggestions}
                                  </TableCell>
                                </TableRow>
                              )}
                              {item.other_comments !== "" && (
                                <TableRow>
                                  <TableCell sx={{ py: 0 }}>Comments</TableCell>
                                  <TableCell sx={{ py: 0 }}>
                                    {item.other_comments}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>
          </>
        )}
        <Dialog
            open={dialogOpen}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
        >

          <DialogTitle>Assign Reviewers</DialogTitle>
          <DialogContent>
              <Box my={2}>
                <AssigneeDropdown setAssignee={setAssignee} />
              </Box>
              {assignee && (
                  <Box sx={{border: "1px solid lightgray",borderRadius: 1,p: 2,my: 2}}>
                    <ListItem
                        disablePadding
                        secondaryAction={
                          <LoadingButton loading={saving} variant="contained" onClick={addAssignee}>
                              Add
                          </LoadingButton>
                          }
                      >
                        <ListItemAvatar>
                          <Avatar {...stringAvatar(assignee.username)} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={assignee.username}
                          secondary={assignee.reg_no}
                        />
                      </ListItem>
                  </Box>
              )}

              {data.reviewers?.length > 0 && (
                <List sx={{border: "1px solid lightgray",borderRadius: 1,pl: 2,}}>
                  {data.reviewers?.map((item, index) => {
                    return (
                      <ListItem
                        key={index}
                        disablePadding
                        secondaryAction={
                          <LoadingButton
                            color="error"
                            disabled={removeReviewer._id && removeReviewer._id !== item._id}
                            loading={removeReviewer._id === item._id}
                            onClick={() => removeAssignee(item)}
                          >
                            Remove
                          </LoadingButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar {...stringAvatar(item.username)} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.username}
                          secondary={item.reg_no}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
          </DialogContent>
            <DialogActions>
              <Button variant="outlined" color="inherit" onClick={handleDialogClose}>Close</Button>
            </DialogActions>
        </Dialog>
        <NotificationBar status={status} setStatus={setStatus} />
      </div>
    </div>
  );
};

export default EntryDetails;
