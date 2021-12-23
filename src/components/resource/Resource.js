import React, { useState, useEffect } from "react";
import resourceList from "../assets/resources-synthea.json";
import ResourceTable from "./ResourceTable";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

function Resource() {
  const [resourceUrl, setResourceUrl] = useState({ resourceType: "DiagnosticReport", params: "", submitParams: 0 });
  const [table, setTable] = useState({
    title: "",
    url: "",
    headers: [],
    body: [],
    errorMsg: "",
  });


  const handleSubmit = event => {
    event.preventDefault()
    let tempParams = resourceUrl.params
    if (!tempParams.startsWith("?")) {
      tempParams = "?" + tempParams
    }
    setResourceUrl({...resourceUrl, params: tempParams, submitParams: resourceUrl.submitParams+1})
  }
  
  useEffect(() => {
    console.log('fetched')
    fetch(`/resources/${resourceUrl.resourceType}${resourceUrl.params}`)
      .then((res) => res.json())
      .then((data) => setTable(data))
      .catch((error) => setTable({ ...table, errorMsg: error.toString() }));
  }, [resourceUrl.resourceType, resourceUrl.submitParams]);

  return (
    <React.Fragment>
      <p className="h1 title">Resources</p>
      <Row>
        <Col>
          <div className="form-group">
            <label>Resource Type</label>
            <select
              className="form-select"
              value={resourceUrl.resourceType}
              onChange={(e) => setResourceUrl({ ...resourceUrl, resourceType: e.target.value })}
            >
              {resourceList.resources.map((resource, index) => (
                <option key={index} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
          </div>
        </Col>

        <Col>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Additional Parameters</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control input-param"
                value={resourceUrl.params}
                onChange={(e) => setResourceUrl({ ...resourceUrl, params: e.target.value })}
              />
              <span><button type="submit" className="btn btn-success btn-sm btn-param">
                Add parameters
              </button></span>
              </div>
            </div>
          </form>
        </Col>
      </Row>
      <ResourceTable url={table.url} headers={table.headers} body={table.body} errorMsg={table.errorMsg}></ResourceTable>
    </React.Fragment>
  );
}

export default Resource;
