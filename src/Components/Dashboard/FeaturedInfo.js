import "./featuredInfo.css";
import "@fortawesome/fontawesome-free/css/all.css";
import Button from "react";

export default function Card({ icon, value, title }) {
  return (
    <div className="cardContainer">
      <div className="leftContainer_1">
        <div className="leftContainer_2">
          <i className={icon}></i>
        </div>
      </div>

      <div className="rightContainer">
        <div className="total">total</div>
        <div className="value">{value}</div>
        <div
          className="label"
          style={{ display: "inline-block", maxWidth: `${title.length}ch` }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}
