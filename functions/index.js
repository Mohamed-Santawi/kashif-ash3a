const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

/**
 * Fan-out notifications to all users when a report is approved.
 * Creates one notification per user (optionally excluding the submitter).
 */
exports.onReportApprovedFanout = onDocumentUpdated(
  "reports/{reportId}",
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    if (!before || !after) return;

    // Only when status transitions to approved
    if (before.status === "approved" || after.status !== "approved") return;

    const reportId = event.params.reportId;
    const { rumorUrl, submittedBy } = after;

    const base = {
      type: "report_approved_broadcast",
      title: "بلاغ جديد تم اعتماده",
      message: `تم اعتماد بلاغ جديد حول: ${rumorUrl || "رابط"}. شاهد التفاصيل.`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      reportId,
    };

    // Skip notifying the submitter in the broadcast (keep their own approval notice separate)
    const excludeUid = submittedBy || null;

    // Fan-out to all users with BulkWriter
    const writer = db.bulkWriter({ throttling: false });
    const usersSnap = await db.collection("users").select("id").get();

    usersSnap.forEach((docSnap) => {
      const uid = docSnap.id;
      if (excludeUid && uid === excludeUid) return;
      const notifRef = db.collection("notifications").doc();
      writer.set(notifRef, { ...base, userId: uid });
    });

    await writer.close();
  }
);
