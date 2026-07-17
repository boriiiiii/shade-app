import React from "react";
import { Text, View } from "react-native";
import * as Linking from "expo-linking";

import {
  Badge,
  Button,
  Card,
  KeyValueRow,
  delegationStatusTone,
} from "./ui";
import type { Delegation } from "../lib/api/types";
import {
  explorerAddressUrl,
  explorerTxUrl,
  formatRelativeExpiry,
  formatSol,
  truncateAddress,
} from "../lib/format";
import { MINTS } from "../lib/theme";

const MODE_LABEL: Record<string, string> = {
  degen: "Degen",
  full_trust: "Full Trust",
  manual: "Manuel",
};

function formatAmount(mint: string, amount: number): string {
  return mint === MINTS.WSOL ? formatSol(amount) : `${amount} (base units)`;
}

export function DelegationCard({
  delegation,
  onRevoke,
  revoking = false,
}: {
  delegation: Delegation;
  onRevoke?: (id: string) => void;
  revoking?: boolean;
}) {
  const d = delegation;
  const canRevoke = onRevoke && d.status !== "revoked" && d.status !== "expired";
  return (
    <Card className="mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-content text-[15px] font-semibold">
          {MODE_LABEL[d.mode] ?? d.mode}
        </Text>
        <Badge label={d.status} tone={delegationStatusTone(d.status)} dot />
      </View>

      <KeyValueRow label="Budget max" value={formatAmount(d.token_mint, d.amount_max)} />
      <KeyValueRow label="Dépensé" value={formatAmount(d.token_mint, d.amount_spent)} />
      <KeyValueRow label="Expire" value={formatRelativeExpiry(d.expires_at)} />
      <KeyValueRow
        label="Compte token"
        value={truncateAddress(d.token_account, 6, 6)}
        onPressValue={() => Linking.openURL(explorerAddressUrl(d.token_account))}
      />
      {d.approve_tx_sig ? (
        <KeyValueRow
          label="Approve"
          value={truncateAddress(d.approve_tx_sig, 6, 6)}
          onPressValue={() => Linking.openURL(explorerTxUrl(d.approve_tx_sig!))}
        />
      ) : null}
      {d.revoke_tx_sig ? (
        <KeyValueRow
          label="Revoke"
          value={truncateAddress(d.revoke_tx_sig, 6, 6)}
          onPressValue={() => Linking.openURL(explorerTxUrl(d.revoke_tx_sig!))}
        />
      ) : null}

      {canRevoke ? (
        <Button
          title="Révoquer"
          variant="danger"
          size="sm"
          loading={revoking}
          onPress={() => onRevoke?.(d.id)}
          className="mt-3 self-start"
        />
      ) : null}
    </Card>
  );
}
