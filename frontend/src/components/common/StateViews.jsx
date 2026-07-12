import { AlertTriangle, Inbox } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Loader from "./Loader";

export const LoadingState = ({ message }) => {
  return (
    <Card hover={false} className="flex min-h-[220px] items-center justify-center">
      <Loader size="lg" message={message || "Loading..."} />
    </Card>
  );
};

export const EmptyState = ({ title = "No data available", description = "Try adjusting filters." }) => {
  return (
    <Card hover={false} className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
      <Inbox className="h-10 w-10 text-[var(--color-text-tertiary)]" />
      <p className="text-base font-semibold text-[var(--color-text-primary)]">{title}</p>
      <p className="max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>
    </Card>
  );
};

export const ErrorState = ({ message = "Something went wrong", onRetry }) => {
  return (
    <Card hover={false} accent className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-text-accent)]" />
      <div className="flex-1">
        <p className="font-semibold text-[var(--color-text-primary)]">Request failed</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{message}</p>
        {onRetry ? (
          <Button className="mt-3" variant="secondary" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
