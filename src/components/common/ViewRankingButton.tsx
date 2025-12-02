"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export default function ViewRankingButton() {
  return (
    <Link href="/ranking" className="block">
      <motion.div
        className="relative overflow-hidden px-8 py-4 rounded-full 
          bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400
          text-white font-bold text-lg shadow-lg
          flex items-center justify-center gap-3
          cursor-pointer select-none"
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 20px 40px rgba(245, 158, 11, 0.4)"
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {/* 光の流れアニメーション */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />

        {/* コンテンツ */}
        <motion.div
          className="relative z-10 flex items-center gap-3"
        >
          <Trophy className="w-6 h-6 drop-shadow-md" />
          <span className="drop-shadow-md">人気の漢字ランキングを見る</span>
        </motion.div>
      </motion.div>
    </Link>
  );
}

