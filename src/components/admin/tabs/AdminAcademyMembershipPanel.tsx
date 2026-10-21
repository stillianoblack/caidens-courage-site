import React, { useEffect, useState } from 'react';

type BundleOrder = {
  orderId: string;
  title: string;
  amountCents: number;
  currency: string;
  customerEmail: string;
  status: string;
  invitationSent: boolean;
  invitationClaimed: boolean;
  shipping?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    method?: string;
    shippingCents?: number;
    taxCents?: number;
    fulfillmentStatus?: string;
  } | null;
};

type MembershipAdminReport = {
  migrationApplied?: boolean;
  activePaidFamilies?: number;
  complimentaryFamilies?: number;
  preservedPromises?: number;
  expiringAccess?: number;
  cancellations?: number;
  revenueCents?: number;
  plans?: Array<{ plan_key: string; display_name: string; amount_cents: number; is_active: boolean; stripe_price_id: string | null }>;
  transitionEmail?: { send?: boolean; reason?: string };
};

export default function AdminAcademyMembershipPanel() {
  const [report, setReport] = useState<MembershipAdminReport | null>(null);
  const [orders, setOrders] = useState<BundleOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/.netlify/functions/academy-membership-admin', { credentials: 'include' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Membership report unavailable.');
        return payload as MembershipAdminReport;
      })
      .then((payload) => {
        if (!cancelled) setReport(payload);
      })
      .catch((loadError: Error) => {
        if (!cancelled) setError(loadError.message);
      });
    fetch('/.netlify/functions/academy-bundle-admin', { credentials: 'include' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) return;
        if (!cancelled) setOrders(payload.orders || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const resend = async (orderId: string) => {
    setResendMessage(null);
    const response = await fetch('/.netlify/functions/academy-bundle-admin', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    setResendMessage(response.ok ? 'Invitation resent to the purchase email.' : 'The invitation could not be resent.');
  };

  return (
    <section className="adminPortal-card">
      <h3 className="adminPortal-cardTitle">Focus Flame Family membership</h3>
      <p className="adminPortal-cardSub">
        Server-managed plans stay inactive until a verified Stripe test price is saved. Saving a price does not change customer access or charge a family. The browser pricing editor below does not grant Academy access.
      </p>
      {error ? <p className="adminPortal-warning">{error}</p> : null}
      {report ? (
        <dl className="adminPortal-fieldHint">
          <div>Migration applied: {report.migrationApplied ? 'yes' : 'no'}</div>
          <div>Active paid families: {report.activePaidFamilies ?? 0}</div>
          <div>Independent families on file: {report.complimentaryFamilies ?? 0}</div>
          <div>Preserved unrestricted promises: {report.preservedPromises ?? 0}</div>
          <div>Access ending within 14 days: {report.expiringAccess ?? 0}</div>
          <div>Cancellations: {report.cancellations ?? 0}</div>
          <div>Recorded revenue: ${((report.revenueCents || 0) / 100).toFixed(2)}</div>
          <div>Transition email: {report.transitionEmail?.send ? 'ready' : report.transitionEmail?.reason || 'not sent'}</div>
          {(report.plans || []).map((plan) => (
            <div key={plan.plan_key}>
              {plan.display_name}: ${(plan.amount_cents / 100).toFixed(2)} · {plan.is_active ? 'active' : 'inactive'} · {plan.stripe_price_id ? 'test price saved' : 'no Stripe price'}
            </div>
          ))}
        </dl>
      ) : null}
      <h4 className="adminPortal-cardTitle">Bundle orders</h4>
      {resendMessage ? <p className="adminPortal-fieldHint">{resendMessage}</p> : null}
      {orders.length === 0 ? <p className="adminPortal-fieldHint">No Courage Adventure Bundle orders yet.</p> : null}
      {orders.map((order) => (
        <div key={order.orderId} className="adminPortal-fieldHint">
          <div>{order.title} · {order.status} · ${(order.amountCents / 100).toFixed(2)} {order.currency}</div>
          <div>{order.customerEmail}</div>
          <div>
            {order.shipping
              ? `${order.shipping.line1 || ''}, ${order.shipping.city || ''} ${order.shipping.state || ''} ${order.shipping.postalCode || ''} ${order.shipping.country || ''} · ${order.shipping.method || 'Shipping'} · tax $${((order.shipping.taxCents || 0) / 100).toFixed(2)} · ${order.shipping.fulfillmentStatus || 'unfulfilled'}`
              : 'Shipping not recorded'}
          </div>
          <div>Invitation sent: {order.invitationSent ? 'yes' : 'no'} · Claimed: {order.invitationClaimed ? 'yes' : 'no'}</div>
          {!order.invitationClaimed && order.status === 'paid' ? (
            <button type="button" onClick={() => { void resend(order.orderId); }}>Resend invitation</button>
          ) : null}
        </div>
      ))}
    </section>
  );
}
