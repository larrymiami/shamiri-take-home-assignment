import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { SessionAnalysisDTO } from "@/features/sessions/types";

interface SessionRubricCardsProps {
  analysis: SessionAnalysisDTO;
}

interface MetricRowProps {
  title: string;
  score: number;
  max: number;
  label: string;
  justification: string;
  evidenceQuotes: string[];
}

function MetricRow({ title, score, max, label, justification, evidenceQuotes }: MetricRowProps) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 12,
                textTransform: "uppercase",
                color: "text.secondary"
              }}
            >
              {title}
            </Typography>
            <Chip
              size="small"
              icon={<CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
              label={`${score}/${max} ${label}`}
              sx={{
                color: "var(--shamiri-text-green-strong)",
                backgroundColor: "var(--shamiri-light-green)",
                border: "1px solid",
                borderColor: "var(--shamiri-border-green-strong)",
                fontWeight: 700
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: "text.primary", opacity: 0.78 }}>
            {justification}
          </Typography>
          {evidenceQuotes.length > 0 ? (
            <Stack spacing={0.5}>
              {evidenceQuotes.map((quote, index) => (
                <Typography
                  key={`${title}-evidence-${index + 1}`}
                  variant="body2"
                  sx={{ color: "text.primary", opacity: 0.72, fontSize: 13 }}
                >
                  &quot;{quote}&quot;
                </Typography>
              ))}
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export function SessionRubricCards({ analysis }: SessionRubricCardsProps) {
  return (
    <Stack spacing={1.5}>
      <MetricRow
        title="Growth Mindset"
        score={analysis.contentCoverage.score}
        max={3}
        label={analysis.contentCoverage.rating}
        justification={analysis.contentCoverage.justification}
        evidenceQuotes={analysis.contentCoverage.evidenceQuotes}
      />
      <MetricRow
        title="Facilitation Quality"
        score={analysis.facilitationQuality.score}
        max={3}
        label={analysis.facilitationQuality.rating}
        justification={analysis.facilitationQuality.justification}
        evidenceQuotes={analysis.facilitationQuality.evidenceQuotes}
      />
      <MetricRow
        title="Protocol Safety"
        score={analysis.protocolSafety.score}
        max={3}
        label={analysis.protocolSafety.rating}
        justification={analysis.protocolSafety.justification}
        evidenceQuotes={analysis.protocolSafety.evidenceQuotes}
      />
    </Stack>
  );
}
