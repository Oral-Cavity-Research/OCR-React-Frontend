import React, { useEffect, useState } from "react";
import {
  Add,
  ArrowBack,
  ArrowLeft,
  AssignmentInd,
  Delete,
  Download,
  Edit,
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
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { stringAvatar } from "../utils";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Canvas from "../Annotation/Canvas";
import axios from "axios";
import dayjs from "dayjs";
import NotificationBar from "../NotificationBar";
import AssigneeDropdown from "../AssigneeDropDown";
import { LoadingButton } from "@mui/lab";

const EntryDetails = () => {

return(
    <div>Empty</div>
)
}
export default EntryDetails;
