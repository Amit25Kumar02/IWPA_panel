"use client";

import { Calendar, CreditCard, DollarSign, FileText, Download } from "lucide-react";
import { text } from "stream/consumers";

export default function SubscriptionMemberPage() {

  const payments = [
    {
      invoice: "INV-2026-001",
      invoiceDate: "3/15/2026",
      amount: "₹1,50,000",
      status: "Paid",
      paidDate: "3/16/2026",
    },
    {
      invoice: "INV-2025-045",
      invoiceDate: "3/15/2025",
      amount: "₹1,50,000",
      status: "Paid",
      paidDate: "3/16/2025",
    },
    {
      invoice: "INV-2024-045",
      invoiceDate: "3/15/2024",
      amount: "₹1,35,000",
      status: "Paid",
      paidDate: "3/18/2024",
    },
  ];

  const cards = [
    {
      title: "Current Plan",
      value: "Corporate Annual",
      text: "text-[#242424]",
      icon: CreditCard,
      bg: "#D0FAE5",
      color: "#1F7A4D",
    },
    {
      title: "Expiry Date",
      value: "14 Mar 2027",
      text: "text-[#242424]",
      icon: Calendar,
      bg: "#DBEAFE",
      color: "#2563EB",
    },
    {
      title: "Payment Status",
      value: "Paid",
      text: "text-[#1F7A4D]",
      icon: DollarSign,
      bg: "#D0FAE5",
      color: "#1F7A4D",
    },
    {
      title: "Outstanding Amount",
      value: "₹0",
      text: "text-[#242424]",
      icon: FileText,
      bg: "#D0FAE5",
      color: "#1F7A4D",
    },
  ];

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-[22.75px] font-bold text-[#242424]">My Subscription</h1>
        <p className="text-[15.17px] text-[#6A7282] mt-1">
          View your membership details and payment history
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-[#6A7282]">{card.title}</p>
                <p className={`text-[22.75px] font-bold ${card.text} mt-1`}>
                  {card.value}
                </p>
              </div>

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <Icon size={18} style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Details */}
      <div className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl p-6">
        <h2 className="text-[17px] font-semibold text-[#242424] mb-6">
          Subscription Details
        </h2>

        <div className="grid grid-cols-2 gap-y-6 text-sm">

          <div>
            <p className="text-[#6A7282] text-[13.27px]">Membership ID</p>
            <p className="text-[#242424] font-semibold text-[15.17px] mt-1">
              MH - GEM - 2026 - 0045
            </p>
          </div>

          <div>
            <p className="text-[#6A7282] text-[13.27px]">Category</p>
            <p className="text-[#242424] font-semibold text-[15.17px] mt-1">
              Generator Members
            </p>
          </div>

          <div>
            <p className="text-[#6A7282] text-[13.27px]">State</p>
            <p className="text-[#242424] font-semibold text-[15.17px] mt-1">
              Maharashtra
            </p>
          </div>

          <div>
            <p className="text-[#6A7282] text-[13.27px]">Validity Period</p>
            <p className="text-[#242424] font-semibold text-[15.17px] mt-1">
              3/15/2026 - 3/14/2027
            </p>
          </div>

          <div>
            <p className="text-[#6A7282] text-[13.27px]">Annual Amount</p>
            <p className="text-[#242424] font-semibold text-[15.17px] mt-1">
              ₹1,50,000
            </p>
          </div>

          <div>
            <p className="text-[#6A7282] text-[13.27px]">Status</p>
            <span className="inline-block mt-1 px-3 py-1 text-xs rounded-md bg-[#D0FAE5] text-[#1F7A4D]">
              Active
            </span>
          </div>

        </div>
      </div>

      {/* Payment History */}
      <div className="grid grid-cols-1 gap-10">
        <div className="bg-white border-[0.76px] border-[#E5E7EB] rounded-xl overflow-auto">

          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-[17px] font-semibold text-[#242424]">
              Payment History
            </h2>
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

              {payments.map((item, i) => (
                <tr key={i} className="hover:bg-[#F9FAFB]">

                  <td className="px-6 py-4 font-medium text-[#242424]">
                    {item.invoice}
                  </td>

                  <td className="px-6 py-4 text-[#6A7282]">
                    {item.invoiceDate}
                  </td>

                  <td className="px-6 py-4 font-semibold text-[#242424]">
                    {item.amount}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs rounded bg-[#D0FAE5] text-[#1F7A4D]">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-[#6A7282]">
                    {item.paidDate}
                  </td>

                  <td className="px-6 py-4 flex justify-end gap-2">

                    <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-[#D0FAE5] text-[#1F7A4D]">
                      <Download size={14} />
                      Invoice
                    </button>

                    <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-[#D0FAE5] text-[#1F7A4D]">
                      <Download size={14} />
                      Receipt
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
}