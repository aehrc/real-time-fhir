import React, { useState, useEffect } from "react";
import resourceList from "../assets/resources-synthea.json";
import ResourceTable from "./ResourceTable";

function Resource() {
  const [resourceType, setResourceType] = useState("DiagnosticReport");
  const [table, setTable] = useState({
    headers: [],
    body: [],
    errorMsg: "",
  });

  useEffect(() => {
    fetch(`/resources/${resourceType}`)
      .then((res) => res.json())
      .then((data) => setTable(data))
      .catch((error) => setTable({ ...table, errorMsg: error.toString() }));
  }, [resourceType]);

  return (
    <React.Fragment>
      <p className="h1 title">Resources</p>
      <div className="form-group">
        <label>Resource Type</label>
        <select className="form-select" value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
          {resourceList.resources.map((resource, index) => (
            <option key={index} value={resource}>
              {resource}
            </option>
          ))}
        </select>
      </div>
      <ResourceTable headers={table.headers} body={table.body} errorMsg={table.errorMsg}></ResourceTable>
    </React.Fragment>
  );
}

export default Resource;
