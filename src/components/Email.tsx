"use client";

import { useEffect, useState } from "react";
import { Send, Inbox, Star, Trash2, Search, X, Paperclip, Loader2, Download, FileText, Image, File } from "lucide-react";
import { toast } from "react-toastify";
import api from "../utils/api";
import { EmailListSkeleton } from "./ui/Shimmer";

type Tab = "inbox" | "starred" | "sent" | "trash";

interface EmailItem {
  _id: string;
  from: string;
  to?: string;
  subject: string;
  preview?: string;
  body: string;
  time: string;
  unread: boolean;
  starred: boolean;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    cid?: string;
  }>;
}

export default function Email() {
  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [inbox, setInbox] = useState<EmailItem[]>([]);
  const [sent, setSent] = useState<EmailItem[]>([]);
  const [trash, setTrash] = useState<EmailItem[]>([]);
  const [starred, setStarred] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeText, setComposeText] = useState("");
  const [starringStar, setStarringStar] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<{[key: string]: string}>({});
  const [downloadingAttachment, setDownloadingAttachment] = useState<string | null>(null);
  const [composeAttachments, setComposeAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setPage(1);
    fetchTab(activeTab, 1);
    setSelectedEmail(null);
    setSearchQuery("");
    Object.values(imagePreviewUrls).forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls({});
  }, [activeTab]);

  // Poll for new emails every 30s — lightweight check only
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get("/api/v1/emails/check-new");
        // If new unread count is higher than current, refresh inbox page 1
        const currentUnread = inbox.filter(e => e.unread).length;
        if (data.unreadCount > currentUnread) {
          fetchTab("inbox", 1);
        }
      } catch { /* silent */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [inbox]);

  async function fetchTab(tab: Tab, p = 1) {
    setLoading(true);
    try {
      const params = { page: p, limit: LIMIT };
      if (tab === "inbox") {
        const { data } = await api.get("/api/v1/emails/inbox", { params });
        setInbox(data.data ?? []);
        setTotalPages(data.pages ?? 1);
        setTotal(data.total ?? 0);
      } else if (tab === "starred") {
        const { data } = await api.get("/api/v1/emails/starred", { params });
        setStarred(data.data ?? []);
        setTotalPages(data.pages ?? 1);
        setTotal(data.total ?? 0);
      } else if (tab === "sent") {
        const { data } = await api.get("/api/v1/emails/sent", { params });
        setSent(data.data ?? []);
        setTotalPages(data.pages ?? 1);
        setTotal(data.total ?? 0);
      } else if (tab === "trash") {
        const { data } = await api.get("/api/v1/emails/trash", { params });
        setTrash(data.data ?? []);
        setTotalPages(data.pages ?? 1);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchTab(activeTab, p);
  };

  const currentEmails: EmailItem[] =
    activeTab === "inbox" ? inbox :
    activeTab === "starred" ? starred :
    activeTab === "sent" ? sent :
    trash;

  const filtered = currentEmails.filter(e =>
    searchQuery === "" ? true :
      e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.preview?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEmail = (email: EmailItem) => {
    Object.values(imagePreviewUrls).forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls({});
    setSelectedEmail(email);
    if (email.unread) {
      // Optimistic update
      setInbox(prev => prev.map(e => e._id === email._id ? { ...e, unread: false } : e));
      setStarred(prev => prev.map(e => e._id === email._id ? { ...e, unread: false } : e));
      // Persist to DB
      api.patch(`/api/v1/emails/read/${email._id}`).catch(() => {});
    }
  };

  const toggleStar = async (id: string) => {
    if (starringStar === id) return; // Prevent multiple clicks
    
    const target = inbox.find(e => e._id === id);
    if (!target) return;
    const newStarred = !target.starred;
    
    try {
      setStarringStar(id);
      
      // Update inbox state immediately for optimistic UI
      setInbox(prev => prev.map(e => e._id === id ? { ...e, starred: newStarred } : e));
      
      // Update selected email if it's the same one
      if (selectedEmail?._id === id) {
        setSelectedEmail(prev => prev ? { ...prev, starred: newStarred } : prev);
      }
      
      await api.patch(`/api/v1/emails/star/${id}`, { starred: newStarred });
      await fetchTab("inbox", page);
      toast.success(newStarred ? "Email starred" : "Email unstarred");
    } catch (err) {
      // Revert on failure
      setInbox(prev => prev.map(e => e._id === id ? { ...e, starred: target.starred } : e));
      if (selectedEmail?._id === id) {
        setSelectedEmail(prev => prev ? { ...prev, starred: target.starred } : prev);
      }
      console.error("Error toggling star:", err);
      toast.error("Failed to update star status");
    } finally {
      setStarringStar(null);
    }
  };

  const deleteEmail = async (id: string) => {
    if (deletingEmail === id) return;
    try {
      setDeletingEmail(id);
      await api.post("/api/v1/emails/trash", { uid: id });
      if (activeTab === "inbox" || activeTab === "starred") {
        setInbox(prev => prev.filter(e => e._id !== id));
      } else if (activeTab === "sent") {
        setSent(prev => prev.filter(e => e._id !== id));
      }
      setSelectedEmail(null);
      await fetchTab("trash", 1);
      toast.success("Email moved to trash");
    } catch (err) {
      console.error("Error moving email to trash:", err);
      toast.error("Failed to move email to trash.");
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleSend = async () => {
    if (!composeTo.trim() || !composeSubject.trim() || !composeText.trim()) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('to', composeTo);
      formData.append('subject', composeSubject);
      formData.append('text', composeText);
      
      // Add attachments
      composeAttachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
      
      await api.post("/api/v1/emails/send", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setComposeTo(""); setComposeSubject(""); setComposeText("");
      setComposeAttachments([]);
      setShowCompose(false);
      if (activeTab === "sent") fetchTab("sent");
      toast.success("Email sent successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const loadImagePreview = async (emailId: string, filename: string) => {
    try {
      const encodedFilename = encodeURIComponent(filename);
      const response = await api.get(`/api/v1/emails/attachment/${emailId}/${encodedFilename}`, {
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response.data);
      setImagePreviewUrls(prev => ({ ...prev, [`${emailId}-${filename}`]: url }));
    } catch (err) {
      console.error('Failed to load image preview:', err);
    }
  };

  const isImageFile = (contentType: string) => {
    return contentType.startsWith('image/');
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (contentType.includes('pdf')) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (contentType.includes('text/') || contentType.includes('document')) {
      return <FileText className="w-4 h-4 text-blue-600" />;
    } else {
      return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const downloadAttachment = async (emailId: string, filename: string) => {
    try {
      setDownloadingAttachment(filename);
      // Encode filename to handle special characters
      const encodedFilename = encodeURIComponent(filename);
      const response = await api.get(`/api/v1/emails/attachment/${emailId}/${encodedFilename}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${filename}`);
    } catch (err: any) {
      console.error('Download failed:', err);
      if (err.response?.status === 404) {
        toast.error('Attachment not found');
      } else {
        toast.error('Failed to download attachment');
      }
    } finally {
      setDownloadingAttachment(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setComposeAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setComposeAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const navItems: { tab: Tab; label: string; icon: React.ReactNode }[] = [
    { tab: "inbox",   label: "Inbox",   icon: <Inbox className="w-4 h-4" /> },
    { tab: "starred", label: "Starred", icon: <Star className="w-4 h-4" /> },
    { tab: "sent",    label: "Sent",    icon: <Send className="w-4 h-4" /> },
    { tab: "trash",   label: "Trash",   icon: <Trash2 className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">Email</h1>
        <p className="text-[#6a7282] mt-1">Official email communication and system notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-4">
          <button
            onClick={() => setShowCompose(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] transition-colors mb-4 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Compose
          </button>

          <nav className="space-y-1">
            {navItems.map(({ tab, label, icon }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#ecfdf5] text-[#1F7A4D] font-medium"
                    : "hover:bg-[#f9fafb] text-[#374151]"
                }`}
              >
                {icon}
                {label}
                {tab === "inbox" && inbox.filter(e => e.unread).length > 0 && (
                  <span className="ml-auto text-xs">{inbox.filter(e => e.unread).length}</span>
                )}
                {tab === "starred" && inbox.filter(e => e.starred).length > 0 && (
                  <span className="ml-auto text-xs bg-[#1F7A4D] text-white rounded-full px-2 py-0.5">
                    {inbox.filter(e => e.starred).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b border-[#e5e7eb]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a7282]" />
              <input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#e5e7eb] rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Email List */}
          {!selectedEmail && (
            loading ? (
              <EmailListSkeleton rows={8} />
            ) : filtered.length === 0 ? (
              <p className="text-sm text-[#6a7282] text-center py-12">No emails in {activeTab}.</p>
            ) : (
              <div className="divide-y divide-[#e5e7eb]">
                {filtered.map(email => (
                  <div
                    key={email._id}
                    onClick={() => openEmail(email)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-[#f9fafb] ${email.unread ? "bg-[#f9fafb]" : ""}`}
                  >
                    <div className="flex gap-4">
                      {/* Star — only for inbox/starred */}
                      {(activeTab === "inbox" || activeTab === "starred") && (
                        <button
                          onClick={e => { 
                            e.stopPropagation(); 
                            if (email._id && starringStar !== email._id) {
                              toggleStar(email._id); 
                            }
                          }}
                          disabled={starringStar === email._id}
                          className="mt-1 shrink-0 disabled:opacity-50"
                        >
                          {starringStar === email._id ? (
                            <Loader2 className="w-4 h-4 text-[#6a7282] animate-spin" />
                          ) : (
                            <Star className={`w-4 h-4 ${email.starred ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#6a7282]"}`} />
                          )}
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${email.unread ? "font-medium text-[#242424]" : "text-[#6a7282]"}`}>
                              {activeTab === "sent" ? `To: ${email.to ?? ""}` : email.from}
                            </span>
                            {email.attachments && email.attachments.length > 0 && (
                              <Paperclip className="w-3 h-3 text-[#6a7282]" />
                            )}
                          </div>
                          <span className="text-xs text-[#6a7282]">{email.time}</span>
                        </div>
                        <h3 className={`text-sm mb-1 ${email.unread ? "font-semibold text-[#242424]" : "text-[#6a7282]"}`}>
                          {email.subject}
                        </h3>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#6a7282] truncate flex-1">{email.preview}</p>
                          {email.attachments && email.attachments.length > 0 && (
                            <div className="flex items-center gap-1 ml-2 text-xs text-[#6a7282]">
                              <Paperclip className="w-3 h-3" />
                              <span>{email.attachments.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Pagination */}
          {!selectedEmail && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#e5e7eb]">
              <p className="text-xs text-[#6a7282]">
                Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg disabled:opacity-40 hover:bg-[#f9fafb] cursor-pointer">←</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(p); return acc;
                  }, [])
                  .map((p, i) => p === "…"
                    ? <span key={i} className="px-2 text-[#6a7282] text-sm">…</span>
                    : <button key={i} onClick={() => handlePageChange(p as number)}
                        className={`px-3 py-1.5 text-sm border rounded-lg cursor-pointer ${
                          page === p ? "bg-[#1F7A4D] text-white border-[#1F7A4D]" : "border-[#e5e7eb] hover:bg-[#f9fafb]"
                        }`}>{p}</button>
                  )}
                <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg disabled:opacity-40 hover:bg-[#f9fafb] cursor-pointer">→</button>
              </div>
            </div>
          )}

          {/* Reading Pane */}
          {selectedEmail && (
            <div className="p-6">
              <button onClick={() => setSelectedEmail(null)} className="text-sm text-[#1F7A4D] mb-4 cursor-pointer">
                ← Back to {activeTab}
              </button>
              <div className="flex items-start justify-between gap-4 mb-1">
                <h2 className="text-lg font-semibold text-[#242424]">{selectedEmail.subject}</h2>
                {(activeTab === "inbox" || activeTab === "starred") && (
                  <button 
                    onClick={() => {
                      if (selectedEmail._id && starringStar !== selectedEmail._id) {
                        toggleStar(selectedEmail._id);
                      }
                    }} 
                    disabled={starringStar === selectedEmail._id}
                    className="shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {starringStar === selectedEmail._id ? (
                      <Loader2 className="w-5 h-5 text-[#6a7282] animate-spin" />
                    ) : (
                      <Star className={`w-5 h-5 ${selectedEmail.starred ? "text-[#f59e0b] fill-[#f59e0b]" : "text-[#6a7282]"}`} />
                    )}
                  </button>
                )}
              </div>
              <p className="text-sm text-[#6a7282] mb-4">
                {activeTab === "sent" ? `To: ${selectedEmail.to ?? ""}` : `From: ${selectedEmail.from}`}
              </p>
              
              {/* Attachments */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Paperclip className="w-4 h-4 text-[#6a7282]" />
                    <span className="text-sm font-medium text-[#242424]">
                      {selectedEmail.attachments.length} attachment{selectedEmail.attachments.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-[#6a7282] ml-2">Scanned by Email Security</span>
                    <button 
                      onClick={() => {
                        selectedEmail.attachments?.forEach(att => {
                          downloadAttachment(selectedEmail._id, att.filename);
                        });
                      }}
                      className="ml-auto text-xs text-[#1F7A4D] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download all
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {selectedEmail.attachments.map((attachment, index) => {
                      const isImage = isImageFile(attachment.contentType);
                      const previewKey = `${selectedEmail._id}-${attachment.filename}`;
                      
                      // Load image preview if it's an image and not already loaded
                      if (isImage && !imagePreviewUrls[previewKey]) {
                        loadImagePreview(selectedEmail._id, attachment.filename);
                      }
                      
                      return (
                        <div key={index} className="relative group">
                          {isImage ? (
                            // Image attachment with preview
                            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                              {imagePreviewUrls[previewKey] ? (
                                <img 
                                  src={imagePreviewUrls[previewKey]} 
                                  alt={attachment.filename}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                                </div>
                              )}
                              
                              {/* Overlay with download button */}
                              <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                  <button
                                    onClick={() => downloadAttachment(selectedEmail._id, attachment.filename)}
                                    disabled={downloadingAttachment === attachment.filename}
                                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                                    title="Download"
                                  >
                                    {downloadingAttachment === attachment.filename ? (
                                      <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4 text-gray-600" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              
                              {/* File info overlay */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                                <div className="text-white text-xs truncate">{attachment.filename}</div>
                                <div className="text-white text-xs opacity-75">{formatFileSize(attachment.size)}</div>
                              </div>
                            </div>
                          ) : (
                            // Non-image attachment
                            <div className="w-48 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                              <div className="flex-shrink-0 w-10 h-10 bg-white rounded border flex items-center justify-center">
                                {getFileIcon(attachment.contentType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[#242424] truncate">
                                  {attachment.filename}
                                </div>
                                <div className="text-xs text-[#6a7282]">
                                  {formatFileSize(attachment.size)} • {attachment.contentType.split('/')[1]?.toUpperCase() || 'FILE'}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => downloadAttachment(selectedEmail._id, attachment.filename)}
                                  disabled={downloadingAttachment === attachment.filename}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Download"
                                >
                                  {downloadingAttachment === attachment.filename ? (
                                    <Loader2 className="w-4 h-4 text-[#6a7282] animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4 text-[#6a7282]" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div 
                className="text-sm text-[#242424] overflow-auto border border-gray-200 rounded-lg p-4 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                style={{
                  lineHeight: '1.6',
                  wordWrap: 'break-word',
                  maxWidth: '100%',
                  maxHeight: '500px'
                }}
              />
              
              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                {(activeTab === "inbox" || activeTab === "starred") && (
                  <button
                    onClick={() => {
                      if (selectedEmail._id) {
                        toggleStar(selectedEmail._id);
                      }
                    }}
                    disabled={starringStar === selectedEmail._id}
                    className="flex items-center gap-1 text-sm text-[#1F7A4D] hover:text-[#176939] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {starringStar === selectedEmail._id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {selectedEmail.starred ? "Unstarring..." : "Starring..."}
                      </>
                    ) : (
                      <>
                        <Star className={`w-4 h-4 ${selectedEmail.starred ? "fill-[#f59e0b] text-[#f59e0b]" : ""}`} />
                        {selectedEmail.starred ? "Unstar" : "Star"}
                      </>
                    )}
                  </button>
                )}
                
                {activeTab !== "trash" && (
                  <button
                    onClick={() => {
                      if (selectedEmail._id) {
                        deleteEmail(selectedEmail._id);
                      }
                    }}
                    disabled={deletingEmail === selectedEmail._id}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingEmail === selectedEmail._id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Moving to Trash...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> Move to Trash
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">New Message</h3>
              <button onClick={() => setShowCompose(false)} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              placeholder="To"
              value={composeTo}
              onChange={e => setComposeTo(e.target.value)}
              className="w-full mb-3 px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none focus:border-[#1F7A4D]"
            />
            <input
              placeholder="Subject"
              value={composeSubject}
              onChange={e => setComposeSubject(e.target.value)}
              className="w-full mb-3 px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none focus:border-[#1F7A4D]"
            />
            <textarea
              placeholder="Message..."
              rows={5}
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              className="w-full mb-4 px-3 py-2 border border-[#e5e7eb] rounded-lg outline-none focus:border-[#1F7A4D] resize-none"
            />
            
            {/* Attachments */}
            {composeAttachments.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Paperclip className="w-4 h-4 text-[#6a7282]" />
                  <span className="text-sm font-medium text-[#242424]">
                    {composeAttachments.length} attachment{composeAttachments.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {composeAttachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[#242424] truncate">{file.name}</div>
                        <div className="text-xs text-[#6a7282]">{formatFileSize(file.size)}</div>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <div className="flex gap-2">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="p-2 hover:bg-[#f9fafb] rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Paperclip className="w-5 h-5 text-[#6a7282]" />
                  <span className="text-sm text-[#6a7282]">Attach</span>
                </label>
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !composeTo.trim() || !composeSubject.trim() || !composeText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#1F7A4D] text-white rounded-lg hover:bg-[#176939] disabled:opacity-50 cursor-pointer"
              >
                {sending && <Loader2 className="w-4 h-4 animate-spin" />}
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
