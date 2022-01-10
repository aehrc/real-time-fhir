import { styled } from "@mui/material/styles";
import { Typography, TableRow, Card } from "@mui/material";

export const CardHeadingTypography = styled(Typography)(({ theme }) => ({
  fontSize: 18,
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const FullHeightCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: 10,
}));

export const RegularCard = styled(Card)(({ theme }) => ({
  borderRadius: 10,
}));
