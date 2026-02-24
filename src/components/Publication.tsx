import { BookOpen, Download, FileText } from 'lucide-react';

export default function Publications() {
    const magazines = [
        'Vol 2026 Issue 1',
        'Vol 2026 Issue 2',
        'Vol 2026 Issue 3',
        'Vol 2026 Issue 4',
        'Vol 2025 Issue 1',
        'Vol 2025 Issue 2',
    ];

    const documents = [
        { title: 'IWPA Bye-Laws 2026', type: 'Governance', size: '1.2 MB' },
        { title: 'Code of Conduct', type: 'Policy', size: '890 KB' },
        { title: 'Membership Guidelines', type: 'Policy', size: '1.5 MB' },
        { title: 'Technical Standards', type: 'Technical', size: '3.2 MB' },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#242424]">Publications</h1>
                <p className="text-xs sm:text-sm text-[#6a7282]">
                    Access WindPro Magazine, Member Directory, and Official Documents
                </p>
            </div>

            {/* WindPro Magazine */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#d0fae5] flex items-center justify-center">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#1F7A4D]" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-[#242424]">WindPro Magazine</h2>
                        <p className="text-xs sm:text-sm text-[#6a7282]">Latest issues and archives</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {magazines.map((title, i) => (
                        <div
                            key={i}
                            className="relative aspect-[2/3] rounded-lg overflow-hidden border border-[#e5e7eb] shadow-md"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=600&fit=crop"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2 text-white">
                                <p className="text-xs font-medium">{title}</p>
                                <div className="flex items-center gap-1 text-xs text-white/80 mt-1">
                                    <Download className="w-3 h-3" />
                                    Download PDF
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Member Directory */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#dbeafe] rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#155DFC]" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-[#242424]">Member Directory</h2>
                            <p className="text-xs sm:text-sm text-[#6a7282]">Complete list of Council Members</p>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#155DFC] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#0f4ac7] cursor-pointer justify-center">
                        <Download className="w-4 h-4" />
                        Download Directory
                    </button>
                </div>

                <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-[#6a7282]">
                    The member directory contains company names and basic information for all IWPA members.
                    Individual contact details are not included for privacy reasons.
                </div>
            </div>

            {/* Official Documents */}
            <div className='grid grid-cols-1 gap-6'>
                <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 sm:p-6 overflow-auto">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f3e8ff] rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#a855f7]" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-[#242424]">Official Documents</h2>
                            <p className="text-xs sm:text-sm text-[#6a7282]">Governance and policy documents</p>
                        </div>
                    </div>

                    <table className="w-full min-w-[600px]">
                        <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                            <tr>
                                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium">Document Title</th>
                                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium">Type</th>
                                <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium">Size</th>
                                <th className="px-3 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#e5e7eb]">
                            {documents.map((doc, i) => (
                                <tr key={i} className="hover:bg-[#f9fafb]">
                                    <td className="px-3 sm:px-4 py-3 flex items-center gap-2 text-xs sm:text-sm font-medium">
                                        <FileText className="w-4 h-4 text-[#1F7A4D]" />
                                        {doc.title}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3">
                                        <span className="px-2.5 py-1 text-xs rounded-md bg-[#f3f4f6] text-[#6a7282]">
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-[#6a7282]">{doc.size}</td>
                                    <td className="px-3 sm:px-4 py-3 text-right">
                                        <button className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-[#1F7A4D] hover:bg-[#ecfdf5] rounded-lg cursor-pointer">
                                            <Download className="w-4 h-4" />
                                            Download
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