// Backend fixes for emailController.js

// Replace the fetchEmailsFromBox function with this:
const fetchEmailsFromBox = async (boxName) => {
  const connection = await imaps.connect(imapConfig());
  await connection.openBox(boxName);
  const messages = await connection.search(["ALL"], { bodies: [""], struct: true });
  const emails = await Promise.all(
    messages.slice(-20).map(async (item) => {
      const all = item.parts.find((p) => p.which === "");
      const parsed = await simpleParser(all.body);
      return {
        _id: item.attributes.uid, // Changed from 'id' to '_id'
        from: parsed.from?.text || "",
        to: parsed.to?.text || "",
        subject: parsed.subject || "",
        body: parsed.text || "",
        preview: parsed.text?.substring(0, 100) || "",
        time: parsed.date ? new Date(parsed.date).toLocaleString() : new Date().toLocaleString(),
        unread: !item.attributes.flags.includes("\\Seen"),
        starred: item.attributes.flags.includes("\\Flagged"), // Check for flagged status
      };
    })
  );
  await connection.end();
  return emails.reverse();
};

// Replace the starEmail function with this:
export const starEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ error: "Invalid email ID" });
    }
    
    const connection = await imaps.connect(imapConfig());
    await connection.openBox("INBOX");
    
    if (starred) {
      await connection.addFlags(id, "\\Flagged");
    } else {
      await connection.delFlags(id, "\\Flagged");
    }
    
    await connection.end();
    
    res.json({ success: true });
  } catch (err) {
    console.error("Star email error:", err);
    res.status(500).json({ error: "Failed to update star status" });
  }
};