"use client";

import { useState, useEffect } from "react";
import { Calendar, CreditCard, DollarSign, FileText, Download, Loader2 } from "lucide-react";
import api from "../utils/api";

interface Subscription {
  _id: string;
  membershipId: string;
  category: string;
  state: string;
  plan: string;
  validFrom: string;
  validTo: string;
  annualAmount: number;
  status: string;
  paymentHistory: {
    invoice: string;
    invoiceDate: string;
    amount: string;
    status: string;
    paidDate: string;
  }[];
}

const currentUserId: string = (() => {
  try { return JSON.parse(localStorage.getItem("user") ?? "{}")._id ?? ""; }
  catch { return ""; }
})();

export default function SubscriptionMemberPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) { setLoading(false); return; }
    api.get(`/api/v1/subscriptions/get-subscription/${currentUserId}`)
      .then(({ data }) => setSubscription(data?.data ?? data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Current Plan", value: subscription?.plan ?? "—", text: "text-[#242424]", icon: CreditCard, bg: "#D0FAE5", color: "#1F7A4D" },
    { title: "Subscription expires on", value: subscription?.validTo ? new Date(subscription.validTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—", text: "text-[#242424]", icon: Calendar, bg: "#DBEAFE", color: "#2563EB" },
    { title: "Payment Status", value: subscription?.status ?? "—", text: "text-[#1F7A4D]", icon: DollarSign, bg: "#D0FAE5", color: "#1F7A4D" },
    { title: "Outstanding Amount", value: subscription ? "₹0" : "—", text: "text-[#242424]", icon: FileText, bg: "#D0FAE5", color: "#1F7A4D" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-[#1F7A4D]" />
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-[22.75px] font-bold text-[#242424]">My Subscription</h1>
        <p className="text-[15.17px] text-[#6A7282] mt-1">View your membership details and payment history</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#6A7282]">{card.title}</p>
                <p className={`text-[22.75px] font-bold ${card.text} mt-1`}>{card.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                <Icon size={18} style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Details */}
      {subscription && (
        <div className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl p-6">
          <h2 className="text-[17px] font-semibold text-[#242424] mb-6">Subscription Details</h2>
          <div className="grid grid-cols-2 gap-y-6 text-sm">
            {([
              ["Membership ID", subscription.membershipId],
              ["Category", subscription.category],
              ["State", subscription.state],
              ["Validity Period", `${new Date(subscription.validFrom).toLocaleDateString("en-GB")} - ${new Date(subscription.validTo).toLocaleDateString("en-GB")}`],
              ["Annual Amount", `₹${Number(subscription.annualAmount).toLocaleString("en-IN")}`],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-[#6A7282] text-[13.27px]">{label}</p>
                <p className="text-[#242424] font-semibold text-[15.17px] mt-1">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-[#6A7282] text-[13.27px]">Status</p>
              <span className="inline-block mt-1 px-3 py-1 text-xs rounded-md bg-[#D0FAE5] text-[#1F7A4D]">{subscription.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      {subscription?.paymentHistory?.length ? (
        <div className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl overflow-auto">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-[17px] font-semibold text-[#242424]">Payment History</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] text-[#242424] text-[13.27px] font-medium">
              <tr>
                <th className="px-6 py-3 text-left">Invoice No.</th>
                <th className="px-6 py-3 text-left">Invoice Date</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Paid Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscription.paymentHistory.map((item, i) => (
                <tr key={i} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 font-medium text-[#242424]">{item.invoice}</td>
                  <td className="px-6 py-4 text-[#6A7282]">{item.invoiceDate}</td>
                  <td className="px-6 py-4 font-semibold text-[#242424]">{item.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs rounded bg-[#D0FAE5] text-[#1F7A4D]">{item.status}</span>
                  </td>
                  <td className="px-6 py-4 text-[#6A7282]">{item.paidDate}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    {["Certificate", "Invoice", "Receipt"].map(label => (
                      <button key={label} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-[#D0FAE5] text-[#1F7A4D]">
                        <Download size={14} />{label}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading && (
        <div className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl px-6 py-12 text-center text-sm text-[#6A7282]">
          No subscription data found.
        </div>
      )}
    </div>
  );
}