import { AlertTriangle, Inbox } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Loader from "./Loader";

export const LoadingState = ({ message }) => {
  return (
    <Card hover={false} className="flex items-center justify-center min-h-[220px]">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accentRed/10 to-transparent -skew-y-12 animate-pulse rounded-full blur-xl" />
        <Loader size="lg" message={message || "Loading..."} />
      </div>
    </Card>
  );
};

export const EmptyState = ({ title = "No data available", description = "Try adjusting filters." }) => {
  return (
    <Card hover={false} className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="text-4xl">🏁</div>
        <Inbox className="h-8 w-8 text-text-muted" />
      </div>
      <p className="text-base font-semibold text-whitePrimary">{title}</p>
      <p className="max-w-md text-sm text-text-secondary">{description}</p>
    </Card>
  );
};

export const ErrorState = ({ message = "Something went wrong", onRetry }) => {
  return (
    <Card hover={false} className="border-[var(--color-accent-red)]/40 bg-[var(--color-accent-red)]/10">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-accentRed" />
        <div className="flex-1">
          <p className="font-semibold text-whitePrimary">Request failed</p>
          <p className="mt-1 text-sm text-text-secondary">{message}</p>
          {onRetry ? (
            <Button className="mt-3" variant="secondary" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

