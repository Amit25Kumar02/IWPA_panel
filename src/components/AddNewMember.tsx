import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const states = [
  "Andhra Pradesh",
  "Gujarat",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Other",
];

const categories = [
  { code: "GEM", name: "Generator (Corporate)" },
  { code: "NGM", name: "Generator (Non-corporate)" },
  { code: "SRV", name: "Service Provider" },
  { code: "FIN", name: "Financial Institution" },
  { code: "SWO", name: "State Wind Owner" },
  { code: "EDU", name: "Educational Institution" },
  { code: "INT", name: "International Member" },
  { code: "MFG", name: "Manufacturer" },
  { code: "ANE", name: "Associate (Non-eligible)" },
];

interface WindRow {
  id: number;
  location: string;
  noOfWindMills: string;
  ratedCapacity: string;
  totalMW: string;
  make: string;
  connectedSubstation: string;
}

export default function AddNewMember({ onClose, initialData }: { onClose: () => void; initialData?: any }) {
  const [formData, setFormData] = useState({
    state: "",
    category: "",
    year: new Date().getFullYear().toString(),
    serialNumber: "0001",
    companyName: "",
    address: "",
    officePhone: "",
    gstNo: "",
    repName: "",
    repDesignation: "",
    repOfficePhone: "",
    repMobile: "",
    repEmail: "",
    memberCategory: "generator",
    businessDescription: "",
    chairmanMD: "",
    groupCompany: "",
  });

  const [windRows, setWindRows] = useState<WindRow[]>([
    {
      id: 1,
      location: "",
      noOfWindMills: "",
      ratedCapacity: "",
      totalMW: "",
      make: "",
      connectedSubstation: "",
    },
  ]);

  const addWindRow = () => {
    setWindRows([
      ...windRows,
      {
        id: Date.now(),
        location: "",
        noOfWindMills: "",
        ratedCapacity: "",
        totalMW: "",
        make: "",
        connectedSubstation: "",
      },
    ]);
  };

  const removeWindRow = (id: number) => {
    if (windRows.length > 1) {
      setWindRows(windRows.filter((row) => row.id !== id));
    }
  };

  const updateWindRow = (id: number, field: keyof WindRow, value: string) => {
    setWindRows(
      windRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Generate membership number preview
  const getMembershipNumber = () => {
    const { state, category, year, serialNumber, groupCompany } = formData;
    if (!state || !category) return "Please select state and category";
    const stateCode = state.substring(0, 2).toUpperCase();
    const categoryCode = category;
    const groupSuffix = groupCompany.trim() ? " (G)" : "";
    return `${stateCode} - ${categoryCode} - ${year} - ${serialNumber}${groupSuffix}`;
  };

  const handleSubmit = () => {
    // In a real app, send data to API
    alert("Member registered (demo)");
    onClose();
  };

  const handleSaveDraft = () => {
    alert("Draft saved (demo)");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-6xl m-4 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e5e7eb]">
          <div>
            <h2 className="text-2xl font-bold text-[#242424]">Add New Member / Sign Up</h2>
            <p className="text-[#6a7282] mt-1">Complete member registration form</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f9fafb] rounded-lg text-[#6a7282] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-8">
          {/* Auto Configuration */}
          {/* <Section title="Auto Configuration">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Select State <span className="text-[#FB2C36]">*</span></Label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Select Category <span className="text-[#FB2C36]">*</span></Label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.code} - {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Year of Joining</Label>
                <input
                  type="text"
                  value={formData.year}
                  readOnly
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg bg-[#f9fafb] cursor-not-allowed"
                />
              </div>
              <div>
                <Label>Serial Number</Label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg bg-[#f9fafb] cursor-not-allowed"
                />
              </div>
            </div>
          </Section> */}
          <div className="bg-linear-to-br from-[#ecfdf5] to-[#ffffff] rounded-lg border-[0.74px] border-[#a4f4cf] p-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#6a7282] mb-1">
                  Membership Number Preview
                </p>
                <p className="text-xl font-bold text-[#1F7A4D] font-mono">
                  {getMembershipNumber()}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#fef3c7] text-[#f59e0b]">
                  Temporary
                </span>
                <p className="text-xs text-[#6a7282] mt-1">
                  Permanent after payment
                </p>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <Section title="Company Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Company Name <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter company name"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Enter GROUP Company Name (if applicable)</Label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter Group company name"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address for Correspondence <span className="text-[#FB2C36]">*</span></Label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter complete address"
                />
              </div>
              <div>
                <Label>Office Phone</Label>
                <input
                  type="tel"
                  value={formData.officePhone}
                  onChange={(e) => setFormData({ ...formData, officePhone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <Label>GST No.</Label>
                <input
                  type="text"
                  value={formData.gstNo}
                  onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter GST number"
                />
              </div>
            </div>
          </Section>

          {/* Authorized Representative */}
          <Section title="Authorized Representative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="text"
                  value={formData.repName}
                  placeholder="Enter name"
                  onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                />
              </div>
              <div>
                <Label>Designation <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="text"
                  value={formData.repDesignation}
                  placeholder="Enter designation"
                  onChange={(e) => setFormData({ ...formData, repDesignation: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                />
              </div>
              <div>
                <Label>Office Phone</Label>
                <input
                  type="tel"
                  value={formData.repOfficePhone}
                  placeholder="+91 XXXXX XXXXX"
                  onChange={(e) => setFormData({ ...formData, repOfficePhone: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                />
              </div>
              <div>
                <Label>Mobile <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="tel"
                  value={formData.repMobile}
                  placeholder="+91 XXXXX XXXXX"
                  onChange={(e) => setFormData({ ...formData, repMobile: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Email <span className="text-[#FB2C36]">*</span></Label>
                <input
                  type="email"
                  value={formData.repEmail}
                  onChange={(e) => setFormData({ ...formData, repEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </Section>

          {/* Category of Members */}
          <Section title="Category of Members">
            <div className="space-y-3">
              {["generator", "manufacturer", "other"].map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-3 p-4 border border-[#e5e7eb] rounded-lg cursor-pointer hover:bg-[#f9fafb] transition-colors"
                >
                  <input
                    type="radio"
                    name="memberCategory"
                    value={cat}
                    checked={formData.memberCategory === cat}
                    onChange={(e) => setFormData({ ...formData, memberCategory: e.target.value })}
                    className="w-4 h-4 text-[#1F7A4D] focus:ring-[#1F7A4D]"
                  />
                  <span className="text-sm font-medium text-[#242424]">
                    {cat === "generator" && "Wind Electric Generator"}
                    {cat === "manufacturer" && "Manufacturer / Supplier"}
                    {cat === "other" && "Other"}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* Wind Electric Generator Details (only if generator selected) */}
          {formData.memberCategory === "generator" && (
            <Section
              title="Wind Electric Generator Details"
              action={
                <button
                  onClick={addWindRow}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-[#ffffff] rounded-lg hover:bg-[#176939] transition-colors text-sm font-medium cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add More
                </button>
              }
            >

              <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium">Location</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">No. of Wind Mills</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Rated Capacity</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Total MW</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Make</th>
                        <th className="text-left px-4 py-3 text-sm font-medium">Connected Substation</th>
                        <th className="text-center px-4 py-3 text-sm font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e7eb]">
                      {windRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={row.location}
                              onChange={(e) => updateWindRow(row.id, "location", e.target.value)}
                              className="w-full px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="Location"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={row.noOfWindMills}
                              onChange={(e) => updateWindRow(row.id, "noOfWindMills", e.target.value)}
                              className="w-full px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="No."
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={row.ratedCapacity}
                              onChange={(e) => updateWindRow(row.id, "ratedCapacity", e.target.value)}
                              className="w-full px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="Capacity"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={row.totalMW}
                              onChange={(e) => updateWindRow(row.id, "totalMW", e.target.value)}
                              className="w-full px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="MW"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={row.make}
                              onChange={(e) => updateWindRow(row.id, "make", e.target.value)}
                              className="w-full px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="Make"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={row.connectedSubstation}
                              onChange={(e) => updateWindRow(row.id, "connectedSubstation", e.target.value)}
                              className="w-full px-2 py-1 border border-[#e5e7eb] rounded outline-none text-sm"
                              placeholder="Substation"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeWindRow(row.id)}
                              disabled={windRows.length === 1}
                              className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>
          )}

          {/* Additional Information */}
          <Section title="Additional Information">
            <div className="space-y-4">
              <div>
                <Label>Business Description</Label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Describe your business activities..."
                />
              </div>
              <div>
                <Label>Chairman / MD Details</Label>
                <input
                  type="text"
                  value={formData.chairmanMD}
                  onChange={(e) => setFormData({ ...formData, chairmanMD: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Name and designation"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name <span className="text-[#FB2C36]">*</span></Label>
                  <input
                    type="text"
                    value={formData.repName}
                    placeholder="Enter name"
                    onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <Label>Designation <span className="text-[#FB2C36]">*</span></Label>
                  <input
                    type="text"
                    value={formData.repDesignation}
                    placeholder="Enter designation"
                    onChange={(e) => setFormData({ ...formData, repDesignation: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <Label>Office Phone</Label>
                  <input
                    type="tel"
                    value={formData.repOfficePhone}
                    placeholder="+91 XXXXX XXXXX"
                    onChange={(e) => setFormData({ ...formData, repOfficePhone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <Label>Mobile <span className="text-[#FB2C36]">*</span></Label>
                  <input
                    type="tel"
                    value={formData.repMobile}
                    placeholder="+91 XXXXX XXXXX"
                    onChange={(e) => setFormData({ ...formData, repMobile: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Email <span className="text-[#FB2C36]">*</span></Label>
                  <input
                    type="email"
                    value={formData.repEmail}
                    onChange={(e) => setFormData({ ...formData, repEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <Label>Group Company Details (if total capacity &gt; 38 MW)</Label>
                <textarea
                  value={formData.groupCompany}
                  onChange={(e) => setFormData({ ...formData, groupCompany: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none"
                  placeholder="Enter group company details if applicable"
                />
                <p className="text-xs text-[#6a7282] mt-1">
                  Adding group company details will append (G) to membership number
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-[#e5e7eb] bg-[#f9fafb]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-white transition-colors font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-6 py-2.5 border border-[#1F7A4D] text-[#1F7A4D] rounded-lg hover:bg-[#ecfdf5] transition-colors font-medium cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors font-medium cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Helper components
   ------------------------------------------------------------------------- */
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#242424]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#242424] mb-2">{children}</label>;
}