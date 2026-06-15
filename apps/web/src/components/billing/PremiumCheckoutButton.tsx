import { CheckoutButton, usePlans } from "@clerk/react/experimental";
import type { ReactNode } from "react";

interface PremiumCheckoutButtonProps {
  className?: string;
  children: ReactNode;
  disabledClassName?: string;
}

function findPremiumPlan(plans: ReturnType<typeof usePlans>["data"]) {
  return plans.find(
    (plan) =>
      plan.slug === "premium" ||
      (plan.hasBaseFee && plan.fee && Number(plan.fee.amount) > 0)
  );
}

export function PremiumCheckoutButton({
  className,
  children,
  disabledClassName,
}: PremiumCheckoutButtonProps) {
  const { data: plans, isLoading } = usePlans();
  const premiumPlan = findPremiumPlan(plans);

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className={disabledClassName ?? className}
      >
        Đang tải...
      </button>
    );
  }

  if (!premiumPlan) {
    return (
      <button
        type="button"
        disabled
        className={disabledClassName ?? className}
      >
        Premium chưa khả dụng
      </button>
    );
  }

  return (
    <CheckoutButton
      planId={premiumPlan.id}
      planPeriod="month"
      for="user"
      newSubscriptionRedirectUrl="/dashboard"
    >
      <button type="button" className={className}>
        {children}
      </button>
    </CheckoutButton>
  );
}
