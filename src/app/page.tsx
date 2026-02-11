import { Container, Typography } from "@mui/material";
import prisma from "@/lib/prisma";

export default async function Home() {
  const supervisors = await prisma.supervisor.findMany();
  console.log("Supervisors from database:", supervisors);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shamiri Take-Home Assignment
      </Typography>
    </Container>
  );
}
