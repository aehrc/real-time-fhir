import React from "react";
import resourceList from "../assets/resources-synthea.json";
import "../componentStyles.css";

const SimulationForm = (props) => (
  <div>
    <div className="form-group">
      <label>Resource Type</label>
      <select
        className="form-select"
        value={props.form.resourceType}
        onChange={(e) => props.setForm({ ...props.form, resourceType: e.target.value })}
      >
        {resourceList.resources.map((resource, index) => (
          <option key={index} value={resource}>
            {resource}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Duration</label>
      <input
        type="text"
        className="form-control"
        value={props.form.duration}
        onChange={(e) => props.setForm({ ...props.form, duration: e.target.value })}
      />
      <small className="form-text text-muted">Enter duration in seconds. E.g. 3600 for 1 hour.</small>
    </div>
  </div>
);

export default React.memo(SimulationForm);
