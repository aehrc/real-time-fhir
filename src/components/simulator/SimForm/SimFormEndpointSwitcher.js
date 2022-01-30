import React, { useState} from 'react';
import { Typography, Stack, Box } from '@mui/material';
import Switch from '@mui/material/Switch';
import { socket } from "../../../App";

const defaultEndpoint = {
	name: "AEHRC CDR",
	url: "***REMOVED***/fhir_r4/",
};

function SimFormEndpointSwitcher() {

	const [endpoint, setEndpoint] = useState(defaultEndpoint);

	const handleSwitchChange = (event) => {
		let endpoint = (event.target.checked) ? { name: "Pathling", url: "http://localhost:8080/fhir/" } : defaultEndpoint
		
		setEndpoint(endpoint)
    socket.emit("change_endpoint", endpoint.url);
	};

	return (
		<React.Fragment>
			<Stack direction="row" alignItems="center">
				<Switch onChange={handleSwitchChange}/>
				<Box sx={{ width: 85, textAlign: "center" }}>
					<Typography sx={{ fontSize: 15 }} color="text.secondary">{endpoint.name}</Typography>
				</Box>
			</Stack>
		</React.Fragment >
	);
}

export default SimFormEndpointSwitcher;
