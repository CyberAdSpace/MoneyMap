"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { matchBestCards, formatCurrency, daysUntilExpiry } from "@/lib/calculations";
import {
  SPENDING_CATEGORIES,
  SPENDING_CATEGORY_LABELS,
  type SpendingCategory,
  type CardBenefit,
  type BenefitFrequency,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Award,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Gift,
} from "lucide-react";

type Tab = "guide" | "benefits";

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>("guide");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rewards</h1>

      <div className="flex gap-1 rounded-lg bg-secondary p-1">
        <button
          onClick={() => setTab("guide")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === "guide"
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Best Card Guide
        </button>
        <button
          onClick={() => setTab("benefits")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === "benefits"
              ? "bg-card text-card-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Benefits Tracker
        </button>
      </div>

      {tab === "guide" ? <RewardsGuide /> : <BenefitsTracker />}
    </div>
  );
}

/* ===================== REWARDS GUIDE ===================== */
function RewardsGuide() {
  const { accounts, cardProducts } = useStore();

  const creditCards = accounts.filter((a) => a.account_type === "credit_card");

  const userCards = creditCards.map((card) => ({
    account_id: card.id,
    nickname: card.nickname,
    current_balance: card.current_balance,
    card_product: cardProducts.find((p) => p.id === card.card_product_id) ?? null,
    annual_fee: card.annual_fee ?? 0,
  }));

  const userCardsKey = JSON.stringify(userCards);
  const recommendations = useMemo(
    () => matchBestCards(userCards, SPENDING_CATEGORIES),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userCardsKey]
  );

  const cardsWithBalance = creditCards.filter((c) => c.current_balance > 0);

  if (creditCards.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No credit cards added</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add credit cards in the Accounts tab and link them to card products to see reward recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasLinkedProducts = userCards.some((c) => c.card_product !== null);

  return (
    <div className="space-y-6">
      {/* Card product linking prompt */}
      {!hasLinkedProducts && (
        <Card className="border-amber/30 bg-amber-bg/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Link your cards to products</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Go to Accounts → edit each credit card → select a Card Product to enable reward
                  recommendations. This tells MoneyMap the reward rates for each card.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Cards</CardTitle>
          <CardDescription>
            {creditCards.length} card{creditCards.length !== 1 ? "s" : ""} in your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {creditCards.map((card) => {
            const product = cardProducts.find((p) => p.id === card.card_product_id);
            return (
              <div key={card.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{card.nickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {product ? `${product.issuer} ${product.product_name}` : "No product linked"}
                    {card.last_four ? ` •••• ${card.last_four}` : ""}
                  </p>
                </div>
                {card.current_balance > 0 ? (
                  <Badge variant="red">Balance: {formatCurrency(card.current_balance)}</Badge>
                ) : (
                  <Badge variant="green">Paid Off</Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Best Card Per Category */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Best Card for Each Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.category}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium text-sm">
                    {SPENDING_CATEGORY_LABELS[rec.category as SpendingCategory] ?? rec.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rec.card_issuer} {rec.card_product}
                  </p>
                </div>
                <Badge variant="default">
                  {rec.rate}
                  {rec.unit === "cash_back" ? "%" : "x"} {rec.unit === "cash_back" ? "cash back" : rec.unit}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Do Not Use */}
      {cardsWithBalance.length > 0 && (
        <Card className="border-red/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red">
              <AlertTriangle className="h-5 w-5" />
              Do Not Use for New Purchases
            </CardTitle>
            <CardDescription>
              Cards carrying a balance should not be used until paid off.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {cardsWithBalance
              .sort((a, b) => b.current_balance - a.current_balance)
              .map((card) => (
                <div key={card.id} className="flex items-center justify-between rounded-lg border border-red/20 bg-red-bg/30 p-3">
                  <p className="font-medium text-sm">{card.nickname}</p>
                  <span className="font-semibold font-tabular text-sm text-red">
                    {formatCurrency(card.current_balance)}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ===================== BENEFITS TRACKER ===================== */
function BenefitsTracker() {
  const { cardBenefits, addCardBenefit, updateCardBenefit, deleteCardBenefit, accounts } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CardBenefit | null>(null);

  const creditCards = accounts.filter((a) => a.account_type === "credit_card");

  // Value at risk
  const valueAtRisk = cardBenefits
    .filter((b) => {
      if (b.claimed) return false;
      const days = daysUntilExpiry(b.expires_on);
      return days !== null && days <= 30 && days >= 0;
    })
    .reduce((s, b) => s + b.remaining_value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {valueAtRisk > 0 && (
          <Badge variant="amber" className="text-sm px-3 py-1">
            {formatCurrency(valueAtRisk)} at risk of expiring
          </Badge>
        )}
        <div className="ml-auto">
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Benefit
          </Button>
        </div>
      </div>

      {cardBenefits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No benefits tracked yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Track recurring credits and expiring benefits from your credit cards.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {cardBenefits.map((benefit) => {
            const days = daysUntilExpiry(benefit.expires_on);
            const isExpiring = days !== null && days <= 14 && days >= 0;
            const isExpired = days !== null && days < 0;
            const card = accounts.find((a) => a.id === benefit.account_id);

            return (
              <Card
                key={benefit.id}
                className={
                  benefit.claimed
                    ? "opacity-60"
                    : isExpiring
                      ? "border-amber/30"
                      : isExpired
                        ? "border-red/30 opacity-60"
                        : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateCardBenefit(benefit.id, { claimed: !benefit.claimed })
                      }
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        benefit.claimed
                          ? "border-green bg-green text-white"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {benefit.claimed && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${benefit.claimed ? "line-through" : ""}`}>
                          {benefit.name}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {benefit.frequency.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {card?.nickname ?? "Unknown card"}
                        {benefit.expires_on && (
                          <>
                            {" · "}
                            {isExpired
                              ? "Expired"
                              : isExpiring
                                ? `${days} day${days !== 1 ? "s" : ""} left`
                                : `Expires ${new Date(benefit.expires_on).toLocaleDateString()}`}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold font-tabular text-sm">
                        {formatCurrency(benefit.remaining_value)}
                      </p>
                      {benefit.remaining_value < benefit.total_value && (
                        <p className="text-xs text-muted-foreground font-tabular">
                          of {formatCurrency(benefit.total_value)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditing(benefit);
                          setDialogOpen(true);
                        }}
                        className="p-1.5 rounded text-muted-foreground hover:bg-accent"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCardBenefit(benefit.id)}
                        className="p-1.5 rounded text-muted-foreground hover:bg-red-bg hover:text-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <BenefitDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        benefit={editing}
        creditCards={creditCards}
        onSave={(data) => {
          if (editing) {
            updateCardBenefit(editing.id, data);
          } else {
            addCardBenefit(data);
          }
          setDialogOpen(false);
        }}
      />
    </div>
  );
}

function BenefitDialog({
  open,
  onClose,
  benefit,
  creditCards,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  benefit: CardBenefit | null;
  creditCards: { id: string; nickname: string }[];
  onSave: (data: Omit<CardBenefit, "id" | "user_id">) => void;
}) {
  const [name, setName] = useState(benefit?.name ?? "");
  const [accountId, setAccountId] = useState(benefit?.account_id ?? creditCards[0]?.id ?? "");
  const [totalValue, setTotalValue] = useState(benefit?.total_value?.toString() ?? "");
  const [remainingValue, setRemainingValue] = useState(benefit?.remaining_value?.toString() ?? "");
  const [frequency, setFrequency] = useState<BenefitFrequency>(benefit?.frequency ?? "monthly");
  const [expiresOn, setExpiresOn] = useState(benefit?.expires_on ?? "");
  const [instructions, setInstructions] = useState(benefit?.instructions ?? "");

  const [prevId, setPrevId] = useState<string | null>(null);
  if ((benefit?.id ?? null) !== prevId && open) {
    setPrevId(benefit?.id ?? null);
    setName(benefit?.name ?? "");
    setAccountId(benefit?.account_id ?? creditCards[0]?.id ?? "");
    setTotalValue(benefit?.total_value?.toString() ?? "");
    setRemainingValue(benefit?.remaining_value?.toString() ?? "");
    setFrequency(benefit?.frequency ?? "monthly");
    setExpiresOn(benefit?.expires_on ?? "");
    setInstructions(benefit?.instructions ?? "");
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>{benefit ? "Edit Benefit" : "Add Benefit"}</DialogTitle>
      </DialogHeader>
      <DialogContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Benefit Name</label>
          <Input placeholder="e.g. $15/mo Uber Cash" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Card</label>
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {creditCards.map((card) => (
              <option key={card.id} value={card.id}>{card.nickname}</option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Total Value</label>
            <Input type="number" placeholder="0.00" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Remaining Value</label>
            <Input type="number" placeholder="0.00" value={remainingValue} onChange={(e) => setRemainingValue(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Frequency</label>
            <Select value={frequency} onChange={(e) => setFrequency(e.target.value as BenefitFrequency)}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="one_time">One-Time</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Expires On</label>
            <Input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">How to Redeem (optional)</label>
          <Input placeholder="Instructions..." value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          onClick={() =>
            onSave({
              name,
              account_id: accountId,
              total_value: parseFloat(totalValue) || 0,
              remaining_value: parseFloat(remainingValue) || parseFloat(totalValue) || 0,
              frequency,
              expires_on: expiresOn || null,
              claimed: benefit?.claimed ?? false,
              instructions: instructions || null,
            })
          }
          disabled={!name.trim() || !accountId}
        >
          {benefit ? "Save" : "Add"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
