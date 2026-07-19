"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Prohibit, ArrowLeft } from "@phosphor-icons/react";
import Button from "@/ui/Button";

interface NoAccessProps {
  title?: string;
  description?: string;
}

export default function NoAccess({
  title = "No access to this module",
  description = "You do not have permission to access this area. Contact your administrator if you need access.",
}: NoAccessProps) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.36, ease: "easeOut" }}
        className="flex max-w-md flex-col items-center gap-5 text-center"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.32, type: "spring", stiffness: 180 }}
          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10"
        >
          <Prohibit size={40} weight="light" className="text-red-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.28 }}
          className="space-y-2"
        >
          <h1 className="text-section-heading text-app-text">{title}</h1>
          <p className="text-body-sm text-app-text-muted">{description}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.28 }}
          className="pt-2"
        >
          <Link href="/dashboard">
            <Button variant="dark">
              <ArrowLeft size={16} weight="bold" />
              Back to home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
