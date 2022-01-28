const generateTableRow = (idx, bundle, timestamp, elapsed, status, total_events) => {
    const row = {
      eventNo: `${idx}/${total_events}`,
      resource: {
        type: bundle.entry[0].resource.resourceType,
        id: bundle.entry[0].resource.id,
      },
      refCount: bundle.entry.length - 1,
      references: [],
      timestamp: timestamp,
      elapsed: elapsed,
      status: status,
    };
  
    for (let i = 1, len = bundle.entry.length; i < len; i++) {
      row.references.push({
        type: bundle.entry[i].resource.resourceType,
        id: bundle.entry[i].resource.id,
      });
    }
    return row;
  };

export default generateTableRow;
