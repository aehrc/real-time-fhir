import { styled } from "@mui/material/styles";
import { TableRow, Card } from "@mui/material";

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const RegularCard = styled(Card)(({ theme }) => ({
  borderRadius: 10
}));