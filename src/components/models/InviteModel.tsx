import { useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";


export default function InviteFriendModal({ isOpen, onClose, onSend }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSend(email);
      setEmail("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900">
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Invite a Friend
        </h4>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Enter your friend's email to send them an invitation.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={!email.trim()}>
              Send Invite
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
