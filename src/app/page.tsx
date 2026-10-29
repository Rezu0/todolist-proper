import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import {
  toReminder,
  toTask,
  type ReminderDoc,
  type TaskDoc,
} from "@/lib/serialize";
import User from "@/models/User";
import Task from "@/models/Task";
import Reminder from "@/models/Reminder";
import Board from "@/components/Board";

export const metadata = {
  title: "Dashboard",
  description: "Kelola task dan pengingat harian kamu.",
};

async function BoardLoader() {
  const uid = await getUserId();

  if (!uid) {
    redirect("/login");
  }

  await connectDB();

  const [user, tasks, reminders] = await Promise.all([
    User.findById(uid)
      .select("name email")
      .lean<{ name?: string; email: string }>(),
    Task.find({ userId: uid }).sort({ createdAt: 1 }).lean<TaskDoc[]>(),
    Reminder.find({ userId: uid }).sort({ createdAt: 1 }).lean<ReminderDoc[]>(),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <Board
      initialTasks={tasks.map(toTask)}
      initialReminders={reminders.map(toReminder)}
      userName={user.name || user.email}
    />
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-desk px-4 py-5 text-ink antialiased sm:px-6 sm:py-8">
      <Suspense fallback={null}>
        <BoardLoader />
      </Suspense>
    </main>
  );
}