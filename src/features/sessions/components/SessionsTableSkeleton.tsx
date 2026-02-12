import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

const SKELETON_ROW_COUNT = 10;

export function SessionsTableSkeleton() {
  return (
    <Card sx={{ borderRadius: 3, backgroundColor: "common.white" }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" sx={{ fontSize: 28, fontWeight: 800, mb: 0.5 }}>
                Completed Sessions
              </Typography>
              <Typography color="text.secondary">
                Review completed Fellow sessions to ensure safety and protocol fidelity.
              </Typography>
            </Box>

            <Box component="form" action="/dashboard">
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  disabled
                  name="q"
                  placeholder="Filter by Fellow or Group ID"
                  size="small"
                  sx={{ minWidth: { sm: 260 } }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment key="search-start-adornment" position="start">
                          <SearchOutlinedIcon fontSize="small" color="disabled" />
                        </InputAdornment>
                      )
                    }
                  }}
                />
                <TextField
                  disabled
                  name="status"
                  select
                  size="small"
                  value="ALL"
                  sx={{ minWidth: 160 }}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="ALL">Status: All</MenuItem>
                </TextField>
                <Button type="submit" variant="outlined" disabled>
                  Apply
                </Button>
              </Stack>
            </Box>
          </Stack>

          <Box sx={{ overflowX: "auto" }}>
            <Table size="medium" aria-label="Completed sessions loading table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                  >
                    Fellow
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                  >
                    Group ID
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase" }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Stack spacing={0.35}>
                        <Skeleton variant="text" width={122} sx={{ transform: "none" }} />
                        <Skeleton variant="text" width={76} sx={{ transform: "none" }} />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={152} sx={{ transform: "none" }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="text" width={86} sx={{ transform: "none" }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rounded" width={72} height={24} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="rounded" width={96} height={36} sx={{ ml: "auto" }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Stack spacing={1} alignItems="center">
            <Skeleton variant="rounded" width={284} height={34} />
            <Skeleton variant="text" width={170} sx={{ transform: "none" }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
