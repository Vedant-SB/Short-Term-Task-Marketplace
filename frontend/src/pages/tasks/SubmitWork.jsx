import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Link as LinkIcon } from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  InputField,
  TextAreaField,
  PrimaryButton,
  ConfirmDialog,
} from "../../components/ui";

const ease = [0.22, 1, 0.36, 1];

function SubmitWork() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "error"
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);

    if (submitting) return;
    setSubmitting(true);
    setMessage("");

    try {
      const response = await api.put(`/tasks/${id}/submit`, {
        submissionLink,
        submissionNote,
      });

      setMessage(response.data.message);
      setMessageType("success");

      setTimeout(() => {
        navigate("/individual-dashboard");
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || "Submission failed");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-[94%] max-w-[800px] py-8 md:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <PageHeader
            badgeText="Work Submission"
            title="Submit Your Work"
            description="Provide your submission link and any additional notes for the company to review."
          />
        </motion.div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-destructive/20 bg-destructive/5 text-destructive"
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease }}
        >
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/50">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Send className="h-4 w-4 text-primary" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="font-display text-lg text-ink">
                  Submission Details
                </h2>
                <p className="text-xs text-muted-foreground">
                  All fields are required
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                label="Submission Link"
                name="submissionLink"
                required
                placeholder="Github, Drive, Figma, etc."
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
                icon={LinkIcon}
                helperText="Provide a link to your completed work (repository, drive folder, deployed app, etc.)"
              />

              <TextAreaField
                label="Submission Note"
                name="submissionNote"
                required
                rows={5}
                placeholder="Describe what you built, key decisions you made, and anything the reviewer should know..."
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                helperText="Help the reviewer understand your approach and any important details"
              />

              <div className="pt-2">
                <PrimaryButton
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit Work"}
                </PrimaryButton>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSubmit}
        icon={Send}
        variant="warning"
        title="Submit your work?"
        message="After submission your work will be sent to the company for review. Make sure everything is ready."
        cancelLabel="Go Back"
        confirmLabel="Yes, Submit"
      />
    </div>
  );
}

export default SubmitWork;